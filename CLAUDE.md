# AI Trip Planner

## Project Overview
AI-powered trip planner app with 7 free AI providers. Generates itineraries, budgets, packing lists, and local recommendations. Cross-platform via Electron (desktop) and Capacitor (mobile).

## Tech Stack
- **Frontend**: React 18 + Vite + React Router
- **Backend**: Express.js (AI API proxy server)
- **Desktop**: Electron 31 + electron-builder
- **Mobile**: Capacitor 8
- **Styling**: CSS with custom properties (no Tailwind)

## Project Structure
```
ai-trip-planner/
├── main.js              # Electron main process
├── preload.js           # Electron IPC bridge
├── store.js             # Electron JSON-file store (userData)
├── server/
│   ├── index.js         # Express server entry
│   ├── ai/
│   │   ├── providers.js # Provider registry (7 providers)
│   │   └── fallback.js  # Fallback orchestrator with retry
│   ├── voice/
│   │   ├── dialogflow.js    # Google Assistant adapter
│   │   ├── alexa.js         # Amazon Alexa adapter
│   │   ├── intentRouter.js  # Intent normalization + AI dispatch
│   │   └── voicePrompts.js  # Voice-optimized prompt templates
│   └── routes/
│       ├── ai.js        # POST /api/ai/chat (SSE streaming)
│       ├── trips.js     # CRUD for saved trips
│       ├── weather.js   # Open-Meteo weather proxy
│       └── voice.js     # POST /api/voice (Dialogflow/Alexa webhook)
├── src/
│   ├── App.jsx          # Root with React Router
│   ├── index.css        # Global styles + design tokens
│   ├── contexts/        # SettingsContext, TripContext
│   ├── hooks/           # useAI, useLocalStorage
│   ├── pages/           # Home, TripForm, Itinerary, Budget, PackingList, Recommendations, Settings, VoiceSetup
│   ├── components/
│   │   ├── layout/      # Sidebar, Header, Layout
│   │   ├── voice/       # VoiceInput, VoiceQueryBar, voice.css
│   │   └── ...          # itinerary/, budget/, packing/, recommendations/
│   └── lib/             # api.js, helpers.js, prompts.js
└── build/               # Electron build resources (icons, afterSign.js)
```

## AI Providers (all free tier)
| Provider | Model | Notes |
|---|---|---|
| Google Gemini | gemini-2.0-flash | 15 RPM, 1M tokens/day |
| Groq | llama-3.3-70b-versatile | Fastest free inference |
| Mistral | mistral-small-latest | Free tier available |
| Cerebras | llama-3.3-70b | Free inference tier |
| GitHub Models | gpt-4o-mini | Free with GitHub token |
| Together AI | Llama-3.3-70B-Instruct-Turbo | Free tier |
| Hugging Face | meta-llama/Llama-3.3-70B-Instruct | Free inference |

## Key Patterns
- **Streaming**: SSE from Express to React via fetch + ReadableStream
- **Fallback**: Provider manager tries preferred provider first, falls through on 429/503
- **Store**: JSON files in Electron's userData directory (store.js)
- **IPC**: contextBridge exposes `window.tripPlannerAPI` for Electron
- **Prompts**: All AI prompts are in `src/lib/prompts.js`, return structured JSON
- **Voice**: Server uses CommonJS. Voice adapters detect Dialogflow vs Alexa, normalize intents, route to AI via `complete()` with `maxTokens: 300` for short spoken responses
- **Voice UI**: Web Speech API (`webkitSpeechRecognition`) for in-app mic input. Browser support: Chrome/Edge/Safari. Graceful fallback when unsupported.

## Commands
- `npm run dev` — Vite dev server + Electron
- `npm run build` — Build React to dist/
- `npm run electron` — Run Electron with built files
- `npm run dist:mac/win/linux` — Package for platforms
