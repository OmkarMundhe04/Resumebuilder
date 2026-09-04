import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ExternalLink,
  Mail,
  MapPin,
  Share2,
  Check,
  Code2,
  GraduationCap,
  Award,
  Sparkles,
  Search,
  FileText,
  BookOpen,
  Trophy,
  HeartHandshake,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// Portfolio Components & Styles
import InteractiveBackground from '../components/portfolio/InteractiveBackground';
import PortfolioPreloader from '../components/portfolio/PortfolioPreloader';
import ProjectCard from '../components/portfolio/ProjectCard';
import MagneticButton from '../components/portfolio/MagneticButton';
import '../components/portfolio/PortfolioPage.css';

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Portfolio = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProjectFilter, setActiveProjectFilter] = useState('ALL');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Scroll Progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Fetch truthful profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/career-profile');
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch {
      addToast('Failed to load portfolio profile data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Share / Copy portfolio URL
  const handleCopyPortfolioUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    addToast('Portfolio link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Copy Email action
  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    addToast(`Copied ${email} to clipboard!`, 'success');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const {
    personal,
    experiences = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    publications = [],
    awards = [],
    volunteer = [],
    customSections = []
  } = profile || {};

  // Extract unique tech tags from projects for interactive filtering
  const projectCategories = useMemo(() => {
    const categories = ['ALL'];
    projects.forEach((p) => {
      if (p.technologies && Array.isArray(p.technologies)) {
        p.technologies.forEach((tech) => {
          if (tech && !categories.includes(tech.toUpperCase()) && categories.length < 6) {
            categories.push(tech.toUpperCase());
          }
        });
      }
    });
    return categories;
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (activeProjectFilter === 'ALL') return projects;
    return projects.filter((p) =>
      p.technologies?.some((t) => t.toUpperCase() === activeProjectFilter)
    );
  }, [projects, activeProjectFilter]);

  // Group skills by category
  const categorizedSkills = useMemo(() => {
    const groups = {
      Technical: [],
      Tools: [],
      Languages: [],
      Soft: []
    };

    skills.forEach((s) => {
      const item = typeof s === 'string' ? { name: s, note: '' } : s;
      const category = item.category && groups[item.category] ? item.category : 'Technical';
      const matchesSearch = !skillSearchQuery || (item.name || '').toLowerCase().includes(skillSearchQuery.toLowerCase());
      if (matchesSearch) {
        groups[category].push(item);
      }
    });

    return groups;
  }, [skills, skillSearchQuery]);

  // Career metrics from profile
  const verifiedProjectsCount = projects.length;
  const verifiedSkillsCount = skills.length;
  const verifiedCertificationsCount = certifications.length;

  if (loading || !profile) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="status-dot-pulse" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600 }}>Loading verified career architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="awwwards-portfolio">
      {/* 0.8s Cinematic Preloader */}
      <PortfolioPreloader fullName={personal?.fullName || 'ENGINEER'} />

      {/* Interactive Canvas Mesh & Noise Overlay */}
      <InteractiveBackground />

      {/* Top Reading Progress Bar */}
      <motion.div className="portfolio-scroll-progress" style={{ scaleX }} />

      {/* Main Portfolio Container */}
      <div className="portfolio-content-wrap">
        {/* ------------------------------------------------------------------
            Top Floating Status & Action Bar
            ------------------------------------------------------------------ */}
        <motion.header
          className="portfolio-top-bar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="portfolio-status-pill">
            <span className="status-dot-pulse" />
            <span>Available for Full-Time & Architecture Roles</span>
          </div>

          <div className="top-bar-actions">
            <MagneticButton>
              <button
                onClick={handleCopyPortfolioUrl}
                className="btn-pill-action"
                data-cursor="button"
                aria-label="Share Portfolio"
              >
                {copiedLink ? <Check size={14} color="var(--success)" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Link Copied' : 'Share Portfolio'}</span>
              </button>
            </MagneticButton>

            <MagneticButton>
              <Link
                to="/builder"
                className="btn-pill-action primary"
                data-cursor="button"
              >
                <FileText size={14} />
                <span>Resume Builder</span>
              </Link>
            </MagneticButton>
          </div>
        </motion.header>

        {/* ------------------------------------------------------------------
            Signature Hero Section
            ------------------------------------------------------------------ */}
        <section className="portfolio-hero-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-tagline">
              <Sparkles size={14} />
              <span>Verified Career Profile // 2026</span>
            </div>
          </motion.div>

          {/* Profile Photo Display */}
          {personal?.photoUrl && personal.showPhoto !== false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              style={{ marginBottom: '1.25rem', display: 'inline-block' }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  padding: '3px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, rgba(99, 102, 241, 0.8) 50%, var(--accent-hover) 100%)',
                  boxShadow: '0 8px 30px rgba(2, 132, 199, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={personal.photoUrl}
                  alt={personal.fullName || 'Career Profile'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </motion.div>
          )}

          <div className="hero-title-wrap">
            <motion.h1
              className="hero-display-name"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {personal?.fullName ? (
                <span className="hero-name-gradient">{personal.fullName}</span>
              ) : (
                'Engineering Leader'
              )}
            </motion.h1>

            <motion.div
              className="hero-role-headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {personal?.title || 'Full Stack Engineer & System Architect'}
            </motion.div>
          </div>

          {personal?.summary && (
            <motion.p
              className="hero-summary-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {personal.summary}
            </motion.p>
          )}

          {/* Quick Truth Metrics */}
          <motion.div
            className="hero-quick-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="stat-item">
              <span className="stat-number">{String(verifiedProjectsCount).padStart(2, '0')}</span>
              <span className="stat-label">Verified Builds</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{String(verifiedSkillsCount).padStart(2, '0')}</span>
              <span className="stat-label">Core Competencies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{String(experiences.length).padStart(2, '0')}</span>
              <span className="stat-label">Career Milestones</span>
            </div>
            {verifiedCertificationsCount > 0 && (
              <div className="stat-item">
                <span className="stat-number">{String(verifiedCertificationsCount).padStart(2, '0')}</span>
                <span className="stat-label">Credentials</span>
              </div>
            )}
          </motion.div>

          {/* Social & Contact Bar */}
          <motion.div
            className="hero-social-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {personal?.location && (
              <span className="hero-social-link" style={{ cursor: 'default' }}>
                <MapPin size={15} color="var(--accent-primary)" />
                <span>{personal.location}</span>
              </span>
            )}

            {personal?.github && (
              <MagneticButton>
                <a
                  href={personal.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hero-social-link"
                  data-cursor="link"
                >
                  <GithubIcon size={15} />
                  <span>GitHub</span>
                </a>
              </MagneticButton>
            )}

            {personal?.linkedin && (
              <MagneticButton>
                <a
                  href={personal.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hero-social-link"
                  data-cursor="link"
                >
                  <LinkedinIcon size={15} color="var(--accent-primary)" />
                  <span>LinkedIn</span>
                </a>
              </MagneticButton>
            )}

            {personal?.email && (
              <MagneticButton>
                <button
                  onClick={() => handleCopyEmail(personal.email)}
                  className="hero-social-link"
                  data-cursor="button"
                >
                  {copiedEmail ? <Check size={15} color="var(--success)" /> : <Mail size={15} />}
                  <span>{copiedEmail ? 'Email Copied' : personal.email}</span>
                </button>
              </MagneticButton>
            )}
          </motion.div>
        </section>

        {/* Empty State Callout if Career Profile is fresh */}
        {(!projects || projects.length === 0) && (!experiences || experiences.length === 0) && (!skills || skills.length === 0) && (
          <section className="portfolio-section" style={{ textAlign: 'center', padding: 'var(--space-3xl) var(--space-md)' }}>
            <div style={{ maxWidth: '560px', margin: '0 auto', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-2xl)' }}>
              <Sparkles size={28} color="var(--accent-primary)" style={{ marginBottom: 'var(--space-md)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Your Portfolio is Ready to Populate</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-lg)' }}>
                This portfolio automatically visualizes your verified work history, technical ecosystems, and deployed projects straight from your Truth DB.
              </p>
              <Link to="/career-profile" className="btn btn-primary btn-sm">
                Add Career Experience & Projects →
              </Link>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 01: Selected Works & Architecture (Projects)
            ------------------------------------------------------------------ */}
        {projects && projects.length > 0 && (
          <section className="portfolio-section" id="projects">
            <div className="section-editorial-header">
              <span className="section-numeral">01 //</span>
              <h2 className="section-heading-title">Selected Works & Architecture</h2>
              <span className="section-subtitle">{projects.length} Engineering Deployments</span>
            </div>

            {/* Project Filter Chips */}
            {projectCategories.length > 1 && (
              <div className="projects-filter-bar">
                {projectCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveProjectFilter(cat)}
                    className={`filter-chip-btn ${activeProjectFilter === cat ? 'active' : ''}`}
                    data-cursor="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Masonry Project Grid */}
            <div className="projects-masonry-grid">
              {filteredProjects.map((project, idx) => (
                <ProjectCard key={project.id || idx} project={project} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 02: Core Competencies & Skills Arsenal
            ------------------------------------------------------------------ */}
        {skills && skills.length > 0 && (
          <section className="portfolio-section" id="skills">
            <div className="section-editorial-header">
              <span className="section-numeral">02 //</span>
              <h2 className="section-heading-title">Verified Technical Arsenal</h2>
              <span className="section-subtitle">{skills.length} Technical Disciplines</span>
            </div>

            <div className="skills-container-card">
              {/* Instant Search Bar */}
              <div style={{ marginBottom: '1.75rem', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter skills & frameworks in real time..."
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Categorized Skills Cloud */}
              {Object.entries(categorizedSkills).map(([cat, list]) => {
                if (list.length === 0) return null;
                return (
                  <div key={cat} className="skills-category-group">
                    <div className="skills-category-title">
                      <Code2 size={15} color="var(--accent-primary)" />
                      <span>{cat} Ecosystem</span>
                    </div>
                    <div className="skills-badges-wrap">
                      {list.map((s, sIdx) => (
                        <motion.div
                          key={s.id || sIdx}
                          className="skill-interactive-badge"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span>{s.name}</span>
                          {s.proficiency && (
                            <span className="skill-proficiency-tag">{s.proficiency}</span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 03: Engineering Trajectory (Experience Timeline)
            ------------------------------------------------------------------ */}
        {experiences && experiences.length > 0 && (
          <section className="portfolio-section" id="experience">
            <div className="section-editorial-header">
              <span className="section-numeral">03 //</span>
              <h2 className="section-heading-title">Engineering Trajectory</h2>
              <span className="section-subtitle">Leadership & Production History</span>
            </div>

            <div className="timeline-container">
              <div className="timeline-line" />
              {experiences.map((exp, idx) => (
                <motion.div
                  key={exp.id || idx}
                  className="timeline-entry"
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="timeline-node-dot" />
                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <h3 className="timeline-role-title">{exp.role}</h3>
                      <span className="timeline-date-badge">
                        {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="timeline-company-row">
                      {exp.company} {exp.location ? `• ${exp.location}` : ''}
                    </div>

                    {exp.responsibilities && (
                      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                        {exp.responsibilities}
                      </p>
                    )}

                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="timeline-bullets">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={b.id || bIdx}>{b.text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 04: Academic Foundation & Research (Education)
            ------------------------------------------------------------------ */}
        {education && education.length > 0 && (
          <section className="portfolio-section" id="education">
            <div className="section-editorial-header">
              <span className="section-numeral">04 //</span>
              <h2 className="section-heading-title">Academic Foundation</h2>
              <span className="section-subtitle">University & Scientific Degrees</span>
            </div>

            <div className="education-grid">
              {education.map((edu, idx) => (
                <motion.div
                  key={edu.id || idx}
                  className="education-card"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-primary)' }}>
                      <GraduationCap size={18} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Academic Degree</span>
                    </div>
                    <h3 className="edu-degree-name">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <div className="edu-institution">{edu.institution}</div>
                    <div className="edu-date-row">
                      {edu.startDate} — {edu.endDate || 'Completed'}
                    </div>

                    {edu.gpa && (
                      <div className="edu-gpa-badge">
                        GPA / Aggregate: {edu.gpa}
                      </div>
                    )}
                  </div>

                  {edu.coursework && edu.coursework.length > 0 && (
                    <div className="edu-coursework-wrap">
                      {edu.coursework.map((course, cIdx) => (
                        <span key={cIdx} className="edu-course-pill">
                          {course}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 05: Verified Certifications & Credentials
            ------------------------------------------------------------------ */}
        {certifications && certifications.length > 0 && (
          <section className="portfolio-section" id="certifications">
            <div className="section-editorial-header">
              <span className="section-numeral">05 //</span>
              <h2 className="section-heading-title">Verified Credentials</h2>
              <span className="section-subtitle">Industry Standards & Certifications</span>
            </div>

            <div className="certifications-grid">
              {certifications.map((cert, idx) => (
                <motion.div
                  key={cert.id || idx}
                  className="certification-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                      <Award size={16} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Accreditation</span>
                    </div>
                    <h3 className="cert-name">{cert.name}</h3>
                    <div className="cert-issuer">{cert.issuer}</div>
                    {cert.issueDate ? (
                      <div className="cert-date">
                        Issued: {cert.issueDate}{cert.expiryDate ? ` · Expires: ${cert.expiryDate}` : ''}
                      </div>
                    ) : (
                      cert.expiryDate ? (
                        <div className="cert-date">Expires: {cert.expiryDate}</div>
                      ) : null
                    )}
                  </div>

                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cert-link-btn"
                      data-cursor="link"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 06: Academic & Technical Publications
            ------------------------------------------------------------------ */}
        {publications && publications.length > 0 && (
          <section className="portfolio-section" id="publications">
            <div className="section-editorial-header">
              <span className="section-numeral">06 //</span>
              <h2 className="section-heading-title">Academic & Technical Publications</h2>
              <span className="section-subtitle">{publications.length} Scientific & Engineering Papers</span>
            </div>

            <div className="certifications-grid">
              {publications.map((pub, idx) => (
                <motion.div
                  key={pub.id || idx}
                  className="certification-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                      <BookOpen size={16} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Publication</span>
                    </div>
                    <h3 className="cert-name">{pub.title}</h3>
                    {pub.publisher && <div className="cert-issuer">{pub.publisher}</div>}
                    {pub.date && <div className="cert-date">{pub.date}</div>}
                    {pub.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                        {pub.description}
                      </p>
                    )}
                  </div>

                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noreferrer"
                      className="cert-link-btn"
                      data-cursor="link"
                      style={{ marginTop: '12px' }}
                    >
                      <span>Read Publication</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 07: Honors & Recognition
            ------------------------------------------------------------------ */}
        {awards && awards.length > 0 && (
          <section className="portfolio-section" id="awards">
            <div className="section-editorial-header">
              <span className="section-numeral">07 //</span>
              <h2 className="section-heading-title">Honors & Recognition</h2>
              <span className="section-subtitle">{awards.length} Distinctions & Awards</span>
            </div>

            <div className="certifications-grid">
              {awards.map((award, idx) => (
                <motion.div
                  key={award.id || idx}
                  className="certification-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                      <Trophy size={16} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Honor</span>
                    </div>
                    <h3 className="cert-name">{award.title}</h3>
                    {award.issuer && <div className="cert-issuer">{award.issuer}</div>}
                    {award.date && <div className="cert-date">{award.date}</div>}
                    {award.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                        {award.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 08: Volunteer & Community Leadership
            ------------------------------------------------------------------ */}
        {volunteer && volunteer.length > 0 && (
          <section className="portfolio-section" id="volunteer">
            <div className="section-editorial-header">
              <span className="section-numeral">08 //</span>
              <h2 className="section-heading-title">Community & Leadership</h2>
              <span className="section-subtitle">{volunteer.length} Volunteer & Mentorship Engagements</span>
            </div>

            <div className="certifications-grid">
              {volunteer.map((vol, idx) => (
                <motion.div
                  key={vol.id || idx}
                  className="certification-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                      <HeartHandshake size={16} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Volunteer</span>
                    </div>
                    <h3 className="cert-name">{vol.role}</h3>
                    {vol.organization && <div className="cert-issuer">{vol.organization}</div>}
                    {(vol.startDate || vol.endDate) && (
                      <div className="cert-date">
                        {vol.startDate} {vol.endDate ? `— ${vol.endDate}` : ''}
                      </div>
                    )}
                    {vol.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                        {vol.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 09: Bespoke Competencies (Custom Sections)
            ------------------------------------------------------------------ */}
        {customSections && customSections.length > 0 && (
          <section className="portfolio-section" id="custom-sections">
            <div className="section-editorial-header">
              <span className="section-numeral">09 //</span>
              <h2 className="section-heading-title">Bespoke Competencies</h2>
              <span className="section-subtitle">{customSections.length} Specialized Domains</span>
            </div>

            <div className="certifications-grid">
              {customSections.map((cs, idx) => (
                <motion.div
                  key={cs.id || idx}
                  className="certification-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                      <Layers size={16} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Custom Focus</span>
                    </div>
                    <h3 className="cert-name">{cs.title || 'Specialized Section'}</h3>
                    {cs.content && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                        {cs.content}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------
            Section 10: Contact & Terminal Connect
            ------------------------------------------------------------------ */}
        <motion.section
          className="contact-terminal-card"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="contact-headline">Ready to Build the Future?</h2>
          <p className="contact-subtext">
            I am currently open to high-impact software engineering roles, full-stack architecture opportunities, and innovative technical projects.
          </p>

          <div className="contact-actions-row">
            {personal?.email && (
              <MagneticButton>
                <button
                  onClick={() => handleCopyEmail(personal.email)}
                  className="email-copy-btn"
                  data-cursor="button"
                >
                  {copiedEmail ? <Check size={18} /> : <Mail size={18} />}
                  <span>{copiedEmail ? 'Email Copied to Clipboard!' : `Get in Touch (${personal.email})`}</span>
                </button>
              </MagneticButton>
            )}

            {personal?.github && (
              <MagneticButton>
                <a
                  href={personal.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill-action"
                  data-cursor="link"
                >
                  <GithubIcon size={15} />
                  <span>GitHub Profile</span>
                </a>
              </MagneticButton>
            )}

            {personal?.linkedin && (
              <MagneticButton>
                <a
                  href={personal.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill-action"
                  data-cursor="link"
                >
                  <LinkedinIcon size={15} color="var(--accent-primary)" />
                  <span>LinkedIn Connect</span>
                </a>
              </MagneticButton>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Portfolio;
