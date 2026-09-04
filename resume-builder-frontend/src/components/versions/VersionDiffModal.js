import React from 'react';
import { GitCompare, X, PlusCircle, CheckCircle } from 'lucide-react';

const VersionDiffModal = ({ originalResume, tailoredResume, isOpen, onClose }) => {
  if (!isOpen || !originalResume || !tailoredResume) return null;

  // Extract skills diff
  const origSkills = (originalResume.skills || []).map(s => s.name);
  const tailSkills = (tailoredResume.skills || []).map(s => s.name);

  const addedSkills = tailSkills.filter(s => !origSkills.includes(s));

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="version-diff-title">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <GitCompare size={18} />
            </div>
            <div>
              <h3 id="version-diff-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Version Comparison: Original vs Tailored
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Inspect exact modifications, skill emphases, and wording changes between versions.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Diff Summary Badges */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PlusCircle size={14} /> {addedSkills.length} Emphasized Skills
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Target: {tailoredResume.targetRole || 'Specific Role'}
          </span>
        </div>

        {/* Side-by-side View */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '420px', overflowY: 'auto' }}>
          {/* Left: Original */}
          <div style={{ padding: '12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              Base Version (v{originalResume.version || 1})
            </h4>
            <div style={{ fontSize: '0.8125rem', marginBottom: '10px' }}>
              <strong>Title:</strong> {originalResume.title}
            </div>
            <div style={{ fontSize: '0.8125rem', marginBottom: '10px' }}>
              <strong>Summary:</strong>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>{originalResume.personal?.summary || 'No summary'}</p>
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Skills ({origSkills.length}):</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {origSkills.map((s, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', padding: '1px 6px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '3px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Tailored */}
          <div style={{ padding: '12px', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--accent-border)', paddingBottom: '4px' }}>
              Tailored Version (v{tailoredResume.version || 2})
            </h4>
            <div style={{ fontSize: '0.8125rem', marginBottom: '10px' }}>
              <strong>Target:</strong> {tailoredResume.title}
            </div>
            <div style={{ fontSize: '0.8125rem', marginBottom: '10px' }}>
              <strong>Summary:</strong>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-primary)' }}>{tailoredResume.personal?.summary || 'No summary'}</p>
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Skills ({tailSkills.length}):</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {tailSkills.map((s, i) => {
                  const isNew = addedSkills.includes(s);
                  return (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        padding: '1px 6px',
                        backgroundColor: isNew ? 'var(--success-bg)' : 'var(--bg-surface)',
                        color: isNew ? 'var(--success)' : 'var(--text-primary)',
                        border: isNew ? '1px solid var(--success-border)' : '1px solid var(--border-subtle)',
                        borderRadius: '3px',
                        fontWeight: isNew ? 700 : 400
                      }}
                    >
                      {s} {isNew ? '★' : ''}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Diff
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionDiffModal;
