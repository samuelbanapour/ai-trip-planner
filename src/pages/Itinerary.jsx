import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../hooks/useAI';
import { formatDate, addDays, CATEGORY_ICONS, formatCurrency } from '../lib/helpers';

export default function Itinerary() {
  const { id } = useParams();
  const { trips, activeTrip, openTrip, updateTrip } = useTrip();
  const { generateItinerary, loading, streaming, error, stopGeneration } = useAI();
  const [streamText, setStreamText] = useState('');

  const trip = trips.find((t) => t.id === id) || activeTrip;

  useEffect(() => {
    if (trip && (!activeTrip || activeTrip.id !== id)) {
      openTrip(trip);
    }
  }, [trip, id, activeTrip, openTrip]);

  const handleRegenerate = useCallback(async () => {
    if (!trip) return;
    setStreamText('');
    try {
      const itinerary = await generateItinerary(trip, (chunk, full) => {
        setStreamText(full);
      });
      if (itinerary) {
        updateTrip(trip.id, { itinerary });
      }
    } catch (err) {
      console.error('Generation failed:', err);
    }
  }, [trip, generateItinerary, updateTrip]);

  if (!trip) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🌍</div>
        <h3>No trip selected</h3>
        <p>Create or select a trip to view its itinerary</p>
        <Link to="/new" className="btn btn-primary">Plan a Trip</Link>
      </div>
    );
  }

  const itinerary = trip.itinerary;
  const isJsonItinerary = itinerary && itinerary.days;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
            📋 Itinerary — {trip.destination}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {trip.startDate && trip.endDate
              ? `${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}`
              : 'Dates not set'}
            {trip.duration ? ` · ${trip.duration} days` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {loading && (
            <button className="btn btn-danger btn-sm" onClick={stopGeneration}>
              ⏹ Stop
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleRegenerate}
            disabled={loading}
          >
            {loading ? <><span className="spinner spinner-sm" /> Generating...</> : '🔄 Regenerate'}
          </button>
        </div>
      </div>

      {/* Error */}
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

      {/* Streaming preview while generating */}
      {loading && streamText && (
        <div className="card" style={{ marginBottom: '24px', maxHeight: '400px', overflow: 'auto' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            ✨ AI is generating your itinerary...
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

      {/* No itinerary yet */}
      {!itinerary && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No itinerary generated yet</h3>
          <p>Click "Generate" to have AI create a day-by-day plan for your trip</p>
          <button className="btn btn-primary" onClick={handleRegenerate}>
            ✨ Generate Itinerary
          </button>
        </div>
      )}

      {/* Structured itinerary */}
      {isJsonItinerary && itinerary.days.map((day, idx) => (
        <div key={idx} className="day-card">
          <div className="day-header">
            <div>
              <h3>Day {day.day} — {day.theme || ''}</h3>
              <span className="day-date">
                {trip.startDate ? formatDate(addDays(trip.startDate, idx)) : ''}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {day.activities?.length || 0} activities
            </span>
          </div>
          <div className="day-activities">
            {(day.activities || []).map((act, actIdx) => (
              <div key={actIdx} className="activity-item">
                <div className="activity-time">
                  {act.time || ''}
                  {act.endTime ? ` – ${act.endTime}` : ''}
                </div>
                <div className="activity-details">
                  <h4>
                    {CATEGORY_ICONS[act.category] || '📌'} {act.title}
                  </h4>
                  <p>{act.description}</p>
                  {act.location && (
                    <div className="activity-meta">
                      <span>📍 {act.location}</span>
                      {act.cost > 0 && (
                        <span className="activity-cost">{formatCurrency(act.cost)}</span>
                      )}
                    </div>
                  )}
                  {act.tips && (
                    <div style={{
                      marginTop: '6px',
                      padding: '6px 10px',
                      background: 'var(--accent-light)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: 'var(--accent)',
                    }}>
                      💡 {act.tips}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Raw text fallback */}
      {itinerary && !isJsonItinerary && itinerary.raw && (
        <div className="card">
          <pre style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
          }}>
            {itinerary.raw}
          </pre>
        </div>
      )}

      {/* Action links */}
      {isJsonItinerary && (
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <Link to={`/trip/${id}/budget`} className="btn btn-secondary">
            💰 View Budget
          </Link>
          <Link to={`/trip/${id}/packing`} className="btn btn-secondary">
            🧳 Packing List
          </Link>
          <Link to={`/trip/${id}/recommendations`} className="btn btn-secondary">
            ⭐ Recommendations
          </Link>
        </div>
      )}
    </div>
  );
}
