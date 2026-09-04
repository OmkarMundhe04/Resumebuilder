import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'verified':
        return {
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        };
      case 'imported':
        return {
          background: 'rgba(59, 130, 246, 0.12)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.25)'
        };
      case 'suggested':
        return {
          background: 'rgba(245, 158, 11, 0.12)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.25)'
        };
      case 'sample':
        return {
          background: 'rgba(139, 92, 246, 0.15)',
          color: '#8b5cf6',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          fontWeight: '700'
        };
      case 'warning':
        return {
          background: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.25)'
        };
      case 'info':
        return {
          background: 'rgba(6, 182, 212, 0.12)',
          color: '#06b6d4',
          border: '1px solid rgba(6, 182, 212, 0.25)'
        };
      case 'default':
      default:
        return {
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '2px 8px', fontSize: '0.7rem' };
      case 'lg':
        return { padding: '6px 14px', fontSize: '0.85rem' };
      case 'md':
      default:
        return { padding: '4px 10px', fontSize: '0.75rem' };
    }
  };

  return (
    <span
      className={`badge-ui ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: '9999px',
        fontWeight: '600',
        lineHeight: '1.2',
        letterSpacing: '0.025em',
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...style
      }}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 11 : size === 'lg' ? 15 : 13} />}
      {children}
    </span>
  );
};
