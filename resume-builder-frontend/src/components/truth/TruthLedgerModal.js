import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Shield, X, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const TruthLedgerModal = ({ resume, onUpdateResume, isOpen, onClose }) => {
  const { addToast } = useToast();
  const [selectedBullet, setSelectedBullet] = useState(null);
  const [evidenceData, setEvidenceData] = useState({
    role: '',
    task: '',
    technology: '',
    outcome: '',
    metric: '',
    status: 'VERIFIED'
  });

  if (!isOpen || !resume) return null;

  const allBullets = [];
  (resume.experiences || []).forEach((exp) => {
    (exp.bullets || []).forEach((b) => {
      allBullets.push({
        ...b,
        section: 'Experience',
        context: `${exp.role} at ${exp.company}`
      });
    });
  });

  const handleSelectBullet = (bullet) => {
    setSelectedBullet(bullet);
    setEvidenceData({
      role: bullet.evidence?.role || '',
      task: bullet.evidence?.task || bullet.text || '',
      technology: bullet.evidence?.technology || '',
      outcome: bullet.evidence?.outcome || '',
      metric: bullet.evidence?.metric || '',
      status: bullet.status || 'VERIFIED'
    });
  };

  const handleSaveEvidence = () => {
    if (!selectedBullet) return;

    const updated = JSON.parse(JSON.stringify(resume));
    (updated.experiences || []).forEach((exp) => {
      (exp.bullets || []).forEach((b) => {
        if (b.id === selectedBullet.id) {
          b.evidence = {
            role: evidenceData.role,
            task: evidenceData.task,
            technology: evidenceData.technology,
            outcome: evidenceData.outcome,
            metric: evidenceData.metric
          };
          b.status = evidenceData.status;
        }
      });
    });

    if (onUpdateResume) {
      onUpdateResume(updated);
    }
    addToast('Truth Ledger evidence verified and updated.', 'success');
    setSelectedBullet(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="badge badge-verified"><CheckCircle size={10} /> Verified</span>;
      case 'SUGGESTED':
        return <span className="badge badge-suggested">Suggested</span>;
      case 'IMPORTED':
        return <span className="badge badge-imported">Imported</span>;
      default:
        return <span className="badge badge-unsupported"><AlertTriangle size={10} /> Unsupported</span>;
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="truth-ledger-title">
      <div className="modal-content" style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--success)' }}>
              <Shield size={18} />
            </div>
            <div>
              <h3 id="truth-ledger-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Truth Ledger — Evidence Provenance
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Every bullet point must be traceable to real facts, verified roles, tools, and outcomes.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedBullet ? '1fr 1fr' : '1fr', gap: '16px', margin: '1rem 0' }}>
          {/* Bullets List */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Resume Statements ({allBullets.length})
            </div>
            {allBullets.map((b) => (
              <div
                key={b.id}
                onClick={() => handleSelectBullet(b)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: selectedBullet?.id === b.id ? 'var(--accent-light)' : 'var(--bg-app)',
                  border: `1px solid ${selectedBullet?.id === b.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{b.context}</span>
                  {getStatusBadge(b.status)}
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{b.text}</p>
              </div>
            ))}
          </div>

          {/* Evidence Inspector / Editor */}
          {selectedBullet && (
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Evidence Breakdown</h4>
                <select
                  value={evidenceData.status}
                  onChange={(e) => setEvidenceData({ ...evidenceData, status: e.target.value })}
                  className="form-select"
                  style={{ width: 'auto', padding: '2px 8px', fontSize: '0.75rem' }}
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="SUGGESTED">SUGGESTED</option>
                  <option value="IMPORTED">IMPORTED</option>
                  <option value="UNSUPPORTED">UNSUPPORTED</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Role / Capacity</label>
                <input
                  type="text"
                  className="form-input"
                  value={evidenceData.role}
                  onChange={(e) => setEvidenceData({ ...evidenceData, role: e.target.value })}
                  placeholder="e.g. Lead Developer"
                  style={{ fontSize: '0.8125rem', padding: '4px 8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Action / Task</label>
                <input
                  type="text"
                  className="form-input"
                  value={evidenceData.task}
                  onChange={(e) => setEvidenceData({ ...evidenceData, task: e.target.value })}
                  placeholder="What was built or managed?"
                  style={{ fontSize: '0.8125rem', padding: '4px 8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Technologies / Tools Used</label>
                <input
                  type="text"
                  className="form-input"
                  value={evidenceData.technology}
                  onChange={(e) => setEvidenceData({ ...evidenceData, technology: e.target.value })}
                  placeholder="e.g. React, Node.js, Docker"
                  style={{ fontSize: '0.8125rem', padding: '4px 8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Measurable Metric / Outcome</label>
                <input
                  type="text"
                  className="form-input"
                  value={evidenceData.metric || evidenceData.outcome}
                  onChange={(e) => setEvidenceData({ ...evidenceData, metric: e.target.value, outcome: e.target.value })}
                  placeholder="e.g. 35% faster load time, 10k users"
                  style={{ fontSize: '0.8125rem', padding: '4px 8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={handleSaveEvidence} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Save size={14} /> Save Verified Evidence
                </button>
                <button onClick={() => setSelectedBullet(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruthLedgerModal;
