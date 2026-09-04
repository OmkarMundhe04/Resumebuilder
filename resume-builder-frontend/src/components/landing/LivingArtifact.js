import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles, Check, ArrowRight, Briefcase } from 'lucide-react';

const LivingArtifact = ({ stage = 'hero', interactive = true }) => {
  return (
    <div className="artifact-viewport-wrapper">
      <motion.div
        className="living-document-sheet"
        initial={{ opacity: 0, y: 30, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        whileHover={interactive ? { rotateY: -2, rotateX: 2, scale: 1.01 } : {}}
      >
        <AnimatePresence mode="wait">
          {/* STAGE 1 & 2: THE LIVING CAREER PROFILE / TRUTH LEDGER */}
          {(stage === 'hero' || stage === 'profile') && (
            <motion.div
              key="stage-profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <div className="doc-header">
                <div>
                  <h3 className="doc-name">Omkar Mundhe</h3>
                  <p className="doc-title">Full-Stack Software Engineer</p>
                </div>
                <div className="doc-badge">
                  <ShieldCheck size={13} /> Verified Truth DB
                </div>
              </div>

              {/* Verified Experience */}
              <div className="doc-section">
                <div className="doc-section-title">Verified Career History</div>
                <div className="doc-item">
                  <div className="doc-item-head">
                    <span className="doc-item-role">Lead Developer • Ration Shop App</span>
                    <span className="doc-item-date">2024 — Present</span>
                  </div>
                  <p className="doc-item-bullet">
                    Architected full-stack appointment system with React & Node.js, handling concurrent real-time citizen slot bookings.
                  </p>
                </div>

                <div className="doc-item">
                  <div className="doc-item-head">
                    <span className="doc-item-role">Team Leader • DisciplineX</span>
                    <span className="doc-item-date">2023 — 2024</span>
                  </div>
                  <p className="doc-item-bullet">
                    Engineered habit tracking dashboard with TypeScript & GraphQL; optimized database latency by 40%.
                  </p>
                </div>
              </div>

              {/* Verified Technical Stack */}
              <div className="doc-section" style={{ marginBottom: 0 }}>
                <div className="doc-section-title">Verified Core Competencies</div>
                <div className="doc-chips-wrap">
                  {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'REST APIs', 'System Design'].map((skill, i) => (
                    <span key={i} className="doc-chip">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: PRECISION RESUME (BUILDER) */}
          {stage === 'builder' && (
            <motion.div
              key="stage-builder"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <div className="doc-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                      CANONICAL A4
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#71717a' }}>• ISO 216 Precision</span>
                  </div>
                  <h3 className="doc-name" style={{ fontSize: '1.125rem' }}>Production ATS Resume</h3>
                </div>
                <div className="doc-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <CheckCircle2 size={13} /> 100% Machine Parsable
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#0a0a0d', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a1a1aa' }}>
                <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>[ATS Parser Text Stream]</div>
                <div>&gt; Name: Omkar Mundhe</div>
                <div>&gt; Role: Full-Stack Software Engineer</div>
                <div>&gt; Experience Nodes: 3 Found (100% entity match)</div>
                <div>&gt; Tables/Frames: 0 (Pure clean semantic flow)</div>
              </div>

              <div className="doc-section" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="doc-section-title">Multi-Format Universal Export</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['PDF', 'DOCX', 'TXT'].map((ext, idx) => (
                      <span key={idx} style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
                        .{ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: JOB MATCH & GAP ANALYZER */}
          {stage === 'match' && (
            <motion.div
              key="stage-match"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <div className="doc-header">
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target Opportunity
                  </span>
                  <h3 className="doc-name" style={{ fontSize: '1.125rem' }}>Senior Engineer @ Stripe</h3>
                </div>
                <div className="doc-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                  <Sparkles size={13} /> Gemini Match Radar
                </div>
              </div>

              {/* Match Score */}
              <div className="doc-match-meter">
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Alignment Index
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#d4d4d8' }}>Strong core technical match</div>
                </div>
                <div className="match-score-num">89%</div>
              </div>

              {/* Matching & Missing Skills */}
              <div className="doc-section">
                <div className="doc-section-title" style={{ color: '#10b981' }}>Confirmed Matching Keywords</div>
                <div className="doc-chips-wrap" style={{ marginBottom: '0.75rem' }}>
                  {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'].map((skill, i) => (
                    <span key={i} className="doc-chip highlighted">
                      ✓ {skill}
                    </span>
                  ))}
                </div>

                <div className="doc-section-title" style={{ color: '#f59e0b' }}>Actionable Keyword Gaps</div>
                <div className="doc-chips-wrap">
                  {['Docker', 'Kubernetes'].map((skill, i) => (
                    <span key={i} className="doc-chip" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 5: GROUNDED COVER LETTER */}
          {stage === 'coverletter' && (
            <motion.div
              key="stage-coverletter"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <div className="doc-header">
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Document Studio
                  </span>
                  <h3 className="doc-name" style={{ fontSize: '1.125rem' }}>Evidence-Grounded Letter</h3>
                </div>
                <div className="doc-badge">
                  <Check size={13} /> Zero Hallucinations
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#0a0a0d', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', fontFamily: 'Charter, Georgia, serif', fontSize: '0.8125rem', lineHeight: 1.6, color: '#e4e4e7', fontStyle: 'italic', marginBottom: '1rem' }}>
                "Dear Stripe Hiring Team,<br /><br />
                I am writing to express my strong enthusiasm for the Senior Engineer role. Drawing from verified engineering leadership on the Ration Shop Appointment System and DisciplineX, I have delivered resilient React/Node.js architectures and optimized data pipelines..."
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Grounded in 100% candidate truth</span>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  1-Click ISO Print <ArrowRight size={12} />
                </span>
              </div>
            </motion.div>
          )}

          {/* STAGE 6: APPLICATIONS PIPELINE */}
          {stage === 'applications' && (
            <motion.div
              key="stage-applications"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <div className="doc-header">
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Lifecycle Control
                  </span>
                  <h3 className="doc-name" style={{ fontSize: '1.125rem' }}>Applications Kanban</h3>
                </div>
                <div className="doc-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <Briefcase size={13} /> Active Pipeline
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase' }}>Applied</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>Stripe</div>
                  <div style={{ fontSize: '0.6875rem', color: '#71717a' }}>Score: 89% Match</div>
                </div>

                <div style={{ padding: '8px 10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>Interviewing</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>Vercel</div>
                  <div style={{ fontSize: '0.6875rem', color: '#71717a' }}>Tech Screen Completed</div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textAlign: 'center', padding: '6px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                Continuous telemetry from first draft to accepted offer.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LivingArtifact;
