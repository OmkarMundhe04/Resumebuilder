import React from 'react';

export const Progress = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  color = 'var(--accent-primary)',
  height = '8px',
  style = {}
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div style={{ width: '100%', ...style }}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '0.8125rem',
            fontWeight: '600'
          }}
        >
          {label && <span style={{ color: 'var(--text-primary)' }}>{label}</span>}
          {showPercentage && (
            <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '9999px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '9999px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
};
