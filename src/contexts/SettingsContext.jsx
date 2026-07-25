import React, { createContext, useContext, useReducer, useEffect } from 'react';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'trip-planner-settings';

const DEFAULT_PROVIDERS = {
  gemini:       { apiKey: '', enabled: false, priority: 1 },
  mistral:      { apiKey: '', enabled: false, priority: 2 },
  groq:         { apiKey: '', enabled: false, priority: 3 },
  cerebras:     { apiKey: '', enabled: false, priority: 4 },
  githubModels: { apiKey: '', enabled: false, priority: 5 },
  together:     { apiKey: '', enabled: false, priority: 6 },
  huggingface:  { apiKey: '', enabled: false, priority: 7 },
};

const DEFAULT_STATE = {
  providers: DEFAULT_PROVIDERS,
  preferredProvider: 'auto',
  currency: 'USD',
  temperatureUnit: 'fahrenheit',
  theme: 'dark',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, ...action.payload };
    case 'UPDATE_PROVIDER':
      return {
        ...state,
        providers: {
          ...state.providers,
          [action.provider]: {
            ...state.providers[action.provider],
            ...action.config,
          },
        },
      };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_CURRENCY':
      return { ...state, currency: action.currency };
    case 'SET_PREFERRED_PROVIDER':
      return { ...state, preferredProvider: action.provider };
    default:
      return state;
  }
}

function loadSettings() {
  try {
    // Try Electron IPC first
    if (window.tripPlannerAPI?.getSettings) {
      return null; // loaded async
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function SettingsProvider({ children }) {
  const [settings, dispatch] = useReducer(reducer, null, loadSettings);

  // Load from Electron on mount
  useEffect(() => {
    if (window.tripPlannerAPI?.getSettings) {
      window.tripPlannerAPI.getSettings().then((s) => {
        if (s) dispatch({ type: 'SET_SETTINGS', payload: s });
      });
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (!settings) return;
    if (window.tripPlannerAPI?.saveSettings) {
      window.tripPlannerAPI.saveSettings(settings);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings?.theme || 'dark');
  }, [settings?.theme]);

  const getEnabledProviderCount = () => {
    if (!settings?.providers) return 0;
    return Object.values(settings.providers).filter((p) => p.enabled && p.apiKey).length;
  };

  return (
    <SettingsContext.Provider value={{ settings, dispatch, getEnabledProviderCount }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
