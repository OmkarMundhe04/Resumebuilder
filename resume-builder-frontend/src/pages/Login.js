import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthVisualProtagonist from '../components/auth/AuthVisualProtagonist';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import BrandLogo from '../components/common/BrandLogo';
import '../components/auth/Auth.css';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter your username or email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      addToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid username/email or password.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-immersive-page">
      {/* Background Ambient Canvas */}
      <div className="auth-ambient-canvas">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-blueprint-grid" />
      </div>

      <div className="auth-split-wrapper">
        {/* Left: Editorial Form Card */}
        <motion.div
          className="auth-form-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/" className="auth-brand-badge">
            <BrandLogo size={30} rounded={7} showGlow={true} />
            <span>ResumeBuilder</span>
          </Link>

          <h1 className="auth-heading">Welcome back.</h1>
          <p className="auth-subheading">
            Sign in to access your verified career truth ledger, active resumes, and job matches.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.625rem 0.875rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={15} flexShrink={0} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Google One-Click Sign In */}
          <GoogleSignInButton redirectTo={from} textType="signin_with" />

          <div className="auth-divider">
            <span>or sign in with password</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label">Username or Email</label>
              <input
                type="text"
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. omkar or omkar@example.com"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="auth-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="auth-label">Password</label>
              </div>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input has-toggle"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                'Signing In...'
              ) : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-links">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Build your career story →
            </Link>
          </div>
        </motion.div>

        {/* Right: Visual Protagonist (Stacked Animated Documents) */}
        <AuthVisualProtagonist mode="login" />
      </div>
    </div>
  );
};

export default Login;
