import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTrip } from '../../contexts/TripContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function Sidebar({ open, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { trips, activeTrip, openTrip } = useTrip();
  const { getEnabledProviderCount } = useSettings();
  const providerCount = getEnabledProviderCount();

  const isActive = (path) => location.pathname === path;
  const tripId = activeTrip?.id;

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <span className="logo-icon">✈️</span>
        <h1>Trip Planner</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">General</div>
          <Link
            to="/"
            className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
          >
            <span className="link-icon">🏠</span>
            Home
          </Link>
          <Link
            to="/new"
            className={`sidebar-link ${isActive('/new') ? 'active' : ''}`}
          >
            <span className="link-icon">➕</span>
            New Trip
          </Link>
          <Link
            to="/voice"
            className={`sidebar-link ${isActive('/voice') ? 'active' : ''}`}
          >
            <span className="link-icon">🎤</span>
            Voice Setup
          </Link>
        </div>

        {tripId && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Current Trip</div>
            <Link
              to={`/trip/${tripId}`}
              className={`sidebar-link ${location.pathname === `/trip/${tripId}` ? 'active' : ''}`}
            >
              <span className="link-icon">📋</span>
              Itinerary
            </Link>
            <Link
              to={`/trip/${tripId}/budget`}
              className={`sidebar-link ${location.pathname === `/trip/${tripId}/budget` ? 'active' : ''}`}
            >
              <span className="link-icon">💰</span>
              Budget
            </Link>
            <Link
              to={`/trip/${tripId}/packing`}
              className={`sidebar-link ${location.pathname === `/trip/${tripId}/packing` ? 'active' : ''}`}
            >
              <span className="link-icon">🧳</span>
              Packing List
            </Link>
            <Link
              to={`/trip/${tripId}/recommendations`}
              className={`sidebar-link ${location.pathname === `/trip/${tripId}/recommendations` ? 'active' : ''}`}
            >
              <span className="link-icon">⭐</span>
              Recommendations
            </Link>
          </div>
        )}

        {trips.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Saved Trips</div>
            {trips.slice(0, 5).map((trip) => (
              <button
                key={trip.id}
                className={`sidebar-link ${activeTrip?.id === trip.id ? 'active' : ''}`}
                onClick={() => {
                  openTrip(trip);
                  navigate(`/trip/${trip.id}`);
                }}
              >
                <span className="link-icon">🌍</span>
                {trip.destination || 'Untitled Trip'}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <Link
          to="/settings"
          className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
        >
          <span className="link-icon">⚙️</span>
          Settings
          {providerCount === 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--warning)' }}>
              ⚠️
            </span>
          )}
        </Link>
        <div className="ai-status" style={{ marginTop: '8px' }}>
          <span className={`status-dot ${providerCount > 0 ? '' : ''}`}
            style={{ background: providerCount > 0 ? 'var(--success)' : 'var(--text-muted)' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {providerCount > 0 ? `${providerCount} AI provider${providerCount > 1 ? 's' : ''} ready` : 'No providers configured'}
          </span>
        </div>
      </div>
    </aside>
  );
}
