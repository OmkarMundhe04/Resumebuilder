import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/motion/PageTransition';

const PrivacyCenter = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleExportData = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/privacy/export-data');
      if (res.data.success) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `career_data_export_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        addToast('Full GDPR data archive downloaded!', 'success');
      }
    } catch {
      addToast('Failed to export data.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      addToast('Please type DELETE to confirm.', 'warning');
      return;
    }

    setDeleting(true);
    try {
      const res = await api.delete('/privacy/delete-account', {
        data: { confirmPhrase: 'DELETE MY ACCOUNT PERMANENTLY' }
      });
      if (res.data.success) {
        addToast('Account and all associated records permanently erased.', 'info');
        logout();
        navigate('/', { replace: true });
      }
    } catch {
      addToast('Failed to erase account.', 'error');
      setDeleting(false);
    }
  };

  return (
    <PageTransition>
      <div className="page-container" style={{ maxWidth: '840px', paddingBottom: 'var(--space-3xl)' }}>
      {/* Editorial Header */}
      <section style={{ marginBottom: 'var(--space-2xl)', paddingTop: 'var(--space-sm)' }}>
        <span className="eyebrow">Data Sovereignty</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="display-md" style={{ margin: '0 0 var(--space-xs) 0' }}>
              Privacy & Trust Center
            </h1>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Complete sovereignty over your verified career records, data exports, and account lifecycle.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Zero Training Commitments */}
      <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} color="var(--success)" /> Zero-Training Commitment
        </h2>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <li><strong>No Public AI Training:</strong> Your resume and profile details are never used to train public foundation models.</li>
          <li><strong>Zero Data Selling:</strong> We do not sell or monetize candidate data to third-party data brokers.</li>
          <li><strong>Full Data Portability:</strong> Export your entire structured database bundle at any time in standard JSON.</li>
        </ul>
      </div>

      {/* GDPR Data Export */}
      <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
          Export Full Data Bundle (GDPR Article 20)
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Download a complete machine-readable JSON archive of your Career Profile, all resume versions, tracked job applications, and cover letters.
        </p>
        <button onClick={handleExportData} disabled={downloading} className="btn btn-secondary btn-sm">
          <Download size={14} /> {downloading ? 'Preparing Archive...' : 'Download JSON Bundle'}
        </button>
      </div>

      {/* Account Deletion */}
      <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={16} /> Permanent Account Erasure
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Permanently delete your account, career profile, resumes, applications, and token links. This action cannot be undone.
        </p>

        <div style={{ maxWidth: '360px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
            Type <strong>DELETE</strong> to confirm:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ fontSize: '0.8125rem' }}
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== 'DELETE'}
              className="btn btn-danger btn-sm"
            >
              {deleting ? 'Erasing...' : 'Erase All'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyCenter;
