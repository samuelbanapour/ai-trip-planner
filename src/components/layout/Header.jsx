import React from 'react';
import { useTrip } from '../../contexts/TripContext';

export default function Header({ onMenuToggle }) {
  const { activeTrip } = useTrip();

  return (
    <header className="main-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onMenuToggle}
          style={{ display: 'none' }}
          id="menu-toggle"
        >
          ☰
        </button>
        <h2>{activeTrip?.destination || 'AI Trip Planner'}</h2>
        {activeTrip && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {activeTrip.startDate && activeTrip.endDate
              ? `${activeTrip.startDate} → ${activeTrip.endDate}`
              : ''}
          </span>
        )}
      </div>

      <div className="header-actions">
        {activeTrip?.itinerary && (
          <div className="ai-status ready">
            <span className="status-dot" />
            Itinerary generated
          </div>
        )}
      </div>
    </header>
  );
}
