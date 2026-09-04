import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, X, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ResumeImporterModal = ({ isOpen, onClose, onImportSuccess }) => {
  const { addToast } = useToast();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target.result || '');
      addToast(`Loaded ${file.name} for parsing.`, 'info');
    };
    reader.readAsText(file);
  };

  const handleProcessImport = async () => {
    if (!inputText.trim()) {
      addToast('Please paste or upload resume text first.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/career-profile/import-text', { text: inputText });
      if (res.data.success) {
        setExtractedData(res.data);
        addToast(`Successfully extracted ${res.data.detectedSkillsCount || 0} skills & contact information!`, 'success');
        if (onImportSuccess) {
          onImportSuccess(res.data.profile);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to import resume text.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="resume-importer-title">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 id="resume-importer-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Import Existing Resume into Career Profile
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Extracted data is tagged as IMPORTED so you can inspect and verify before making it official.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {!extractedData ? (
          <div style={{ margin: '1rem 0' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ marginBottom: '6px' }}>
                Upload Resume File (.txt, .docx text) or Paste Raw Content:
              </label>
              <input
                type="file"
                accept=".txt,.md,.rtf,.doc,.docx"
                onChange={handleFileUpload}
                className="form-input"
                style={{ marginBottom: '8px', padding: '6px' }}
              />
              <textarea
                className="form-textarea"
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the raw text of your current resume here..."
                style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
              />
            </div>

            <div className="modal-footer">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleProcessImport}
                disabled={loading || !inputText.trim()}
                className="btn btn-primary"
              >
                {loading ? 'Extracting & Parsing...' : <>Extract into Profile <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ margin: '1rem 0' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                <CheckCircle2 size={18} /> Import & Extraction Complete
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                {extractedData.message}
              </p>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Next Steps in Career Profile:
              </div>
              <ul style={{ margin: '0 0 0 16px', color: 'var(--text-secondary)' }}>
                <li>Review the imported skills tagged with the <span className="badge badge-imported">IMPORTED</span> badge.</li>
                <li>Mark verified experiences and skills as <span className="badge badge-verified">VERIFIED</span>.</li>
                <li>Add quantified outcomes and evidence metrics to each bullet.</li>
              </ul>
            </div>

            <div className="modal-footer">
              <button onClick={onClose} className="btn btn-primary">
                Done, Open Career Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeImporterModal;
