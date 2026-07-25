// API client — wraps fetch for both Electron and web modes.

const WEB_API_BASE = 'http://localhost:3001';
const IS_ELECTRON = !!window.tripPlannerAPI;

export async function apiGet(path) {
  if (IS_ELECTRON) {
    // In Electron, most data is handled via IPC
    // Only AI calls go through the server
  }
  const res = await fetch(`${WEB_API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${WEB_API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${WEB_API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Geocode a destination name
export async function geocode(query) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`
  );
  return res.json();
}

// Get weather data
export async function getWeather(lat, lon, days = 7) {
  const res = await fetch(
    `${WEB_API_BASE}/api/weather?lat=${lat}&lon=${lon}&days=${days}`
  );
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}
