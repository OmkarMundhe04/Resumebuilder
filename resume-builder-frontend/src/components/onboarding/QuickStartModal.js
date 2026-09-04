import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UploadCloud, PlusCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal, Button, Card } from '../ui';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { createDefaultCanonicalResume } from '../../utils/canonicalResume';

const QuickStartModal = ({ isOpen, onClose, onOpenImporter }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState('choice'); // 'choice' | 'scratch_form'
  const [scratchData, setScratchData] = useState({
    fullName: '',
    title: 'Software Engineer',
    email: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const handleStartScratch = async (e) => {
    e.preventDefault();
    if (!scratchData.fullName.trim()) {
      addToast('Please enter your name to start.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Create minimal career profile
      const minimalProfile = {
        personal: {
          fullName: scratchData.fullName.trim(),
          title: scratchData.title.trim(),
          email: scratchData.email.trim(),
          phone: scratchData.phone.trim(),
          location: scratchData.location.trim()
        },
        experiences: [],
        education: [],
        skills: [],
        projects: []
      };

      await api.put('/career-profile', { profile: minimalProfile });

      // Create new canonical resume
      const newResume = createDefaultCanonicalResume(minimalProfile, scratchData.title.trim());
      const res = await api.post('/resume', { resume: newResume });

      if (res.data.success) {
        addToast('Resume initialized successfully!', 'success');
        onClose();
        navigate(`/builder/${res.data.resume._id}`);
      }
    } catch {
      addToast('Failed to initialize resume. Continuing locally.', 'info');
      onClose();
      navigate('/builder');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSample = async () => {
    setLoading(true);
    try {
      // Create default canonical sample resume
      const sampleResume = createDefaultCanonicalResume(null, 'Senior Full-Stack Engineer');
      sampleResume.title = 'Sample Professional Resume (Demo)';
      sampleResume.isSample = true;

      const res = await api.post('/resume', { resume: sampleResume });
      if (res.data.success) {
        addToast('Sample resume loaded! Explore templates & diagnostics freely.', 'success');
        onClose();
        navigate(`/builder/${res.data.resume._id}?sample=true`);
      }
    } catch {
      onClose();
      navigate('/builder?sample=true');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'choice' ? 'Build My Resume — Quick Start' : 'Quick Details'}
      subtitle={step === 'choice' ? 'Choose how you would like to begin your resume.' : 'Enter basic contact information to create your blank canvas.'}
      maxWidth="620px"
    >
      {step === 'choice' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Option 1: Start From Scratch */}
          <Card
            hoverable
            onClick={() => setStep('scratch_form')}
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderColor: 'var(--accent-primary)',
              background: 'rgba(2, 132, 199, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <PlusCircle size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Start from Scratch
                </h4>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Enter your name & target role to start with a clean structured canvas.
                </p>
              </div>
            </div>
            <ArrowRight size={18} color="var(--accent-primary)" />
          </Card>

          {/* Option 2: Import Existing Resume */}
          <Card
            hoverable
            onClick={() => {
              onClose();
              if (onOpenImporter) onOpenImporter();
            }}
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <UploadCloud size={22} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Import Existing Resume
                </h4>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Upload a PDF/Word file or paste text to parse into your Career Truth Ledger.
                </p>
              </div>
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </Card>

          {/* Option 3: Explore with Sample Data */}
          <Card
            hoverable
            onClick={handleUseSample}
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.25)'
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Explore with Sample Data
                  </h4>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '1px 6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderRadius: '4px' }}>
                    DEMO
                  </span>
                </div>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Test all 8 ATS templates, health checks, and export tools instantly.
                </p>
              </div>
            </div>
            <ArrowRight size={18} color="var(--text-muted)" />
          </Card>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--success)" />
            <span>Your information is 100% private. Sample data is kept completely isolated from your real profile.</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleStartScratch}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Omkar Mundhe"
                value={scratchData.fullName}
                onChange={(e) => setScratchData({ ...scratchData, fullName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                Target Job Title / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={scratchData.title}
                onChange={(e) => setScratchData({ ...scratchData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="omkar@example.com"
                  value={scratchData.email}
                  onChange={(e) => setScratchData({ ...scratchData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-2834"
                  value={scratchData.phone}
                  onChange={(e) => setScratchData({ ...scratchData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setStep('choice')}>
                Back
              </Button>
              <Button variant="primary" type="submit" loading={loading} icon={CheckCircle2}>
                Create Canvas & Launch Builder
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default QuickStartModal;
