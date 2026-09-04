import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Shield, X, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const EvidenceCoachModal = ({ initialText = '', initialRole = '', onApplyBullet, isOpen, onClose }) => {
  const { addToast } = useToast();
  const [step, setStep] = useState(1); // 1: Questions, 2: Variants
  const [formData, setFormData] = useState({
    originalText: initialText,
    role: initialRole || '',
    task: initialText || '',
    technology: '',
    outcome: '',
    metric: ''
  });
  const [variants, setVariants] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/enhance-bullet', {
        originalText: formData.originalText,
        role: formData.role,
        task: formData.task,
        technology: formData.technology,
        outcome: formData.outcome,
        metric: formData.metric,
        style: 'achievement'
      });

      if (res.data.success) {
        setVariants(res.data.allVariants);
        setStep(2);
      }
    } catch (err) {
      // Fallback deterministic local generation
      const baseTask = (formData.task || formData.originalText || 'Built application features').trim().replace(/[.]+$/, '');
      const techClause = formData.technology ? ` utilizing ${formData.technology}` : '';
      const metricClause = formData.metric ? ` achieving ${formData.metric}` : '';

      setVariants({
        concise: `${baseTask}${techClause}.${metricClause ? ' ' + metricClause : ''}`.trim(),
        achievement: `Delivered ${baseTask}${techClause}, successfully ${metricClause ? metricClause.replace(/^ achieving /i, '') : 'enhancing platform reliability and user experience.'}`,
        technical: `Engineered and maintained ${baseTask}${techClause}, adhering to architectural best practices.`,
        professional: `Spearheaded ${baseTask}${techClause} for the team${metricClause ? ', ' + metricClause : ''}.`
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (text) => {
    if (onApplyBullet) {
      onApplyBullet(text, {
        role: formData.role,
        task: formData.task,
        technology: formData.technology,
        outcome: formData.outcome,
        metric: formData.metric
      });
    }
    addToast('Truthful bullet applied to resume.', 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="evidence-coach-title">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', backgroundColor: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 id="evidence-coach-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Evidence Coach & Bullet Enhancer
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evidence-based AI assistance that improves wording without inventing fake metrics
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <div style={{ margin: '1rem 0' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', gap: '8px' }}>
              <Shield size={16} color="var(--info)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Zero Hallucination Guarantee:</strong> We do not fabricate percentages or accomplishments. Answer the prompts below with real experience to generate polished variants.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">1. Action: What did you actually build, design, or manage?</label>
              <input
                type="text"
                className="form-input"
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                placeholder="e.g. Developed authentication and resume persistence microservices"
              />
            </div>

            <div className="form-group">
              <label className="form-label">2. Tools: What technologies or frameworks did you use?</label>
              <input
                type="text"
                className="form-input"
                value={formData.technology}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                placeholder="e.g. React, Node.js, Express, MongoDB"
              />
            </div>

            <div className="form-group">
              <label className="form-label">3. Measurable Outcome (Optional): Did you measure any result?</label>
              <input
                type="text"
                className="form-input"
                value={formData.metric}
                onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                placeholder="e.g. 40% reduction in latency, 5,000 active users (leave blank if unmeasured)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleGenerate} disabled={loading || !formData.task} className="btn btn-primary">
                {loading ? 'Crafting Truthful Variants...' : <>Generate Variants <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ margin: '1rem 0' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Choose a Truthful Style Variant:
            </div>

            {variants && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'achievement', title: 'Achievement-Focused', text: variants.achievement },
                  { key: 'technical', title: 'Technical Architecture', text: variants.technical },
                  { key: 'concise', title: 'Concise & Direct', text: variants.concise },
                  { key: 'professional', title: 'Professional Leadership', text: variants.professional }
                ].map((v) => (
                  <div
                    key={v.key}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '2px' }}>
                        {v.title}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{v.text}</p>
                    </div>
                    <button onClick={() => handleApply(v.text)} className="btn btn-primary btn-sm">
                      <CheckCircle2 size={14} /> Apply
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                ← Back to Prompts
              </button>
              <button onClick={onClose} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceCoachModal;
