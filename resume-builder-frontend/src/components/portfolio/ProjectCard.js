import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import MagneticButton from './MagneticButton';

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics for desktop
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const formattedIndex = String(index + 1).padStart(2, '0');
  const technologies = project.technologies || [];

  return (
    <motion.div
      ref={cardRef}
      className="portfolio-project-card"
      data-cursor="view"
      data-cursor-text="EXPLORE"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.12 }}
    >
      {/* Visual Header / Editorial Architectural Banner */}
      <div className="project-banner-visual">
        <div className="project-index-watermark">{formattedIndex}</div>
        <div className="project-banner-content">
          <div className="project-meta-top">
            <span className="project-category-badge">
              <Layers size={13} /> {project.role || 'Architecture & Build'}
            </span>
            {project.status === 'VERIFIED' && (
              <span className="project-verified-badge">
                <Sparkles size={12} /> Verified
              </span>
            )}
          </div>
          <h3 className="project-title">{project.name}</h3>
        </div>
        {/* Subtle decorative glow overlay */}
        <div className={`project-hover-glow ${isHovered ? 'active' : ''}`} />
      </div>

      {/* Card Body Details */}
      <div className="project-card-body">
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}

        {/* Project Outcome / Highlights if present */}
        {project.outcome && (
          <div className="project-outcome-highlight">
            <strong>Impact:</strong> {project.outcome}
          </div>
        )}

        {/* Verified Bullets if available */}
        {project.bullets && project.bullets.length > 0 && (
          <ul className="project-bullets-list">
            {project.bullets.slice(0, 2).map((b, bIdx) => (
              <li key={b.id || bIdx}>{b.text}</li>
            ))}
          </ul>
        )}

        {/* Technology Stack Pills */}
        {technologies.length > 0 && (
          <div className="project-tech-stack">
            {technologies.map((tech, tIdx) => (
              <span key={tIdx} className="project-tech-pill">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Action Bar / External Links */}
        <div className="project-actions-bar">
          {project.link && (
            <MagneticButton>
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="project-action-btn live-btn"
                data-cursor="link"
              >
                <span>Live Deployment</span>
                <ArrowUpRight size={16} />
              </a>
            </MagneticButton>
          )}

          {project.repoLink && (
            <MagneticButton>
              <a
                href={project.repoLink}
                target="_blank"
                rel="noreferrer"
                className="project-action-btn repo-btn"
                data-cursor="link"
              >
                <GithubIcon size={15} />
                <span>Source Code</span>
              </a>
            </MagneticButton>
          )}

          {!project.link && !project.repoLink && (
            <span className="project-internal-badge">Production Architecture</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
