import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  RefreshCw,
  Plus,
  Target
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SectionImprovementModal = ({
  isOpen,
  type = 'section',
  title = 'Enhance Section',
  originalText = '',
  itemContext = {},
  targetRole = '',
  jobDescription = '',
  onClose,
  onApplyText,
  onApply,
  onApplySkills
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState({});
  const [isGeminiPowered, setIsGeminiPowered] = useState(false);

  const isEmptyContent = (!originalText || !originalText.trim()) && (!itemContext || Object.keys(itemContext).length === 0 || !Object.values(itemContext).some(v => v && String(v).trim()));

  const fetchEnhancements = useCallback(async () => {
    if (isEmptyContent) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/ai/enhance-section-text', {
        type,
        originalText: originalText || '',
        itemContext: itemContext || {},
        targetRole: targetRole || '',
        jobDescription: jobDescription || ''
      });

      let rawSuggestions = [];
      if (res && res.data && res.data.success) {
        if (Array.isArray(res.data.suggestions)) {
          rawSuggestions = res.data.suggestions;
        } else if (res.data.variants && typeof res.data.variants === 'object') {
          rawSuggestions = Object.entries(res.data.variants).map(([v, t]) => ({
            variant: v,
            title: v === 'concise' ? 'Concise & Direct' : v === 'highImpact' ? 'High Impact & Professional' : 'Role-Targeted Optimization',
            text: t,
            explanation: 'Truthful professional phrasing'
          }));
        }
      }

      if (rawSuggestions.length > 0) {
        setSuggestions(rawSuggestions);
        setIsGeminiPowered(Boolean(res.data.isGeminiPowered));

        const rawSkills = Array.isArray(res.data.extractedSkills) ? res.data.extractedSkills : (Array.isArray(res.data.detectedSkills) ? res.data.detectedSkills : []);
        const skills = rawSkills.map(s => typeof s === 'string' ? { name: s } : s);
        setExtractedSkills(skills);
        const sel = {};
        skills.forEach(s => { sel[s.name] = true; });
        setSelectedSkills(sel);
      } else {
        setError(res?.data?.message || 'No enhancement suggestions could be generated.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to enhance section. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isEmptyContent, type, originalText, itemContext, targetRole, jobDescription]);

  useEffect(() => {
    if (isOpen) {
      if (isEmptyContent) {
        setLoading(false);
      } else {
        fetchEnhancements();
      }
    }
  }, [isOpen, isEmptyContent, fetchEnhancements]);

  if (!isOpen) return null;

  const handleUseText = (text) => {
    if (onApplyText) {
      onApplyText(text);
      addToast('Updated with AI enhancement.', 'success');
      onClose();
    } else if (onApply) {
      const skillsToAdd = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
      onApply(text, skillsToAdd);
      addToast('Updated with AI enhancement.', 'success');
      onClose();
    }
  };

  const handleAddSkills = () => {
    const toAdd = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
    if (toAdd.length === 0) {
      addToast('No skills selected.', 'info');
      return;
    }
    if (onApplySkills) {
      onApplySkills(toAdd);
      addToast(`Added ${toAdd.length} verified skill(s) to resume.`, 'success');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="section-improvement-title">
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 id="section-improvement-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                {title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Truthful, active phrasing optimized for ATS parsing without inventing facts
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
              <strong>Zero-Hallucination Policy:</strong> The AI works strictly with the facts you entered. It will not fabricate grades, coursework, metrics, revenue, or unverified achievements.
            </div>
          </div>

          {/* Original Text Preview */}
          {originalText && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Current Text:
              </span>
              <div style={{ padding: '10px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "{originalText}"
              </div>
            </div>
          )}

          {/* Target Role Context indicator */}
          {targetRole && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: '1rem', padding: '6px 10px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)' }}>
              <Target size={13} />
              <span>Optimizing with awareness for target role: <strong>{targetRole}</strong></span>
            </div>
          )}

          {/* Empty Content Guard */}
          {isEmptyContent && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 12px auto', color: 'var(--warning, #f59e0b)' }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                No User Content to Improve
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Cannot improve empty section. Please enter your authentic details first so AI can polish without hallucinating facts.
              </p>
            </div>
          )}

          {/* Loading */}
          {!isEmptyContent && loading && (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin-slow" style={{ margin: '0 auto 10px auto', color: 'var(--accent-primary)' }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
                Refining wording with Gemini AI...
              </p>
              <span style={{ fontSize: '0.75rem' }}>Preserving truthful provenance while polishing sentence clarity</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg, #fef2f2)', border: '1px solid var(--danger-border, #fca5a5)', borderRadius: 'var(--radius-md)', color: 'var(--danger, #dc2626)', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <div style={{ flex: 1 }}>{error}</div>
              <button onClick={fetchEnhancements} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                Retry
              </button>
            </div>
          )}

          {/* Extracted Skills to add */}
          {!loading && extractedSkills.length > 0 && onApplySkills && (
            <div style={{ marginBottom: '1.25rem', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Verified Skills Detected ({extractedSkills.length}):
                </span>
                <button
                  type="button"
                  onClick={handleAddSkills}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  <Plus size={12} /> Add Selected to Skills
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {extractedSkills.map((s, idx) => (
                  <label
                    key={idx}
                    style={{
                      padding: '4px 8px',
                      background: selectedSkills[s.name] ? 'var(--accent-light)' : 'var(--bg-surface)',
                      border: `1px solid ${selectedSkills[s.name] ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(selectedSkills[s.name])}
                      onChange={(e) => setSelectedSkills({ ...selectedSkills, [s.name]: e.target.checked })}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Truthful Enhancement Options:
              </span>
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
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
                        {s.title || s.variant}
                      </span>
                      {s.variant === 'roleTargeted' && (
                        <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'var(--accent-light)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                          Role Optimized
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseText(s.text)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      <CheckCircle2 size={13} /> Use This
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {s.text}
                  </p>
                  {s.explanation && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      💡 {s.explanation}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {isGeminiPowered ? 'Powered by Google Gemini 2.5' : 'Verified Rule-Based Polisher'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={fetchEnhancements} disabled={loading} className="btn btn-secondary btn-sm">
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

export default SectionImprovementModal;
