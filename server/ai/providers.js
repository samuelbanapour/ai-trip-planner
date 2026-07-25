// Provider registry — maps provider name to config, endpoint, and header builder.
// OpenAI-compatible providers share the same adapter; Gemini has its own.

const PROVIDERS = {
  gemini: {
    name: 'gemini',
    displayName: 'Google Gemini',
    model: 'gemini-2.0-flash',
    freeLimits: '15 RPM, 1M tokens/day',
    docsUrl: 'https://aistudio.google.com/apikey',
    buildUrl(apiKey, model) {
      return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
    },
    buildHeaders() {
      return { 'Content-Type': 'application/json' };
    },
    buildBody(messages, options) {
      const contents = [];
      let systemInstruction = '';

      for (const msg of messages) {
        if (msg.role === 'system') {
          systemInstruction = msg.content;
        } else {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      }

      return {
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 4096,
          topP: 0.95,
        },
      };
    },
    parseChunk(line) {
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') return null;
      try {
        const obj = JSON.parse(payload);
        const cand = obj?.candidates?.[0];
        return cand?.content?.parts?.map((p) => p.text || '').join('') || null;
      } catch {
        return null;
      }
    },
  },

  mistral: {
    name: 'mistral',
    displayName: 'Mistral AI',
    model: 'mistral-small-latest',
    freeLimits: 'Free tier available',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    ...openaiCompat('https://api.mistral.ai/v1/chat/completions'),
  },

  groq: {
    name: 'groq',
    displayName: 'Groq',
    model: 'llama-3.3-70b-versatile',
    freeLimits: 'Fast free inference, generous limits',
    docsUrl: 'https://console.groq.com/keys',
    ...openaiCompat('https://api.groq.com/openai/v1/chat/completions'),
  },

  cerebras: {
    name: 'cerebras',
    displayName: 'Cerebras',
    model: 'llama-3.3-70b',
    freeLimits: 'Free inference tier',
    docsUrl: 'https://cloud.cerebras.ai/',
    ...openaiCompat('https://api.cerebras.ai/v1/chat/completions'),
  },

  githubModels: {
    name: 'githubModels',
    displayName: 'GitHub Models',
    model: 'gpt-4o-mini',
    freeLimits: 'Free with GitHub token',
    docsUrl: 'https://github.com/settings/tokens',
    ...openaiCompat('https://models.inference.ai.azure.com/chat/completions'),
  },

  together: {
    name: 'together',
    displayName: 'Together AI',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    freeLimits: 'Free tier available',
    docsUrl: 'https://api.together.xyz/settings/api-keys',
    ...openaiCompat('https://api.together.xyz/v1/chat/completions'),
  },

  huggingface: {
    name: 'huggingface',
    displayName: 'Hugging Face',
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    freeLimits: 'Free inference (rate limited)',
    docsUrl: 'https://huggingface.co/settings/tokens',
    ...openaiCompat('https://api-inference.huggingface.co/models/', true),
  },
};

// Factory for OpenAI-compatible providers (6 of 7 use this format).
function openaiCompat(endpoint, isHf = false) {
  return {
    buildUrl(apiKey, model) {
      if (isHf) return `${endpoint}${encodeURIComponent(model)}`;
      return endpoint;
    },
    buildHeaders(apiKey) {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
    },
    buildBody(messages, options) {
      return {
        model: isHf ? undefined : undefined, // model set by provider config
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        stream: true,
      };
    },
    parseChunk(line) {
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') return null;
      try {
        const obj = JSON.parse(payload);
        return obj?.choices?.[0]?.delta?.content || null;
      } catch {
        return null;
      }
    },
  };
}

function getProvider(name) {
  return PROVIDERS[name] || null;
}

function getAllProviders() {
  return Object.values(PROVIDERS).map((p) => ({
    name: p.name,
    displayName: p.displayName,
    model: p.model,
    freeLimits: p.freeLimits,
    docsUrl: p.docsUrl,
  }));
}

module.exports = { PROVIDERS, getProvider, getAllProviders };
