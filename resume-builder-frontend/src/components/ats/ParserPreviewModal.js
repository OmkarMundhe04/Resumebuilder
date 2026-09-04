import React from 'react';
import { Terminal, X, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { extractRawResumeText } from '../../utils/canonicalResume';
import { useToast } from '../../context/ToastContext';

const ParserPreviewModal = ({ resume, isOpen, onClose }) => {
  const { addToast } = useToast();

  if (!isOpen || !resume) return null;

  const rawText = extractRawResumeText(resume);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    addToast('Raw extracted text copied to clipboard.', 'success');
  };

  const detectedContacts = [
    { label: 'Full Name', val: resume.personal?.fullName, status: !!resume.personal?.fullName },
    { label: 'Email', val: resume.personal?.email, status: !!resume.personal?.email },
    { label: 'Phone', val: resume.personal?.phone, status: !!resume.personal?.phone },
    { label: 'Location', val: resume.personal?.location, status: !!resume.personal?.location }
  ];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="parser-preview-title">
      <div className="modal-content" style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Terminal size={18} />
            </div>
            <div>
              <h3 id="parser-preview-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                ATS Parser Preview & Text Stream
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Exact machine-readable plain text extracted by automated applicant tracking systems
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Contact Field Extraction Checklist */}
        <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Parser Contact Entities Detection:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {detectedContacts.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                {c.status ? <CheckCircle size={15} color="var(--success)" /> : <AlertCircle size={15} color="var(--danger)" />}
                <span style={{ color: 'var(--text-secondary)' }}>{c.label}:</span>
                <strong style={{ color: c.status ? 'var(--text-primary)' : 'var(--danger)' }}>
                  {c.status ? c.val : 'Missing'}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Extracted Text Terminal */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Extracted ASCII / Plain Text Stream:
            </span>
            <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              <Copy size={12} /> Copy Text
            </button>
          </div>
          <pre
            style={{
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              maxHeight: '380px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              border: '1px solid #1e293b'
            }}
          >
            {rawText}
          </pre>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParserPreviewModal;
