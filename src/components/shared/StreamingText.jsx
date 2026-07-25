import React from 'react';

export default function StreamingText({ text, streaming = false }) {
  if (!text) return null;
  return (
    <pre style={{
      fontSize: '13px',
      fontFamily: 'var(--font-mono)',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.7',
      color: 'var(--text-secondary)',
    }}>
      {text}
      {streaming && <span className="streaming-cursor" />}
    </pre>
  );
}
