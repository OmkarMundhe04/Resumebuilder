import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  RefreshCw,
  Target,
  FileText,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sliders,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const RoleAnalysisModal = ({
  isOpen,
  onClose,
  resume = {},
  initialTab = 'analysis',
  onApplyOptimization,
  onApplySummary,
  onApplyExperienceBullet,
  onApplyProjectDescription,
  onApplySkills,
  onUpdateTargetRole,
  onUpdateJobDescription
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab === 'optimizer' ? 'optimize' : initialTab); // 'analysis' | 'optimize'
  const [targetRole, setTargetRole] = useState(resume.targetRole || resume.personal?.title || '');
  const [jobDescription, setJobDescription] = useState(
    resume.jobDescription?.rawText || (typeof resume.jobDescription === 'string' ? resume.jobDescription : '') || ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [isGeminiPowered, setIsGeminiPowered] = useState(false);

  // Selected skills to apply from optimization
  const [selectedOptSkills, setSelectedOptSkills] = useState({});

  const runAnalysis = useCallback(async () => {
    if (!targetRole.trim() && !jobDescription.trim()) {
      setError('Please provide at least a Target Role / Title or Job Description to evaluate alignment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'analysis') {
        const res = await api.post('/ai/role-analysis', {
          resume,
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim()
        });
        if (res.data.success && res.data.analysis) {
          setAnalysisResult(res.data.analysis);
          setIsGeminiPowered(Boolean(res.data.isGeminiPowered));
          addToast(`Analyzed fit for ${targetRole || 'target role'}!`, 'success');
        } else {
          setError(res.data.message || 'Failed to complete role analysis.');
        }
      } else {
        const res = await api.post('/ai/optimize-for-role', {
          resume,
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim()
        });
        if (res.data.success && res.data.proposals) {
          setOptimizeResult(res.data.proposals);
          setIsGeminiPowered(Boolean(res.data.isGeminiPowered));
          
          const sel = {};
          (res.data.proposals.skills || []).forEach(s => {
            const name = typeof s === 'string' ? s : s.name;
            if (name) sel[name] = true;
          });
          setSelectedOptSkills(sel);

          addToast(`Generated role optimization proposals!`, 'success');
        } else {
          setError(res.data.message || 'Failed to generate role optimizations.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, resume, targetRole, jobDescription, addToast]);

  useEffect(() => {
    if (isOpen) {
      runAnalysis();
    }
  }, [isOpen, activeTab, runAnalysis]);

  if (!isOpen) return null;

  const handleSaveRoleAndJd = () => {
    if (onUpdateTargetRole) onUpdateTargetRole(targetRole);
    if (onUpdateJobDescription) onUpdateJobDescription(jobDescription);
    addToast('Target role and job description saved to resume.', 'info');
    runAnalysis();
  };

  const handleApplySummaryText = (text) => {
    if (onApplySummary) {
      onApplySummary(text);
    } else if (onApplyOptimization) {
      onApplyOptimization({ summary: text });
    }
    addToast('Professional summary updated for target role.', 'success');
  };

  const handleApplyBullet = (expId, bIdx, text) => {
    if (onApplyExperienceBullet) {
      onApplyExperienceBullet(expId, bIdx, text);
    } else if (onApplyOptimization) {
      onApplyOptimization({
        experiences: [{ id: expId, suggestedBullets: [text] }]
      });
    }
    addToast('Experience bullet updated.', 'success');
  };

  const handleApplyProjDesc = (projId, text) => {
    if (onApplyProjectDescription) {
      onApplyProjectDescription(projId, text);
    } else if (onApplyOptimization) {
      onApplyOptimization({
        projects: [{ id: projId, suggestedDescription: text }]
      });
    }
    addToast('Project description updated.', 'success');
  };

  const handleApplySelectedSkills = () => {
    const toAdd = Object.keys(selectedOptSkills).filter(k => selectedOptSkills[k]);
    if (toAdd.length === 0) {
      addToast('No skills selected.', 'info');
      return;
    }
    if (onApplySkills) {
      onApplySkills(toAdd);
    } else if (onApplyOptimization) {
      onApplyOptimization({ skills: toAdd });
    }
    addToast(`Added ${toAdd.length} verified skill(s) to resume.`, 'success');
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="role-analysis-title">
      <div className="modal-content" style={{ maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Target size={18} />
            </div>
            <div>
              <h3 id="role-analysis-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Target Role AI Intelligence
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evidence-grounded role match diagnostic & non-destructive ATS optimization
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Target Role & JD Controls */}
        <div style={{ padding: '12px 16px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={12} color="var(--accent-primary)" /> Target Role / Title
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Backend Developer, Senior Full Stack Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={12} color="var(--accent-primary)" /> Target Job Description (Optional keywords)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Paste key JD excerpt or keywords..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSaveRoleAndJd}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ height: '36px', alignSelf: 'flex-end' }}
            >
              <RefreshCw size={13} className={loading ? 'spin-slow' : ''} /> Update & Analyze
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`btn btn-ghost ${activeTab === 'analysis' ? 'active' : ''}`}
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: activeTab === 'analysis' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'analysis' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              padding: '10px'
            }}
          >
            <TrendingUp size={14} style={{ marginRight: '6px' }} />
            Role Fit & ATS Diagnostic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('optimize')}
            className={`btn btn-ghost ${activeTab === 'optimize' ? 'active' : ''}`}
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: activeTab === 'optimize' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'optimize' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              padding: '10px'
            }}
          >
            <Sliders size={14} style={{ marginRight: '6px' }} />
            Role Optimization Proposals
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '1.25rem 1rem', flex: 1 }}>
          {/* Zero-Hallucination Policy Banner */}
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={16} color="var(--info)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Evidence Grounding Guarantee:</strong> We clearly distinguish between keywords requested by the employer versus skills you genuinely have evidence for. We never suggest falsely claiming experience.
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={28} className="spin-slow" style={{ margin: '0 auto 12px auto', color: 'var(--accent-primary)' }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>
                Analyzing resume against {targetRole || 'target role'}...
              </p>
              <span style={{ fontSize: '0.75rem' }}>Evaluating evidence alignment, ATS keywords, and role match</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg, #fef2f2)', border: '1px solid var(--danger-border, #fca5a5)', borderRadius: 'var(--radius-md)', color: 'var(--danger, #dc2626)', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <div style={{ flex: 1 }}>{error}</div>
              <button onClick={runAnalysis} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                Retry
              </button>
            </div>
          )}

          {/* TAB 1: ROLE FIT & ATS DIAGNOSTIC */}
          {!loading && activeTab === 'analysis' && analysisResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Score card */}
              <div style={{ padding: '16px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--accent-light)', border: '3px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>
                    {analysisResult.matchScore || 75}%
                  </span>
                  <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    Match
                  </span>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>
                    Role Fit: {analysisResult.targetRole || targetRole || 'Target Role'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {analysisResult.summary}
                  </p>
                </div>
              </div>

              {/* Strong Matches */}
              {analysisResult.strongMatches && analysisResult.strongMatches.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--success, #16a34a)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} /> Verified Strong Matches ({analysisResult.strongMatches.length})
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {analysisResult.strongMatches.map((m, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <strong style={{ fontSize: '0.8125rem', display: 'block', color: 'var(--text-primary)', marginBottom: '3px' }}>
                          {typeof m === 'string' ? m : m.item}
                        </strong>
                        {m.evidence && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                            Evidence: {m.evidence}
                          </span>
                        )}
                        {m.reason && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>
                            {m.reason}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Evidence from Job Description (Distinguished!) */}
              {analysisResult.missingEvidence && analysisResult.missingEvidence.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--warning, #ca8a04)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} /> Missing Evidence from Job Requirements ({analysisResult.missingEvidence.length})
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analysisResult.missingEvidence.map((me, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', background: 'var(--warning-bg, #fefce8)', border: '1px solid var(--warning-border, #fef08a)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                            {typeof me === 'string' ? me : me.skill}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                            Status: {me.userStatus || 'No evidence found in your resume'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--warning, #ca8a04)', fontWeight: 600, textAlign: 'right' }}>
                          {me.recommendation || 'Do not add without real experience'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ATS Keyword Alignment */}
              {analysisResult.atsKeywordAlignment && analysisResult.atsKeywordAlignment.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ATS Keyword Alignment
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysisResult.atsKeywordAlignment.map((kw, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: kw.userHasEvidence ? 'var(--success-bg, #dcfce7)' : 'var(--bg-surface-hover)',
                          color: kw.userHasEvidence ? 'var(--success, #15803d)' : 'var(--text-muted)',
                          border: `1px solid ${kw.userHasEvidence ? 'var(--success-border, #86efac)' : 'var(--border-subtle)'}`
                        }}
                      >
                        {kw.userHasEvidence ? <Check size={11} /> : '✕'} {kw.keyword}
                        <span style={{ fontSize: '0.625rem', opacity: 0.8 }}>
                          {kw.userHasEvidence ? '(Evidenced)' : '(Not evidenced)'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Skills & Priorities */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {analysisResult.relevantSkillsToHighlight && (
                  <div style={{ padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary)', display: 'block', marginBottom: '6px' }}>
                      Key Skills to Highlight
                    </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {analysisResult.relevantSkillsToHighlight.map((sk, idx) => (
                        <span key={idx} style={{ padding: '2px 6px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.sectionPriorities && (
                  <div style={{ padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary)', display: 'block', marginBottom: '6px' }}>
                      Recommended Section Order
                    </strong>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {analysisResult.sectionPriorities.map((sec, idx) => (
                        <li key={idx}>{sec}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ROLE OPTIMIZATION PROPOSALS */}
          {!loading && activeTab === 'optimize' && optimizeResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Review proposed optimizations tailored for <strong>{targetRole || 'your target role'}</strong>. Click <strong>[Use This]</strong> on individual items to apply only what you approve.
              </div>

              {/* Summary Proposal */}
              {optimizeResult.summary && (
                <div style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      Professional Summary Optimization
                    </strong>
                    <button
                      type="button"
                      onClick={() => handleApplySummaryText(typeof optimizeResult.summary === 'string' ? optimizeResult.summary : optimizeResult.summary.suggested)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      <CheckCircle2 size={13} /> Use This Summary
                    </button>
                  </div>
                  {typeof optimizeResult.summary === 'object' && optimizeResult.summary.current && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontStyle: 'italic' }}>
                      Current: "{optimizeResult.summary.current}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '6px', padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    {typeof optimizeResult.summary === 'string' ? optimizeResult.summary : optimizeResult.summary.suggested}
                  </div>
                  {typeof optimizeResult.summary === 'object' && optimizeResult.summary.reason && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>
                      💡 {optimizeResult.summary.reason}
                    </span>
                  )}
                </div>
              )}

              {/* Experience Bullets Proposals */}
              {optimizeResult.experiences && optimizeResult.experiences.length > 0 && (
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Experience Bullet Optimizations:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {optimizeResult.experiences.map((exp, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {exp.company} — {exp.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyBullet(exp.expId, exp.bIdx, exp.suggestedBullet)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          >
                            <CheckCircle2 size={12} /> Use This Bullet
                          </button>
                        </div>
                        {exp.currentBullet && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontStyle: 'italic' }}>
                            Current: • {exp.currentBullet}
                          </div>
                        )}
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                          • {exp.suggestedBullet}
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)' }}>
                          💡 {exp.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Proposals */}
              {optimizeResult.projects && optimizeResult.projects.length > 0 && (
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Project Description Optimizations:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {optimizeResult.projects.map((proj, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Project: {proj.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyProjDesc(proj.projId, proj.suggestedDescription)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          >
                            <CheckCircle2 size={12} /> Use This Description
                          </button>
                        </div>
                        {proj.currentDescription && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontStyle: 'italic' }}>
                            Current: {proj.currentDescription}
                          </div>
                        )}
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', padding: '6px 8px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                          {proj.suggestedDescription}
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)' }}>
                          💡 {proj.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Proposals */}
              {optimizeResult.skills && optimizeResult.skills.length > 0 && onApplySkills && (
                <div style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      Verified Skills Recommended to Add ({optimizeResult.skills.length}):
                    </strong>
                    <button
                      type="button"
                      onClick={handleApplySelectedSkills}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      <Plus size={12} /> Add Selected Skills
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {optimizeResult.skills.map((s, idx) => (
                      <label
                        key={idx}
                        style={{
                          padding: '6px 10px',
                          background: selectedOptSkills[s.name] ? 'var(--accent-light)' : 'var(--bg-surface)',
                          border: `1px solid ${selectedOptSkills[s.name] ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
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
                          checked={Boolean(selectedOptSkills[s.name])}
                          onChange={(e) => setSelectedOptSkills({ ...selectedOptSkills, [s.name]: e.target.checked })}
                        />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({s.evidence})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {isGeminiPowered ? 'Powered by Google Gemini 2.5' : 'Verified Rule-Based Diagnostic'}
          </span>
          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleAnalysisModal;
