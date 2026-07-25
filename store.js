// JSON-file store in Electron's per-user data directory.
// Follows the pattern from roleplay-chatbot/store.js.
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// When running outside Electron (e.g. Node tests), use a local fallback dir.
function userDataPath() {
  try {
    return app.getPath('userData');
  } catch {
    return path.join(__dirname, '.data');
  }
}

function filePath(name) {
  return path.join(userDataPath(), name);
}

function readJson(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(name, data) {
  try {
    const dir = path.dirname(filePath(name));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Failed to write ${name}:`, err);
    return false;
  }
}

// ---- Settings --------------------------------------------------------------
function getSettings() {
  const saved = readJson('settings.json', {});
  return {
    providers: saved.providers || {
      gemini:      { apiKey: process.env.GEMINI_API_KEY      || '', enabled: !!process.env.GEMINI_API_KEY },
      mistral:     { apiKey: process.env.MISTRAL_API_KEY     || '', enabled: !!process.env.MISTRAL_API_KEY },
      groq:        { apiKey: process.env.GROQ_API_KEY        || '', enabled: !!process.env.GROQ_API_KEY },
      cerebras:    { apiKey: process.env.CEREBRAS_API_KEY    || '', enabled: !!process.env.CEREBRAS_API_KEY },
      githubModels:{ apiKey: process.env.GITHUB_TOKEN        || '', enabled: !!process.env.GITHUB_TOKEN },
      together:    { apiKey: process.env.TOGETHER_API_KEY    || '', enabled: !!process.env.TOGETHER_API_KEY },
      huggingface: { apiKey: process.env.HF_API_TOKEN        || '', enabled: !!process.env.HF_API_TOKEN },
    },
    preferredProvider: saved.preferredProvider || 'auto',
    currency: saved.currency || 'USD',
    temperatureUnit: saved.temperatureUnit || 'fahrenheit',
    theme: saved.theme || 'dark',
  };
}

function saveSettings(partial) {
  const current = readJson('settings.json', {});
  const next = { ...current, ...partial };
  writeJson('settings.json', next);
  return getSettings();
}

// ---- Trips -----------------------------------------------------------------
function getTrips() {
  return readJson('trips.json', []);
}

function saveTrip(trip) {
  const list = getTrips();
  const idx = list.findIndex((t) => t.id === trip.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...trip, updatedAt: Date.now() };
  else list.push({ ...trip, createdAt: Date.now(), updatedAt: Date.now() });
  writeJson('trips.json', list);
  return list;
}

function deleteTrip(id) {
  const list = getTrips().filter((t) => t.id !== id);
  writeJson('trips.json', list);
  return list;
}

module.exports = {
  getSettings,
  saveSettings,
  getTrips,
  saveTrip,
  deleteTrip,
};
