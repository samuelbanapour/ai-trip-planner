// POST /api/ai/chat — unified AI completion endpoint with streaming.

const express = require('express');
const router = express.Router();
const { streamWithFallback } = require('../ai/fallback');
const store = require('../../store');

router.post('/chat', async (req, res) => {
  const { messages, provider, options } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const settings = store.getSettings();

  // Set up SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    let meta = { provider: '', model: '' };

    for await (const chunk of streamWithFallback(messages, provider || 'auto', settings, options || {})) {
      if (typeof chunk === 'string') {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      } else {
        meta = chunk;
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, ...meta })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// POST /api/ai/test — test a provider connection
router.post('/test', async (req, res) => {
  const { provider } = req.body;
  const settings = store.getSettings();

  try {
    const result = await streamWithFallback(
      [{ role: 'user', content: 'Say "Connection successful" in exactly those words.' }],
      provider,
      settings,
      { maxTokens: 50 }
    );

    let text = '';
    let meta = {};
    for await (const chunk of result) {
      if (typeof chunk === 'string') text += chunk;
      else meta = chunk;
    }

    res.json({ ok: true, text: text.trim(), ...meta });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// GET /api/ai/providers — list all available providers
router.get('/providers', (_req, res) => {
  const { getAllProviders } = require('../ai/providers');
  res.json(getAllProviders());
});

module.exports = router;
