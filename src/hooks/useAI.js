import { useState, useCallback, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { PROMPTS } from '../lib/prompts';

const API_BASE = 'http://localhost:3001';

export function useAI() {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [lastProvider, setLastProvider] = useState(null);
  const abortRef = useRef(null);

  const streamChat = useCallback(async (messages, onChunk, options = {}) => {
    setLoading(true);
    setStreaming(true);
    setError(null);
    setLastProvider(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          provider: settings?.preferredProvider || 'auto',
          options,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith('data:')) continue;

          try {
            const data = JSON.parse(line.slice(5));
            if (data.error) throw new Error(data.error);
            if (data.done) {
              setLastProvider({ provider: data.provider, model: data.model });
            } else if (data.text) {
              fullText += data.text;
              onChunk?.(data.text, fullText);
            }
          } catch (e) {
            if (e.message && !e.message.includes('JSON')) throw e;
          }
        }
      }

      return fullText;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
    }
  }, [settings?.preferredProvider]);

  const generateItinerary = useCallback(async (trip, onChunk) => {
    const prompt = PROMPTS.itinerary(trip);
    const text = await streamChat(
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      onChunk,
      { maxTokens: 8192 }
    );

    if (text) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch {
        // If JSON parsing fails, return raw text
      }
      return { raw: text };
    }
    return null;
  }, [streamChat]);

  const generateBudget = useCallback(async (trip, itinerary, onChunk) => {
    const prompt = PROMPTS.budget(trip, itinerary);
    const text = await streamChat(
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      onChunk,
      { maxTokens: 4096 }
    );

    if (text) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch { /* ignore */ }
      return { raw: text };
    }
    return null;
  }, [streamChat]);

  const generatePackingList = useCallback(async (trip, onChunk) => {
    const prompt = PROMPTS.packing(trip);
    const text = await streamChat(
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      onChunk,
      { maxTokens: 4096 }
    );

    if (text) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch { /* ignore */ }
      return { raw: text };
    }
    return null;
  }, [streamChat]);

  const generateRecommendations = useCallback(async (trip, onChunk) => {
    const prompt = PROMPTS.recommendations(trip);
    const text = await streamChat(
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      onChunk,
      { maxTokens: 4096 }
    );

    if (text) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch { /* ignore */ }
      return { raw: text };
    }
    return null;
  }, [streamChat]);

  const testProvider = useCallback(async (providerName) => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName }),
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    loading,
    streaming,
    error,
    lastProvider,
    streamChat,
    generateItinerary,
    generateBudget,
    generatePackingList,
    generateRecommendations,
    testProvider,
    stopGeneration,
  };
}
