import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  FileEdit,
  Crosshair,
  FileText,
  Briefcase,
  Layers,
  GraduationCap,
  Settings,
  Shield,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Globe,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CareerCopilotWidget from '../ai/CareerCopilotWidget';
import BrandLogo from '../common/BrandLogo';

const AppShell = ({ children }) => {
  const { user, logout, toggleTheme } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  useEffect(() => {
    // Check for unsaved local draft recovery
    const savedDraft = localStorage.getItem('resume_draft_backup');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.savedAt && (Date.now() - parsed.savedAt) < 24 * 60 * 60 * 1000) {
          setDraftAvailable(true);
        }
      } catch {
        localStorage.removeItem('resume_draft_backup');
      }
    }
  }, []);

  const handleRestoreDraft = () => {
    navigate('/builder?restore=draft');
    setDraftAvailable(false);
    addToast('Restored unsaved draft from local storage.', 'success');
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('resume_draft_backup');
    setDraftAvailable(false);
    addToast('Unsaved draft discarded.', 'info');
  };

  const handleLogout = () => {
    logout();
    addToast('Signed out successfully.', 'info');
    navigate('/', { replace: true });
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/career-profile', label: 'Career Profile', icon: UserCheck, badge: 'Truth' },
    { to: '/builder', label: 'Resume Builder', icon: FileEdit },
    { to: '/job-match', label: 'Job Match', icon: Crosshair },
    { to: '/cover-letter', label: 'Cover Letter', icon: FileText },
    { to: '/applications', label: 'Applications', icon: Briefcase },
    { to: '/portfolio', label: 'Portfolio', icon: Globe },
    { to: '/templates', label: 'Templates', icon: Layers },
    { to: '/learning', label: 'Learning Center', icon: GraduationCap },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const currentTitle = navItems.find(i => location.pathname.startsWith(i.to))?.label || 'Career Platform';

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop Sidebar Navigation */}
      <aside
        className="app-sidebar no-print"
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          borderRight: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <BrandLogo size={28} rounded={6} />
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                Resume<span style={{ color: 'var(--accent-primary)' }}>Builder</span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '0.875rem 0.625rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#f4f4f5' : '#71717a',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                <Icon size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: '0.59rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#f4f4f5' }}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f4f4f5' }}>{user?.name || 'User'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ color: '#71717a', padding: '4px' }}
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Global Header */}
        <header
          className="app-header no-print"
          style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--bg-app)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-icon"
              style={{ display: 'none' }}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {currentTitle}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun size={14} color="var(--warning)" /> : <Moon size={14} />}
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* Draft Recovery Banner */}
        {draftAvailable && (
          <div
            className="draft-recovery-banner no-print"
            style={{
              padding: '8px 1.5rem',
              backgroundColor: 'var(--accent-soft)',
              borderBottom: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              <RotateCcw size={14} color="var(--accent-primary)" />
              <span><strong>Draft Recovery:</strong> You have unsaved changes from a previous session.</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleRestoreDraft} className="btn btn-primary btn-sm">
                Restore Draft
              </button>
              <button onClick={handleDiscardDraft} className="btn btn-ghost btn-sm">
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main id="main-content" style={{ flex: 1, padding: '0', overflowY: 'auto' }}>
          {children}
        </main>

        {/* Global AI Career Copilot Widget */}
        <CareerCopilotWidget />
      </div>
    </div>
  );
};

export default AppShell;
