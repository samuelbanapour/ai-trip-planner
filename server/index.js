// Express server — serves API routes and (in production) static files.

const express = require('express');
const path = require('path');

const aiRoutes = require('./routes/ai');
const tripRoutes = require('./routes/trips');
const weatherRoutes = require('./routes/weather');
const voiceRoutes = require('./routes/voice');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '1mb' }));

// CORS for development
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// API routes
app.use('/api/ai', aiRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/voice', voiceRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Serve static files in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// If run directly (not required as module), start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, PORT };
