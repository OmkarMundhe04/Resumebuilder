import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

const LandingNav = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="landing-nav-wrap">
      <nav className={`landing-nav-inner ${scrolled ? 'landing-nav-scrolled' : ''}`}>
        {/* Brand */}
        <Link to="/" className="landing-brand">
          <BrandLogo size={30} rounded={8} showGlow={true} />
          <span>ResumeBuilder</span>
        </Link>

        {/* Narrative Links */}
        <div className="landing-nav-links">
          <button
            type="button"
            onClick={() => scrollToSection('chapter-truth')}
            className="landing-nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Truth Engine
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chapter-builder')}
            className="landing-nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Resume
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chapter-intelligence')}
            className="landing-nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Intelligence
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chapter-studio')}
            className="landing-nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Cover Letter
          </button>
          <Link to="/templates" className="landing-nav-link">
            Templates
          </Link>
          <Link to="/learning" className="landing-nav-link">
            ATS Guide
          </Link>
        </div>

        {/* Auth CTA */}
        <div className="landing-nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-landing-primary">
              Open Dashboard <ArrowRight size={13} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-landing-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-landing-primary">
                Build Resume <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default LandingNav;
