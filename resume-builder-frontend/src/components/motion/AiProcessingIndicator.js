import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const AiProcessingIndicator = ({
  text = 'Processing with Career Intelligence...',
  subtext = '',
  size = 'md',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`ai-processing-indicator ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'sm' ? '1rem' : size === 'lg' ? '3rem 2rem' : '2rem 1.5rem',
        textAlign: 'center',
        gap: '0.75rem',
        ...style
      }}
    >
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Subtle breathing glow */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.45, 0.2]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            width: size === 'sm' ? '32px' : '44px',
            height: size === 'sm' ? '32px' : '44px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-primary) 0%, rgba(59, 130, 246, 0) 70%)'
          }}
        />

        {/* Central Icon */}
        <motion.div
          animate={{
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'relative',
            zIndex: 2,
            width: size === 'sm' ? '28px' : '36px',
            height: size === 'sm' ? '28px' : '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-soft)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}
        >
          <Sparkles size={size === 'sm' ? 14 : 18} />
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: size === 'sm' ? '0.8125rem' : '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}
        >
          {text}
        </motion.div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {subtext}
          </div>
        )}
      </div>

      {/* Shimmering Progress Bar */}
      <div
        style={{
          width: size === 'sm' ? '120px' : '180px',
          height: '3px',
          backgroundColor: 'var(--border-subtle)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          marginTop: '4px'
        }}
      >
        <motion.div
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '60%',
            background: 'linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
};

export default AiProcessingIndicator;
