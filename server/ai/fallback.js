// Fallback orchestrator — tries providers in priority order, falls through on rate limits.

const { getProvider, PROVIDERS } = require('./providers');

// Error codes that trigger fallback to next provider.
const RETRYABLE_STATUSES = new Set([429, 502, 503, 529]);

/**
 * Build ordered list of providers to try.
 * Preferred provider first, then others by configured priority.
 */
function buildProviderOrder(preferred, settings) {
  const enabled = Object.entries(settings.providers || {})
    .filter(([, cfg]) => cfg.enabled && cfg.apiKey)
    .sort((a, b) => (a[1].priority || 99) - (b[1].priority || 99))
    .map(([name]) => name);

  if (preferred && preferred !== 'auto' && enabled.includes(preferred)) {
    return [preferred, ...enabled.filter((n) => n !== preferred)];
  }

  // Auto mode: prefer Groq (fastest), then Gemini (best quality), then others
  const autoOrder = ['groq', 'gemini', 'mistral', 'cerebras', 'together', 'githubModels', 'huggingface'];
  const ordered = autoOrder.filter((n) => enabled.includes(n));
  const remaining = enabled.filter((n) => !ordered.includes(n));
  return [...ordered, ...remaining];
}

/**
 * Stream a completion with automatic provider fallback.
 * Yields text chunks as they arrive.
 *
 * @param {Array} messages - [{ role, content }]
 * @param {string} preferred - preferred provider name or 'auto'
 * @param {object} settings - full settings object with providers config
 * @param {object} options - { temperature, maxTokens }
 * @yields {string} text chunks
 * @returns {{ provider: string, model: string }} which provider succeeded
 */
async function* streamWithFallback(messages, preferred, settings, options = {}) {
  const order = buildProviderOrder(preferred, settings);
  if (order.length === 0) {
    throw new Error('No AI providers configured. Open Settings and add at least one API key.');
  }

  let lastError = null;

  for (const providerName of order) {
    const providerCfg = settings.providers[providerName];
    if (!providerCfg || !providerCfg.apiKey) continue;

    const provider = getProvider(providerName);
    if (!provider) continue;

    try {
      const url = provider.buildUrl(providerCfg.apiKey, provider.model);
      const headers = provider.buildHeaders(providerCfg.apiKey);
      const body = provider.buildBody(messages, options);

      // Add model to body for OpenAI-compatible providers
      if (!body.model && provider.model) {
        body.model = provider.model;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let detail = '';
        try {
          const errJson = await res.json();
          detail = errJson?.error?.message || JSON.stringify(errJson);
        } catch {
          try { detail = await res.text(); } catch { /* ignore */ }
        }

        // Auth errors should not trigger fallback — key is invalid
        if (res.status === 401 || res.status === 403) {
          throw new Error(`${provider.displayName}: Invalid API key (${res.status}). Check your key in Settings.`);
        }

        if (RETRYABLE_STATUSES.has(res.status)) {
          lastError = new Error(`${provider.displayName}: Rate limited or overloaded (${res.status}). ${detail}`);
          continue; // try next provider
        }

        throw new Error(`${provider.displayName} error ${res.status}: ${detail || res.statusText}`);
      }

      if (!res.body) {
        throw new Error(`${provider.displayName}: No response body`);
      }

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith('data:')) continue;

          const chunk = provider.parseChunk(line);
          if (chunk) yield chunk;
        }
      }

      // Success — return which provider was used
      return { provider: providerName, model: provider.model };
    } catch (err) {
      if (err.message.includes('Invalid API key')) throw err;
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All providers failed');
}

/**
 * Non-streaming completion — collects full response.
 */
async function complete(messages, preferred, settings, options = {}) {
  let full = '';
  let meta = { provider: '', model: '' };

  for await (const chunk of streamWithFallback(messages, preferred, settings, options)) {
    if (typeof chunk === 'string') {
      full += chunk;
    } else {
      meta = chunk;
    }
  }

  return { text: full, ...meta };
}

module.exports = { streamWithFallback, complete, buildProviderOrder };
