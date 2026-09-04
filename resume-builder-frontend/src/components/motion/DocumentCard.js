import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowUpRight } from 'lucide-react';
import { documentHover } from '../../utils/motion';

const DocumentCard = ({
  title,
  subtitle,
  metrics,
  badge,
  onClick,
  actions,
  className = '',
  style = {}
}) => {
  return (
    <motion.div
      variants={documentHover}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`document-card ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <FileText size={18} />
          </div>
          {badge && (
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              {badge}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Metrics & Actions Footer */}
      <div style={{ marginTop: '1.25rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {metrics}
        </div>
        {actions ? (
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '4px' }}>
            {actions}
          </div>
        ) : onClick ? (
          <ArrowUpRight size={15} style={{ color: 'var(--text-muted)' }} />
        ) : null}
      </div>
    </motion.div>
  );
};

export default DocumentCard;
