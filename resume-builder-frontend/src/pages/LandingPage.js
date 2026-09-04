import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Download,
  Share2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingNav from '../components/landing/LandingNav';
import LivingArtifact from '../components/landing/LivingArtifact';
import BrandLogo from '../components/common/BrandLogo';
import '../components/landing/LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(isAuthenticated ? '/dashboard' : '/register');
  };

  const scrollToStory = () => {
    const el = document.getElementById('chapter-truth');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-immersive">
      {/* Ambient Canvas & Subtle Blueprint Grid */}
      <div className="landing-ambient-canvas">
        <div className="landing-mesh-orb landing-orb-1" />
        <div className="landing-mesh-orb landing-orb-2" />
        <div className="landing-mesh-orb landing-orb-3" />
        <div className="landing-blueprint-grid" />
        <div className="landing-grain" />
      </div>

      {/* Floating Glass Navigation */}
      <LandingNav />

      {/* ====================================================================
          CHAPTER 01: THE HERO
          ==================================================================== */}
      <section className="landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hero-eyebrow"
        >
          <span className="hero-eyebrow-dot" />
          The Intelligent Career Operating System
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="hero-headline"
        >
          YOUR CAREER <br />
          DESERVES <span className="gradient-text">A BETTER STORY.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="hero-subheadline"
        >
          Transform verified experience into precision ATS resumes, discover instant job match intelligence, and generate evidence-grounded cover letters with zero hallucinations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hero-cta-group"
        >
          <button onClick={handleStart} className="hero-btn-primary">
            {isAuthenticated ? 'Open Dashboard' : 'Build Your Resume'} <ArrowRight size={16} />
          </button>
          <button onClick={scrollToStory} className="hero-btn-secondary">
            Explore The Narrative <ChevronDown size={15} />
          </button>
        </motion.div>

        {/* Hero Visual Protagonist */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}
        >
          <LivingArtifact stage="hero" />
        </motion.div>
      </section>

      {/* ====================================================================
          STORY TIMELINE CHAPTERS
          ==================================================================== */}
      <div className="story-scroll-container">
        {/* CHAPTER 02: CAREER PROFILE (TRUTH ENGINE) */}
        <section id="chapter-truth" className="story-chapter">
          <div className="story-grid-split">
            <div className="story-editorial-copy">
              <span className="story-chapter-number">01 / The Truth Engine</span>
              <h2 className="story-chapter-title">
                One verified source of truth for your entire career.
              </h2>
              <p className="story-chapter-desc">
                Stop rewriting your history from memory. Maintain a centralized career database of verified roles, projects, skills, and quantified metrics that powers all future documents.
              </p>
              <div className="story-feature-list">
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Fact Verification Ledger:</strong> Guaranteed accuracy across every milestone.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Attribute Control:</strong> Add, edit, or remove technical skills and project details instantly.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Reusability:</strong> Write once; deploy to hundreds of targeted resumes.</span>
                </div>
              </div>
            </div>

            <div className="story-visual-wrap">
              <LivingArtifact stage="profile" />
            </div>
          </div>
        </section>

        {/* CHAPTER 03: RESUME BUILDER (PRECISION TRANSFORMATION) */}
        <section id="chapter-builder" className="story-chapter">
          <div className="story-grid-split reversed">
            <div className="story-visual-wrap">
              <LivingArtifact stage="builder" />
            </div>

            <div className="story-editorial-copy">
              <span className="story-chapter-number">02 / Precision Architecture</span>
              <h2 className="story-chapter-title">
                Raw experience transformed into ISO A4 precision.
              </h2>
              <p className="story-chapter-desc">
                Engineered for maximum ATS machine-readability and human recruiter clarity. 16 curated templates built with pure semantic hierarchy and multi-format export.
              </p>
              <div className="story-feature-list">
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>100% ATS Safe:</strong> Zero tables, text boxes, or hidden artifacts that break parsers.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Tri-Format Universal Export:</strong> Download selectable PDF, native Word (.docx), or raw ASCII TXT.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Live ATS Health Radar:</strong> Multi-metric scoring for length, keywords, and typography.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 04: JOB MATCH (INTELLIGENCE) */}
        <section id="chapter-intelligence" className="story-chapter">
          <div className="story-grid-split">
            <div className="story-editorial-copy">
              <span className="story-chapter-number">03 / Match Intelligence</span>
              <h2 className="story-chapter-title">
                See exactly how you align before you hit apply.
              </h2>
              <p className="story-chapter-desc">
                Paste any job description to trigger our Gemini AI gap analyzer. Uncover confirmed matching keywords, missing requirements, and actionable bullet formulas.
              </p>
              <div className="story-feature-list">
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Keyword Matrix:</strong> Real-time mapping between job requirements and your verified profile.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Actionable Bullet Formulas:</strong> Context + Action + Metric templates tailored to the opportunity.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Zero Exaggeration:</strong> Tailor emphasis without fabricating false qualifications.</span>
                </div>
              </div>
            </div>

            <div className="story-visual-wrap">
              <LivingArtifact stage="match" />
            </div>
          </div>
        </section>

        {/* CHAPTER 05: COVER LETTER (WRITING STUDIO) */}
        <section id="chapter-studio" className="story-chapter">
          <div className="story-grid-split reversed">
            <div className="story-visual-wrap">
              <LivingArtifact stage="coverletter" />
            </div>

            <div className="story-editorial-copy">
              <span className="story-chapter-number">04 / The Writing Studio</span>
              <h2 className="story-chapter-title">
                Compelling letters grounded strictly in your truth.
              </h2>
              <p className="story-chapter-desc">
                Say goodbye to generic AI fluff. Our generator pulls verified achievements from your Career Profile to construct persuasive, evidence-backed cover letters.
              </p>
              <div className="story-feature-list">
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Evidence Grounding:</strong> Every claim references actual projects and quantified milestones.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Tone Calibration:</strong> Switch between Confident, Technical, Formal, and Conversational styles.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>1-Click PDF Export:</strong> Professional letterhead ready for immediate submission.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 06: PIPELINE & LIFECYCLE */}
        <section className="story-chapter">
          <div className="story-grid-split">
            <div className="story-editorial-copy">
              <span className="story-chapter-number">05 / Pipeline Control</span>
              <h2 className="story-chapter-title">
                Your end-to-end career workflow in one place.
              </h2>
              <p className="story-chapter-desc">
                Organize opportunities with an intuitive Kanban pipeline. Track submission dates, match scores, interview rounds, and offers seamlessly.
              </p>
              <div className="story-feature-list">
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Drag & Drop Stages:</strong> Move applications from Wishlist to Interviewing and Offer.</span>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-bullet" />
                  <span><strong>Telemetry:</strong> Understand which resume versions and keywords generate the most callbacks.</span>
                </div>
              </div>
            </div>

            <div className="story-visual-wrap">
              <LivingArtifact stage="applications" />
            </div>
          </div>
        </section>
      </div>

      {/* ====================================================================
          CHAPTER 07: TRUST & DATA SOVEREIGNTY GUARANTEE
          ==================================================================== */}
      <section className="landing-trust-section">
        <div className="trust-hero-head">
          <span className="hero-eyebrow">
            <ShieldCheck size={14} /> Absolute Sovereignty
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 1rem 0' }}>
            Your career. Your facts. Your control.
          </h2>
          <p style={{ fontSize: '1rem', color: '#94949e', lineHeight: 1.6, margin: 0 }}>
            We treat your professional history with rigorous security, zero third-party monetization, and zero public AI model training.
          </p>
        </div>

        <div className="trust-pillars-grid">
          <div className="trust-pillar-card">
            <div className="pillar-icon-box">
              <Lock size={20} />
            </div>
            <h3 className="pillar-title">Zero Public AI Training</h3>
            <p className="pillar-desc">
              Your resume bullets and career history are never used to train public foundation models. Your data remains strictly isolated to your account.
            </p>
          </div>

          <div className="trust-pillar-card">
            <div className="pillar-icon-box">
              <Download size={20} />
            </div>
            <h3 className="pillar-title">GDPR Data Portability</h3>
            <p className="pillar-desc">
              Download your entire structured career profile, resume history, and telemetry in standard JSON format at any time with 1 click.
            </p>
          </div>

          <div className="trust-pillar-card">
            <div className="pillar-icon-box">
              <Share2 size={20} />
            </div>
            <h3 className="pillar-title">Cryptographic Share Links</h3>
            <p className="pillar-desc">
              Share read-only candidate profiles with recruiters via tamper-proof, tokenized links with optional contact information masking.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          CHAPTER 08: FINAL CALL TO ACTION
          ==================================================================== */}
      <section className="landing-final-cta">
        <span className="hero-eyebrow">Start Your Next Chapter</span>
        <h2 className="final-cta-headline">
          YOUR NEXT OPPORTUNITY <br />
          STARTS WITH HOW YOU <br />
          <span className="gradient-text">PRESENT YOUR STORY.</span>
        </h2>
        <p className="final-cta-desc">
          Build a truthful, intelligent career profile and create precision resumes that open doors at top companies.
        </p>

        <div className="hero-cta-group">
          <button onClick={handleStart} className="hero-btn-primary">
            {isAuthenticated ? 'Go to Dashboard' : 'Create Your Resume'} <ArrowRight size={16} />
          </button>
          {!isAuthenticated && (
            <Link to="/login" className="hero-btn-secondary">
              Sign In to Existing Account
            </Link>
          )}
        </div>
      </section>

      {/* ====================================================================
          MINIMAL EDITORIAL FOOTER
          ==================================================================== */}
      <footer className="landing-footer">
        <div className="footer-top-grid">
          <div className="footer-brand-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <BrandLogo size={28} rounded={6} showGlow={true} />
              <div className="footer-brand-title" style={{ margin: 0 }}>ResumeBuilder</div>
            </div>
            <p className="footer-brand-tagline">
              The intelligent career operating system for modern engineers, designers, and builders.
            </p>
          </div>

          <div className="footer-links-group">
            <div>
              <div className="footer-col-title">Platform</div>
              <div className="footer-link-list">
                <Link to={isAuthenticated ? '/builder' : '/register'} className="footer-nav-link">Resume Builder</Link>
                <Link to={isAuthenticated ? '/job-match' : '/register'} className="footer-nav-link">Job Match AI</Link>
                <Link to={isAuthenticated ? '/cover-letter' : '/register'} className="footer-nav-link">Cover Letter Studio</Link>
                <Link to="/templates" className="footer-nav-link">ATS Templates</Link>
                <Link to="/learning" className="footer-nav-link">Learning Center</Link>
              </div>
            </div>

            <div>
              <div className="footer-col-title">Security & Trust</div>
              <div className="footer-link-list">
                <Link to="/trust" className="footer-nav-link">Trust Center</Link>
                <Link to={isAuthenticated ? '/privacy' : '/register'} className="footer-nav-link">Data Sovereignty</Link>
                <Link to={isAuthenticated ? '/settings' : '/register'} className="footer-nav-link">Account Settings</Link>
              </div>
            </div>

            <div>
              <div className="footer-col-title">Account</div>
              <div className="footer-link-list">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="footer-nav-link">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="footer-nav-link">Sign In</Link>
                    <Link to="/register" className="footer-nav-link">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>© {new Date().getFullYear()} ResumeBuilder. All rights reserved.</div>
          <div>Engineered with verified career evidence & precision typography.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
