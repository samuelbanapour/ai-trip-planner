import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../hooks/useAI';

export default function PackingList() {
  const { id } = useParams();
  const { trips, activeTrip, openTrip, updateTrip } = useTrip();
  const { generatePackingList, loading, error, stopGeneration } = useAI();
  const [streamText, setStreamText] = useState('');
  const [checkedItems, setCheckedItems] = useState({});

  const trip = trips.find((t) => t.id === id) || activeTrip;

  useEffect(() => {
    if (trip && (!activeTrip || activeTrip.id !== id)) {
      openTrip(trip);
    }
  }, [trip, id, activeTrip, openTrip]);

  // Load saved checked state
  useEffect(() => {
    if (trip?.packingChecked) {
      setCheckedItems(trip.packingChecked);
    }
  }, [trip?.packingChecked]);

  const handleGenerate = useCallback(async () => {
    if (!trip) return;
    setStreamText('');
    setCheckedItems({});
    try {
      const packingList = await generatePackingList(trip, (chunk, full) => {
        setStreamText(full);
      });
      if (packingList) {
        updateTrip(trip.id, { packingList, packingChecked: {} });
      }
    } catch (err) {
      console.error('Packing list generation failed:', err);
    }
  }, [trip, generatePackingList, updateTrip]);

  const toggleItem = (categoryIdx, itemIdx) => {
    const key = `${categoryIdx}-${itemIdx}`;
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (trip) updateTrip(trip.id, { packingChecked: next });
      return next;
    });
  };

  if (!trip) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🧳</div>
        <h3>No trip selected</h3>
        <Link to="/new" className="btn btn-primary">Plan a Trip</Link>
      </div>
    );
  }

  const packingList = trip.packingList;
  const isJsonList = packingList && packingList.categories;

  // Calculate progress
  let totalItems = 0;
  let checkedCount = 0;
  if (isJsonList) {
    packingList.categories.forEach((cat, catIdx) => {
      cat.items.forEach((item, itemIdx) => {
        totalItems++;
        if (checkedItems[`${catIdx}-${itemIdx}`]) checkedCount++;
      });
    });
  }
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
            🧳 Packing List — {trip.destination}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            AI-generated based on your destination, weather, and activities
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
            ✨ AI is creating your packing list...
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

      {!packingList && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🧳</div>
          <h3>No packing list yet</h3>
          <p>Let AI create a personalized packing list for your trip</p>
          <button className="btn btn-primary" onClick={handleGenerate}>
            ✨ Generate Packing List
          </button>
        </div>
      )}

      {isJsonList && (
        <>
          {/* Progress */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Packing Progress</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {checkedCount} / {totalItems} items
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Weather notes */}
          {packingList.weatherNotes && (
            <div className="card" style={{
              marginBottom: '24px',
              borderLeft: '3px solid var(--accent)',
              padding: '12px 16px',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                🌤️ {packingList.weatherNotes}
              </span>
            </div>
          )}

          {/* Categories */}
          {packingList.categories.map((cat, catIdx) => (
            <div key={catIdx} className="packing-category">
              <div className="packing-category-header">
                <span style={{ fontSize: '20px' }}>{cat.icon || '📦'}</span>
                <h3>{cat.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {cat.items.length} items
                </span>
              </div>
              {cat.items.map((item, itemIdx) => {
                const key = `${catIdx}-${itemIdx}`;
                const isChecked = checkedItems[key];
                return (
                  <div key={itemIdx} className={`packing-item ${isChecked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      onChange={() => toggleItem(catIdx, itemIdx)}
                    />
                    <span className="packing-item-name">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="packing-item-qty">×{item.quantity}</span>
                    )}
                    {!item.essential && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>optional</span>
                    )}
                    {item.notes && (
                      <span className="packing-item-notes">{item.notes}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {packingList && !isJsonList && packingList.raw && (
        <div className="card">
          <pre style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
          }}>
            {packingList.raw}
          </pre>
        </div>
      )}
    </div>
  );
}
