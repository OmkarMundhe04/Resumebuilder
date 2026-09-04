import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GoogleSignInButton = ({ redirectTo = '/dashboard', textType = 'continue_with' }) => {
  const { googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(clientId && clientId.includes('.apps.googleusercontent.com') && !clientId.includes('demo-resumebuilder'));

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      addToast('Google response missing ID token.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      addToast(data.message || 'Signed in with Google!', 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Google sign-in failed.';
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    // If client ID is invalid or not yet configured on Google Cloud
    setShowConfigModal(true);
  };

  const handleDevInstantLogin = async (customEmail = null) => {
    setLoading(true);
    try {
      const testEmail = customEmail || `omkar.google_${Math.floor(100 + Math.random() * 900)}@gmail.com`;
      const data = await googleLogin(null, {
        email: testEmail,
        name: 'Omkar Mundhe (Google)',
        sub: `google_oauth_${Date.now()}`,
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
      });
      addToast(data.message || 'Signed in with Google test account!', 'success');
      setShowConfigModal(false);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      addToast(err.message || 'Google sign-in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-auth-container">
      {isConfigured ? (
        <div className="google-auth-wrapper">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="100%"
            text={textType}
            logo_alignment="left"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="google-auth-btn-custom"
        >
          <GoogleIcon />
          <span>{textType === 'signup_with' ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>
      )}

      {loading && (
        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          Authenticating with Google...
        </div>
      )}

      {/* Google OAuth Setup & Dev Helper Modal */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            style={{
              backgroundColor: '#121216',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              color: '#f4f4f6',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GoogleIcon />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Google Sign-In Setup</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              To enable real Google Single Sign-On in production or local development:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>1.</span>
                <span>
                  Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Google Cloud Console → Credentials <ExternalLink size={11} style={{ display: 'inline' }} /></a>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>2.</span>
                <span>Create <strong>OAuth 2.0 Client ID</strong> (Application type: <strong>Web application</strong>).</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>3.</span>
                <span>Under <em>Authorized JavaScript origins</em>, add <code>http://localhost:3000</code>.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>4.</span>
                <span>Paste the Client ID in <code>resume-builder-frontend/.env</code> as:</span>
              </div>
              <code style={{ fontSize: '0.75rem', background: '#09090b', padding: '6px 10px', borderRadius: '6px', color: '#38bdf8', wordBreak: 'break-all' }}>
                REACT_APP_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
              </code>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Instant Dev Testing
              </div>
              <button
                type="button"
                onClick={() => handleDevInstantLogin('omkarmundhe04@gmail.com')}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} />
                {loading ? 'Authenticating...' : 'Sign in as omkarmundhe04@gmail.com (Dev Mock)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
