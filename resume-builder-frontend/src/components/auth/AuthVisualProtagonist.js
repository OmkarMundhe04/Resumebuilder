import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, FileText, Sparkles, Layers } from 'lucide-react';

const AuthVisualProtagonist = ({ mode = 'login' }) => {
  return (
    <div className="auth-protagonist-container">
      {/* Ambient background glow behind cards */}
      <div className="auth-protagonist-glow" />

      {mode === 'login' ? (
        /* LOGIN: STACKED FLOATING RESUME DOCUMENTS */
        <div className="auth-card-stack">
          {/* Background Card 2 */}
          <motion.div
            className="auth-resume-card card-layer-3"
            initial={{ opacity: 0, y: 40, rotateZ: 8, scale: 0.88 }}
            animate={{ opacity: 0.4, y: 0, rotateZ: 8, scale: 0.88 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mini-doc-header">
              <div className="mini-doc-line title-line" style={{ width: '40%' }} />
              <div className="mini-doc-line" style={{ width: '25%' }} />
            </div>
            <div className="mini-doc-body">
              <div className="mini-doc-line" style={{ width: '90%' }} />
              <div className="mini-doc-line" style={{ width: '75%' }} />
              <div className="mini-doc-line" style={{ width: '85%' }} />
            </div>
          </motion.div>

          {/* Background Card 1 */}
          <motion.div
            className="auth-resume-card card-layer-2"
            initial={{ opacity: 0, y: 30, rotateZ: -4, scale: 0.94 }}
            animate={{ opacity: 0.75, y: 0, rotateZ: -4, scale: 0.94 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="mini-doc-header">
              <div className="mini-doc-badge">
                <Sparkles size={11} /> Tailored • Stripe
              </div>
              <div className="mini-doc-line title-line" style={{ width: '55%', marginTop: '6px' }} />
              <div className="mini-doc-line" style={{ width: '35%' }} />
            </div>
            <div className="mini-doc-body">
              <div className="mini-doc-box">
                <div className="mini-doc-line bold" style={{ width: '60%' }} />
                <div className="mini-doc-line" style={{ width: '100%' }} />
              </div>
            </div>
          </motion.div>

          {/* Primary Front Card */}
          <motion.div
            className="auth-resume-card card-layer-1"
            initial={{ opacity: 0, y: 20, rotateZ: 0, scale: 1 }}
            animate={{ opacity: 1, y: 0, rotateZ: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, rotateX: 2, scale: 1.02 }}
          >
            <div className="doc-meta-bar">
              <div className="doc-meta-badge">
                <ShieldCheck size={13} color="#10b981" /> Verified Truth DB
              </div>
              <span className="doc-meta-score">100% ATS Ready</span>
            </div>

            <div className="doc-primary-header">
              <h3 className="doc-candidate-name">Omkar Mundhe</h3>
              <p className="doc-candidate-role">Full-Stack Software Engineer</p>
            </div>

            <div className="doc-section-mini">
              <div className="doc-section-label">Verified Experience</div>
              <div className="doc-experience-block">
                <div className="doc-exp-head">
                  <span className="doc-exp-role">Lead Developer</span>
                  <span className="doc-exp-date">2024 — Present</span>
                </div>
                <p className="doc-exp-summary">
                  Architected full-stack appointment system with React & Node.js; reduced booking friction by 60%.
                </p>
              </div>
            </div>

            <div className="doc-section-mini" style={{ marginBottom: 0 }}>
              <div className="doc-section-label">Core Competencies</div>
              <div className="doc-chips-row">
                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL'].map((s, i) => (
                  <span key={i} className="doc-chip-tag">✓ {s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* REGISTER: BLUEPRINT STRUCTURING INTO PRODUCTION RESUME */
        <motion.div
          className="auth-resume-card card-blueprint"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4, scale: 1.01 }}
        >
          <div className="doc-meta-bar">
            <div className="doc-meta-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <Layers size={13} /> Structuring Career Profile
            </div>
            <span className="doc-meta-score" style={{ color: '#93c5fd' }}>Step 1 of 1</span>
          </div>

          <div className="doc-primary-header">
            <h3 className="doc-candidate-name" style={{ color: '#ffffff' }}>Your Career Story</h3>
            <p className="doc-candidate-role" style={{ color: '#3b82f6' }}>One Profile • Infinite Possibilities</p>
          </div>

          <div className="blueprint-nodes-container">
            <div className="blueprint-node completed">
              <CheckCircle2 size={15} color="#10b981" />
              <div className="blueprint-node-info">
                <div className="node-title">Verified Truth Database</div>
                <div className="node-desc">Capture authentic career facts once</div>
              </div>
            </div>

            <div className="blueprint-node active">
              <Sparkles size={15} color="#3b82f6" />
              <div className="blueprint-node-info">
                <div className="node-title">16 Production ATS Templates</div>
                <div className="node-desc">Precision typography & multi-format export</div>
              </div>
            </div>

            <div className="blueprint-node">
              <FileText size={15} color="#71717a" />
              <div className="blueprint-node-info">
                <div className="node-title">Targeted Job Match Intelligence</div>
                <div className="node-desc">Evidence-grounded tailoring in 1 click</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AuthVisualProtagonist;
