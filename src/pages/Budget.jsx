import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../hooks/useAI';
import { formatCurrency, formatDate, addDays } from '../lib/helpers';

const CATEGORY_ICONS = {
  'Accommodation': '🏨',
  'Food & Dining': '🍽️',
  'Transportation': '🚗',
  'Activities': '🎭',
  'Shopping': '🛍️',
  'Miscellaneous': '📦',
};

export default function Budget() {
  const { id } = useParams();
  const { trips, activeTrip, openTrip, updateTrip } = useTrip();
  const { generateBudget, loading, error, stopGeneration } = useAI();
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
      const budget = await generateBudget(trip, trip.itinerary, (chunk, full) => {
        setStreamText(full);
      });
      if (budget) {
        updateTrip(trip.id, { budget });
      }
    } catch (err) {
      console.error('Budget generation failed:', err);
    }
  }, [trip, generateBudget, updateTrip]);

  if (!trip) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💰</div>
        <h3>No trip selected</h3>
        <Link to="/new" className="btn btn-primary">Plan a Trip</Link>
      </div>
    );
  }

  const budget = trip.budget;
  const isJsonBudget = budget && budget.categories;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
            💰 Budget — {trip.destination}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {trip.totalBudget ? `Budget: ${formatCurrency(trip.totalBudget, trip.currency)}` : 'Budget not set'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {loading && (
            <button className="btn btn-danger btn-sm" onClick={stopGeneration}>⏹ Stop</button>
          )}
          <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Generating...</> : '🔄 Generate Budget'}
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
            ✨ AI is calculating your budget...
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

      {!budget && !loading && (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>No budget breakdown yet</h3>
          <p>Let AI create a detailed budget based on your destination and travel style</p>
          <button className="btn btn-primary" onClick={handleGenerate}>
            ✨ Generate Budget
          </button>
        </div>
      )}

      {isJsonBudget && (
        <>
          {/* Summary stats */}
          <div className="budget-summary">
            <div className="budget-stat">
              <div className="stat-value">{formatCurrency(budget.totalEstimate, budget.currency)}</div>
              <div className="stat-label">Total Estimate</div>
            </div>
            <div className="budget-stat">
              <div className="stat-value">
                {formatCurrency(budget.totalEstimate / (trip.duration || 1), budget.currency)}
              </div>
              <div className="stat-label">Per Day</div>
            </div>
            <div className="budget-stat">
              <div className="stat-value">
                {formatCurrency(budget.totalEstimate / (trip.travelers || 1), budget.currency)}
              </div>
              <div className="stat-label">Per Person</div>
            </div>
            {trip.totalBudget && (
              <div className="budget-stat">
                <div className="stat-value" style={{
                  color: trip.totalBudget >= budget.totalEstimate ? 'var(--success)' : 'var(--error)',
                }}>
                  {formatCurrency(trip.totalBudget - budget.totalEstimate, budget.currency)}
                </div>
                <div className="stat-label">
                  {trip.totalBudget >= budget.totalEstimate ? 'Under Budget' : 'Over Budget'}
                </div>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>By Category</h2>
          <div className="card-grid" style={{ marginBottom: '32px' }}>
            {(budget.categories || []).map((cat, idx) => (
              <div key={idx} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{CATEGORY_ICONS[cat.name] || '📦'}</span>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600' }}>{cat.name}</h3>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>
                      {formatCurrency(cat.total, budget.currency)}
                    </p>
                  </div>
                </div>
                {cat.items && (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {cat.items.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: i < cat.items.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <span>{item.description}</span>
                        <span style={{ fontWeight: '500' }}>{formatCurrency(item.cost, budget.currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Daily breakdown */}
          {budget.dailyBreakdown && budget.dailyBreakdown.length > 0 && (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Daily Breakdown</h2>
              <div style={{ marginBottom: '32px' }}>
                {budget.dailyBreakdown.map((day, idx) => (
                  <div key={idx} className="card" style={{ marginBottom: '8px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500' }}>
                        Day {day.day} {trip.startDate ? `(${formatDate(addDays(trip.startDate, idx))})` : ''}
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
                        {formatCurrency(day.total, budget.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tips */}
          {budget.tips && budget.tips.length > 0 && (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>💡 Money-Saving Tips</h2>
              <ul className="tips-list">
                {budget.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* Raw text fallback */}
      {budget && !isJsonBudget && budget.raw && (
        <div className="card">
          <pre style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
          }}>
            {budget.raw}
          </pre>
        </div>
      )}
    </div>
  );
}
