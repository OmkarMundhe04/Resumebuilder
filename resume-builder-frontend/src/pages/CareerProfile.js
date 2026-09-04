import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  BookOpen,
  Trophy,
  HeartHandshake,
  Layers,
  Plus,
  Trash2,
  UploadCloud,
  Save,
  Camera,
  Image,
  RefreshCw,
  Sparkles,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { generateId } from '../utils/canonicalResume';
import ResumeImporterModal from '../components/import/ResumeImporterModal';
import PageTransition from '../components/motion/PageTransition';
import TagInput from '../components/ui/TagInput';
import ProjectAnalyzerModal from '../components/career/ProjectAnalyzerModal';
import SkillSuggestionsModal from '../components/career/SkillSuggestionsModal';
import EvidenceCoachModal from '../components/truth/EvidenceCoachModal';

const CareerProfile = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // AI Modals state
  const [projectAnalyzerOpen, setProjectAnalyzerOpen] = useState(false);
  const [activeProjectForAnalysis, setActiveProjectForAnalysis] = useState(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState(-1);

  const [skillSuggestionsOpen, setSkillSuggestionsOpen] = useState(false);

  const [evidenceCoachOpen, setEvidenceCoachOpen] = useState(false);
  const [activeCoachBullet, setActiveCoachBullet] = useState(null);

  // Drag and Drop state for Reorderable Sections
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const [dragSection, setDragSection] = useState(null);
  const [activeDraggableId, setActiveDraggableId] = useState(null);
  const touchDragRef = useRef(null);

  // Normalization helper to guarantee stable unique IDs for all items
  const normalizeProfile = useCallback((raw) => {
    if (!raw) return raw;
    const experiences = (raw.experiences || []).map(e => ({
      ...e,
      id: e.id || generateId(),
      bullets: (e.bullets || []).map(b => ({ ...b, id: b.id || generateId() }))
    }));
    const education = (raw.education || []).map(e => ({ ...e, id: e.id || generateId() }));
    const projects = (raw.projects || []).map(p => ({
      ...p,
      id: p.id || generateId(),
      technologies: Array.isArray(p.technologies) ? p.technologies : (p.technologies ? [p.technologies] : []),
      bullets: (p.bullets || []).map(b => ({ ...b, id: b.id || generateId() }))
    }));
    const skills = (raw.skills || []).map(s => (typeof s === 'string' ? { id: generateId(), name: s, note: '' } : { ...s, id: s.id || generateId() }));
    const certifications = (raw.certifications || []).map(c => ({ ...c, id: c.id || generateId() }));
    const publications = (raw.publications || []).map(p => ({ ...p, id: p.id || generateId() }));
    const awards = (raw.awards || []).map(a => ({ ...a, id: a.id || generateId() }));
    const volunteer = (raw.volunteer || []).map(v => ({ ...v, id: v.id || generateId() }));
    const customSections = (raw.customSections || []).map(cs => ({ ...cs, id: cs.id || generateId() }));

    return {
      ...raw,
      personal: raw.personal || {},
      experiences,
      education,
      projects,
      skills,
      certifications,
      publications,
      awards,
      volunteer,
      customSections
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/career-profile');
      if (res.data.success) {
        setProfile(normalizeProfile(res.data.profile));
      }
    } catch {
      addToast('Failed to load Career Profile.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, normalizeProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api.put('/career-profile', profile);
      if (res.data.success) {
        setProfile(normalizeProfile(res.data.profile));
        addToast('Career Profile saved successfully (Truth DB & Portfolio updated).', 'success');
      }
    } catch {
      addToast('Failed to save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reorder list helper
  const reorderList = (listKey, sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex) return;
    const items = [...(profile[listKey] || [])];
    const [moved] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, moved);
    setProfile({ ...profile, [listKey]: items });
  };

  const moveItem = (listKey, index, direction) => {
    const targetIndex = index + direction;
    const items = profile[listKey] || [];
    if (targetIndex < 0 || targetIndex >= items.length) return;
    reorderList(listKey, index, targetIndex);
  };

  // HTML5 Drag Handlers
  const handleItemDragStart = (e, id, section) => {
    setDraggedItemId(id);
    setDragSection(section);
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, section }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e, targetId, section) => {
    if (dragSection !== section || draggedItemId === targetId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItemId !== targetId) {
      setDragOverItemId(targetId);
    }
  };

  const handleItemDragLeave = (targetId) => {
    if (dragOverItemId === targetId) {
      setDragOverItemId(null);
    }
  };

  const handleItemDrop = (e, targetId, section, targetIndex) => {
    e.preventDefault();
    if (dragSection !== section) return;
    const items = profile[section] || [];
    const sourceIndex = items.findIndex(item => item.id === draggedItemId);
    if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
      reorderList(section, sourceIndex, targetIndex);
    }
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragSection(null);
    setActiveDraggableId(null);
  };

  const handleItemDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragSection(null);
    setActiveDraggableId(null);
  };

  // Mobile Touch Drag Handlers
  const handleTouchStart = (e, id, section, index) => {
    const touch = e.touches[0];
    touchDragRef.current = {
      id,
      section,
      startIndex: index,
      startY: touch.clientY,
      currentY: touch.clientY
    };
    setDraggedItemId(id);
    setDragSection(section);
  };

  const handleTouchMove = (e) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    touchDragRef.current.currentY = touch.clientY;

    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = elem?.closest('.career-item-card[data-reorder-id]');
    if (card) {
      const targetId = card.getAttribute('data-reorder-id');
      const targetSec = card.getAttribute('data-reorder-section');
      if (targetSec === touchDragRef.current.section && targetId !== touchDragRef.current.id) {
        setDragOverItemId(targetId);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchDragRef.current) return;
    const { section, startIndex } = touchDragRef.current;
    if (dragOverItemId) {
      const items = profile[section] || [];
      const targetIndex = items.findIndex(item => item.id === dragOverItemId);
      if (targetIndex !== -1 && targetIndex !== startIndex) {
        reorderList(section, startIndex, targetIndex);
      }
    }
    touchDragRef.current = null;
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragSection(null);
    setActiveDraggableId(null);
  };

  // Item Addition Helpers
  const addExperience = () => {
    const newExp = {
      id: generateId(),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      responsibilities: '',
      bullets: [{ id: generateId(), text: '', evidence: { role: '', task: '', technology: '', outcome: '', metric: '' }, status: 'VERIFIED' }],
      status: 'VERIFIED'
    };
    setProfile({ ...profile, experiences: [newExp, ...(profile.experiences || [])] });
  };

  const addEducation = () => {
    const newEdu = {
      id: generateId(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      coursework: [],
      honors: [],
      status: 'VERIFIED'
    };
    setProfile({ ...profile, education: [...(profile.education || []), newEdu] });
  };

  const addSkill = () => {
    const newSkill = {
      id: generateId(),
      name: '',
      note: '',
      status: 'VERIFIED'
    };
    setProfile({ ...profile, skills: [...(profile.skills || []), newSkill] });
  };

  const addProject = () => {
    const newProj = {
      id: generateId(),
      name: '',
      description: '',
      role: '',
      technologies: [],
      link: '',
      repoLink: '',
      outcome: '',
      bullets: [{ id: generateId(), text: '' }],
      status: 'VERIFIED'
    };
    setProfile({ ...profile, projects: [...(profile.projects || []), newProj] });
  };

  const addCertification = () => {
    const newCert = {
      id: generateId(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      status: 'VERIFIED'
    };
    setProfile({ ...profile, certifications: [...(profile.certifications || []), newCert] });
  };

  const addPublication = () => {
    const newPub = {
      id: generateId(),
      title: '',
      publisher: '',
      date: '',
      url: '',
      description: '',
      status: 'VERIFIED'
    };
    setProfile({ ...profile, publications: [...(profile.publications || []), newPub] });
  };

  const addAward = () => {
    const newAward = {
      id: generateId(),
      title: '',
      issuer: '',
      date: '',
      description: '',
      status: 'VERIFIED'
    };
    setProfile({ ...profile, awards: [...(profile.awards || []), newAward] });
  };

  const addVolunteer = () => {
    const newVol = {
      id: generateId(),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      status: 'VERIFIED'
    };
    setProfile({ ...profile, volunteer: [...(profile.volunteer || []), newVol] });
  };

  const addCustomSection = () => {
    const newCs = {
      id: generateId(),
      title: '',
      content: '',
      status: 'VERIFIED'
    };
    setProfile({ ...profile, customSections: [...(profile.customSections || []), newCs] });
  };

  // Completeness health check
  const calculateCompleteness = () => {
    let score = 0;
    const checks = {
      name: Boolean(profile?.personal?.fullName?.trim()),
      email: Boolean(profile?.personal?.email?.trim()),
      title: Boolean(profile?.personal?.title?.trim()),
      summary: Boolean(profile?.personal?.summary?.trim()),
      experience: (profile?.experiences?.length || 0) > 0,
      education: (profile?.education?.length || 0) > 0,
      skills: (profile?.skills?.length || 0) >= 3,
      projects: (profile?.projects?.length || 0) > 0,
      certifications: (profile?.certifications?.length || 0) > 0
    };

    if (checks.name) score += 15;
    if (checks.email) score += 15;
    if (checks.title) score += 10;
    if (checks.summary) score += 10;
    if (checks.experience) score += 15;
    if (checks.education) score += 15;
    if (checks.skills) score += 10;
    if (checks.projects) score += 5;
    if (checks.certifications) score += 5;

    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserCheck },
    { id: 'experience', label: `Experience (${profile?.experiences?.length || 0})`, icon: Briefcase },
    { id: 'education', label: `Education (${profile?.education?.length || 0})`, icon: GraduationCap },
    { id: 'skills', label: `Skills (${profile?.skills?.length || 0})`, icon: Wrench },
    { id: 'projects', label: `Projects (${profile?.projects?.length || 0})`, icon: FolderGit2 },
    { id: 'certifications', label: `Certifications (${profile?.certifications?.length || 0})`, icon: Award },
    { id: 'publications', label: `Publications (${profile?.publications?.length || 0})`, icon: BookOpen },
    { id: 'awards', label: `Awards (${profile?.awards?.length || 0})`, icon: Trophy },
    { id: 'volunteer', label: `Volunteer (${profile?.volunteer?.length || 0})`, icon: HeartHandshake },
    { id: 'custom', label: `Custom (${profile?.customSections?.length || 0})`, icon: Layers }
  ];

  if (loading || !profile) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your verified Career Profile workspace...
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="page-container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        {/* Editorial Header */}
        <section style={{ marginBottom: 'var(--space-xl)', paddingTop: 'var(--space-sm)' }}>
          <span className="eyebrow">Truth Database</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h1 className="display-md" style={{ margin: '0 0 var(--space-xs) 0' }}>
                Career Profile
              </h1>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
                Your complete, verified career history and evidence repository. Powers all resumes, portfolio items, and AI tailoring without fake metrics.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setImportModalOpen(true)} className="btn btn-secondary btn-sm">
                <UploadCloud size={14} /> Import Resume
              </button>
              <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary btn-sm">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </section>

        {/* Completeness Bar */}
        <div
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-md)'
          }}
        >
          <div style={{ flex: '1', minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completeness Health</span>
              <span style={{ color: completeness >= 80 ? 'var(--success)' : 'var(--text-primary)' }}>
                {completeness}% ({completeness >= 80 ? 'Strong' : 'In Progress'})
              </span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${completeness}%`,
                  height: '100%',
                  backgroundColor: completeness >= 80 ? 'var(--success)' : 'var(--accent-primary)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div
          className="horizontal-section-nav"
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY * 0.8;
            }
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                type="button"
              >
                <Icon size={14} style={{ color: isActive ? 'var(--text-primary)' : 'inherit', flexShrink: 0 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {/* -------------------------------------------------------------
                  1. PERSONAL INFO TAB
                  ------------------------------------------------------------- */}
              {activeTab === 'personal' && (
                <div>
                  <h3 style={{ fontSize: '1.125rem', margin: '0 0 1.25rem 0' }}>Personal & Contact Details</h3>

                  {/* Profile Photo Area */}
                  <div style={{ marginBottom: '1.5rem', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      {profile.personal?.photoUrl ? (
                        <img
                          src={profile.personal.photoUrl}
                          alt="Career Profile"
                          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        />
                      ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <Camera size={32} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', fontWeight: 600 }}>Profile Photo</h4>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        This photo is automatically inherited by your personal portfolio site and photo-ready resume templates.
                      </p>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                          <Image size={14} /> Upload Custom Photo
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (uploadEvt) => {
                                  setProfile({
                                    ...profile,
                                    personal: {
                                      ...profile.personal,
                                      showPhoto: true,
                                      photoUrl: uploadEvt.target.result
                                    }
                                  });
                                  addToast('Profile picture uploaded successfully!', 'success');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const seed = profile.personal?.fullName || 'Engineer';
                            const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                            setProfile({
                              ...profile,
                              personal: {
                                ...profile.personal,
                                showPhoto: true,
                                photoUrl: dicebearUrl
                              }
                            });
                            addToast('Generated professional avatar!', 'info');
                          }}
                        >
                          <RefreshCw size={14} /> Generate Avatar
                        </button>

                        {profile.personal?.photoUrl && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => {
                              setProfile({
                                ...profile,
                                personal: {
                                  ...profile.personal,
                                  showPhoto: false,
                                  photoUrl: ''
                                }
                              });
                              addToast('Photo removed', 'info');
                            }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profile.personal?.fullName || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, fullName: e.target.value } })}
                        placeholder="e.g. Alex Morgan"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Professional Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profile.personal?.title || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, title: e.target.value } })}
                        placeholder="e.g. Senior Full-Stack Engineer"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        value={profile.personal?.email || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, email: e.target.value } })}
                        placeholder="name@domain.com"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={profile.personal?.phone || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, phone: e.target.value } })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location (City, Country)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profile.personal?.location || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, location: e.target.value } })}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={profile.personal?.linkedin || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, linkedin: e.target.value } })}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GitHub Profile URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={profile.personal?.github || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, github: e.target.value } })}
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Personal Website / Portfolio</label>
                      <input
                        type="url"
                        className="form-input"
                        value={profile.personal?.portfolio || profile.personal?.website || ''}
                        onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, portfolio: e.target.value, website: e.target.value } })}
                        placeholder="https://yourportfolio.dev"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Executive / Career Summary</label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={profile.personal?.summary || ''}
                      onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, summary: e.target.value } })}
                      placeholder="2-4 sentences summarizing your verified background, domain expertise, and core engineering strengths."
                    />
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  2. WORK EXPERIENCE TAB (WITH DRAG/DROP & EVIDENCE COACH)
                  ------------------------------------------------------------- */}
              {activeTab === 'experience' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Work Experience & Evidence</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Drag cards or use arrow buttons to reorder your roles chronologically.
                      </p>
                    </div>
                    <button onClick={addExperience} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Experience
                    </button>
                  </div>

                  {(profile.experiences || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No experience entries recorded. Click "Add Experience" above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.experiences.map((exp, idx) => (
                        <div
                          key={exp.id || idx}
                          data-reorder-id={exp.id}
                          data-reorder-section="experiences"
                          draggable={activeDraggableId === exp.id}
                          onDragStart={(e) => handleItemDragStart(e, exp.id, 'experiences')}
                          onDragOver={(e) => handleItemDragOver(e, exp.id, 'experiences')}
                          onDragLeave={() => handleItemDragLeave(exp.id)}
                          onDrop={(e) => handleItemDrop(e, exp.id, 'experiences', idx)}
                          onDragEnd={handleItemDragEnd}
                          className={`career-item-card ${draggedItemId === exp.id ? 'is-dragging' : ''} ${dragOverItemId === exp.id ? 'is-drop-target' : ''}`}
                          style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-app)',
                            border: `1px solid ${dragOverItemId === exp.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-lg)',
                            position: 'relative'
                          }}
                        >
                          {/* Reorder Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                className="drag-handle-btn"
                                onMouseDown={() => setActiveDraggableId(exp.id)}
                                onMouseUp={() => setActiveDraggableId(null)}
                                onTouchStart={(e) => handleTouchStart(e, exp.id, 'experiences', idx)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                title="Click and drag to reorder role"
                                style={{ cursor: 'grab', background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                              >
                                <GripVertical size={16} />
                              </button>
                              <span className="badge badge-verified">
                                #{idx + 1} {exp.role ? `• ${exp.role}` : ''} {exp.company ? `at ${exp.company}` : ''}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem('experiences', idx, -1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move up"
                                style={{ opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (profile.experiences?.length || 0) - 1}
                                onClick={() => moveItem('experiences', idx, 1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move down"
                                style={{ opacity: idx === (profile.experiences?.length || 0) - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.experiences.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, experiences: updated });
                                  addToast('Experience entry deleted.', 'info');
                                }}
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                title="Delete experience"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Company Name"
                              value={exp.company || ''}
                              onChange={(e) => {
                                const updated = [...profile.experiences];
                                updated[idx].company = e.target.value;
                                setProfile({ ...profile, experiences: updated });
                              }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Job Title / Role"
                              value={exp.role || ''}
                              onChange={(e) => {
                                const updated = [...profile.experiences];
                                updated[idx].role = e.target.value;
                                setProfile({ ...profile, experiences: updated });
                              }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Start Date (e.g. 2021-06)"
                              value={exp.startDate || ''}
                              onChange={(e) => {
                                const updated = [...profile.experiences];
                                updated[idx].startDate = e.target.value;
                                setProfile({ ...profile, experiences: updated });
                              }}
                            />
                            <input
                              type="text"
                              className="form-input"
                              placeholder="End Date or 'Present'"
                              value={exp.endDate || ''}
                              onChange={(e) => {
                                const updated = [...profile.experiences];
                                updated[idx].endDate = e.target.value;
                                setProfile({ ...profile, experiences: updated });
                              }}
                            />
                          </div>

                          {/* Achievement Bullets with Evidence Coach */}
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Achievement Bullets:
                              </span>
                            </div>

                            {(exp.bullets || []).map((b, bIdx) => (
                              <div key={b.id || bIdx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={b.text || ''}
                                  onChange={(e) => {
                                    const updated = [...profile.experiences];
                                    updated[idx].bullets[bIdx].text = e.target.value;
                                    setProfile({ ...profile, experiences: updated });
                                  }}
                                  placeholder="e.g. Engineered responsive frontend microservices with React..."
                                  style={{ flex: 1, fontSize: '0.8125rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCoachBullet({ expId: exp.id, expIdx: idx, bIdx, text: b.text });
                                    setEvidenceCoachOpen(true);
                                  }}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                                  title="Enhance bullet with truthful AI coaching"
                                >
                                  <Sparkles size={12} /> Enhance
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...profile.experiences];
                                    updated[idx].bullets = updated[idx].bullets.filter((_, i) => i !== bIdx);
                                    setProfile({ ...profile, experiences: updated });
                                  }}
                                  className="btn btn-ghost btn-icon btn-sm"
                                  style={{ color: 'var(--danger)' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...profile.experiences];
                                updated[idx].bullets = [...(updated[idx].bullets || []), { id: generateId(), text: '', status: 'VERIFIED' }];
                                setProfile({ ...profile, experiences: updated });
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', marginTop: '4px' }}
                            >
                              <Plus size={12} /> Add Bullet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  3. EDUCATION TAB (WITH DRAG/DROP REORDERING)
                  ------------------------------------------------------------- */}
              {activeTab === 'education' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Education & Academic Degrees</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Drag cards or use arrow buttons to reorder education items.
                      </p>
                    </div>
                    <button onClick={addEducation} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Education
                    </button>
                  </div>

                  {(profile.education || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No education entries recorded. Click "Add Education" above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.education.map((edu, idx) => (
                        <div
                          key={edu.id || idx}
                          data-reorder-id={edu.id}
                          data-reorder-section="education"
                          draggable={activeDraggableId === edu.id}
                          onDragStart={(e) => handleItemDragStart(e, edu.id, 'education')}
                          onDragOver={(e) => handleItemDragOver(e, edu.id, 'education')}
                          onDragLeave={() => handleItemDragLeave(edu.id)}
                          onDrop={(e) => handleItemDrop(e, edu.id, 'education', idx)}
                          onDragEnd={handleItemDragEnd}
                          className={`career-item-card ${draggedItemId === edu.id ? 'is-dragging' : ''} ${dragOverItemId === edu.id ? 'is-drop-target' : ''}`}
                          style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-app)',
                            border: `1px solid ${dragOverItemId === edu.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-lg)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                className="drag-handle-btn"
                                onMouseDown={() => setActiveDraggableId(edu.id)}
                                onMouseUp={() => setActiveDraggableId(null)}
                                onTouchStart={(e) => handleTouchStart(e, edu.id, 'education', idx)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                title="Click and drag to reorder degree"
                                style={{ cursor: 'grab', background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                              >
                                <GripVertical size={16} />
                              </button>
                              <span className="badge badge-verified">
                                #{idx + 1} {edu.degree ? `• ${edu.degree}` : ''} {edu.institution ? `at ${edu.institution}` : ''}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem('education', idx, -1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move up"
                                style={{ opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (profile.education?.length || 0) - 1}
                                onClick={() => moveItem('education', idx, 1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move down"
                                style={{ opacity: idx === (profile.education?.length || 0) - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.education.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, education: updated });
                                  addToast('Education entry deleted.', 'info');
                                }}
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                title="Delete education"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Institution / University</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Stanford University"
                                value={edu.institution || ''}
                                onChange={(e) => {
                                  const updated = [...profile.education];
                                  updated[idx].institution = e.target.value;
                                  setProfile({ ...profile, education: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Degree</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. B.S. Computer Science"
                                value={edu.degree || ''}
                                onChange={(e) => {
                                  const updated = [...profile.education];
                                  updated[idx].degree = e.target.value;
                                  setProfile({ ...profile, education: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Field of Study / Major</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Software Engineering"
                                value={edu.fieldOfStudy || ''}
                                onChange={(e) => {
                                  const updated = [...profile.education];
                                  updated[idx].fieldOfStudy = e.target.value;
                                  setProfile({ ...profile, education: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 2018-09"
                                value={edu.startDate || ''}
                                onChange={(e) => {
                                  const updated = [...profile.education];
                                  updated[idx].startDate = e.target.value;
                                  setProfile({ ...profile, education: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date / Graduation</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 2022-05"
                                value={edu.endDate || ''}
                                onChange={(e) => {
                                  const updated = [...profile.education];
                                  updated[idx].endDate = e.target.value;
                                  setProfile({ ...profile, education: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>GPA / Aggregate (Optional)</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 3.85 / 4.0"
                                value={edu.gpa || ''}
                                onChange={(e) => {
                                  const updated = [...profile.education];
                                  updated[idx].gpa = e.target.value;
                                  setProfile({ ...profile, education: updated });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  4. SKILLS TAB (CURRENT FREE-FORM UX + AI SUGGESTIONS)
                  ------------------------------------------------------------- */}
              {activeTab === 'skills' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Technical Skills & Competencies</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Core tools and frameworks for ATS keyword indexing and portfolio badges.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSkillSuggestionsOpen(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Sparkles size={14} color="var(--accent-primary)" /> Suggest Skills ✦
                      </button>
                      <button onClick={addSkill} className="btn btn-primary btn-sm">
                        <Plus size={14} /> Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Quick Batch Skill Entry */}
                  <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Quick Batch Add Skills (type multiple separated by enter or comma):
                    </label>
                    <TagInput
                      tags={[]}
                      placeholder="e.g. Python, Machine Learning, Docker, React JS..."
                      onChange={(newTags) => {
                        const newSkills = newTags.map(tag => ({
                          id: generateId(),
                          name: tag,
                          note: ''
                        }));
                        const existingNames = new Set((profile.skills || []).map(s => (s.name || '').toLowerCase()));
                        const filtered = newSkills.filter(s => !existingNames.has(s.name.toLowerCase()));
                        if (filtered.length > 0) {
                          setProfile({ ...profile, skills: [...(profile.skills || []), ...filtered] });
                          addToast(`Added ${filtered.length} new skill(s)`, 'success');
                        }
                      }}
                    />
                  </div>

                  {/* Skills Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {(profile.skills || []).map((skill, idx) => (
                      <div
                        key={skill.id || idx}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            value={skill.name || ''}
                            onChange={(e) => {
                              const updated = [...profile.skills];
                              updated[idx].name = e.target.value;
                              setProfile({ ...profile, skills: updated });
                            }}
                            placeholder="Skill name (e.g. Python)"
                            style={{ fontSize: '0.8125rem', padding: '5px 8px', marginBottom: '4px' }}
                          />
                          <input
                            type="text"
                            className="form-input"
                            value={skill.note || ''}
                            onChange={(e) => {
                              const updated = [...profile.skills];
                              updated[idx].note = e.target.value;
                              setProfile({ ...profile, skills: updated });
                            }}
                            placeholder="Optional note (e.g. Advanced, 3+ yrs)"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--text-secondary)' }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = profile.skills.filter((_, i) => i !== idx);
                            setProfile({ ...profile, skills: updated });
                          }}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--danger)', flexShrink: 0 }}
                          title="Delete skill"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  5. PROJECTS TAB (DRAG/DROP + TECH REORDER + AI ANALYZER)
                  ------------------------------------------------------------- */}
              {activeTab === 'projects' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Key Projects & Builds</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Drag cards to reorder projects. Reorder technologies independently inside each project.
                      </p>
                    </div>
                    <button onClick={addProject} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Project
                    </button>
                  </div>

                  {(profile.projects || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No project entries recorded. Click "Add Project" above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {profile.projects.map((proj, idx) => (
                        <div
                          key={proj.id || idx}
                          data-reorder-id={proj.id}
                          data-reorder-section="projects"
                          draggable={activeDraggableId === proj.id}
                          onDragStart={(e) => handleItemDragStart(e, proj.id, 'projects')}
                          onDragOver={(e) => handleItemDragOver(e, proj.id, 'projects')}
                          onDragLeave={() => handleItemDragLeave(proj.id)}
                          onDrop={(e) => handleItemDrop(e, proj.id, 'projects', idx)}
                          onDragEnd={handleItemDragEnd}
                          className={`career-item-card ${draggedItemId === proj.id ? 'is-dragging' : ''} ${dragOverItemId === proj.id ? 'is-drop-target' : ''}`}
                          style={{
                            padding: '1.25rem',
                            backgroundColor: 'var(--bg-app)',
                            border: `1px solid ${dragOverItemId === proj.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-lg)'
                          }}
                        >
                          {/* Project Card Header with Reordering & AI Analyze Button */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                className="drag-handle-btn"
                                onMouseDown={() => setActiveDraggableId(proj.id)}
                                onMouseUp={() => setActiveDraggableId(null)}
                                onTouchStart={(e) => handleTouchStart(e, proj.id, 'projects', idx)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                title="Click and drag to reorder project"
                                style={{ cursor: 'grab', background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                              >
                                <GripVertical size={16} />
                              </button>
                              <span className="badge badge-verified">
                                Project #{idx + 1} {proj.name ? `• ${proj.name}` : ''}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* AI Analyze Shortcut */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProjectForAnalysis(proj);
                                  setActiveProjectIndex(idx);
                                  setProjectAnalyzerOpen(true);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                title="Analyze repository or live URL with Gemini AI"
                              >
                                <Sparkles size={13} color="var(--accent-primary)" /> Analyze Project ✦
                              </button>

                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem('projects', idx, -1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move project up"
                                style={{ opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (profile.projects?.length || 0) - 1}
                                onClick={() => moveItem('projects', idx, 1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move project down"
                                style={{ opacity: idx === (profile.projects?.length || 0) - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.projects.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, projects: updated });
                                  addToast('Project deleted.', 'info');
                                }}
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                title="Delete project"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Project Name</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Distributed Analytics Engine"
                                value={proj.name || ''}
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[idx].name = e.target.value;
                                  setProfile({ ...profile, projects: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Role / Capacity</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Lead Architect"
                                value={proj.role || ''}
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[idx].role = e.target.value;
                                  setProfile({ ...profile, projects: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Live Demo URL</label>
                              <input
                                type="url"
                                className="form-input"
                                placeholder="https://app.domain.com"
                                value={proj.link || ''}
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[idx].link = e.target.value;
                                  setProfile({ ...profile, projects: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Repository / GitHub Link</label>
                              <input
                                type="url"
                                className="form-input"
                                placeholder="https://github.com/user/repo"
                                value={proj.repoLink || ''}
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[idx].repoLink = e.target.value;
                                  setProfile({ ...profile, projects: updated });
                                }}
                              />
                            </div>
                          </div>

                          {/* Reorderable Technologies Inside Each Project */}
                          <div className="form-group" style={{ margin: '10px 0' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Technologies Used (Drag chips to reorder authoritative stack):</span>
                            </label>
                            <TagInput
                              tags={Array.isArray(proj.technologies) ? proj.technologies : (proj.technologies ? [proj.technologies] : [])}
                              placeholder="Type technology and press enter or comma..."
                              allowReorder={true}
                              projectId={proj.id}
                              reorderAriaLabelPrefix={proj.name || 'project'}
                              onChange={(newTags) => {
                                const updated = [...profile.projects];
                                updated[idx].technologies = newTags;
                                setProfile({ ...profile, projects: updated });
                              }}
                            />
                          </div>

                          {/* Project Description */}
                          <div className="form-group" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <label className="form-label" style={{ fontSize: '0.75rem', margin: 0 }}>
                                Project Description & Architectural Overview
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProjectForAnalysis(proj);
                                  setActiveProjectIndex(idx);
                                  setProjectAnalyzerOpen(true);
                                }}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '0.72rem', padding: '2px 6px', color: 'var(--accent-primary)' }}
                              >
                                <Sparkles size={11} /> Generate Description ✦
                              </button>
                            </div>
                            <textarea
                              className="form-textarea"
                              rows={2}
                              placeholder="Problem solved, systems architecture, engineering execution..."
                              value={proj.description || ''}
                              onChange={(e) => {
                                const updated = [...profile.projects];
                                updated[idx].description = e.target.value;
                                setProfile({ ...profile, projects: updated });
                              }}
                            />
                          </div>

                          {/* Bullet Points */}
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                              Key Accomplishment Bullets:
                            </div>
                            {(proj.bullets || []).map((b, bIdx) => (
                              <div key={b.id || bIdx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={b.text || ''}
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[idx].bullets[bIdx].text = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }}
                                  placeholder="e.g. Built streaming data pipelines with Node.js and Redis..."
                                  style={{ fontSize: '0.8125rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...profile.projects];
                                    updated[idx].bullets = updated[idx].bullets.filter((_, i) => i !== bIdx);
                                    setProfile({ ...profile, projects: updated });
                                  }}
                                  className="btn btn-ghost btn-icon btn-sm"
                                  style={{ color: 'var(--danger)' }}
                                  title="Delete bullet"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...profile.projects];
                                updated[idx].bullets = [...(updated[idx].bullets || []), { id: generateId(), text: '' }];
                                setProfile({ ...profile, projects: updated });
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', marginTop: '4px' }}
                            >
                              <Plus size={12} /> Add Highlight Bullet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  6. CERTIFICATIONS TAB (OPTIONAL EXPIRY + CLICKABLE URLS)
                  ------------------------------------------------------------- */}
              {activeTab === 'certifications' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Certifications & Verified Credentials</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Industry accreditations with clickable verification badges.
                      </p>
                    </div>
                    <button onClick={addCertification} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Certification
                    </button>
                  </div>

                  {(profile.certifications || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No certification entries recorded. Click "Add Certification" above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.certifications.map((c, idx) => (
                        <div key={c.id || idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className="badge badge-verified">Certification #{idx + 1} {c.name ? `• ${c.name}` : ''}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = profile.certifications.filter((_, i) => i !== idx);
                                setProfile({ ...profile, certifications: updated });
                                addToast('Certification deleted.', 'info');
                              }}
                              className="btn btn-ghost btn-icon btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Delete this certification"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Certification Name</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. AWS Certified Solutions Architect"
                                value={c.name || ''}
                                onChange={(e) => {
                                  const updated = [...profile.certifications];
                                  updated[idx].name = e.target.value;
                                  setProfile({ ...profile, certifications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Issuer / Organization</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Amazon Web Services"
                                value={c.issuer || ''}
                                onChange={(e) => {
                                  const updated = [...profile.certifications];
                                  updated[idx].issuer = e.target.value;
                                  setProfile({ ...profile, certifications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Issue Date</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 2023-04"
                                value={c.issueDate || ''}
                                onChange={(e) => {
                                  const updated = [...profile.certifications];
                                  updated[idx].issueDate = e.target.value;
                                  setProfile({ ...profile, certifications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiration Date (Optional)</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 2026-04"
                                value={c.expiryDate || ''}
                                onChange={(e) => {
                                  const updated = [...profile.certifications];
                                  updated[idx].expiryDate = e.target.value;
                                  setProfile({ ...profile, certifications: updated });
                                }}
                              />
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '4px' }}>
                                <input
                                  type="checkbox"
                                  checked={!c.expiryDate}
                                  onChange={(e) => {
                                    const updated = [...profile.certifications];
                                    if (e.target.checked) {
                                      updated[idx].expiryDate = '';
                                    }
                                    setProfile({ ...profile, certifications: updated });
                                  }}
                                />
                                Does not expire
                              </label>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Credential ID / License #</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. AWS-PSA-123456"
                                value={c.credentialId || ''}
                                onChange={(e) => {
                                  const updated = [...profile.certifications];
                                  updated[idx].credentialId = e.target.value;
                                  setProfile({ ...profile, certifications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Verification URL (Real link)</label>
                              <input
                                type="url"
                                className="form-input"
                                placeholder="https://credly.com/your-badge"
                                value={c.credentialUrl || ''}
                                onChange={(e) => {
                                  const updated = [...profile.certifications];
                                  updated[idx].credentialUrl = e.target.value;
                                  setProfile({ ...profile, certifications: updated });
                                }}
                              />
                              {c.credentialUrl && (
                                <a
                                  href={c.credentialUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                                >
                                  Test Verification Link <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  7. PUBLICATIONS TAB
                  ------------------------------------------------------------- */}
              {activeTab === 'publications' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Publications & Technical Papers</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Research papers, academic publications, conference talks, and published articles.
                      </p>
                    </div>
                    <button onClick={addPublication} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Publication
                    </button>
                  </div>

                  {(profile.publications || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No publications recorded. Click "Add Publication" above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.publications.map((pub, idx) => (
                        <div key={pub.id || idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className="badge badge-verified">Publication #{idx + 1} {pub.title ? `• ${pub.title}` : ''}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem('publications', idx, -1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move up"
                                style={{ opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (profile.publications?.length || 0) - 1}
                                onClick={() => moveItem('publications', idx, 1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move down"
                                style={{ opacity: idx === (profile.publications?.length || 0) - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.publications.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, publications: updated });
                                  addToast('Publication deleted.', 'info');
                                }}
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                title="Delete publication"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Publication Title</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Distributed Consensus Protocols in Edge Computing"
                                value={pub.title || ''}
                                onChange={(e) => {
                                  const updated = [...profile.publications];
                                  updated[idx].title = e.target.value;
                                  setProfile({ ...profile, publications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Publisher / Journal / Conference</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. IEEE Transactions on Cloud Computing"
                                value={pub.publisher || ''}
                                onChange={(e) => {
                                  const updated = [...profile.publications];
                                  updated[idx].publisher = e.target.value;
                                  setProfile({ ...profile, publications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Date</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 2023-11"
                                value={pub.date || ''}
                                onChange={(e) => {
                                  const updated = [...profile.publications];
                                  updated[idx].date = e.target.value;
                                  setProfile({ ...profile, publications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>URL / DOI Link</label>
                              <input
                                type="url"
                                className="form-input"
                                placeholder="https://doi.org/10.1109/TCC.2023.123456"
                                value={pub.url || ''}
                                onChange={(e) => {
                                  const updated = [...profile.publications];
                                  updated[idx].url = e.target.value;
                                  setProfile({ ...profile, publications: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Description / Abstract</label>
                              <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Summary of research findings, methodology, and scientific contributions..."
                                value={pub.description || ''}
                                onChange={(e) => {
                                  const updated = [...profile.publications];
                                  updated[idx].description = e.target.value;
                                  setProfile({ ...profile, publications: updated });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  8. AWARDS & HONORS TAB
                  ------------------------------------------------------------- */}
              {activeTab === 'awards' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Honors & Awards</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Hackathon victories, academic honors, company recognitions, and competitive awards.
                      </p>
                    </div>
                    <button onClick={addAward} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Award
                    </button>
                  </div>

                  {(profile.awards || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No awards recorded. Click "Add Award" above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.awards.map((award, idx) => (
                        <div key={award.id || idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className="badge badge-verified">Award #{idx + 1} {award.title ? `• ${award.title}` : ''}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem('awards', idx, -1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move up"
                                style={{ opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (profile.awards?.length || 0) - 1}
                                onClick={() => moveItem('awards', idx, 1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move down"
                                style={{ opacity: idx === (profile.awards?.length || 0) - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.awards.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, awards: updated });
                                  addToast('Award deleted.', 'info');
                                }}
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                title="Delete award"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Award Title</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 1st Place - Global FinTech Hackathon"
                                value={award.title || ''}
                                onChange={(e) => {
                                  const updated = [...profile.awards];
                                  updated[idx].title = e.target.value;
                                  setProfile({ ...profile, awards: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Issuer / Organization</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. TechCrunch Disrupt"
                                value={award.issuer || ''}
                                onChange={(e) => {
                                  const updated = [...profile.awards];
                                  updated[idx].issuer = e.target.value;
                                  setProfile({ ...profile, awards: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Date</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 2023-10"
                                value={award.date || ''}
                                onChange={(e) => {
                                  const updated = [...profile.awards];
                                  updated[idx].date = e.target.value;
                                  setProfile({ ...profile, awards: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Description / Significance</label>
                              <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Recognized out of 500+ participants for building real-time fraud detection pipeline..."
                                value={award.description || ''}
                                onChange={(e) => {
                                  const updated = [...profile.awards];
                                  updated[idx].description = e.target.value;
                                  setProfile({ ...profile, awards: updated });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  9. VOLUNTEER EXPERIENCE TAB
                  ------------------------------------------------------------- */}
              {activeTab === 'volunteer' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Volunteer & Community Leadership</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Non-profit contributions, open source leadership, and community mentorship.
                      </p>
                    </div>
                    <button onClick={addVolunteer} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Volunteer Experience
                    </button>
                  </div>

                  {(profile.volunteer || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No volunteer entries recorded. Click "Add Volunteer Experience" above.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.volunteer.map((vol, idx) => (
                        <div key={vol.id || idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className="badge badge-verified">Volunteer #{idx + 1} {vol.role ? `• ${vol.role}` : ''}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem('volunteer', idx, -1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move up"
                                style={{ opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (profile.volunteer?.length || 0) - 1}
                                onClick={() => moveItem('volunteer', idx, 1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move down"
                                style={{ opacity: idx === (profile.volunteer?.length || 0) - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.volunteer.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, volunteer: updated });
                                  addToast('Volunteer entry deleted.', 'info');
                                }}
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                title="Delete volunteer entry"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Organization</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Code for Good Foundation"
                                value={vol.organization || ''}
                                onChange={(e) => {
                                  const updated = [...profile.volunteer];
                                  updated[idx].organization = e.target.value;
                                  setProfile({ ...profile, volunteer: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Role / Capacity</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Open Source Mentor"
                                value={vol.role || ''}
                                onChange={(e) => {
                                  const updated = [...profile.volunteer];
                                  updated[idx].role = e.target.value;
                                  setProfile({ ...profile, volunteer: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 2022-01"
                                value={vol.startDate || ''}
                                onChange={(e) => {
                                  const updated = [...profile.volunteer];
                                  updated[idx].startDate = e.target.value;
                                  setProfile({ ...profile, volunteer: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date or 'Present'</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Present"
                                value={vol.endDate || ''}
                                onChange={(e) => {
                                  const updated = [...profile.volunteer];
                                  updated[idx].endDate = e.target.value;
                                  setProfile({ ...profile, volunteer: updated });
                                }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Description & Impact</label>
                              <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Mentored 25+ students in JavaScript fundamentals and web accessibility standards..."
                                value={vol.description || ''}
                                onChange={(e) => {
                                  const updated = [...profile.volunteer];
                                  updated[idx].description = e.target.value;
                                  setProfile({ ...profile, volunteer: updated });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  10. CUSTOM SECTIONS TAB (USER-DEFINED ARBITRARY SECTIONS)
                  ------------------------------------------------------------- */}
              {activeTab === 'custom' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Custom Sections</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Add bespoke sections for patents, speaking engagements, hobbies, or unique career achievements.
                      </p>
                    </div>
                    <button onClick={addCustomSection} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Add Custom Section
                    </button>
                  </div>

                  {(profile.customSections || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No custom sections added yet. Click "Add Custom Section" to create bespoke fields.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {profile.customSections.map((cs, idx) => (
                        <div key={cs.id || idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className="badge badge-verified">Custom Section #{idx + 1} {cs.title ? `• ${cs.title}` : ''}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItem('customSections', idx, -1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move up"
                                style={{ opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (profile.customSections?.length || 0) - 1}
                                onClick={() => moveItem('customSections', idx, 1)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Move down"
                                style={{ opacity: idx === (profile.customSections?.length || 0) - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.customSections.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, customSections: updated });
                                  addToast('Custom section deleted.', 'info');
                                }}
                                className="btn btn-ghost btn-icon btn-sm"
                                style={{ color: 'var(--danger)' }}
                                title="Delete section"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Title</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. Patents & Inventions, Speaking Engagements, Languages..."
                              value={cs.title || ''}
                              onChange={(e) => {
                                const updated = [...profile.customSections];
                                updated[idx].title = e.target.value;
                                setProfile({ ...profile, customSections: updated });
                              }}
                            />
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Section Content / Details</label>
                            <textarea
                              className="form-textarea"
                              rows={3}
                              placeholder="Add details, bullet points, or paragraphs for this custom section..."
                              value={cs.content || ''}
                              onChange={(e) => {
                                const updated = [...profile.customSections];
                                updated[idx].content = e.target.value;
                                setProfile({ ...profile, customSections: updated });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Resume Importer Modal */}
        {importModalOpen && (
          <ResumeImporterModal
            isOpen={true}
            onClose={() => setImportModalOpen(false)}
            onImportSuccess={(newProfile) => {
              setProfile(normalizeProfile(newProfile));
              setImportModalOpen(false);
            }}
          />
        )}

        {/* AI Project Analyzer Modal */}
        {projectAnalyzerOpen && activeProjectForAnalysis && (
          <ProjectAnalyzerModal
            isOpen={true}
            onClose={() => {
              setProjectAnalyzerOpen(false);
              setActiveProjectForAnalysis(null);
              setActiveProjectIndex(-1);
            }}
            project={activeProjectForAnalysis}
            onApplyDescription={(descText) => {
              if (activeProjectIndex !== -1 && profile.projects[activeProjectIndex]) {
                const updated = [...profile.projects];
                updated[activeProjectIndex].description = descText;
                setProfile({ ...profile, projects: updated });
              }
            }}
            onApplyTechnologies={(techsToAdd) => {
              if (activeProjectIndex !== -1 && profile.projects[activeProjectIndex]) {
                const updated = [...profile.projects];
                const existing = updated[activeProjectIndex].technologies || [];
                const existingLower = new Set(existing.map(t => t.toLowerCase()));
                const filtered = techsToAdd.filter(t => !existingLower.has(t.toLowerCase()));
                updated[activeProjectIndex].technologies = [...existing, ...filtered];
                setProfile({ ...profile, projects: updated });
              }
            }}
            onApplySkills={(skillsToAdd) => {
              const existingNames = new Set((profile.skills || []).map(s => (s.name || '').toLowerCase()));
              const newSkills = skillsToAdd
                .filter(name => !existingNames.has(name.toLowerCase()))
                .map(name => ({ id: generateId(), name, note: '' }));
              if (newSkills.length > 0) {
                setProfile({ ...profile, skills: [...(profile.skills || []), ...newSkills] });
              }
            }}
            onApplyBullet={(bulletText) => {
              if (activeProjectIndex !== -1 && profile.projects[activeProjectIndex]) {
                const updated = [...profile.projects];
                updated[activeProjectIndex].bullets = [
                  ...(updated[activeProjectIndex].bullets || []),
                  { id: generateId(), text: bulletText }
                ];
                setProfile({ ...profile, projects: updated });
              }
            }}
          />
        )}

        {/* AI Skill Suggestions Modal */}
        {skillSuggestionsOpen && (
          <SkillSuggestionsModal
            isOpen={true}
            onClose={() => setSkillSuggestionsOpen(false)}
            profile={profile}
            onApplySkills={(skillsToAdd) => {
              const existingNames = new Set((profile.skills || []).map(s => (s.name || '').toLowerCase()));
              const newSkills = skillsToAdd
                .filter(name => !existingNames.has(name.toLowerCase()))
                .map(name => ({ id: generateId(), name, note: '' }));
              if (newSkills.length > 0) {
                setProfile({ ...profile, skills: [...(profile.skills || []), ...newSkills] });
              }
            }}
          />
        )}

        {/* Evidence Coach Modal for Experience Bullets */}
        {evidenceCoachOpen && activeCoachBullet && (
          <EvidenceCoachModal
            isOpen={true}
            initialText={activeCoachBullet.text || ''}
            onClose={() => {
              setEvidenceCoachOpen(false);
              setActiveCoachBullet(null);
            }}
            onApplyBullet={(newText, evidence) => {
              const { expIdx, bIdx } = activeCoachBullet;
              if (profile.experiences[expIdx] && profile.experiences[expIdx].bullets[bIdx]) {
                const updated = [...profile.experiences];
                updated[expIdx].bullets[bIdx].text = newText;
                updated[expIdx].bullets[bIdx].evidence = evidence;
                setProfile({ ...profile, experiences: updated });
              }
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default CareerProfile;
