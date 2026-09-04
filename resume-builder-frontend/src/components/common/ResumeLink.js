import React from 'react';

/**
 * Standardized Clickable Link Component for Resumes
 * Ensures valid protocol, accessible styling, and clickable anchors in HTML, print, and PDF.
 */
const ResumeLink = ({ href, label, children, style = {}, className = '', target = '_blank', rel = 'noopener noreferrer' }) => {
  if (!href) return null;

  const rawHref = String(href).trim();
  if (!rawHref) return null;

  // Normalize protocol
  let normalizedHref = rawHref;
  if (rawHref.includes('@') && !rawHref.startsWith('mailto:')) {
    normalizedHref = `mailto:${rawHref}`;
  } else if (/^\+?[0-9\s\-()]{7,}$/.test(rawHref) && !rawHref.startsWith('tel:')) {
    normalizedHref = `tel:${rawHref.replace(/\s+/g, '')}`;
  } else if (!rawHref.startsWith('http://') && !rawHref.startsWith('https://') && !rawHref.startsWith('mailto:') && !rawHref.startsWith('tel:')) {
    normalizedHref = `https://${rawHref}`;
  }

  // Display text
  const displayText = label || children || rawHref.replace(/^https?:\/\//, '').replace(/^mailto:/, '').replace(/^tel:/, '').replace(/\/$/, '');

  const defaultStyle = {
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    ...style
  };

  return (
    <a
      href={normalizedHref}
      target={target}
      rel={rel}
      style={defaultStyle}
      className={`resume-link ${className}`}
      data-resume-url={normalizedHref}
    >
      {displayText}
    </a>
  );
};

export default ResumeLink;
