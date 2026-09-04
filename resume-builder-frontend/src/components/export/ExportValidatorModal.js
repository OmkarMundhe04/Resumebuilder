import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Download, X, FileText } from 'lucide-react';
import { Button } from '../ui';

// Sanitize filename against dangerous path traversal and OS characters
export const sanitizeFilename = (name) => {
  if (!name) return 'Resume';
  return name
    .replace(/[/\\:*?"<>|]/g, '_')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .trim()
    .slice(0, 100);
};

const ExportValidatorModal = ({ resume, format, onConfirmExport, onCancel }) => {
  const [customFilename, setCustomFilename] = useState(() => {
    const rawName = `${resume?.personal?.fullName || 'Candidate'}_${resume?.personal?.title || 'Professional'}_Resume`;
    const safeBase = sanitizeFilename(rawName);
    const ext = format === 'docx' ? 'doc' : format === 'pdf' ? 'pdf' : format === 'txt' ? 'txt' : 'doc';
    return `${safeBase}.${ext}`;
  });

  const [exporting, setExporting] = useState(false);

  if (!resume) return null;

  // Pre-flight checks
  const issues = [];
  if (!resume.personal?.fullName) issues.push({ severity: 'critical', text: 'Full Name is missing from the header.' });
  if (!resume.personal?.email) issues.push({ severity: 'critical', text: 'Email address is missing.' });
  if (!resume.personal?.phone) issues.push({ severity: 'warning', text: 'Phone number is omitted.' });

  if (!resume.experiences || resume.experiences.length === 0) {
    issues.push({ severity: 'warning', text: 'No work experience items exist.' });
  } else {
    const emptyBullets = resume.experiences.some(e => (e.bullets || []).some(b => !b.text || b.text.trim().length === 0));
    if (emptyBullets) {
      issues.push({ severity: 'warning', text: 'Some bullet points contain blank lines or empty text.' });
    }
  }

  if (!resume.skills || resume.skills.length === 0) {
    issues.push({ severity: 'warning', text: 'No skills listed in Skills section.' });
  }

  const hasCritical = issues.some(i => i.severity === 'critical');

  // Estimate page count
  const wordCount = (resume.experiences || []).reduce((acc, e) => acc + (e.bullets || []).reduce((bAcc, b) => bAcc + (b.text || '').split(/\s+/).length, 0), 0);
  const estimatedPages = wordCount > 450 ? (wordCount > 900 ? 3 : 2) : 1;

  const handleExport = async () => {
    setExporting(true);
    try {
      const safeName = sanitizeFilename(customFilename);

      // Record in local download audit trail
      try {
        const history = JSON.parse(localStorage.getItem('export_download_history') || '[]');
        history.unshift({
          documentId: resume._id || resume.id || 'draft',
          title: resume.title || 'Untitled Resume',
          format,
          filename: safeName,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('export_download_history', JSON.stringify(history.slice(0, 50)));
      } catch {}

      await onConfirmExport(format, safeName);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="export-validator-title">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h3 id="export-validator-title" style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} color="var(--accent-primary)" />
            Pre-Flight Export ({format?.toUpperCase()})
          </h3>
          <button onClick={onCancel} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Document Summary Pill */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-primary)" />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{resume.personal?.fullName || 'Candidate'}</strong>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Template: {resume.template || 'ats-classic'} • ~{estimatedPages} {estimatedPages === 1 ? 'Page' : 'Pages'}
                </div>
              </div>
            </div>
            <span style={{ fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-primary)' }}>
              {format?.toUpperCase()}
            </span>
          </div>

          {/* Safe Filename Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
              Download Filename (Safe Sanitized Format)
            </label>
            <input
              type="text"
              className="form-input"
              value={customFilename}
              onChange={(e) => setCustomFilename(sanitizeFilename(e.target.value))}
              style={{ width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          {/* Issues checklist */}
          {issues.length === 0 ? (
            <div style={{ padding: '12px', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={22} color="var(--success)" />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--success)' }}>Pre-Flight Checks Passed</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Complies with ATS layout, contact presence, and document formatting standards.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {issues.length} item(s) to verify:
              </div>
              {issues.map((iss, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: iss.severity === 'critical' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                    border: `1px solid ${iss.severity === 'critical' ? 'var(--danger-border)' : 'var(--warning-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {iss.severity === 'critical' ? <AlertCircle size={14} color="var(--danger)" /> : <AlertTriangle size={14} color="var(--warning)" />}
                  <span style={{ color: 'var(--text-primary)' }}>{iss.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Review Canvas
          </button>
          <Button
            variant={hasCritical ? 'danger' : 'primary'}
            onClick={handleExport}
            loading={exporting}
            icon={Download}
          >
            {hasCritical ? 'Download Anyway' : `Download ${format?.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportValidatorModal;
