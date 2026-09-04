import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  RefreshCw,
  Target
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ProjectDescriptionModal = ({
  isOpen,
  onClose,
  project = {},
  targetRole = '',
  jobDescription = '',
  onApplyDescription
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [variants, setVariants] = useState(null);
  const [isGeminiPowered, setIsGeminiPowered] = useState(false);

  const generateDescriptions = useCallback(async () => {
    if (!project.name?.trim() && (!project.technologies || project.technologies.length === 0) && !project.description?.trim()) {
      setError('Please provide at least a project name, technologies, or description first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/ai/project-description', {
        projectName: project.name || '',
        technologies: project.technologies || [],
        context: project.description || '',
        existingDescription: project.description || '',
        targetRole: targetRole || '',
        jobDescription: jobDescription || ''
      });

      if (res.data.success && res.data.variants) {
        setVariants(res.data.variants);
        setIsGeminiPowered(Boolean(res.data.isGeminiPowered));
      } else {
        setError(res.data.message || 'Failed to generate description variants.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate descriptions. Please try again.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, targetRole, jobDescription]);

  useEffect(() => {
    if (isOpen) {
      generateDescriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUse = (text) => {
    if (onApplyDescription) {
      onApplyDescription(text);
      addToast('Project description updated.', 'success');
      onClose();
    }
  };

  const variantList = variants ? [
    {
      key: 'concise',
      label: 'Concise Resume Style',
      badge: 'Standard ATS',
      text: variants.concise,
      description: 'Clear, 2-sentence overview suited for standard resume project layouts.'
    },
    {
      key: 'technical',
      label: 'Technical Architecture Focus',
      badge: 'Systems & Tools',
      text: variants.technical,
      description: 'Emphasizes concrete frameworks, modular architecture, and engineering standards.'
    },
    {
      key: 'roleTargeted',
      label: `Role-Targeted Optimization ${targetRole ? `(${targetRole})` : ''}`,
      badge: 'Target Role',
      text: variants.roleTargeted,
      description: 'Tailored to highlight relevance to your target role based on verified technologies.'
    },
    {
      key: 'portfolio',
      label: 'Portfolio Narrative Style',
      badge: 'Portfolio Showcase',
      text: variants.portfolio,
      description: 'Engaging, narrative summary highlighting problem solving and execution.'
    }
  ].filter(v => Boolean(v.text)) : [];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="project-desc-modal-title">
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 id="project-desc-modal-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Generate Project Description: {project.name || 'Project'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evidence-grounded, human-sounding descriptions optimized for your target role
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '1rem 0', flex: 1 }}>
          {/* Zero-Hallucination Policy Badge */}
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={16} color="var(--info)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Zero-Hallucination Policy:</strong> Only verified technologies and stated functionality are used. No fake metrics, percentages, or user counts are invented.
            </div>
          </div>

          {/* Context Info */}
          <div style={{ padding: '10px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Technologies: </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {Array.isArray(project.technologies) && project.technologies.length > 0
                  ? project.technologies.join(', ')
                  : 'None specified'}
              </span>
            </div>
            {targetRole && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={12} color="var(--accent-primary)" />
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Target Role: </span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{targetRole}</span>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin-slow" style={{ margin: '0 auto 10px auto', color: 'var(--accent-primary)' }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
                Generating description variants with Gemini AI...
              </p>
              <span style={{ fontSize: '0.75rem' }}>Analyzing verified project architecture & role relevance</span>
            </div>
          )}

          {/* Error display */}
          {error && !loading && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg, #fef2f2)', border: '1px solid var(--danger-border, #fca5a5)', borderRadius: 'var(--radius-md)', color: 'var(--danger, #dc2626)', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <div style={{ flex: 1 }}>{error}</div>
              <button onClick={generateDescriptions} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                Retry
              </button>
            </div>
          )}

          {/* Variants display */}
          {!loading && variantList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {variantList.map(v => (
                <div
                  key={v.key}
                  style={{
                    padding: '14px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {v.label}
                      </span>
                      <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--accent-light)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                        {v.badge}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUse(v.text)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      <CheckCircle2 size={13} /> Use This
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {v.text}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {v.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {isGeminiPowered ? 'Powered by Google Gemini 2.5' : 'Verified Metadata Mode'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={generateDescriptions} disabled={loading} className="btn btn-secondary btn-sm">
              <RefreshCw size={13} className={loading ? 'spin-slow' : ''} /> Regenerate
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDescriptionModal;
