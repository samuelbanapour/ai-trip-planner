import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../hooks/useAI';
import { formatCurrency } from '../lib/helpers';

const TYPE_ICONS = {
  museum: '🏛️',
  park: '🌳',
  landmark: '🗼',
  market: '🏪',
  experience: '⚡',
  temple: '⛩️',
  beach: '🏖️',
  garden: '🌺',
};

export default function Recommendations() {
  const { id } = useParams();
  const { trips, activeTrip, openTrip, updateTrip } = useTrip();
  const { generateRecommendations, loading, error, stopGeneration } = useAI();
  const [streamText, setStreamText] = useState('');

  const trip = trips.find((t) => t.id === id) || activeTrip;

  useEffect(() => {
    if (trip && (!activeTrip || activeTrip.id !== id)) {
      openTrip(trip);
    }
  }, [trip, id, activeTrip, openTrip]);

  const handleGenerate = useCallback(async () => {
    if (!trip) return;
    setStreamText('');
    try {
      const recs = await generateRecommendations(trip, (chunk, full) => {
        setStreamText(full);
      });
      if (recs) {
        updateTrip(trip.id, { recommendations: recs });
      }
    } catch (err) {
      console.error('Recommendations generation failed:', err);
    }
  }, [trip, generateRecommendations, updateTrip]);

  if (!trip) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⭐</div>
        <h3>No trip selected</h3>
        <Link to="/new" className="btn btn-primary">Plan a Trip</Link>
      </div>
    );
  }

  const recs = trip.recommendations;
  const isJsonRecs = recs && (recs.restaurants || recs.attractions);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
            ⭐ Recommendations — {trip.destination}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Curated restaurants, attractions, and local tips
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {loading && (
            <button className="btn btn-danger btn-sm" onClick={stopGeneration}>⏹ Stop</button>
          )}
          <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Generating...</> : '🔄 Regenerate'}
          </button>
        </div>
      </div>

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

      {loading && streamText && (
        <div className="card" style={{ marginBottom: '24px', maxHeight: '300px', overflow: 'auto' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            ✨ AI is finding recommendations...
          </div>
          <pre style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            color: 'var(--text-secondary)',
          }}>
            {streamText}
            <span className="streaming-cursor" />
          </pre>
        </div>
      )}

      {!recs && !loading && (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No recommendations yet</h3>
          <p>Let AI find the best restaurants, attractions, and local tips</p>
          <button className="btn btn-primary" onClick={handleGenerate}>
            ✨ Get Recommendations
          </button>
        </div>
      )}

      {isJsonRecs && (
        <>
          {/* Restaurants */}
          {recs.restaurants && recs.restaurants.length > 0 && (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                🍽️ Restaurants
              </h2>
              <div className="card-grid" style={{ marginBottom: '32px' }}>
                {recs.restaurants.map((r, idx) => (
                  <div key={idx} className="place-card">
                    <div className="place-type">{r.cuisine || 'Restaurant'}</div>
                    <h4>{r.name}</h4>
                    <p>{r.highlight}</p>
                    <div className="place-meta">
                      {r.priceRange && <span>{r.priceRange}</span>}
                    </div>
                    {r.tip && <div className="place-tip">💡 {r.tip}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Attractions */}
          {recs.attractions && recs.attractions.length > 0 && (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                🏛️ Attractions
              </h2>
              <div className="card-grid" style={{ marginBottom: '32px' }}>
                {recs.attractions.map((a, idx) => (
                  <div key={idx} className="place-card">
                    <div className="place-type">
                      {TYPE_ICONS[a.type] || '📍'} {a.type || 'Attraction'}
                    </div>
                    <h4>{a.name}</h4>
                    <p>{a.description}</p>
                    <div className="place-meta">
                      {a.estimatedCost > 0 && (
                        <span>{formatCurrency(a.estimatedCost)}</span>
                      )}
                      {a.timeNeeded && <span>⏱ {a.timeNeeded}</span>}
                    </div>
                    {a.tip && <div className="place-tip">💡 {a.tip}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Local Tips */}
          {recs.localTips && recs.localTips.length > 0 && (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                💡 Local Tips
              </h2>
              <ul className="tips-list">
                {recs.localTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {recs && !isJsonRecs && recs.raw && (
        <div className="card">
          <pre style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
          }}>
            {recs.raw}
          </pre>
        </div>
      )}
    </div>
  );
}
