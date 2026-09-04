import React, { useState } from 'react';
import {
  Sparkles,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const ProjectAnalyzerModal = ({
  isOpen,
  onClose,
  project = {},
  onApplyDescription,
  onApplyTechnologies,
  onApplySkills,
  onApplyBullet
}) => {
  const { addToast } = useToast();

  const [githubUrl, setGithubUrl] = useState(project.repoLink || '');
  const [liveUrl, setLiveUrl] = useState(project.link || '');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Selected items to apply
  const [selectedTechs, setSelectedTechs] = useState({});
  const [selectedSkills, setSelectedSkills] = useState({});

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!githubUrl.trim() && !liveUrl.trim() && !context.trim() && !project.name?.trim()) {
      setError('Please provide at least a GitHub URL, Live URL, or Project Context to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/career-profile/ai/analyze-project', {
        projectName: project.name || '',
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        context: context.trim(),
        existingTechnologies: project.technologies || [],
        existingDescription: project.description || ''
      });

      if (res.data.success && res.data.analysis) {
        setResult(res.data.analysis);
        
        // Pre-select verified technologies that are not already in project
        const existingTechSet = new Set((project.technologies || []).map(t => t.toLowerCase()));
        const initialTechSel = {};
        (res.data.analysis.technologies || []).forEach(t => {
          if (!existingTechSet.has(t.name.toLowerCase())) {
            initialTechSel[t.name] = true;
          }
        });
        setSelectedTechs(initialTechSel);

        // Pre-select skills
        const initialSkillSel = {};
        (res.data.analysis.suggestedSkills || []).forEach(s => {
          initialSkillSel[s.name] = true;
        });
        setSelectedSkills(initialSkillSel);

        addToast(
          res.data.isGeminiPowered
            ? 'Project analyzed with Gemini AI based on verified evidence!'
            : 'Project analyzed from verified repository metadata!',
          'success'
        );
      } else {
        setError(res.data.message || 'Failed to analyze project.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Analysis failed. Please check the URL and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSelectedTechs = () => {
    const toAdd = Object.keys(selectedTechs).filter(k => selectedTechs[k]);
    if (toAdd.length === 0) {
      addToast('No technologies selected.', 'info');
      return;
    }
    if (onApplyTechnologies) {
      onApplyTechnologies(toAdd);
      addToast(`Added ${toAdd.length} technology/technologies to project.`, 'success');
    }
  };

  const handleAddSelectedSkills = () => {
    const toAdd = Object.keys(selectedSkills).filter(k => selectedSkills[k]);
    if (toAdd.length === 0) {
      addToast('No skills selected.', 'info');
      return;
    }
    if (onApplySkills) {
      onApplySkills(toAdd);
      addToast(`Added ${toAdd.length} skill(s) to Career Profile.`, 'success');
    }
  };

  const handleUseDescription = (descText) => {
    if (onApplyDescription) {
      onApplyDescription(descText);
      addToast('Project description updated.', 'success');
    }
  };

  const handleAddBullet = (bulletText) => {
    if (onApplyBullet) {
      onApplyBullet(bulletText);
      addToast('Bullet added to project.', 'success');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="project-analyzer-title">
      <div className="modal-content" style={{ maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 id="project-analyzer-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Project AI Analyzer: {project.name || 'Untitled Project'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evidence-based repository inspection & truthful resume descriptions
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '1rem 0', flex: 1 }}>
          {/* Zero Hallucination Guarantee Badge */}
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={16} color="var(--info)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Zero-Hallucination Policy:</strong> The AI extracts factual evidence from public repository manifests and documentation. It will NEVER invent fake metrics, percentages, or unsupported technologies.
            </div>
          </div>

          {/* Evidence Input Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <GithubIcon size={13} /> Public GitHub Repository URL
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <Globe size={13} /> Live Deployment URL (Optional)
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://myproject.vercel.app"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              Additional Project Context / Architecture Notes (Optional)
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Built a microservices architecture using Docker, Redis pub/sub, and PostgreSQL..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '1.25rem' }}>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Analyzing Project Evidence...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Analyze Project Evidence
                </>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg, #fef2f2)', border: '1px solid var(--danger-border, #fca5a5)', borderRadius: 'var(--radius-md)', color: 'var(--danger, #dc2626)', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary */}
              {result.projectSummary && (
                <div style={{ padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>
                    Factual Project Summary
                  </span>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {result.projectSummary}
                  </p>
                </div>
              )}

              {/* Technologies Detected */}
              {result.technologies && result.technologies.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Technologies Detected ({result.technologies.length}):
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSelectedTechs}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      <Plus size={12} /> Add Selected to Project
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {result.technologies.map((t, idx) => {
                      const isExisting = (project.technologies || []).some(
                        pt => pt.toLowerCase() === t.name.toLowerCase()
                      );
                      return (
                        <label
                          key={idx}
                          style={{
                            padding: '8px 10px',
                            background: isExisting ? 'var(--bg-surface-hover)' : 'var(--bg-app)',
                            border: `1px solid ${selectedTechs[t.name] ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            cursor: isExisting ? 'default' : 'pointer',
                            fontSize: '0.8125rem'
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={isExisting}
                            checked={isExisting || Boolean(selectedTechs[t.name])}
                            onChange={(e) => {
                              setSelectedTechs({ ...selectedTechs, [t.name]: e.target.checked });
                            }}
                            style={{ marginTop: '2px' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{t.name}</strong>
                              <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: t.status === 'verified' ? 'var(--success-bg, #dcfce7)' : 'var(--accent-light)', color: t.status === 'verified' ? 'var(--success, #16a34a)' : 'var(--accent-primary)', fontWeight: 600 }}>
                                {isExisting ? 'Already in Project' : (t.status || 'VERIFIED').toUpperCase()}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.evidence || 'Repository evidence'}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description Variants */}
              {result.descriptionVariants && Object.keys(result.descriptionVariants).length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Truthful Description Variants (Select to Use):
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { key: 'concise', label: 'Concise Resume Style', text: result.descriptionVariants.concise },
                      { key: 'technical', label: 'Technical Architecture Focus', text: result.descriptionVariants.technical },
                      { key: 'portfolio', label: 'Portfolio Showcase Style', text: result.descriptionVariants.portfolio }
                    ].map(v => {
                      if (!v.text) return null;
                      return (
                        <div
                          key={v.key}
                          style={{
                            padding: '12px',
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>
                              {v.label}
                            </span>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                              {v.text}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUseDescription(v.text)}
                            className="btn btn-primary btn-sm"
                            style={{ flexShrink: 0 }}
                          >
                            <CheckCircle2 size={13} /> Use This
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resume Bullets */}
              {result.resumeBullets && result.resumeBullets.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Evidence-Grounded Bullets:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.resumeBullets.map((b, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', flex: 1 }}>
                          • {b}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(b)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', flexShrink: 0 }}
                        >
                          <Plus size={12} /> Add As Bullet
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Skills */}
              {result.suggestedSkills && result.suggestedSkills.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Skills Demonstrated by This Project ({result.suggestedSkills.length}):
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSelectedSkills}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      <Plus size={12} /> Add to Profile Skills
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {result.suggestedSkills.map((s, idx) => (
                      <label
                        key={idx}
                        style={{
                          padding: '8px 10px',
                          background: 'var(--bg-app)',
                          border: `1px solid ${selectedSkills[s.name] ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(selectedSkills[s.name])}
                          onChange={(e) => {
                            setSelectedSkills({ ...selectedSkills, [s.name]: e.target.checked });
                          }}
                          style={{ marginTop: '2px' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{s.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.evidence}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalyzerModal;
