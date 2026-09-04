import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { TEMPLATES } from '../utils/canonicalResume';
import PageTransition from '../components/motion/PageTransition';
import { staggerContainer, staggerItem } from '../utils/motion';

const TemplatesGallery = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleUseTemplate = async (templateId) => {
    try {
      const res = await api.post('/resume', {
        title: `New Resume (${templateId})`,
        template: templateId
      });
      if (res.data.success) {
        addToast('Created resume with selected template!', 'success');
        navigate(`/builder/${res.data.resume._id}`);
      }
    } catch {
      addToast('Opening template editor...', 'info');
      navigate('/builder');
    }
  };

  return (
    <PageTransition>
      <div className="page-container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        {/* Editorial Header */}
        <section style={{ marginBottom: 'var(--space-2xl)', paddingTop: 'var(--space-sm)' }}>
          <span className="eyebrow">Document Typography</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h1 className="display-md" style={{ margin: '0 0 var(--space-xs) 0' }}>
                Production ATS Templates
              </h1>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
                Calibrated to parse accurately across major applicant tracking systems while delivering clean editorial visual hierarchy.
              </p>
            </div>
          </div>
        </section>

        {/* Grid of Templates */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}
        >
          {TEMPLATES.map((tmpl) => (
            <motion.div
              key={tmpl.id}
              variants={staggerItem}
              whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
              style={{
                padding: 'var(--space-xl)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              className="card-hover"
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  <div>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '1.125rem', fontWeight: 600 }}>{tmpl.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tmpl.category}</div>
                  </div>
                  <span className="badge badge-verified">
                    <CheckCircle2 size={12} /> ATS 99%
                  </span>
                </div>

                <div
                  style={{
                    height: '140px',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: 'var(--space-md)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '8px', width: '40%', backgroundColor: 'var(--text-primary)', borderRadius: '2px', opacity: 0.8 }} />
                  <div style={{ height: '4px', width: '70%', backgroundColor: 'var(--text-muted)', borderRadius: '2px', opacity: 0.5 }} />
                  <div style={{ height: '1px', width: '100%', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
                  <div style={{ height: '4px', width: '90%', backgroundColor: 'var(--text-secondary)', borderRadius: '2px', opacity: 0.4 }} />
                  <div style={{ height: '4px', width: '85%', backgroundColor: 'var(--text-secondary)', borderRadius: '2px', opacity: 0.4 }} />
                  <div style={{ height: '4px', width: '75%', backgroundColor: 'var(--text-secondary)', borderRadius: '2px', opacity: 0.4 }} />
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-lg) 0' }}>
                  {tmpl.description}
                </p>
              </div>

              <button
                onClick={() => handleUseTemplate(tmpl.id)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Use Template <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default TemplatesGallery;
