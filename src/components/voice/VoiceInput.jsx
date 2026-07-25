import React, { useState, useRef, useCallback } from 'react';
import './voice.css';

/**
 * Mic button using Web Speech API (SpeechRecognition).
 * Records user voice → converts to text → calls onTranscript.
 */
export default function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize on first use
  const getRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      onTranscript?.(transcript);
    };
    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    return recognition;
  }, [onTranscript]);

  const toggleListening = () => {
    const recognition = getRecognition();
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  if (!supported) {
    return (
      <button
        className="voice-mic-btn voice-mic-unsupported"
        disabled
        title="Voice input not supported in this browser"
      >
        🎤
      </button>
    );
  }

  return (
    <button
      className={`voice-mic-btn ${listening ? 'voice-mic-listening' : ''}`}
      onClick={toggleListening}
      disabled={disabled}
      title={listening ? 'Stop listening' : 'Speak a question'}
    >
      <span className="voice-mic-icon">{listening ? '🔴' : '🎤'}</span>
      {listening && <span className="voice-pulse-ring" />}
    </button>
  );
}
