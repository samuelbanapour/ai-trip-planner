import React from 'react';

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="card" style={{
      marginBottom: '20px',
      border: '1px solid var(--error)',
      background: 'rgba(239, 68, 68, 0.08)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ color: 'var(--error)', fontSize: '14px' }}>❌ {message}</span>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
