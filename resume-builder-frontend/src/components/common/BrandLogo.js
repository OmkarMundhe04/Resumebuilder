import React from 'react';
import logoImg from '../../assets/logo.png';

const BrandLogo = ({
  size = 28,
  className = '',
  style = {},
  rounded = 6,
  showGlow = false,
  alt = 'ResumeBuilder Logo'
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  const radius = typeof rounded === 'number' ? `${rounded}px` : rounded;

  return (
    <div
      className={`brand-logo-wrap ${className}`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        borderRadius: radius,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: '#0a0a0f',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: showGlow ? '0 0 16px rgba(59, 130, 246, 0.35)' : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style
      }}
    >
      <img
        src={logoImg}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
};

export default BrandLogo;
