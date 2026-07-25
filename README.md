# ✈️ AI Trip Planner

> Plan your perfect trip with the power of **7 free AI providers**. Generate itineraries, budgets, packing lists, and local recommendations — all powered by AI.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux%20%7C%20Web-blue)
![License](https://img.shields.io/badge/license-UNLICENSED-red)

## Features

- 🗺️ **AI Itinerary Generation** — Day-by-day plans with activities, times, locations, and costs
- 💰 **Budget Planner** — Detailed cost breakdown by category with money-saving tips
- 🧳 **Packing Lists** — AI-generated, weather-aware packing lists with progress tracking
- ⭐ **Recommendations** — Curated restaurants, attractions, and local tips
- 🌤️ **Weather Integration** — Real-time weather data via Open-Meteo (free, no API key)
- 🌙 **Dark/Light Theme** — Easy on the eyes, day or night
- 💻 **Cross-Platform** — Works on macOS, Windows, Linux, and web browsers
- 🎤 **Voice Assistant** — Talk to Google Assistant or Alexa to check your trip plans hands-free

## AI Providers (All Free!)

| Provider | Model | Free Limits |
|----------|-------|-------------|
| 🔷 Google Gemini | gemini-2.0-flash | 15 RPM, 1M tokens/day |
| ⚡ Groq | llama-3.3-70b-versatile | Fast free inference |
| 🟣 Mistral AI | mistral-small-latest | Free tier available |
| 🧠 Cerebras | llama-3.3-70b | Free inference tier |
| 🐙 GitHub Models | gpt-4o-mini | Free with GitHub token |
| 🤝 Together AI | Llama-3.3-70B-Instruct-Turbo | Free tier |
| 🤗 Hugging Face | meta-llama/Llama-3.3-70B-Instruct | Free inference |

**Auto-fallback**: If one provider is rate-limited, the app automatically falls through to the next available provider.

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-trip-planner.git
cd ai-trip-planner

# Install dependencies
npm install

# Start the app (Vite dev server + Electron)
npm run dev
```

### Get a Free API Key

1. Open the app → Settings
2. Click "Get Key" next to any provider
3. Sign up for a free account and copy your API key
4. Paste it in the app and toggle the provider on
5. Click "Test" to verify the connection

**Recommended**: Start with **Groq** (fastest) or **Google Gemini** (best quality).

## Build for Production

```bash
# Build React frontend
npm run build

# Package for your platform
npm run dist:mac     # macOS (DMG + ZIP, universal/x64/arm64)
npm run dist:win     # Windows (NSIS installer + ZIP, x64/arm64)
npm run dist:linux   # Linux (AppImage + DEB, x64/arm64)
```

## Mobile (Capacitor)

```bash
# Android
npm run android:prepare
npm run android:debug

# iOS
npm run ios:prepare
# Then open in Xcode
```

## Voice Assistant

Talk to your trip planner hands-free via **Google Assistant** or **Amazon Alexa**.

| Intent | Example | Returns |
|--------|---------|---------|
| GetItinerary | "What's my itinerary for day 2?" | Day-by-day spoken plan |
| GetBudget | "What's my budget for Tokyo?" | Budget overview + tips |
| GetPackingList | "What should I pack for Paris?" | Packing essentials |
| GetRecommendations | "Find restaurants near me" | Top recommendations |
| AskTrip | "Is it safe to travel to Thailand?" | AI travel advice |
| GetWeather | "What's the weather at my destination?" | Weather forecast |

**Setup**: Navigate to `Settings → Voice Setup` in the app for step-by-step deployment instructions.

## Project Structure

```
ai-trip-planner/
├── main.js              # Electron main process
├── preload.js           # Electron IPC bridge
├── store.js             # Persistent JSON store
├── server/              # Express backend
│   ├── ai/providers.js  # 7 AI provider adapters
│   ├── ai/fallback.js   # Auto-fallback orchestrator
│   ├── voice/           # Voice assistant adapters
│   └── routes/          # API endpoints
├── src/                 # React frontend
│   ├── pages/           # 8 pages (Home, TripForm, Itinerary, Voice, etc.)
│   ├── components/      # UI components (includes voice input)
│   ├── contexts/        # React Context (Settings, Trips)
│   ├── hooks/           # Custom hooks (useAI, useLocalStorage)
│   └── lib/             # Utilities, prompts, API client
└── build/               # Electron build resources
```

## How It Works

1. **Configure** — Add one or more free AI API keys in Settings
2. **Create** — Enter your destination, dates, budget, and interests
3. **Generate** — AI creates a detailed day-by-day itinerary
4. **Explore** — View budget breakdowns, packing lists, and recommendations
5. **Track** — Check off packing items as you go

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Backend | Express.js |
| Desktop | Electron 31 |
| Mobile | Capacitor 8 |
| Packaging | electron-builder |
| Styling | CSS Custom Properties |

## License

UNLICENSED — Solo Apps Studio
