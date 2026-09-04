import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  AlertCircle,
  X,
  Plus,
  ShieldCheck,
  RefreshCw,
  Target,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SkillSuggestionsModal = ({
  isOpen,
  onClose,
  profile = {},
  resume = null,
  targetRole = '',
  jobDescription = '',
  projectContext = null,
  onApplySkills,
  onAddSkills
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [missingJobSkills, setMissingJobSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState({});
  const [isGeminiPowered, setIsGeminiPowered] = useState(false);

  const dataSource = resume || profile || {};
  const existingSkillNames = new Set(
    (dataSource.skills || []).map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim()).filter(Boolean)
  );

  const role = targetRole || dataSource.targetRole || dataSource.personal?.title || '';
  const jd = jobDescription || dataSource.jobDescription?.rawText || (typeof dataSource.jobDescription === 'string' ? dataSource.jobDescription : '') || '';

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/suggest-skills', {
        resume: resume || undefined,
        profileData: (!resume && profile) ? profile : undefined,
        targetRole: role,
        jobDescription: jd,
        projectContext: projectContext || undefined
      });

      if (res.data.success && Array.isArray(res.data.suggestedSkills)) {
        setSuggestions(res.data.suggestedSkills);
        setMissingJobSkills(Array.isArray(res.data.missingJobSkills) ? res.data.missingJobSkills : []);
        setIsGeminiPowered(Boolean(res.data.isGeminiPowered));

        const initialSelected = {};
        res.data.suggestedSkills.forEach(s => {
          if (!existingSkillNames.has(s.name?.toLowerCase().trim())) {
            initialSelected[s.name] = true;
          }
        });
        setSelectedSkills(initialSelected);
      } else {
        setError(res.data.message || 'No skill suggestions could be generated from current evidence.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch skill suggestions.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, jd]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    const allSelected = suggestions
      .filter(s => !existingSkillNames.has(s.name?.toLowerCase().trim()))
      .every(s => selectedSkills[s.name]);

    const newSelected = {};
    suggestions.forEach(s => {
      if (!existingSkillNames.has(s.name?.toLowerCase().trim())) {
        newSelected[s.name] = !allSelected;
      }
    });
    setSelectedSkills(newSelected);
  };

  const handleApply = () => {
    const toAdd = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
    if (toAdd.length === 0) {
      addToast('No skills selected.', 'info');
      return;
    }

    const callback = onApplySkills || onAddSkills;
    if (callback) {
      callback(toAdd);
      addToast(`Added ${toAdd.length} verified skill(s).`, 'success');
      onClose();
    }
  };

  const availableCount = suggestions.filter(
    s => !existingSkillNames.has(s.name?.toLowerCase().trim())
  ).length;

  const selectedCount = Object.keys(selectedSkills).filter(
    k => selectedSkills[k] && !existingSkillNames.has(k.toLowerCase().trim())
  ).length;

  const modalTitle = projectContext 
    ? `Suggest Skills for Project: ${projectContext.name || 'Project'}`
    : 'Evidence-Grounded Skill Suggestions';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="skill-suggestions-title">
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 id="skill-suggestions-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                {modalTitle}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Skills backed by concrete evidence in your projects and work history
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '1rem 0', flex: 1 }}>
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={16} color="var(--info)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Truthful Skill Verification:</strong> Only skills backed by concrete evidence in your projects, technologies, experience, or degrees are suggested. We never invent unsupported competencies.
            </div>
          </div>

          {role && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: '1rem', padding: '6px 10px', background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)' }}>
              <Target size={13} />
              <span>Prioritizing evidence relevant to target role: <strong>{role}</strong></span>
            </div>
          )}

          {loading && (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin-slow" style={{ margin: '0 auto 10px auto', color: 'var(--accent-primary)' }} />
              <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>
                Synthesizing evidence across your projects, experience bullets, and credentials...
              </p>
            </div>
          )}

          {error && !loading && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg, #fef2f2)', border: '1px solid var(--danger-border, #fca5a5)', borderRadius: 'var(--radius-md)', color: 'var(--danger, #dc2626)', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <div style={{ flex: 1 }}>{error}</div>
              <button onClick={fetchSuggestions} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && suggestions.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                No new skills could be derived from current records. Add more project technologies or work experience to unlock evidence-based skill suggestions.
              </p>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Evidenced Skills ({suggestions.length}) {isGeminiPowered ? '• Gemini AI Verified' : '• Evidence Grounded'}
                </span>
                {availableCount > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  >
                    {suggestions.filter(s => !existingSkillNames.has(s.name?.toLowerCase().trim())).every(s => selectedSkills[s.name])
                      ? 'Deselect All'
                      : 'Select All Supported'}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
                {suggestions.map((s, idx) => {
                  const isExisting = existingSkillNames.has(s.name?.toLowerCase().trim());
                  const isChecked = isExisting || Boolean(selectedSkills[s.name]);

                  return (
                    <label
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        background: isExisting ? 'var(--bg-surface-hover)' : 'var(--bg-app)',
                        border: `1px solid ${isChecked && !isExisting ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: isExisting ? 'default' : 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        disabled={isExisting}
                        checked={isChecked}
                        onChange={(e) => {
                          setSelectedSkills({ ...selectedSkills, [s.name]: e.target.checked });
                        }}
                        style={{ marginTop: '3px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {s.name}
                            </span>
                            {s.relevance === 'High' && (
                              <span style={{ fontSize: '0.625rem', padding: '1px 5px', background: 'var(--accent-light)', color: 'var(--accent-primary)', borderRadius: '3px', fontWeight: 700 }}>
                                High Role Fit
                              </span>
                            )}
                            {s.confidence && (
                              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                {s.confidence}% conf.
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: isExisting
                                ? 'var(--bg-surface)'
                                : s.status === 'verified'
                                  ? 'var(--success-bg, #dcfce7)'
                                  : 'var(--accent-light)',
                              color: isExisting
                                ? 'var(--text-muted)'
                                : s.status === 'verified'
                                  ? 'var(--success, #16a34a)'
                                  : 'var(--accent-primary)'
                            }}
                          >
                            {isExisting ? 'Already in Skills' : (s.status || 'SUPPORTED').toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                          Evidence: {s.evidence || 'Verified through career artifacts'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && missingJobSkills.length > 0 && (
            <div style={{ padding: '12px', background: 'var(--warning-bg, #fefce8)', border: '1px solid var(--warning-border, #fef08a)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--warning, #ca8a04)', fontWeight: 700, fontSize: '0.8125rem' }}>
                <AlertTriangle size={15} />
                <span>Job Description Requirements Lacking Candidate Evidence ({missingJobSkills.length})</span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                These keywords appear in the target job description, but no evidence was found in your resume. To maintain truthful provenance, these cannot be added automatically without verified experience.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {missingJobSkills.map((m, idx) => (
                  <span key={idx} style={{ padding: '3px 8px', background: 'var(--bg-surface)', border: '1px solid var(--warning-border, #fef08a)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-primary)' }}>
                    ⚠️ {typeof m === 'string' ? m : m.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedCount === 0}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> Add Selected Skills ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillSuggestionsModal;
