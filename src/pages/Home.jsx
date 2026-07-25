import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatDate, getDayCount } from '../lib/helpers';

export default function Home() {
  const { trips, openTrip, deleteTrip } = useTrip();
  const { getEnabledProviderCount } = useSettings();
  const navigate = useNavigate();
  const providerCount = getEnabledProviderCount();

  const handleOpenTrip = (trip) => {
    openTrip(trip);
    navigate(`/trip/${trip.id}`);
  };

  return (
    <div>
      {/* Hero section */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          ✈️ AI Trip Planner
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px' }}>
          Plan your perfect trip with the power of AI. Generate itineraries, budgets,
          packing lists, and local recommendations — all powered by 7 free AI providers.
        </p>
      </div>

      {/* Provider warning */}
      {providerCount === 0 && (
        <div className="card" style={{
          marginBottom: '32px',
          border: '1px solid var(--warning)',
          background: 'rgba(245, 158, 11, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                No AI providers configured
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Add at least one free API key in Settings to start generating trips.
              </p>
            </div>
            <Link to="/settings" className="btn btn-primary btn-sm">
              Open Settings
            </Link>
          </div>
        </div>
      )}

      {/* Quick start */}
      <div className="card-grid" style={{ marginBottom: '40px' }}>
        <Link to="/new" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Plan a New Trip</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Tell us where you're going and let AI create your perfect itinerary
          </p>
        </Link>

        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            {providerCount > 0 ? `${providerCount} AI Provider${providerCount > 1 ? 's' : ''} Ready` : 'AI Providers'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {providerCount > 0
              ? 'Your AI is configured and ready to plan trips'
              : 'Configure free API keys to power your trip planning'}
          </p>
          {providerCount === 0 && (
            <Link to="/settings" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
              Configure Providers
            </Link>
          )}
        </div>
      </div>

      {/* Saved trips */}
      {trips.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Saved Trips</h2>
          <div className="card-grid">
            {trips.map((trip) => (
              <div key={trip.id} className="card" style={{ cursor: 'pointer' }}>
                <div onClick={() => handleOpenTrip(trip)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                      🌍 {trip.destination || 'Untitled Trip'}
                    </h3>
                    {trip.itinerary && (
                      <span style={{
                        padding: '2px 8px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: 'var(--success)',
                        fontSize: '11px',
                        fontWeight: '600',
                        borderRadius: '10px',
                      }}>
                        Planned
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {trip.startDate && trip.endDate
                      ? `${formatDate(trip.startDate)} — ${formatDate(trip.endDate)} (${getDayCount(trip.startDate, trip.endDate)} days)`
                      : 'Dates not set'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {trip.travelers && <span>👥 {trip.travelers}</span>}
                    {trip.budgetRange && <span>💰 {trip.budgetRange}</span>}
                    {trip.travelStyle && <span>🎒 {trip.travelStyle}</span>}
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleOpenTrip(trip); }}
                  >
                    Open
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this trip?')) deleteTrip(trip.id);
                    }}
                    style={{ color: 'var(--error)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {trips.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <h3>No trips yet</h3>
          <p>Create your first AI-powered trip plan to get started</p>
          <Link to="/new" className="btn btn-primary">
            Plan Your First Trip
          </Link>
        </div>
      )}
    </div>
  );
}
