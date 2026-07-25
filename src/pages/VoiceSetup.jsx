import React, { useState } from 'react';

const WEBHOOK_PLACEHOLDER = 'https://your-server.com/api/voice';

const DIALOGFLOW_INTENTS = `[
  {
    "name": "GetItinerary",
    "parameters": [
      { "name": "day", "type": "number" },
      { "name": "destination", "type": "string" }
    ],
    "trainingPhrases": [
      "What's my itinerary", "What should I do today", "Plan my day",
      "What's the plan for day 2", "Tell me about my itinerary for Paris"
    ]
  },
  {
    "name": "GetBudget",
    "parameters": [
      { "name": "destination", "type": "string" }
    ],
    "trainingPhrases": [
      "What's my budget", "How much am I spending", "Budget overview",
      "What's my budget for Tokyo", "Tell me about costs"
    ]
  },
  {
    "name": "GetPackingList",
    "parameters": [
      { "name": "destination", "type": "string" }
    ],
    "trainingPhrases": [
      "What should I pack", "Packing list", "What do I need to bring",
      "What should I pack for Paris"
    ]
  },
  {
    "name": "GetRecommendations",
    "parameters": [
      { "name": "category", "type": "string" },
      { "name": "query", "type": "string" }
    ],
    "trainingPhrases": [
      "Find me restaurants", "Recommend something to do", "What's good nearby",
      "Find restaurants in Paris", "Recommend hotels"
    ]
  },
  {
    "name": "AskTrip",
    "parameters": [
      { "name": "question", "type": "string" },
      { "name": "query", "type": "string" }
    ],
    "trainingPhrases": [
      "Is it safe to travel there", "What's the weather like", "Tell me about my trip",
      "Any tips for visiting Tokyo", "What should I know about Paris"
    ]
  },
  {
    "name": "GetWeather",
    "parameters": [
      { "name": "destination", "type": "string" }
    ],
    "trainingPhrases": [
      "What's the weather", "Weather forecast", "Is it going to rain",
      "What's the weather in Paris"
    ]
  }
]`;

const ALEXA_INTENTS = `{
  "interactionModel": {
    "languageModel": {
      "invocationName": "trip planner",
      "intents": [
        {
          "name": "GetItineraryIntent",
          "slots": [
            { "name": "day", "type": "AMAZON.NUMBER" },
            { "name": "destination", "type": "AMAZON.SearchQuery" }
          ],
          "samples": [
            "what's my itinerary", "what should I do today", "plan my day",
            "what's the plan for day 2", "tell me about my itinerary for Paris"
          ]
        },
        {
          "name": "GetBudgetIntent",
          "slots": [
            { "name": "destination", "type": "AMAZON.SearchQuery" }
          ],
          "samples": [
            "what's my budget", "how much am I spending", "budget overview",
            "what's my budget for Tokyo"
          ]
        },
        {
          "name": "GetPackingListIntent",
          "slots": [
            { "name": "destination", "type": "AMAZON.SearchQuery" }
          ],
          "samples": [
            "what should I pack", "packing list", "what do I need to bring"
          ]
        },
        {
          "name": "GetRecommendationsIntent",
          "slots": [
            { "name": "category", "type": "AMAZON.SearchQuery" }
          ],
          "samples": [
            "find me restaurants", "recommend something to do",
            "what's good nearby", "find restaurants in Paris"
          ]
        },
        {
          "name": "AskTripIntent",
          "slots": [
            { "name": "question", "type": "AMAZON.SearchQuery" }
          ],
          "samples": [
            "is it safe to travel there", "what should I know about Paris",
            "any tips for visiting Tokyo", "tell me about my trip"
          ]
        },
        {
          "name": "GetWeatherIntent",
          "slots": [
            { "name": "destination", "type": "AMAZON.SearchQuery" }
          ],
          "samples": [
            "what's the weather", "weather forecast", "is it going to rain"
          ]
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        }
      ]
    }
  }
}`;

