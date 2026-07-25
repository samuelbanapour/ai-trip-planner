import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAI } from '../hooks/useAI';

const PROVIDER_INFO = [
  {
    name: 'gemini',
    displayName: 'Google Gemini',
    model: 'gemini-2.0-flash',
    limits: '15 RPM, 1M tokens/day',
    docsUrl: 'https://aistudio.google.com/apikey',
    description: 'Google\'s flagship AI model. Excellent quality, generous free tier.',
  },
  {
    name: 'groq',
    displayName: 'Groq',
    model: 'llama-3.3-70b-versatile',
    limits: 'Fast free inference, generous limits',
    docsUrl: 'https://console.groq.com/keys',
    description: 'Ultra-fast inference on Llama models. Best speed of any free provider.',
  },
  {
    name: 'mistral',
    displayName: 'Mistral AI',
    model: 'mistral-small-latest',
    limits: 'Free tier available',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    description: 'European AI company with strong multilingual capabilities.',
  },
  {
    name: 'cerebras',
    displayName: 'Cerebras',
    model: 'llama-3.3-70b',
    limits: 'Free inference tier',
    docsUrl: 'https://cloud.cerebras.ai/',
    description: 'Wafer-scale AI chip company. Very fast inference speeds.',
  },
  {
    name: 'githubModels',
    displayName: 'GitHub Models',
    model: 'gpt-4o-mini',
    limits: 'Free with GitHub token',
    docsUrl: 'https://github.com/settings/tokens',
    description: 'Access GPT-4o-mini and other models free via GitHub.',
  },
  {
    name: 'together',
    displayName: 'Together AI',
    model: 'Llama-3.3-70B-Instruct-Turbo',
    limits: 'Free tier available',
    docsUrl: 'https://api.together.xyz/settings/api-keys',
    description: 'Open-source model hosting with free credits for new users.',
  },
  {
    name: 'huggingface',
    displayName: 'Hugging Face',
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    limits: 'Free inference (rate limited)',
    docsUrl: 'https://huggingface.co/settings/tokens',
    description: 'The open-source AI hub. Free inference on many models.',
  },
];

export default function Settings() {
  const { settings, dispatch } = useSettings();
  const { testProvider } = useAI();
  const [showKeys, setShowKeys] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(null);

  if (!settings) return <div className="loading-container"><div className="spinner" /><p>Loading settings...</p></div>;

  const updateProvider = (name, updates) => {
    dispatch({ type: 'UPDATE_PROVIDER', provider: name, config: updates });
  };

  const handleTest = async (providerName) => {
    setTesting(providerName);
    setTestResults((prev) => ({ ...prev, [providerName]: null }));
    try {
      const result = await testProvider(providerName);
      setTestResults((prev) => ({ ...prev, [providerName]: result }));
    } catch (err) {
      setTestResults((prev) => ({ ...prev, [providerName]: { ok: false, error: err.message } }));
    } finally {
      setTesting(null);
    }
  };

  const enabledCount = Object.values(settings.providers || {}).filter(
    (p) => p.enabled && p.apiKey
  ).length;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
        ⚙️ Settings
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Configure AI providers and app preferences. Get free API keys from the links below.
      </p>

      {/* Status overview */}
      <div className="card" style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
            {enabledCount > 0 ? `${enabledCount} provider${enabledCount > 1 ? 's' : ''} configured` : 'No providers configured'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {enabledCount > 0
              ? 'AI trip planning is ready to use'
              : 'Add at least one API key below to start planning trips'}
          </p>
        </div>
        <div className={`ai-status ${enabledCount > 0 ? 'ready' : 'error'}`}>
          <span className="status-dot" />
          {enabledCount > 0 ? 'Ready' : 'Not configured'}
        </div>
      </div>

      {/* Preferred provider */}
      <div className="form-group">
        <label className="form-label">Preferred AI Provider</label>
        <select
          className="form-select"
          value={settings.preferredProvider || 'auto'}
          onChange={(e) => dispatch({ type: 'SET_PREFERRED_PROVIDER', provider: e.target.value })}
        >
          <option value="auto">Auto (fastest available)</option>
          {PROVIDER_INFO.map((p) => (
            <option key={p.name} value={p.name}>{p.displayName}</option>
          ))}
        </select>
      </div>

      {/* Theme */}
      <div className="form-group" style={{ marginBottom: '32px' }}>
        <label className="form-label">Theme</label>
        <div className="chip-group">
          <button
            className={`chip ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_THEME', theme: 'dark' })}
          >
            🌙 Dark
          </button>
          <button
            className={`chip ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_THEME', theme: 'light' })}
          >
            ☀️ Light
          </button>
        </div>
      </div>

      {/* Provider cards */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        AI Providers
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {PROVIDER_INFO.map((info) => {
          const cfg = settings.providers?.[info.name] || { apiKey: '', enabled: false };
          const showKey = showKeys[info.name];
          const testResult = testResults[info.name];

          return (
            <div key={info.name} className="provider-card">
              <div className="provider-info" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3>{info.displayName}</h3>
                  <span className="free-badge">FREE</span>
                </div>
                <p style={{ marginTop: '4px' }}>{info.description}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Model: {info.model} · {info.limits}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
                {/* API Key input */}
                <div style={{ position: 'relative' }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    className="form-input"
                    placeholder="API key"
                    value={cfg.apiKey || ''}
                    onChange={(e) => updateProvider(info.name, { apiKey: e.target.value })}
                    style={{ paddingRight: '80px' }}
                  />
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowKeys((prev) => ({ ...prev, [info.name]: !prev[info.name] }))}
                    style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}
                  >
                    {showKey ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Toggle */}
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={cfg.enabled || false}
                      onChange={(e) => updateProvider(info.name, { enabled: e.target.checked })}
                    />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>

                  {/* Test button */}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleTest(info.name)}
                    disabled={!cfg.apiKey || testing === info.name}
                  >
                    {testing === info.name ? (
                      <><span className="spinner spinner-sm" /> Testing...</>
                    ) : 'Test'}
                  </button>

                  {/* Get key link */}
                  <a
                    href={info.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    Get Key ↗
                  </a>
                </div>

                {/* Test result */}
                {testResult && (
                  <div style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: testResult.ok ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: testResult.ok ? 'var(--success)' : 'var(--error)',
                  }}>
                    {testResult.ok
                      ? `✅ Connected (${testResult.provider}, ${testResult.model})`
                      : `❌ ${testResult.error}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
