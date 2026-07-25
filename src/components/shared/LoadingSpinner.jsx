import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : '';
  return (
    <div className="loading-container">
      <div className={`spinner ${sizeClass}`} />
      {text && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{text}</p>}
    </div>
  );
}
