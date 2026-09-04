import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Lock, Copy, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ShareResumeModal = ({ resume, isOpen, onClose }) => {
  const { addToast } = useToast();
  const [links, setLinks] = useState([]);
  const [password, setPassword] = useState('');
  const [expiresDays, setExpiresDays] = useState(30);
  const [maskContactInfo, setMaskContactInfo] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'manage'

  const fetchMyLinks = useCallback(async () => {
    if (!resume?._id) return;
    try {
      const res = await api.get(`/share/my-links/${resume._id}`);
      if (res.data.success) {
        setLinks(res.data.links || []);
      }
    } catch {
      // Ignored
    }
  }, [resume?._id]);

  useEffect(() => {
    if (isOpen && resume?._id) {
      fetchMyLinks();
    }
  }, [isOpen, resume?._id, fetchMyLinks]);

  if (!isOpen || !resume) return null;

  const handleCreateShareLink = async () => {
    setLoading(true);
    try {
      const res = await api.post('/share/create', {
        resumeId: resume._id,
        title: `${resume.title} (Public Share)`,
        password: password.trim() || undefined,
        expiresDays: Number(expiresDays),
        maskContactInfo,
        allowDownload
      });

      if (res.data.success) {
        addToast('Public share link created!', 'success');
        fetchMyLinks();
        setActiveTab('manage');
        setPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create share link.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeLink = async (token) => {
    try {
      const res = await api.delete(`/share/revoke/${token}`);
      if (res.data.success) {
        addToast('Share link revoked.', 'info');
        setLinks(prev => prev.filter(l => l.token !== token));
      }
    } catch {
      addToast('Failed to revoke link.', 'error');
    }
  };

  const copyShareUrl = (token) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    addToast('Share link copied to clipboard!', 'success');
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="share-resume-title">
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Share2 size={18} />
            </div>
            <div>
              <h3 id="share-resume-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Shareable Resume Link
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Create privacy-safe, tokenized view links with optional expiration and contact masking.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('create')}
            className={`btn btn-sm ${activeTab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Create New Link
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`btn btn-sm ${activeTab === 'manage' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Active Links ({links.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <div style={{ margin: '1rem 0' }}>
            <div className="form-group">
              <label className="form-label">Link Expiration (Days):</label>
              <select
                className="form-select"
                value={expiresDays}
                onChange={(e) => setExpiresDays(e.target.value)}
              >
                <option value={7}>7 Days</option>
                <option value={30}>30 Days (Recommended)</option>
                <option value={90}>90 Days</option>
                <option value={365}>1 Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Optional Password Protection:</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for open token access"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '1rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={maskContactInfo}
                  onChange={(e) => setMaskContactInfo(e.target.checked)}
                />
                <span><strong>Mask Private Contact Info</strong> (Obscures phone & email for public viewing)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                />
                <span>Allow viewers to download PDF / TXT copy</span>
              </label>
            </div>

            <div className="modal-footer">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateShareLink} disabled={loading} className="btn btn-primary">
                {loading ? 'Generating...' : 'Generate Secure Link'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ margin: '1rem 0', maxHeight: '350px', overflowY: 'auto' }}>
            {links.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No active share links. Create one in the "Create New Link" tab.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map((link) => (
                  <div
                    key={link.token}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {link.isPasswordProtected && <Lock size={12} color="var(--warning)" />}
                        <span>Views: {link.viewCount || 0}</span>
                        {link.maskContactInfo && <span className="badge badge-suggested" style={{ fontSize: '0.6875rem' }}>Masked</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Expires: {new Date(link.expiresAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => copyShareUrl(link.token)} className="btn btn-secondary btn-sm">
                        <Copy size={12} /> Copy URL
                      </button>
                      <button onClick={() => handleRevokeLink(link.token)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Revoke Link">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-footer">
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareResumeModal;
