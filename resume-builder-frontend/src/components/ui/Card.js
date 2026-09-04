import React from 'react';

export const Card = ({
  children,
  className = '',
  style = {},
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`card-ui ${className}`}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        ...(hoverable
          ? {
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-md)',
                borderColor: 'var(--accent-primary)'
              }
            }
          : {}),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, style = {}, className = '', ...props }) => (
  <div
    className={`card-header-ui ${className}`}
    style={{
      paddingBottom: '0.875rem',
      marginBottom: '1rem',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...style
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardBody = ({ children, style = {}, className = '', ...props }) => (
  <div className={`card-body-ui ${className}`} style={{ ...style }} {...props}>
    {children}
  </div>
);
