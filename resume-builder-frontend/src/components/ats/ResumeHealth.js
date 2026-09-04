import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, Wrench, Eye } from 'lucide-react';
import { calculateResumeHealth, detectSafeRepairs, applySafeRepair } from '../../utils/canonicalResume';

const ResumeHealth = ({ resume, onUpdateResume, onOpenParserPreview }) => {
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  const health = calculateResumeHealth(resume);
  const repairs = detectSafeRepairs(resume);

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 75) return 'var(--info)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getRatingBadge = (score) => {
    if (score >= 90) return <span className="badge badge-verified">Excellent</span>;
    if (score >= 75) return <span className="badge badge-suggested">Good</span>;
    if (score >= 60) return <span className="badge badge-imported">Needs Attention</span>;
    return <span className="badge badge-unsupported">Critical</span>;
  };

  const dimensions = [
    { key: 'parserSafety', label: 'Parser Safety', score: health.parserSafety, desc: 'Machine readability & section standard conformity' },
    { key: 'jobAlignment', label: 'Job Alignment', score: health.jobAlignment, desc: 'Skill breadth and role keyword density' },
    { key: 'evidenceStrength', label: 'Evidence Strength', score: health.evidenceStrength, desc: 'Quantified metrics and outcome verification' },
    { key: 'readability', label: 'Human Readability', score: health.readability, desc: 'Hierarchy, typography, and scannability' },
    { key: 'accessibility', label: 'Accessibility (WCAG)', score: health.accessibility, desc: 'Semantic tags, contrast, and screen reader flow' },
    { key: 'completeness', label: 'Profile Completeness', score: health.completeness, desc: 'Contact, history, education, and skill presence' },
    { key: 'formattingSafety', label: 'Formatting Safety', score: health.formattingSafety, desc: 'Zero layout breakage or unparseable columns' }
  ];

  const handleApplyRepair = (repairId) => {
    if (onUpdateResume) {
      const repaired = applySafeRepair(resume, repairId);
      onUpdateResume(repaired);
    }
    setSelectedRepair(null);
    setShowRepairModal(false);
  };

  return (
    <div className="card resume-health-card" style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Resume Health Radar</h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Independent multi-metric ATS & evidence quality diagnostics
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getScoreColor(health.overall) }}>
              {health.overall}%
            </div>
            {getRatingBadge(health.overall)}
          </div>
          {onOpenParserPreview && (
            <button onClick={onOpenParserPreview} className="btn btn-secondary btn-sm" title="View machine extracted text">
              <Eye size={14} /> Parser Preview
            </button>
          )}
        </div>
      </div>

      {/* 7 Dimension Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
        {dimensions.map((dim) => (
          <div key={dim.key} style={{ padding: '10px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dim.label}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: getScoreColor(dim.score) }}>{dim.score}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${dim.score}%`, height: '100%', backgroundColor: getScoreColor(dim.score), transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>{dim.desc}</div>
          </div>
        ))}
      </div>

      {/* Actionable Diagnostics */}
      {health.diagnostics && health.diagnostics.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Diagnostic Recommendations:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {health.diagnostics.map((diag, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', padding: '6px 8px', backgroundColor: diag.severity === 'Critical' ? 'var(--danger-bg)' : 'var(--warning-bg)', borderRadius: 'var(--radius-sm)', border: `1px solid ${diag.severity === 'Critical' ? 'var(--danger-border)' : 'var(--warning-border)'}` }}>
                {diag.severity === 'Critical' ? <AlertCircle size={15} color="var(--danger)" style={{ marginTop: '2px', flexShrink: 0 }} /> : <AlertTriangle size={15} color="var(--warning)" style={{ marginTop: '2px', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>[{diag.category}]:</strong> {diag.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1-Click Safe Repairs */}
      {repairs.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '10px 12px', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={16} color="var(--success)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }}>
              {repairs.length} Deterministic 1-Click Safe Fix(es) Available
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {repairs.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRepair(r);
                  setShowRepairModal(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', borderColor: 'var(--success-border)' }}
              >
                Fix: {r.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Safe Repair Preview Modal */}
      {showRepairModal && selectedRepair && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={18} color="var(--accent-primary)" /> One-Click Safe Repair: {selectedRepair.title}
              </h3>
            </div>
            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {selectedRepair.description}
              </p>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Impact: {selectedRepair.impact}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Note: Safe repairs strictly normalize formats without modifying your factual claims.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowRepairModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleApplyRepair(selectedRepair.id)} className="btn btn-primary">
                <CheckCircle2 size={16} /> Apply Safe Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeHealth;
