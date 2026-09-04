import React, { useState, useEffect } from 'react';
import { Eye, Sun, Moon, Type } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/motion/PageTransition';

const Settings = () => {
  const { user, updatePreferences } = useAuth();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'light',
    highContrast: false,
    fontSize: 'normal',
    reducedMotion: false,
    aiEnabled: true
  });

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        theme: user.preferences.theme || 'light',
        highContrast: !!user.preferences.highContrast,
        fontSize: user.preferences.fontSize || 'normal',
        reducedMotion: !!user.preferences.reducedMotion,
        aiEnabled: user.preferences.aiEnabled !== false
      });
    }
  }, [user]);

  const handleUpdatePreferences = async (newPrefs) => {
    setPreferences(newPrefs);
    try {
      await updatePreferences(newPrefs);
      addToast('Preferences saved and applied!', 'success');
    } catch {
      addToast('Failed to save preferences.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        addToast('Password changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PageTransition>
      <div className="page-container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        {/* Editorial Header */}
        <section style={{ marginBottom: 'var(--space-xl)', paddingTop: 'var(--space-sm)' }}>
          <span className="eyebrow">User Controls</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h1 className="display-md" style={{ margin: '0 0 var(--space-xs) 0' }}>
                Account Settings
              </h1>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
                Manage interface preferences, typography scale, accessibility modes, and security credentials.
              </p>
            </div>
          </div>
        </section>

      {/* Accessibility & UI Preferences */}
      <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
          Appearance & Accessibility
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Theme Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Interface Theme</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'dark', label: 'Dark Mode', icon: Moon },
                { id: 'system', label: 'System Match', icon: Eye }
              ].map(t => {
                const Icon = t.icon;
                const active = preferences.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleUpdatePreferences({ ...preferences, theme: t.id })}
                    className={`btn ${active ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ flex: 1, padding: '8px 12px' }}
                  >
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Scaling */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>Typography Scale</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'normal', label: 'Standard (100%)' },
                { id: 'large', label: 'Large (110%)' },
                { id: 'xlarge', label: 'Extra Large (125%)' }
              ].map(f => {
                const active = preferences.fontSize === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleUpdatePreferences({ ...preferences, fontSize: f.id })}
                    className={`btn ${active ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ flex: 1, padding: '8px 12px' }}
                  >
                    <Type size={14} /> {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>High Contrast Mode</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enhance border definitions and text contrast for maximum visibility.</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) => handleUpdatePreferences({ ...preferences, highContrast: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reduced Motion</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disable smooth transitions, cursor physics, and animations.</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => handleUpdatePreferences({ ...preferences, reducedMotion: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Password Security */}
      <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
          Security & Password
        </h2>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">New Password (8+ characters)</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-sm)' }}>
            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword}
              className="btn btn-primary btn-sm"
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
