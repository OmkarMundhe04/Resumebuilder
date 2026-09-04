import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Share2,
  UploadCloud,
  History,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/ui';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/motion';
import AnimatedNumber from '../components/motion/AnimatedNumber';
import ShareResumeModal from '../components/share/ShareResumeModal';
import ResumeImporterModal from '../components/import/ResumeImporterModal';
import QuickStartModal from '../components/onboarding/QuickStartModal';
import PageTransition from '../components/motion/PageTransition';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [appMetrics, setAppMetrics] = useState({ total: 0, applied: 0, interviews: 0, offers: 0 });
  const [profileCompletion, setProfileCompletion] = useState(85);
  const [shareModalResume, setShareModalResume] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [versionsTab, setVersionsTab] = useState('saved'); // 'saved' | 'drafts'
  const [selectedVersionResumeId, setSelectedVersionResumeId] = useState(null);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resumesRes, appsRes, profileRes] = await Promise.all([
        api.get('/resume'),
        api.get('/applications'),
        api.get('/career-profile')
      ]);

      if (resumesRes.data.success) {
        setResumes(resumesRes.data.resumes || []);
      }
      if (appsRes.data.success) {
        setAppMetrics(appsRes.data.metrics || {});
      }
      if (profileRes.data.success) {
        const p = profileRes.data.profile;
        let score = 30;
        if (p.personal?.fullName && p.personal?.email) score += 20;
        if (p.experiences?.length > 0) score += 20;
        if (p.education?.length > 0) score += 15;
        if (p.skills?.length >= 5) score += 15;
        setProfileCompletion(Math.min(100, score));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleCreateResume = async () => {
    try {
      const res = await api.post('/resume', {
        title: 'Software Engineer Resume',
        targetRole: 'Software Engineer',
        fromProfile: true,
        isDraft: false
      });
      if (res.data.success) {
        addToast('New resume created from your Career Profile.', 'success');
        navigate(`/builder/${res.data.resume._id}`);
      }
    } catch {
      addToast('Failed to create resume.', 'error');
    }
  };

  const handleDuplicate = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/resume/${id}/duplicate`);
      if (res.data.success) {
        addToast('Resume duplicated.', 'success');
        fetchDashboardData();
      }
    } catch {
      addToast('Failed to duplicate resume.', 'error');
    }
  };

  const handlePromoteDraftToSaved = async (e, draftResume) => {
    e.stopPropagation();
    try {
      const res = await api.put(`/resume/${draftResume._id}`, {
        ...draftResume,
        isDraft: false
      });
      if (res.data.success) {
        addToast(`"${draftResume.title}" saved as official version.`, 'success');
        fetchDashboardData();
      }
    } catch {
      addToast('Failed to save draft as official version.', 'error');
    }
  };

  const confirmDeleteResume = async () => {
    if (!resumeToDelete) return;
    try {
      const res = await api.delete(`/resume/${resumeToDelete._id}`);
      if (res.data.success) {
        addToast(`"${resumeToDelete.title}" removed.`, 'info');
        setResumes(prev => prev.filter(r => r._id !== resumeToDelete._id));
      }
    } catch {
      addToast('Failed to delete resume.', 'error');
    } finally {
      setResumeToDelete(null);
    }
  };

  const savedResumes = resumes.filter(r => !r.isDraft);
  const draftResumes = resumes.filter(r => r.isDraft === true);
  const displayedVersions = versionsTab === 'saved' ? savedResumes : draftResumes;

  const handleOpenSavedVersions = (resume = null) => {
    setSelectedVersionResumeId(resume?._id || null);
    setVersionsTab(resume?.isDraft ? 'drafts' : 'saved');
    setVersionsModalOpen(true);
  };

  return (
    <PageTransition>
      <div className="page-container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        {/* Editorial Header Section */}
        <section style={{ marginBottom: 'var(--space-2xl)', paddingTop: 'var(--space-sm)' }}>
          <span className="eyebrow">Career Command Center</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h1 className="display-md" style={{ margin: '0 0 var(--space-xs) 0' }}>
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Professional'}.
              </h1>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                Your truthful career documents, application pipeline, and AI intelligence in one focused workspace.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => handleOpenSavedVersions(null)} className="btn btn-secondary btn-sm">
                <History size={14} /> Versions ({savedResumes.length + draftResumes.length})
              </button>
              <button onClick={() => setImportModalOpen(true)} className="btn btn-secondary btn-sm">
                <UploadCloud size={14} /> Import
              </button>
              <button onClick={handleCreateResume} className="btn btn-primary btn-sm">
                <Plus size={14} /> Build Resume
              </button>
            </div>
          </div>
        </section>

      {/* Metrics Strip - Open Clean Layout */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ marginBottom: 'var(--space-2xl)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            style={{ padding: 'var(--space-md) var(--space-lg)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', transition: 'box-shadow 0.2s ease, border-color 0.2s ease' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Saved Resumes
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              <AnimatedNumber value={savedResumes.length} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {draftResumes.length} active draft{draftResumes.length === 1 ? '' : 's'}
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            style={{ padding: 'var(--space-md) var(--space-lg)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', transition: 'box-shadow 0.2s ease, border-color 0.2s ease' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Active Applications
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              <AnimatedNumber value={appMetrics.applied || 0} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <AnimatedNumber value={appMetrics.total || 0} /> total tracked
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            style={{ padding: 'var(--space-md) var(--space-lg)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', transition: 'box-shadow 0.2s ease, border-color 0.2s ease' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Interviews
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              <AnimatedNumber value={appMetrics.interviews || 0} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {appMetrics.offers || 0} offer{appMetrics.offers === 1 ? '' : 's'} received
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            style={{ padding: 'var(--space-md) var(--space-lg)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', transition: 'box-shadow 0.2s ease, border-color 0.2s ease' }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Profile Evidence
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: profileCompletion >= 80 ? 'var(--success)' : 'var(--warning)', lineHeight: 1.1 }}>
              <AnimatedNumber value={profileCompletion} suffix="%" />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Truth DB completeness
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Launch Actions */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ marginBottom: 'var(--space-2xl)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3, scale: 1.008, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.985 }}
            onClick={handleCreateResume}
            style={{
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            className="card-hover"
          >
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Resume Builder
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Draft and export ISO A4 verified documents
              </div>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3, scale: 1.008, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/job-match')}
            style={{
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            className="card-hover"
          >
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Job Match & Gap Analyzer
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Match profile against job descriptions
              </div>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3, scale: 1.008, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/portfolio')}
            style={{
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            className="card-hover"
          >
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Developer Portfolio
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Cinematic case studies & verified live work
              </div>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </motion.div>
        </div>
      </motion.section>

      {/* Section 1: Saved Official Resumes */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            Saved Resumes ({savedResumes.length})
          </h2>
          <button onClick={handleCreateResume} className="btn btn-secondary btn-sm">
            <Plus size={14} /> New Resume
          </button>
        </div>

        {savedResumes.length === 0 ? (
          <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
            <h3 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem' }}>No Saved Resumes Yet</h3>
            <p style={{ margin: '0 0 var(--space-md) 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Click "Save Resume" in the builder to create your first official document.
            </p>
            <button onClick={handleCreateResume} className="btn btn-primary btn-sm">
              Create Resume
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-md)' }}
          >
            {savedResumes.map((r) => (
              <motion.div
                key={r._id}
                variants={staggerItem}
                whileHover={{ y: -3, scale: 1.008, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleOpenSavedVersions(r)}
                style={{
                  padding: 'var(--space-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                className="card-hover"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</h3>
                    <span className="badge badge-verified">v{r.version || 1}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {r.targetRole ? `Role: ${r.targetRole}` : 'Standard Profile'} {r.targetCompany ? `• ${r.targetCompany}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Template: <strong>{r.template || 'ATS Classic'}</strong> • Health: <strong>{r.health?.overall || 93}%</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(r.updatedAt || Date.now()).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder/${r._id}`);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '3px 8px', gap: '4px' }}
                      title="Open in Builder"
                    >
                      <ExternalLink size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareModalResume(r);
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Share Link"
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, r._id)}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeToDelete(r);
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Resume"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Section 2: In-Progress Drafts */}
      {draftResumes.length > 0 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
              In-Progress Drafts ({draftResumes.length})
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Auto-saved workspace edits not yet published.
            </span>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-md)' }}
          >
            {draftResumes.map((r) => (
              <motion.div
                key={r._id}
                variants={staggerItem}
                whileHover={{ y: -3, scale: 1.008, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleOpenSavedVersions(r)}
                style={{
                  padding: 'var(--space-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                className="card-hover"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</h3>
                    <span className="badge badge-imported">Draft</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {r.targetRole ? `Role: ${r.targetRole}` : 'Work in progress'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Last edited: {new Date(r.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Template: {r.template || 'ATS Classic'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePromoteDraftToSaved(e, r);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                    title="Save this draft as an official saved resume"
                  >
                    Save as Final
                  </button>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder/${r._id}`);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '3px 8px', gap: '4px' }}
                      title="Open Draft in Builder"
                    >
                      <ExternalLink size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeToDelete(r);
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Draft"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Show All Saved Versions & Drafts Modal */}
      {versionsModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setVersionsModalOpen(false)}
          title="Document Versions & Drafts"
          subtitle="Manage all saved resumes, historical versions, and drafts."
          maxWidth="760px"
        >
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <button
              onClick={() => { setVersionsTab('saved'); }}
              className={`btn btn-sm ${versionsTab === 'saved' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Saved Resumes ({savedResumes.length})
            </button>
            <button
              onClick={() => { setVersionsTab('drafts'); }}
              className={`btn btn-sm ${versionsTab === 'drafts' ? 'btn-primary' : 'btn-ghost'}`}
            >
              In-Progress Drafts ({draftResumes.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '58vh', overflowY: 'auto', paddingRight: '4px' }}>
            {displayedVersions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                No {versionsTab === 'saved' ? 'saved resumes' : 'in-progress drafts'} found.
              </div>
            ) : (
              displayedVersions.map(r => {
                const isSelected = selectedVersionResumeId === r._id;
                return (
                  <div
                    key={r._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      boxShadow: isSelected ? '0 0 0 1px var(--accent-primary)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: '1 1 260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{r.title}</strong>
                        <span className={r.isDraft ? "badge badge-imported" : "badge badge-verified"}>
                          {r.isDraft ? 'Draft' : `v${r.version || 1}`}
                        </span>
                        {isSelected && (
                          <span className="badge badge-accent" style={{ fontSize: '0.6875rem' }}>
                            Selected Document
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {r.targetRole ? `Role: ${r.targetRole}` : 'General Profile'} {r.targetCompany ? `• ${r.targetCompany}` : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Template: {r.template || 'ATS Classic'} • Health: {r.health?.overall || 93}% • Updated: {new Date(r.updatedAt || Date.now()).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {r.isDraft && (
                        <button
                          onClick={(e) => handlePromoteDraftToSaved(e, r)}
                          className="btn btn-secondary btn-sm"
                          title="Promote draft to official saved resume"
                        >
                          Save Final
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setVersionsModalOpen(false);
                          navigate(`/builder/${r._id}`);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '4px' }}
                      >
                        <ExternalLink size={13} /> Open Editor
                      </button>
                      <button
                        onClick={() => {
                          setVersionsModalOpen(false);
                          setShareModalResume(r);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Share Tokenized Link"
                      >
                        <Share2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(e, r._id)}
                        className="btn btn-secondary btn-sm"
                        title="Duplicate this version"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeToDelete(r);
                        }}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {resumeToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setResumeToDelete(null)}
          title="Delete Document"
          subtitle="This action cannot be undone."
          maxWidth="440px"
        >
          <div style={{ textAlign: 'center', padding: 'var(--space-sm) 0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-sm)' }}>
              <AlertTriangle size={20} />
            </div>
            <p style={{ fontSize: '0.875rem', margin: '0 0 var(--space-lg) 0', color: 'var(--text-primary)' }}>
              Are you sure you want to permanently delete <strong>"{resumeToDelete.title}"</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setResumeToDelete(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDeleteResume} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Share Modal */}
      {shareModalResume && (
        <ShareResumeModal
          resume={shareModalResume}
          isOpen={true}
          onClose={() => setShareModalResume(null)}
        />
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <ResumeImporterModal
          isOpen={true}
          onClose={() => setImportModalOpen(false)}
          onImportSuccess={() => fetchDashboardData()}
        />
      )}

      {/* Quick Start Modal */}
      {quickStartOpen && (
        <QuickStartModal
          isOpen={true}
          onClose={() => {
            setQuickStartOpen(false);
            fetchDashboardData();
          }}
          onOpenImporter={() => setImportModalOpen(true)}
        />
      )}
      </div>
    </PageTransition>
  );
};

export default Dashboard;
