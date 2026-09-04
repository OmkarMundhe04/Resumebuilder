import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Lock, Download, Printer, AlertCircle } from 'lucide-react';
import api from '../services/api';
import ResumeRenderer from '../components/templates/ResumeRenderer';
import { exportToPdf } from '../utils/export/exportPdf';
import { exportToDocx } from '../utils/export/exportDocx';
import { exportToTxt } from '../utils/export/exportTxt';
import { useToast } from '../context/ToastContext';

const PublicResumeView = () => {
  const { token } = useParams();
  const { addToast } = useToast();

  const [resume, setResume] = useState(null);
  const [shareConfig, setShareConfig] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSharedResume = useCallback(async (pwd = '') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/share/view/${token}${pwd ? `?password=${encodeURIComponent(pwd)}` : ''}`);
      if (res.data.success) {
        setResume(res.data.resume);
        setShareConfig(res.data.shareConfig);
        setPasswordRequired(false);
      }
    } catch (err) {
      if (err.response?.data?.passwordRequired) {
        setPasswordRequired(true);
      } else {
        setErrorMsg(err.response?.data?.message || 'Shared resume link is invalid or expired.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSharedResume();
  }, [fetchSharedResume]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    fetchSharedResume(enteredPassword);
  };

  const handleDownload = async (format) => {
    if (!resume) return;
    try {
      if (format === 'pdf') {
        await exportToPdf(resume, 'shared-resume-document');
        addToast('PDF downloaded.', 'success');
      } else if (format === 'docx') {
        await exportToDocx(resume);
        addToast('DOCX downloaded.', 'success');
      } else if (format === 'txt') {
        exportToTxt(resume);
      }
    } catch {
      addToast('Download failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading shared resume...
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Password Protected Resume</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            The owner of this resume has protected it with a passcode.
          </p>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                className="form-input"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="Enter password..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Unlock Resume
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Link Expired or Invalid</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-resume-view" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', paddingBottom: '3rem' }}>
      {/* Top Header Bar */}
      <header
        className="no-print"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--success)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Verified Resume: {resume?.personal?.fullName || 'Candidate'}
          </span>
          {shareConfig?.maskContactInfo && (
            <span className="badge badge-suggested" style={{ fontSize: '0.6875rem' }}>Contact Masked</span>
          )}
        </div>

        {shareConfig?.allowDownload !== false && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleDownload('pdf')} className="btn btn-primary btn-sm">
              <Download size={14} /> PDF
            </button>
            <button onClick={() => handleDownload('docx')} className="btn btn-secondary btn-sm">
              DOCX
            </button>
            <button onClick={() => window.print()} className="btn btn-ghost btn-icon btn-sm">
              <Printer size={15} />
            </button>
          </div>
        )}
      </header>

      {/* Render Document */}
      <div style={{ marginTop: '1.5rem' }}>
        <ResumeRenderer resume={resume} containerId="shared-resume-document" />
      </div>
    </div>
  );
};

export default PublicResumeView;
