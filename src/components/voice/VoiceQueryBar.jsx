import React, { useState, useRef, useEffect } from 'react';
import VoiceInput from './VoiceInput';

/**
 * Floating query bar — voice input + text fallback + AI response display.
 * When opened, listens for voice or accepts typed text, sends to AI, shows response.
 */
export default function VoiceQueryBar({ isOpen, onClose }) {
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const responseRef = useRef(null);

  // Auto-focus text input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll response
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleTranscript = (text) => {
    setTranscript(text);
    setTextInput(text);
    // Auto-send voice input
    sendQuery(text);
  };

  const sendQuery = async (query) => {
    const trimmed = (query || textInput).trim();
    if (!trimmed || loading) return;

    setTranscript(trimmed);
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'You are a concise travel assistant. Answer in 1-3 short sentences, suitable for being read aloud. No markdown, no bullets, no lists.',
            },
            { role: 'user', content: trimmed },
          ],
          mode: 'full',
          maxTokens: 300,
        }),
      });

      if (!res.ok) throw new Error(`AI request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullText += data.text;
                setResponse(fullText);
              }
              if (data.error) throw new Error(data.error);
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }

      // Read response aloud
      if (fullText && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(textInput);
    }
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="voice-query-bar">
      <div className="voice-query-inner">
        {/* Transcript badge */}
        {transcript && (
          <div className="voice-transcript-badge">
            🎤 "{transcript}"
          </div>
        )}

        {/* Input row */}
        <div className="voice-input-row">
          <VoiceInput onTranscript={handleTranscript} disabled={loading} />
          <input
            ref={inputRef}
            type="text"
            className="voice-text-input"
            placeholder="Ask about your trip..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => sendQuery(textInput)}
            disabled={loading || !textInput.trim()}
          >
            {loading ? '⏳' : '➤'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Response */}
        {(response || loading || error) && (
          <div className="voice-response" ref={responseRef}>
            {error ? (
              <span className="voice-error">⚠️ {error}</span>
            ) : loading && !response ? (
              <span className="voice-loading">Thinking...</span>
            ) : (
              <span>{response}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
