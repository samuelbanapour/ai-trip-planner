import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../hooks/useAI';
import { useSettings } from '../contexts/SettingsContext';
import { getToday, getMinDate, calculateDuration, TRAVEL_STYLES, INTERESTS } from '../lib/helpers';

export default function TripForm() {
  const navigate = useNavigate();
  const { createTrip, updateTrip } = useTrip();
  const { generateItinerary } = useAI();
  const { getEnabledProviderCount } = useSettings();

  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    totalBudget: '',
    budgetRange: 'mid',
    travelStyle: 'mid',
    interests: [],
    dietaryRestrictions: '',
    accessibility: '',
  });

  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState(null);

  const duration = calculateDuration(form.startDate, form.endDate);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleGenerate = useCallback(async () => {
    if (!form.destination) {
      setError('Please enter a destination');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Please select travel dates');
      return;
    }
    if (getEnabledProviderCount() === 0) {
      setError('No AI providers configured. Open Settings and add at least one API key.');
      return;
    }

    setError(null);
    setGenerating(true);
    setStreamText('');

    try {
      const tripData = {
        ...form,
        duration,
        currency: 'USD',
      };

      const itinerary = await generateItinerary(tripData, (chunk, full) => {
        setStreamText(full);
      });

      if (itinerary) {
        const trip = createTrip(tripData);
        updateTrip(trip.id, { itinerary });
        navigate(`/trip/${trip.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [form, duration, generateItinerary, createTrip, updateTrip, navigate, getEnabledProviderCount]);

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
        🗺️ Plan a New Trip
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Tell us about your trip and AI will create a personalized itinerary.
      </p>

      {error && (
        <div className="card" style={{
          marginBottom: '20px',
          border: '1px solid var(--error)',
          background: 'rgba(239, 68, 68, 0.08)',
          padding: '12px 16px',
          color: 'var(--error)',
          fontSize: '14px',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Destination */}
      <div className="form-group">
        <label className="form-label">Where are you going?</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Paris, Tokyo, New York..."
          value={form.destination}
          onChange={(e) => updateField('destination', e.target.value)}
          autoFocus
        />
      </div>

      {/* Dates */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input"
            value={form.startDate}
            min={getMinDate()}
            onChange={(e) => updateField('startDate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-input"
            value={form.endDate}
            min={form.startDate || getMinDate()}
            onChange={(e) => updateField('endDate', e.target.value)}
          />
        </div>
      </div>

      {duration > 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-12px', marginBottom: '20px' }}>
          📅 {duration} day{duration > 1 ? 's' : ''}
        </p>
      )}

      {/* Travelers & Budget */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Number of Travelers</label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="20"
            value={form.travelers}
            onChange={(e) => updateField('travelers', parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Total Budget (optional)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 3000"
            value={form.totalBudget}
            onChange={(e) => updateField('totalBudget', e.target.value)}
          />
        </div>
      </div>

      {/* Travel Style */}
      <div className="form-group">
        <label className="form-label">Budget Level</label>
        <div className="chip-group">
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.id}
              className={`chip ${form.budgetRange === style.id ? 'active' : ''}`}
              onClick={() => updateField('budgetRange', style.id)}
            >
              {style.icon} {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="form-group">
        <label className="form-label">Interests (select all that apply)</label>
        <div className="chip-group">
          {INTERESTS.map((interest) => (
            <button
              key={interest}
              className={`chip ${form.interests.includes(interest) ? 'active' : ''}`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary & Accessibility */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Dietary Restrictions (optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Vegetarian, Gluten-free"
            value={form.dietaryRestrictions}
            onChange={(e) => updateField('dietaryRestrictions', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Accessibility Needs (optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Wheelchair accessible"
            value={form.accessibility}
            onChange={(e) => updateField('accessibility', e.target.value)}
          />
        </div>
      </div>

      {/* Generate Button */}
      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="spinner spinner-sm" /> Generating Itinerary...
            </>
          ) : (
            '✨ Generate Itinerary'
          )}
        </button>
        {generating && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            AI is planning your trip...
          </span>
        )}
      </div>

      {/* Streaming Preview */}
      {generating && streamText && (
        <div className="card" style={{ marginTop: '20px', maxHeight: '300px', overflow: 'auto' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            AI Response Preview:
          </div>
          <pre style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
          }}>
            {streamText}
            <span className="streaming-cursor" />
          </pre>
        </div>
      )}
    </div>
  );
}