export default function VoiceSetup() {
  const [copied, setCopied] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const copyButton = (text, label) => (
    <button
      className="btn btn-ghost btn-sm"
      onClick={() => copyToClipboard(text, label)}
      style={{ marginLeft: '8px', fontSize: '12px' }}
    >
      {copied === label ? '✓ Copied' : '📋 Copy'}
    </button>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>🎤 Voice Assistant Setup</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: 600 }}>
        Connect your trip planner to Google Assistant and Amazon Alexa for hands-free voice access.
      </p>

      {/* Webhook URL */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
          🔗 Your Webhook URL
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Both Dialogflow and Alexa send requests to this endpoint. During development, use{' '}
          <code>ngrok</code> to expose your local server.
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder={WEBHOOK_PLACEHOLDER}
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px' }}
          />
          {copyButton(webhookUrl || WEBHOOK_PLACEHOLDER, 'webhook')}
        </div>
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          # Terminal 1 — Start your server{'\n'}
          npm run dev{'\n\n'}
          # Terminal 2 — Expose with ngrok{'\n'}
          ngrok http 3001
        </div>
      </div>

      {/* Google Assistant (Dialogflow) */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
          🔵 Google Assistant (Dialogflow)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Create a Dialogflow agent and connect it to your webhook for Google Assistant voice queries.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { step: 1, text: 'Go to dialogflow.cloud.google.com and create a new agent.' },
            { step: 2, text: 'In Fulfillment → Webhook, paste your webhook URL and save.' },
            { step: 3, text: 'Create the intents below (Intents → Create Intent). Add training phrases and set Fulfillment → Enable webhook call.' },
            { step: 4, text: 'Test via "Talk to <your agent>" in Google Assistant, or use the Dialogflow test console.' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}>{step}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingTop: '2px' }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Dialogflow Intents (JSON)
            </span>
            {copyButton(DIALOGFLOW_INTENTS, 'df-intents')}
          </div>
          <pre style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            overflow: 'auto',
            maxHeight: '300px',
          }}>
            {DIALOGFLOW_INTENTS}
          </pre>
        </div>
      </div>

      {/* Amazon Alexa */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
          🟠 Amazon Alexa
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Create an Alexa skill and connect it to your webhook for Alexa voice queries.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { step: 1, text: 'Go to developer.amazon.com/alexa/console/ask and create a new skill (Custom → Alexa-hosted).' },
            { step: 2, text: 'In the interaction model JSON tab, paste the JSON below and save/build.' },
            { step: 3, text: 'In the endpoint section, add your webhook URL as an HTTPS endpoint.' },
            { step: 4, text: 'Test via Alexa developer console, or say "Alexa, open Trip Planner" on an Alexa device.' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#ff9900',
                color: '#000',
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}>{step}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingTop: '2px' }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Alexa Interaction Model (JSON)
            </span>
            {copyButton(ALEXA_INTENTS, 'alexa-intents')}
          </div>
          <pre style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            overflow: 'auto',
            maxHeight: '300px',
          }}>
            {ALEXA_INTENTS}
          </pre>
        </div>
      </div>

      {/* Supported Intents Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
          📋 Supported Voice Intents
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>INTENT</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>EXAMPLE</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>RETURNS</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['GetItinerary', '"What\'s my itinerary for day 2?"', 'Day-by-day spoken plan'],
              ['GetBudget', '"What\'s my budget for Tokyo?"', 'Budget overview + top tips'],
              ['GetPackingList', '"What should I pack for Paris?"', 'Packing essentials'],
              ['GetRecommendations', '"Find restaurants near me"', 'Top 3 recommendations'],
              ['AskTrip', '"Is it safe to travel to Thailand?"', 'General AI travel advice'],
              ['GetWeather', '"What\'s the weather at my destination?"', 'Current weather + forecast'],
            ].map(([intent, example, returns], i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)' }}>{intent}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{example}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{returns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
