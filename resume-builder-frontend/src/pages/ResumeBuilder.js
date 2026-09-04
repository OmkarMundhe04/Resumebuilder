import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Download,
  Share2,
  Undo2,
  Redo2,
  Sparkles,
  Shield,
  Eye,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  GitCompare,
  Printer,
  Edit3,
  Save,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  BookOpen,
  Trophy,
  HeartHandshake,
  Layers,
  Palette,
  GripVertical
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createDefaultCanonicalResume, generateId, TEMPLATES } from '../utils/canonicalResume';
import ResumeRenderer from '../components/templates/ResumeRenderer';
import ResumeHealth from '../components/ats/ResumeHealth';
import ParserPreviewModal from '../components/ats/ParserPreviewModal';
import TruthLedgerModal from '../components/truth/TruthLedgerModal';
import EvidenceCoachModal from '../components/truth/EvidenceCoachModal';
import VersionDiffModal from '../components/versions/VersionDiffModal';
import ExportValidatorModal from '../components/export/ExportValidatorModal';
import ShareResumeModal from '../components/share/ShareResumeModal';
import TemplateSelectorModal from '../components/templates/TemplateSelectorModal';
import ProjectAnalyzerModal from '../components/career/ProjectAnalyzerModal';
import SkillSuggestionsModal from '../components/career/SkillSuggestionsModal';
import ProjectDescriptionModal from '../components/ai/ProjectDescriptionModal';
import SectionImprovementModal from '../components/ai/SectionImprovementModal';
import RoleAnalysisModal from '../components/ai/RoleAnalysisModal';

import { exportToPdf } from '../utils/export/exportPdf';
import { exportToDocx } from '../utils/export/exportDocx';
import { exportToTxt } from '../utils/export/exportTxt';
import PageTransition from '../components/motion/PageTransition';
import ResizableSplitPane from '../components/layout/ResizableSplitPane';
import TagInput from '../components/ui/TagInput';

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [resume, setResume] = useState(null);
  const [allResumes, setAllResumes] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const [zoomScale, setZoomScale] = useState(0.9);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('content'); // 'content' | 'document' | 'quality' | 'export'
  const [activeSection, setActiveSection] = useState('personal');
  const [mobileActiveTab, setMobileActiveTab] = useState('editor'); // 'editor' | 'preview'

  // Modals
  const [parserPreviewOpen, setParserPreviewOpen] = useState(false);
  const [truthLedgerOpen, setTruthLedgerOpen] = useState(false);
  const [evidenceCoachOpen, setEvidenceCoachOpen] = useState(false);
  const [activeCoachBullet, setActiveCoachBullet] = useState(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [originalResume, setOriginalResume] = useState(null);
  const [exportModalFormat, setExportModalFormat] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [aiReviewOpen, setAiReviewOpen] = useState(false);
  const [aiReviewData, setAiReviewData] = useState(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);

  // Manual Context-Aware AI Modals
  const [projectAnalyzerOpen, setProjectAnalyzerOpen] = useState(false);
  const [activeProjectForAnalyzer, setActiveProjectForAnalyzer] = useState(null);
  const [projectDescModalOpen, setProjectDescModalOpen] = useState(false);
  const [activeProjectForDesc, setActiveProjectForDesc] = useState(null);
  const [projectSkillsModalOpen, setProjectSkillsModalOpen] = useState(false);
  const [activeProjectForSkills, setActiveProjectForSkills] = useState(null);
  const [resumeSkillsModalOpen, setResumeSkillsModalOpen] = useState(false);
  const [sectionImprovementModalOpen, setSectionImprovementModalOpen] = useState(false);
  const [activeSectionImprovement, setActiveSectionImprovement] = useState(null);
  const [roleAnalysisModalOpen, setRoleAnalysisModalOpen] = useState(false);
  const [roleAnalysisInitialTab, setRoleAnalysisInitialTab] = useState('analysis');

  const autosaveTimerRef = useRef(null);

  // Normalization helper: ensures existing items have guaranteed stable unique IDs
  const normalizeResumeItems = useCallback((rawResume) => {
    if (!rawResume) return rawResume;
    let modified = false;
    const projects = (rawResume.projects || []).map(p => {
      if (!p.id) {
        modified = true;
        return { ...p, id: generateId() };
      }
      return p;
    });
    const education = (rawResume.education || []).map(e => {
      if (!e.id) {
        modified = true;
        return { ...e, id: generateId() };
      }
      return e;
    });
    const experiences = (rawResume.experiences || []).map(exp => {
      if (!exp.id) {
        modified = true;
        return { ...exp, id: generateId() };
      }
      return exp;
    });
    return modified ? { ...rawResume, projects, education, experiences } : rawResume;
  }, []);

  const initDefaultResume = useCallback(async () => {
    try {
      const profileRes = await api.get('/career-profile');
      if (profileRes.data.success) {
        const p = profileRes.data.profile;
        const newResume = normalizeResumeItems(createDefaultCanonicalResume(p));
        setResume(newResume);
        setOriginalResume(newResume);
        setHistory([newResume]);
        setHistoryIndex(0);
      }
    } catch {
      const fallback = normalizeResumeItems(createDefaultCanonicalResume());
      setResume(fallback);
      setOriginalResume(fallback);
      setHistory([fallback]);
      setHistoryIndex(0);
    }
  }, [normalizeResumeItems]);

  const loadResume = useCallback(async () => {
    // Check if requested restoring draft
    const params = new URLSearchParams(location.search);
    if (params.get('restore') === 'draft') {
      const savedDraft = localStorage.getItem('resume_draft_backup');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.resume) {
            const norm = normalizeResumeItems(parsed.resume);
            setResume(norm);
            setOriginalResume(norm);
            setHistory([norm]);
            setHistoryIndex(0);
            return;
          }
        } catch {}
      }
    }

    if (id) {
      try {
        const res = await api.get(`/resume/${id}`);
        if (res.data.success) {
          const norm = normalizeResumeItems(res.data.resume);
          setResume(norm);
          setOriginalResume(norm);
          setHistory([norm]);
          setHistoryIndex(0);
        }
      } catch {
        addToast('Failed to load resume, creating default.', 'error');
        initDefaultResume();
      }
    } else {
      initDefaultResume();
    }
  }, [id, location.search, addToast, initDefaultResume, normalizeResumeItems]);

  useEffect(() => {
    loadResume();
    api.get('/resume')
      .then(res => {
        if (res.data.success) setAllResumes(res.data.resumes || []);
      })
      .catch(() => {});
  }, [loadResume]);

  // State Change with Undo / Redo History
  const updateResumeState = (updated, pushHistory = true) => {
    setResume(updated);
    setSaveStatus('unsaved');

    // Debounced LocalStorage Auto-backup
    localStorage.setItem('resume_draft_backup', JSON.stringify({
      savedAt: Date.now(),
      resume: updated
    }));

    if (pushHistory) {
      const newHist = history.slice(0, historyIndex + 1);
      newHist.push(updated);
      setHistory(newHist);
      setHistoryIndex(newHist.length - 1);
    }

    // Debounced remote autosave
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      saveResumeToBackend(updated, true);
    }, 2000);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setResume(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setResume(history[newIdx]);
    }
  };

  const saveResumeToBackend = async (dataToSave = resume, silent = false) => {
    if (!dataToSave) return;
    setSaveStatus('saving');
    try {
      if (dataToSave._id) {
        const res = await api.put(`/resume/${dataToSave._id}`, dataToSave);
        if (res.data.success) {
          setResume(res.data.resume);
          setSaveStatus('saved');
          if (!silent) addToast('Resume saved successfully.', 'success');
        }
      } else {
        const res = await api.post('/resume', dataToSave);
        if (res.data.success) {
          setResume(res.data.resume);
          setSaveStatus('saved');
          if (!silent) addToast('New resume created and saved.', 'success');
          navigate(`/builder/${res.data.resume._id}`, { replace: true });
        }
      }
    } catch {
      setSaveStatus('unsaved');
      if (!silent) addToast('Failed to save resume.', 'error');
    }
  };

  // Manual explicit save to Dashboard
  const handleManualSaveResume = async () => {
    if (!resume) return;
    const updated = { ...resume, isDraft: false };
    setResume(updated);
    setSaveStatus('saving');
    try {
      if (updated._id) {
        const res = await api.put(`/resume/${updated._id}`, updated);
        if (res.data.success) {
          setResume(res.data.resume);
          setSaveStatus('saved');
          addToast(`"${updated.title || 'Resume'}" saved as official version in Dashboard!`, 'success');
        }
      } else {
        const res = await api.post('/resume', updated);
        if (res.data.success) {
          setResume(res.data.resume);
          setSaveStatus('saved');
          addToast(`"${updated.title || 'Resume'}" saved as official version in Dashboard!`, 'success');
          navigate(`/builder/${res.data.resume._id}`, { replace: true });
        }
      }
    } catch {
      setSaveStatus('unsaved');
      addToast('Failed to save resume.', 'error');
    }
  };

  // Export handlers
  const handleExportClick = (format) => {
    if (format === 'print') {
      handleDirectPrint();
      return;
    }
    setExportModalFormat(format);
  };

  const handleDirectPrint = () => {
    setExportModalFormat(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const executeExport = async () => {
    const format = exportModalFormat;
    setExportModalFormat(null);
    try {
      if (format === 'pdf') {
        const filename = `${(resume?.personal?.fullName || resume?.title || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.pdf`;
        await exportToPdf('resume-preview-document', filename);
        addToast('PDF downloaded successfully.', 'success');
      } else if (format === 'docx') {
        await exportToDocx(resume);
        addToast('Word .docx document downloaded successfully.', 'success');
      } else if (format === 'txt') {
        exportToTxt(resume);
        addToast('Plain text (.txt) exported.', 'success');
      } else if (format === 'print') {
        handleDirectPrint();
      }
    } catch (err) {
      console.error('Export error:', err);
      addToast('Export encountered an error.', 'error');
    }
  };

  // Section Reordering
  const moveSection = (index, direction) => {
    const currentOrder = [...(resume.sectionOrder || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;

    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIdx];
    currentOrder[targetIdx] = temp;

    updateResumeState({ ...resume, sectionOrder: currentOrder });
  };

  // Projects, Education & Experience Reordering (Canonical State)
  const reorderProjects = (sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex) return;
    const current = [...(resume.projects || [])];
    if (sourceIndex < 0 || sourceIndex >= current.length || targetIndex < 0 || targetIndex >= current.length) return;
    const [moved] = current.splice(sourceIndex, 1);
    current.splice(targetIndex, 0, moved);
    updateResumeState({ ...resume, projects: current });
  };

  const moveProject = (index, direction) => {
    reorderProjects(index, index + direction);
  };

  const reorderEducation = (sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex) return;
    const current = [...(resume.education || [])];
    if (sourceIndex < 0 || sourceIndex >= current.length || targetIndex < 0 || targetIndex >= current.length) return;
    const [moved] = current.splice(sourceIndex, 1);
    current.splice(targetIndex, 0, moved);
    updateResumeState({ ...resume, education: current });
  };

  const moveEducation = (index, direction) => {
    reorderEducation(index, index + direction);
  };

  const reorderExperiences = (sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex) return;
    const current = [...(resume.experiences || [])];
    if (sourceIndex < 0 || sourceIndex >= current.length || targetIndex < 0 || targetIndex >= current.length) return;
    const [moved] = current.splice(sourceIndex, 1);
    current.splice(targetIndex, 0, moved);
    updateResumeState({ ...resume, experiences: current });
  };

  const moveExperience = (index, direction) => {
    reorderExperiences(index, index + direction);
  };

  // Drag and Drop state for Projects, Education & Experience
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const [dragSection, setDragSection] = useState(null); // 'projects' | 'education' | 'experiences'
  const [activeDraggableId, setActiveDraggableId] = useState(null);

  // Touch drag tracking for mobile
  const touchDragRef = useRef(null);

  // Desktop HTML5 Drag Handlers
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
    const items = section === 'projects'
      ? (resume.projects || [])
      : section === 'education'
        ? (resume.education || [])
        : (resume.experiences || []);
    const sourceIndex = items.findIndex(item => item.id === draggedItemId);
    if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
      if (section === 'projects') {
        reorderProjects(sourceIndex, targetIndex);
      } else if (section === 'education') {
        reorderEducation(sourceIndex, targetIndex);
      } else if (section === 'experiences') {
        reorderExperiences(sourceIndex, targetIndex);
      }
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

  // Mobile Touch Handlers
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
    const card = elem?.closest('.builder-item-card[data-reorder-id]');
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
      const items = section === 'projects'
        ? (resume.projects || [])
        : section === 'education'
          ? (resume.education || [])
          : (resume.experiences || []);
      const targetIndex = items.findIndex(item => item.id === dragOverItemId);
      if (targetIndex !== -1 && targetIndex !== startIndex) {
        if (section === 'projects') {
          reorderProjects(startIndex, targetIndex);
        } else if (section === 'education') {
          reorderEducation(startIndex, targetIndex);
        } else if (section === 'experiences') {
          reorderExperiences(startIndex, targetIndex);
        }
      }
    }
    touchDragRef.current = null;
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragSection(null);
    setActiveDraggableId(null);
  };

  // Evidence Coach Bullet Injection
  const handleApplyCoachBullet = (newText, evidence) => {
    if (!activeCoachBullet) return;
    const { expId, expIdx, bIdx } = activeCoachBullet;
    const updated = JSON.parse(JSON.stringify(resume));
    const targetIdx = expId
      ? updated.experiences.findIndex(e => e.id === expId)
      : expIdx;
    if (targetIdx !== -1 && updated.experiences[targetIdx]?.bullets[bIdx]) {
      updated.experiences[targetIdx].bullets[bIdx].text = newText;
      updated.experiences[targetIdx].bullets[bIdx].evidence = evidence;
      updated.experiences[targetIdx].bullets[bIdx].status = 'VERIFIED';
      updateResumeState(updated);
    }
    setActiveCoachBullet(null);
  };

  // Page Count Estimation & Content Density Analysis
  const calculatePageEstimate = () => {
    if (!resume) return { estPages: 1, wordCount: 0, bulletCount: 0, longBullets: 0 };
    let wordCount = 0;
    let bulletCount = 0;
    let longBullets = 0;

    if (resume.personal?.summary) wordCount += resume.personal.summary.split(/\s+/).filter(Boolean).length;
    (resume.experiences || []).forEach(exp => {
      (exp.bullets || []).forEach(b => {
        const words = (b.text || '').split(/\s+/).filter(Boolean).length;
        wordCount += words;
        bulletCount++;
        if ((b.text || '').length > 200) longBullets++;
      });
    });
    (resume.projects || []).forEach(p => {
      if (p.description) wordCount += p.description.split(/\s+/).filter(Boolean).length;
    });

    let estPages = 1;
    if (wordCount > 420 || bulletCount > 10) estPages = 2;
    if (wordCount > 850 || bulletCount > 20) estPages = 3;

    return { estPages, wordCount, bulletCount, longBullets };
  };

  const pageMetrics = calculatePageEstimate();

  if (!resume) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Loading Canonical Resume...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="resume-builder-page" style={{ height: 'calc(100vh - var(--header-height) - 3rem)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Toolbar */}
      <div
        className="builder-toolbar no-print"
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        {/* Title & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {allResumes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Resume:</span>
              <select
                className="form-input"
                value={id || (resume?._id || '')}
                onChange={(e) => {
                  if (e.target.value) navigate(`/builder/${e.target.value}`);
                }}
                style={{ padding: '2px 8px', fontSize: '0.75rem', height: '28px', maxWidth: '170px' }}
              >
                <option value="">Switch Resume...</option>
                {allResumes.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.title} (v{r.version || 1})
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            type="text"
            className="form-input"
            value={resume.title || ''}
            onChange={(e) => updateResumeState({ ...resume, title: e.target.value })}
            style={{ fontWeight: 700, fontSize: '0.9375rem', width: '200px', padding: '4px 8px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: saveStatus === 'saved' ? 'var(--success)' : 'var(--warning)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: saveStatus === 'saved' ? 'var(--success)' : 'var(--warning)' }} />
            <span>{saveStatus === 'saved' ? 'Autosaved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved Changes'}</span>
          </div>
          {resume.isSample && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderRadius: '4px' }}>
              SAMPLE DATA
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Undo / Redo */}
          <button onClick={handleUndo} disabled={historyIndex <= 0} className="btn btn-ghost btn-icon btn-sm" title="Undo (Ctrl+Z)">
            <Undo2 size={16} />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="btn btn-ghost btn-icon btn-sm" title="Redo (Ctrl+Y)">
            <Redo2 size={16} />
          </button>

          {/* Signature Tools */}
          <button
            onClick={async () => {
              setAiReviewOpen(true);
              setAiReviewLoading(true);
              try {
                const res = await api.post('/ai/analyze-resume', {
                  resumeData: resume,
                  targetRole: resume.targetRole || resume.personal?.title
                });
                if (res.data.success) {
                  setAiReviewData(res.data.analysis);
                }
              } catch {
                setAiReviewData('### ⚡ Resume Review Insights\n- **Parser Safety:** Clear single/dual column structure ensures standard ATS parsability.\n- **Action Verbs:** Strengthen starting verbs across work experience bullets.\n- **Quantification:** Include percentage improvements, user counts, or latency reductions.');
              } finally {
                setAiReviewLoading(false);
              }
            }}
            className="btn btn-secondary btn-sm"
            title="Gemini AI Diagnostic & Specific Modifications"
            style={{ color: 'var(--accent-primary)', borderColor: 'rgba(2, 132, 199, 0.35)', fontWeight: 600 }}
          >
            <Sparkles size={14} /> AI Review
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleAnalysisInitialTab('analysis');
              setRoleAnalysisModalOpen(true);
            }}
            className="btn btn-secondary btn-sm"
            title="Analyze resume alignment with target role & JD"
            style={{ color: 'var(--accent-primary)', borderColor: 'rgba(2, 132, 199, 0.4)', fontWeight: 600, gap: '4px' }}
          >
            <Sparkles size={14} /> ✦ Analyze for Role
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleAnalysisInitialTab('optimizer');
              setRoleAnalysisModalOpen(true);
            }}
            className="btn btn-secondary btn-sm"
            title="Review proposed role-specific optimizations"
            style={{ color: 'var(--accent-primary)', borderColor: 'rgba(2, 132, 199, 0.4)', fontWeight: 600, gap: '4px' }}
          >
            <Sparkles size={14} /> ✦ Optimize for Role
          </button>
          <button onClick={() => setTemplateSelectorOpen(true)} className="btn btn-secondary btn-sm" title="Change Template Layout">
            Switch Template
          </button>
          <button onClick={() => setParserPreviewOpen(true)} className="btn btn-secondary btn-sm" title="View Machine-Parsed ASCII Text">
            <Eye size={14} /> Parser View
          </button>
          <button onClick={() => setTruthLedgerOpen(true)} className="btn btn-secondary btn-sm" title="Inspect Fact Provenance">
            <Shield size={14} /> Truth Ledger
          </button>
          <button onClick={() => setDiffModalOpen(true)} className="btn btn-secondary btn-sm" title="Compare Versions">
            <GitCompare size={14} /> Diff
          </button>
          <button onClick={() => setShareModalOpen(true)} className="btn btn-secondary btn-sm" title="Create Public Token Link">
            <Share2 size={14} /> Share
          </button>

          {/* Primary Save Action */}
          <button
            onClick={handleManualSaveResume}
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}
            title="Save this resume as an official version to your Dashboard"
          >
            <Save size={14} /> Save Resume
          </button>

          {/* Export Quick Trigger */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => handleExportClick('pdf')} className="btn btn-primary btn-sm">
              <Download size={14} /> PDF
            </button>
            <button onClick={() => handleExportClick('docx')} className="btn btn-secondary btn-sm">
              DOCX
            </button>
            <button onClick={() => handleExportClick('txt')} className="btn btn-secondary btn-sm">
              TXT
            </button>
            <button onClick={() => handleExportClick('print')} className="btn btn-ghost btn-icon btn-sm" title="Print Document">
              <Printer size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Page Count & Content Density Indicator */}
      <div
        className="no-print"
        style={{
          padding: '6px 14px',
          background: pageMetrics.estPages >= 3 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Estimated Page Count:</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 700,
              background: pageMetrics.estPages === 1 ? 'rgba(16, 185, 129, 0.15)' : pageMetrics.estPages === 2 ? 'rgba(2, 132, 199, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: pageMetrics.estPages === 1 ? 'var(--success)' : pageMetrics.estPages === 2 ? 'var(--accent-primary)' : 'var(--danger)'
            }}
          >
            {pageMetrics.estPages} {pageMetrics.estPages === 1 ? 'Page (Optimal)' : pageMetrics.estPages === 2 ? 'Pages (Standard Senior)' : 'Pages (High Density Warning)'}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>• {pageMetrics.wordCount} words ({pageMetrics.bulletCount} bullets)</span>
        </div>

        {pageMetrics.estPages >= 3 && (
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
            ⚠️ This resume spans 3 pages and may reduce scan speed. Consider condensing bullet points.
          </span>
        )}

        {pageMetrics.longBullets > 0 && (
          <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
            ℹ️ {pageMetrics.longBullets} bullet(s) exceed 200 characters (consider splitting).
          </span>
        )}

        {/* Mobile View Switcher */}
        <div
          className="builder-mobile-toggle no-print"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-secondary)',
            padding: '2px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <button
            type="button"
            onClick={() => setMobileActiveTab('editor')}
            className={`btn btn-sm ${mobileActiveTab === 'editor' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
          >
            Form Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab('preview')}
            className={`btn btn-sm ${mobileActiveTab === 'preview' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace (IDE Style) */}
      <ResizableSplitPane
        mobileActiveTab={mobileActiveTab}
        defaultWidth={460}
        minWidth={340}
        minRightWidth={400}
        leftPane={
          <div
            className="builder-editor-pane no-print"
            style={{
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflowY: 'auto'
            }}
          >
          {/* 4-Step Primary Hierarchy Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
            {[
              { id: 'content', label: '1. Content' },
              { id: 'document', label: '2. Document' },
              { id: 'quality', label: '3. Quality' },
              { id: 'export', label: '4. Export' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveWorkflowTab(tab.id)}
                style={{
                  padding: '6px 4px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeWorkflowTab === tab.id ? 'var(--bg-card)' : 'transparent',
                  color: activeWorkflowTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  boxShadow: activeWorkflowTab === tab.id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Workflow Tab 2: LAYOUT & SECTIONS */}
          {activeWorkflowTab === 'document' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Document Layout & Section Order</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Reorder sections up/down, toggle visibility, or click "Edit" to jump straight into editing.
                  </p>
                </div>
                <button
                  onClick={() => setTemplateSelectorOpen(true)}
                  className="btn btn-secondary btn-sm"
                >
                  Change Template
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {(resume.sectionOrder || []).map((secKey, idx) => (
                  <div
                    key={secKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={resume.sectionVisibility?.[secKey] !== false}
                        onChange={(e) => {
                          const visibility = { ...(resume.sectionVisibility || {}) };
                          visibility[secKey] = e.target.checked;
                          updateResumeState({ ...resume, sectionVisibility: visibility });
                        }}
                      />
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{secKey}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setActiveWorkflowTab('content');
                          setActiveSection(secKey === 'summary' ? 'personal' : secKey);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => moveSection(idx, -1)}
                        disabled={idx === 0}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Move up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === (resume.sectionOrder || []).length - 1}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Move down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Tab 3: QUALITY (ATS Health & Safe Repairs) */}
          {activeWorkflowTab === 'quality' && (
            <div className="builder-content-section">
              <ResumeHealth
                resume={resume}
                onUpdateResume={(repaired) => updateResumeState(repaired)}
                onOpenParserPreview={() => setParserPreviewOpen(true)}
              />
            </div>
          )}

          {/* Workflow Tab 4: EXPORT */}
          {activeWorkflowTab === 'export' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Pre-Flight Export Center</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Review format, estimated pages, and sanitized filename before downloading.
                  </p>
                </div>
              </div>

              <div className="builder-grid-2">
                <button onClick={() => handleExportClick('pdf')} className="btn btn-primary" style={{ padding: '14px' }}>
                  <Download size={16} /> Export PDF
                </button>
                <button onClick={() => handleExportClick('docx')} className="btn btn-secondary" style={{ padding: '14px' }}>
                  Export Word (.docx)
                </button>
                <button onClick={() => handleExportClick('txt')} className="btn btn-secondary" style={{ padding: '14px' }}>
                  Export Plain Text (.txt)
                </button>
                <button onClick={() => handleExportClick('print')} className="btn btn-secondary" style={{ padding: '14px' }}>
                  <Printer size={16} /> Print Document
                </button>
              </div>
            </div>
          )}

          {/* Workflow Tab 1: CONTENT (Section Navigation Accordion) */}
          {activeWorkflowTab === 'content' && (
            <>
              {/* Section Sub-Navigation Bar (Horizontal Scrolling Pills) */}
              <div 
                className="horizontal-section-nav"
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY * 0.8;
                  }
                }}
              >
                {[
                  { id: 'personal', label: 'Personal', icon: User, count: null },
                  { id: 'experience', label: 'Experience', icon: Briefcase, count: resume.experiences?.length || 0 },
                  { id: 'education', label: 'Education', icon: GraduationCap, count: resume.education?.length || 0 },
                  { id: 'skills', label: 'Skills', icon: Wrench, count: resume.skills?.length || 0 },
                  { id: 'projects', label: 'Projects', icon: FolderGit2, count: resume.projects?.length || 0 },
                  { id: 'certifications', label: 'Certifications', icon: Award, count: resume.certifications?.length || 0 },
                  { id: 'publications', label: 'Publications', icon: BookOpen, count: resume.publications?.length || 0 },
                  { id: 'awards', label: 'Awards', icon: Trophy, count: resume.awards?.length || 0 },
                  { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake, count: resume.volunteer?.length || 0 },
                  { id: 'custom', label: 'Custom', icon: Layers, count: resume.customSections?.length || 0 },
                  { id: 'formatting', label: 'Style & Font', icon: Palette, count: null }
                ].map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec.id)}
                      className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                      type="button"
                    >
                      <Icon size={14} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} />
                      <span>{sec.label}</span>
                      {sec.count !== null && (
                        <span className="nav-pill-badge">
                          {sec.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contextual Guidance Callouts */}
              {activeSection === 'personal' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Personal Tip:</strong> Keep summary to 2–4 sentences focusing on core expertise, proven track record, and key achievements.
                </div>
              )}
              {activeSection === 'experience' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Experience Tip:</strong> Use 3–5 strong bullets with measurable impact and specific tools. Click ✨ for AI Evidence Coaching.
                </div>
              )}
              {activeSection === 'education' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Education Tip:</strong> Include your degree, institution, graduation date, GPA (if &gt; 3.5), and relevant coursework.
                </div>
              )}
              {activeSection === 'projects' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Projects Tip:</strong> Highlight what you architected, the technologies utilized, and quantifiable results with links.
                </div>
              )}
              {activeSection === 'skills' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Skills Tip:</strong> List your core competencies and tools. Add an optional note (e.g. "Advanced", "2+ years", "Backend") to highlight specific context.
                </div>
              )}
              {activeSection === 'certifications' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Certifications Tip:</strong> Add valid industry certifications (e.g. AWS, GCP, PMP, Scrums) with issuing organization.
                </div>
              )}
              {activeSection === 'publications' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Publications Tip:</strong> Include peer-reviewed articles, conference proceedings, or notable tech writeups.
                </div>
              )}
              {activeSection === 'awards' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Awards Tip:</strong> Highlight hackathons, company recognition, scholarships, and technical honors.
                </div>
              )}
              {activeSection === 'volunteer' && (
                <div className="builder-guidance-tip">
                  💡 <strong>Volunteer Tip:</strong> Showcase leadership, open source mentoring, and community contributions.
                </div>
              )}
            </>
          )}

          {/* Form Content Based on Active Section */}
          {activeSection === 'personal' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Personal Contact Info & Summary</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Core identification and direct contact channels for recruiters.
                  </p>
                </div>
              </div>

              <div className="builder-field">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.personal?.fullName || ''}
                  onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, fullName: e.target.value } })}
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div className="builder-field">
                <label>Target Role / Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.personal?.title || ''}
                  onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, title: e.target.value }, targetRole: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>

              <div className="builder-grid-2">
                <div className="builder-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={resume.personal?.email || ''}
                    onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, email: e.target.value } })}
                    placeholder="name@domain.com"
                  />
                  {resume.personal?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.personal.email) && (
                    <span className="form-error" style={{ marginTop: '4px' }}>
                      ⚠️ Please enter a valid email format (e.g. name@domain.com)
                    </span>
                  )}
                </div>

                <div className="builder-field">
                  <label>Phone Number (10+ digits)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resume.personal?.phone || ''}
                    onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, phone: e.target.value } })}
                    placeholder="+1 (555) 000-0000"
                  />
                  {resume.personal?.phone && (resume.personal.phone.replace(/\D/g, '').length < 10) && (
                    <span className="form-error" style={{ marginTop: '4px' }}>
                      ⚠️ Official phone number requires at least 10 digits
                    </span>
                  )}
                </div>
              </div>

              <div className="builder-field">
                <label>Location / City, Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={resume.personal?.location || ''}
                  onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, location: e.target.value } })}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                />
              </div>

              <div className="builder-grid-2">
                <div className="builder-field">
                  <label>LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={resume.personal?.linkedin || ''}
                    onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, linkedin: e.target.value } })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="builder-field">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={resume.personal?.github || ''}
                    onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, github: e.target.value } })}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="builder-field">
                <label>Portfolio / Personal Website</label>
                <input
                  type="url"
                  className="form-input"
                  value={resume.personal?.website || resume.personal?.portfolio || ''}
                  onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, website: e.target.value, portfolio: e.target.value } })}
                  placeholder="https://yourportfolio.dev"
                />
              </div>

              {/* Photo / Avatar Section */}
              <div style={{ padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label className="builder-checkbox-row" style={{ margin: 0, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(resume.personal?.showPhoto)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      updateResumeState({
                        ...resume,
                        personal: {
                          ...resume.personal,
                          showPhoto: isChecked,
                          photoUrl: isChecked && !resume.personal?.photoUrl 
                            ? (user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`)
                            : resume.personal?.photoUrl
                        }
                      });
                    }}
                  />
                  <span>Include Profile Picture / Photo in Resume</span>
                </label>

                {Boolean(resume.personal?.showPhoto) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
                    {resume.personal?.photoUrl ? (
                      <img
                        src={resume.personal.photoUrl}
                        alt="Profile preview"
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        No Photo
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => {
                          const defaultAvatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`;
                          updateResumeState({
                            ...resume,
                            personal: {
                              ...resume.personal,
                              showPhoto: true,
                              photoUrl: defaultAvatar
                            }
                          });
                        }}
                      >
                        Use Profile Avatar
                      </button>
                      <label className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer', margin: 0 }}>
                        Upload Custom Photo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvt) => {
                                updateResumeState({
                                  ...resume,
                                  personal: {
                                    ...resume.personal,
                                    showPhoto: true,
                                    photoUrl: uploadEvt.target.result
                                  }
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {resume.personal?.photoUrl && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.75rem', color: 'var(--danger)', padding: '6px 10px' }}
                          onClick={() => {
                            updateResumeState({
                              ...resume,
                              personal: {
                                ...resume.personal,
                                photoUrl: '',
                                showPhoto: false
                              }
                            });
                          }}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="builder-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ margin: 0 }}>Professional Summary</label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSectionImprovement({
                        type: 'summary',
                        title: 'Professional Summary',
                        itemContext: { role: resume.personal?.title || resume.targetRole, location: resume.personal?.location },
                        originalText: resume.personal?.summary || '',
                        onApply: (improvedText, newSkills) => {
                          const updatedPersonal = { ...resume.personal, summary: improvedText };
                          let updatedSkills = resume.skills || [];
                          if (newSkills && newSkills.length > 0) {
                            const existing = new Set(updatedSkills.map(s => s.name?.toLowerCase()));
                            const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: 'Summary' }));
                            updatedSkills = [...updatedSkills, ...toAdd];
                          }
                          updateResumeState({ ...resume, personal: updatedPersonal, skills: updatedSkills });
                        }
                      });
                      setSectionImprovementModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                    title="Improve Professional Summary"
                  >
                    <Sparkles size={12} color="var(--accent-primary)" />
                    <span>✦ Improve Summary</span>
                  </button>
                </div>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={resume.personal?.summary || ''}
                  onChange={(e) => updateResumeState({ ...resume, personal: { ...resume.personal, summary: e.target.value } })}
                  placeholder="2-4 sentences highlighting your background, core strengths, and major impact."
                />
              </div>
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Work Experience</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Add your career history in reverse chronological order.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newExp = {
                      id: generateId(),
                      company: 'New Company',
                      role: 'Software Engineer',
                      location: 'Remote',
                      startDate: '2023',
                      endDate: 'Present',
                      isCurrent: true,
                      bullets: [{ id: generateId(), text: '' }]
                    };
                    updateResumeState({ ...resume, experiences: [newExp, ...(resume.experiences || [])] });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Experience
                </button>
              </div>

              {(resume.experiences || []).map((exp, idx) => {
                const isDragging = draggedItemId === exp.id;
                const isOver = dragOverItemId === exp.id;
                const totalExp = (resume.experiences || []).length;
                return (
                  <div
                    key={exp.id}
                    data-reorder-id={exp.id}
                    data-reorder-section="experiences"
                    className={`builder-item-card ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-drop-target' : ''}`}
                    draggable={activeDraggableId === exp.id}
                    onDragStart={(e) => handleItemDragStart(e, exp.id, 'experiences')}
                    onDragOver={(e) => handleItemDragOver(e, exp.id, 'experiences')}
                    onDragLeave={() => handleItemDragLeave(exp.id)}
                    onDrop={(e) => handleItemDrop(e, exp.id, 'experiences', idx)}
                    onDragEnd={handleItemDragEnd}
                  >
                    <div className="builder-item-card-header">
                      <div className="builder-card-header-left">
                        <div
                          className="builder-drag-handle"
                          title="Hold and drag to reorder"
                          aria-label="Hold and drag to reorder"
                          onMouseDown={() => setActiveDraggableId(exp.id)}
                          onMouseUp={() => setActiveDraggableId(null)}
                          onTouchStart={(e) => handleTouchStart(e, exp.id, 'experiences', idx)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                        >
                          <GripVertical size={16} />
                        </div>
                        <strong className="builder-item-card-title">{exp.company || exp.role || 'Experience'}</strong>
                      </div>

                      <div className="builder-card-header-actions">
                        <button
                          type="button"
                          onClick={() => {
                            const bulletTexts = (exp.bullets || []).map(b => typeof b === 'string' ? b : b.text).filter(Boolean);
                            setActiveSectionImprovement({
                              type: 'experience',
                              title: `${exp.role || 'Role'} at ${exp.company || 'Company'}`,
                              itemContext: { role: exp.role, company: exp.company, location: exp.location },
                              originalText: bulletTexts.join('\n'),
                              onApply: (improvedText, newSkills) => {
                                const newBullets = improvedText
                                  .split('\n')
                                  .map(line => line.trim().replace(/^[-•*]\s*/, ''))
                                  .filter(Boolean)
                                  .map(text => ({ id: generateId(), text }));
                                const updated = (resume.experiences || []).map(item =>
                                  item.id === exp.id ? { ...item, bullets: newBullets.length > 0 ? newBullets : item.bullets } : item
                                );
                                let updatedSkills = resume.skills || [];
                                if (newSkills && newSkills.length > 0) {
                                  const existing = new Set(updatedSkills.map(s => s.name?.toLowerCase()));
                                  const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: exp.company || 'Experience' }));
                                  updatedSkills = [...updatedSkills, ...toAdd];
                                }
                                updateResumeState({ ...resume, experiences: updated, skills: updatedSkills });
                              }
                            });
                            setSectionImprovementModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                          title="Improve Experience with evidence-backed wording"
                        >
                          <Sparkles size={12} color="var(--accent-primary)" />
                          <span>✦ Improve Experience</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProjectForSkills({
                              name: `${exp.role || ''} at ${exp.company || ''}`.trim() || 'Work Experience',
                              description: (exp.bullets || []).map(b => typeof b === 'string' ? b : b.text).join(' '),
                              technologies: []
                            });
                            setProjectSkillsModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                          title="Suggest Skills from this experience"
                        >
                          <Sparkles size={12} color="var(--accent-primary)" />
                          <span>✦ Suggest Skills</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExperience(idx, -1)}
                          disabled={idx === 0}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Move up"
                          aria-label={`Move ${exp.company || exp.role || 'Experience ' + (idx + 1)} up`}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExperience(idx, 1)}
                          disabled={idx === totalExp - 1}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Move down"
                          aria-label={`Move ${exp.company || exp.role || 'Experience ' + (idx + 1)} down`}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (resume.experiences || []).filter(item => item.id !== exp.id);
                            updateResumeState({ ...resume, experiences: updated });
                          }}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--danger)', padding: '4px 6px' }}
                          title="Delete Experience"
                          aria-label={`Delete ${exp.company || exp.role || 'Experience'}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="builder-grid-2">
                      <div className="builder-field">
                        <label>Role / Job Title</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.role || ''}
                          placeholder="e.g. Senior Software Engineer"
                          onChange={(e) => {
                            const updated = (resume.experiences || []).map(item =>
                              item.id === exp.id ? { ...item, role: e.target.value } : item
                            );
                            updateResumeState({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <label>Company / Organization</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.company || ''}
                          placeholder="e.g. Google"
                          onChange={(e) => {
                            const updated = (resume.experiences || []).map(item =>
                              item.id === exp.id ? { ...item, company: e.target.value } : item
                            );
                            updateResumeState({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="builder-grid-3">
                      <div className="builder-field">
                        <label>Location</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.location || ''}
                          placeholder="City, ST (or Remote)"
                          onChange={(e) => {
                            const updated = (resume.experiences || []).map(item =>
                              item.id === exp.id ? { ...item, location: e.target.value } : item
                            );
                            updateResumeState({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <label>Start Date</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.startDate || ''}
                          placeholder="e.g. Jan 2022"
                          onChange={(e) => {
                            const updated = (resume.experiences || []).map(item =>
                              item.id === exp.id ? { ...item, startDate: e.target.value } : item
                            );
                            updateResumeState({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <label>End Date</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.isCurrent ? 'Present' : (exp.endDate || '')}
                          disabled={exp.isCurrent}
                          placeholder="Present"
                          onChange={(e) => {
                            const updated = (resume.experiences || []).map(item =>
                              item.id === exp.id ? { ...item, endDate: e.target.value } : item
                            );
                            updateResumeState({ ...resume, experiences: updated });
                          }}
                        />
                      </div>
                    </div>

                    <label className="builder-checkbox-row">
                      <input
                        type="checkbox"
                        checked={Boolean(exp.isCurrent)}
                        onChange={(e) => {
                          const updated = (resume.experiences || []).map(item => {
                            if (item.id !== exp.id) return item;
                            const isCurrent = e.target.checked;
                            return {
                              ...item,
                              isCurrent,
                              endDate: isCurrent ? 'Present' : item.endDate
                            };
                          });
                          updateResumeState({ ...resume, experiences: updated });
                        }}
                      />
                      <span>I currently work here</span>
                    </label>

                    {/* Bullets with Evidence Coach trigger */}
                    <div className="builder-bullets-section">
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Key Contributions & Quantifiable Evidence:
                      </label>
                      {(exp.bullets || []).map((b, bIdx) => (
                        <div key={b.id || bIdx} className="builder-bullet-row">
                          <textarea
                            rows={2}
                            className="form-textarea"
                            value={b.text}
                            placeholder="Action verb + task + quantifiable metric & outcome (e.g. Optimized queries, reducing latency by 45%)"
                            onChange={(e) => {
                              const updated = (resume.experiences || []).map(item => {
                                if (item.id !== exp.id) return item;
                                const bullets = (item.bullets || []).map((bullet, bulletI) =>
                                  bulletI === bIdx ? { ...bullet, text: e.target.value } : bullet
                                );
                                return { ...item, bullets };
                              });
                              updateResumeState({ ...resume, experiences: updated });
                            }}
                          />
                          <div className="builder-bullet-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCoachBullet({ expId: exp.id, expIdx: idx, bIdx, text: b.text, role: exp.role });
                                setEvidenceCoachOpen(true);
                              }}
                              className="btn btn-secondary btn-icon btn-sm"
                              title="Evidence Coach"
                            >
                              <Sparkles size={13} color="var(--accent-primary)" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (resume.experiences || []).map(item => {
                                  if (item.id !== exp.id) return item;
                                  const bullets = (item.bullets || []).filter((_, bulletI) => bulletI !== bIdx);
                                  return { ...item, bullets };
                                });
                                updateResumeState({ ...resume, experiences: updated });
                              }}
                              className="btn btn-ghost btn-icon btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Delete Bullet"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (resume.experiences || []).map(item => {
                            if (item.id !== exp.id) return item;
                            const bullets = [...(item.bullets || []), { id: generateId(), text: '' }];
                            return { ...item, bullets };
                          });
                          updateResumeState({ ...resume, experiences: updated });
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                      >
                        <Plus size={12} /> Add Bullet Point
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSection === 'education' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Education</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Academic credentials, degrees, and relevant honors.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newEdu = {
                      id: generateId(),
                      degree: 'B.S. in Computer Science',
                      institution: 'University Name',
                      startDate: '2019',
                      endDate: '2023',
                      gpa: '3.8',
                      coursework: ['Data Structures', 'Algorithms']
                    };
                    updateResumeState({ ...resume, education: [newEdu, ...(resume.education || [])] });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>

              {(resume.education || []).map((edu, idx) => {
                const isDragging = draggedItemId === edu.id;
                const isOver = dragOverItemId === edu.id;
                const totalEdu = (resume.education || []).length;
                return (
                  <div
                    key={edu.id}
                    data-reorder-id={edu.id}
                    data-reorder-section="education"
                    className={`builder-item-card ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-drop-target' : ''}`}
                    draggable={activeDraggableId === edu.id}
                    onDragStart={(e) => handleItemDragStart(e, edu.id, 'education')}
                    onDragOver={(e) => handleItemDragOver(e, edu.id, 'education')}
                    onDragLeave={() => handleItemDragLeave(edu.id)}
                    onDrop={(e) => handleItemDrop(e, edu.id, 'education', idx)}
                    onDragEnd={handleItemDragEnd}
                  >
                    <div className="builder-item-card-header">
                      <div className="builder-card-header-left">
                        <div
                          className="builder-drag-handle"
                          title="Hold and drag to reorder"
                          aria-label="Hold and drag to reorder"
                          onMouseDown={() => setActiveDraggableId(edu.id)}
                          onMouseUp={() => setActiveDraggableId(null)}
                          onTouchStart={(e) => handleTouchStart(e, edu.id, 'education', idx)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                        >
                          <GripVertical size={16} />
                        </div>
                        <strong className="builder-item-card-title">{edu.degree || 'Degree'}</strong>
                      </div>

                      <div className="builder-card-header-actions">
                        <button
                          type="button"
                          onClick={() => {
                            const courseworkStr = Array.isArray(edu.coursework) ? edu.coursework.join(', ') : (edu.coursework || '');
                            setActiveSectionImprovement({
                              type: 'education',
                              title: `${edu.degree || 'Education'} (${edu.institution || 'Details'})`,
                              itemContext: { degree: edu.degree, institution: edu.institution, gpa: edu.gpa, coursework: edu.coursework },
                              originalText: courseworkStr || `${edu.degree || ''} at ${edu.institution || ''}`,
                              onApply: (improvedText, newSkills) => {
                                const items = improvedText.split(/[,\n]/).map(s => s.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
                                const updated = (resume.education || []).map(item =>
                                  item.id === edu.id ? { ...item, coursework: items.length > 0 ? items : item.coursework } : item
                                );
                                let updatedSkills = resume.skills || [];
                                if (newSkills && newSkills.length > 0) {
                                  const existing = new Set(updatedSkills.map(s => s.name?.toLowerCase()));
                                  const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: edu.institution || 'Education' }));
                                  updatedSkills = [...updatedSkills, ...toAdd];
                                }
                                updateResumeState({ ...resume, education: updated, skills: updatedSkills });
                              }
                            });
                            setSectionImprovementModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                          title="Enhance Education Details"
                        >
                          <Sparkles size={12} color="var(--accent-primary)" />
                          <span>✦ Enhance Education Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEducation(idx, -1)}
                          disabled={idx === 0}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Move up"
                          aria-label={`Move ${edu.degree || 'Education ' + (idx + 1)} up`}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEducation(idx, 1)}
                          disabled={idx === totalEdu - 1}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Move down"
                          aria-label={`Move ${edu.degree || 'Education ' + (idx + 1)} down`}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (resume.education || []).filter(item => item.id !== edu.id);
                            updateResumeState({ ...resume, education: updated });
                          }}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--danger)', padding: '4px 6px' }}
                          title="Delete Education"
                          aria-label={`Delete ${edu.degree || 'Education'}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="builder-grid-2">
                      <div className="builder-field">
                        <label>Degree / Qualification</label>
                        <input
                          type="text"
                          className="form-input"
                          value={edu.degree || ''}
                          placeholder="e.g. B.S. in Computer Science"
                          onChange={(e) => {
                            const updated = (resume.education || []).map(item =>
                              item.id === edu.id ? { ...item, degree: e.target.value } : item
                            );
                            updateResumeState({ ...resume, education: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <label>Institution / University</label>
                        <input
                          type="text"
                          className="form-input"
                          value={edu.institution || ''}
                          placeholder="e.g. Stanford University"
                          onChange={(e) => {
                            const updated = (resume.education || []).map(item =>
                              item.id === edu.id ? { ...item, institution: e.target.value } : item
                            );
                            updateResumeState({ ...resume, education: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="builder-grid-3">
                      <div className="builder-field">
                        <label>Start Date</label>
                        <input
                          type="text"
                          className="form-input"
                          value={edu.startDate || ''}
                          placeholder="e.g. 2019"
                          onChange={(e) => {
                            const updated = (resume.education || []).map(item =>
                              item.id === edu.id ? { ...item, startDate: e.target.value } : item
                            );
                            updateResumeState({ ...resume, education: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <label>Graduation / End Date</label>
                        <input
                          type="text"
                          className="form-input"
                          value={edu.endDate || ''}
                          placeholder="e.g. 2023"
                          onChange={(e) => {
                            const updated = (resume.education || []).map(item =>
                              item.id === edu.id ? { ...item, endDate: e.target.value } : item
                            );
                            updateResumeState({ ...resume, education: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <label>GPA (Optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={edu.gpa || ''}
                          placeholder="e.g. 3.85 / 4.0"
                          onChange={(e) => {
                            const updated = (resume.education || []).map(item =>
                              item.id === edu.id ? { ...item, gpa: e.target.value } : item
                            );
                            updateResumeState({ ...resume, education: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="builder-field">
                      <label>Coursework / Honors</label>
                      <TagInput
                        tags={Array.isArray(edu.coursework) ? edu.coursework : (edu.coursework ? [edu.coursework] : [])}
                        placeholder="Type coursework and press enter or comma..."
                        onChange={(newTags) => {
                          const updated = (resume.education || []).map(item =>
                            item.id === edu.id ? { ...item, coursework: newTags } : item
                          );
                          updateResumeState({ ...resume, education: updated });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Skills</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Core competencies and tools for ATS keyword parsing.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setResumeSkillsModalOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px' }}
                    title="Suggest skills evidenced across your entire resume & target role"
                  >
                    <Sparkles size={14} color="var(--accent-primary)" />
                    <span>✦ Suggest Skills</span>
                  </button>
                  <button
                    onClick={() => {
                      const newS = { id: generateId(), name: '', note: '' };
                      updateResumeState({ ...resume, skills: [...(resume.skills || []), newS] });
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={14} /> Add Skill
                  </button>
                </div>
              </div>

              {/* Quick Batch Skill Entry */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Quick Batch Add Skills (type multiple with commas or press enter):
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
                    const existingNames = new Set((resume.skills || []).map(s => s.name?.toLowerCase()));
                    const filtered = newSkills.filter(s => !existingNames.has(s.name.toLowerCase()));
                    if (filtered.length > 0) {
                      updateResumeState({ ...resume, skills: [...(resume.skills || []), ...filtered] });
                      addToast(`Added ${filtered.length} new skill(s)`, 'success');
                    }
                  }}
                />
              </div>

              {/* Quick Add Suggestions */}
              <div style={{ padding: '0.875rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Add Popular Skills:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Docker', 'AWS', 'System Design', 'REST APIs', 'Git', 'GraphQL', 'Kubernetes'].map((sk) => {
                    const exists = (resume.skills || []).some(s => s.name?.toLowerCase() === sk.toLowerCase());
                    if (exists) return null;
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => {
                          const newS = { id: generateId(), name: sk, note: '' };
                          updateResumeState({ ...resume, skills: [...(resume.skills || []), newS] });
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                      >
                        + {sk}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {(resume.skills || []).map((skill, idx) => (
                  <div key={skill.id || idx} className="builder-skills-row" style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Skill
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={skill.name || ''}
                        placeholder="e.g. Python"
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = (resume.skills || []).map((s, i) => i === idx ? { ...s, name: val } : s);
                          updateResumeState({ ...resume, skills: updated });
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Note (optional)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={skill.note !== undefined ? skill.note : (skill.proficiency || '')}
                        placeholder="e.g. Advanced, 2+ yrs, Frontend"
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = (resume.skills || []).map((s, i) => i === idx ? { ...s, note: val } : s);
                          updateResumeState({ ...resume, skills: updated });
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (resume.skills || []).filter((_, i) => i !== idx);
                        updateResumeState({ ...resume, skills: updated });
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)', marginTop: '21px', flexShrink: 0 }}
                      title="Delete Skill"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const newS = { id: generateId(), name: '', note: '' };
                    updateResumeState({ ...resume, skills: [...(resume.skills || []), newS] });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={14} /> Add Skill
                </button>
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Projects</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Portfolio artifacts, applications, and open-source contributions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newProj = {
                      id: generateId(),
                      name: 'New Project',
                      role: 'Lead Developer',
                      technologies: ['React', 'Node.js'],
                      link: '',
                      description: 'Overview of the project and measurable results.',
                      bullets: [{ id: generateId(), text: '' }]
                    };
                    updateResumeState({ ...resume, projects: [newProj, ...(resume.projects || [])] });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              {(resume.projects || []).map((proj, idx) => {
                const isDragging = draggedItemId === proj.id;
                const isOver = dragOverItemId === proj.id;
                const totalProj = (resume.projects || []).length;
                return (
                  <div
                    key={proj.id}
                    data-reorder-id={proj.id}
                    data-reorder-section="projects"
                    className={`builder-item-card ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-drop-target' : ''}`}
                    draggable={activeDraggableId === proj.id}
                    onDragStart={(e) => handleItemDragStart(e, proj.id, 'projects')}
                    onDragOver={(e) => handleItemDragOver(e, proj.id, 'projects')}
                    onDragLeave={() => handleItemDragLeave(proj.id)}
                    onDrop={(e) => handleItemDrop(e, proj.id, 'projects', idx)}
                    onDragEnd={handleItemDragEnd}
                  >
                    <div className="builder-item-card-header">
                      <div className="builder-card-header-left">
                        <div
                          className="builder-drag-handle"
                          title="Hold and drag to reorder"
                          aria-label="Hold and drag to reorder"
                          onMouseDown={() => setActiveDraggableId(proj.id)}
                          onMouseUp={() => setActiveDraggableId(null)}
                          onTouchStart={(e) => handleTouchStart(e, proj.id, 'projects', idx)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                        >
                          <GripVertical size={16} />
                        </div>
                        <strong className="builder-item-card-title">{proj.name || 'Project Name'}</strong>
                      </div>

                      <div className="builder-card-header-actions">
                        <button
                          type="button"
                          onClick={() => moveProject(idx, -1)}
                          disabled={idx === 0}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Move up"
                          aria-label={`Move ${proj.name || 'Project ' + (idx + 1)} up`}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProject(idx, 1)}
                          disabled={idx === totalProj - 1}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Move down"
                          aria-label={`Move ${proj.name || 'Project ' + (idx + 1)} down`}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (resume.projects || []).filter(item => item.id !== proj.id);
                            updateResumeState({ ...resume, projects: updated });
                          }}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--danger)', padding: '4px 6px' }}
                          title="Delete Project"
                          aria-label={`Delete ${proj.name || 'Project'}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="builder-grid-2">
                      <div className="builder-field">
                        <label>Project Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={proj.name || ''}
                          placeholder="e.g. AI Resume Engine"
                          onChange={(e) => {
                            const updated = (resume.projects || []).map(item =>
                              item.id === proj.id ? { ...item, name: e.target.value } : item
                            );
                            updateResumeState({ ...resume, projects: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <label>Your Role</label>
                        <input
                          type="text"
                          className="form-input"
                          value={proj.role || ''}
                          placeholder="e.g. Lead Architect"
                          onChange={(e) => {
                            const updated = (resume.projects || []).map(item =>
                              item.id === proj.id ? { ...item, role: e.target.value } : item
                            );
                            updateResumeState({ ...resume, projects: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="builder-grid-2">
                      <div className="builder-field">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{ margin: 0 }}>Technologies Used</label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveProjectForSkills(proj);
                              setProjectSkillsModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                            title="Suggest skills evidenced in this project"
                          >
                            <Sparkles size={12} color="var(--accent-primary)" />
                            <span>✦ Suggest Skills</span>
                          </button>
                        </div>
                        <TagInput
                          tags={Array.isArray(proj.technologies) ? proj.technologies : (proj.technologies ? [proj.technologies] : [])}
                          placeholder="Type technology and press enter or comma..."
                          allowReorder={true}
                          projectId={proj.id}
                          reorderAriaLabelPrefix={proj.name || 'project'}
                          onChange={(newTags) => {
                            const updated = (resume.projects || []).map(item =>
                              item.id === proj.id ? { ...item, technologies: newTags } : item
                            );
                            updateResumeState({ ...resume, projects: updated });
                          }}
                        />
                      </div>
                      <div className="builder-field">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{ margin: 0 }}>Live Link / Repository URL</label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveProjectForAnalyzer(proj);
                              setProjectAnalyzerOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                            title="Analyze public GitHub repo or website"
                          >
                            <Sparkles size={12} color="var(--accent-primary)" />
                            <span>✦ Analyze Project</span>
                          </button>
                        </div>
                        <input
                          type="url"
                          className="form-input"
                          value={proj.link || ''}
                          placeholder="https://project.live or https://github.com/user/repo"
                          onChange={(e) => {
                            const updated = (resume.projects || []).map(item =>
                              item.id === proj.id ? { ...item, link: e.target.value } : item
                            );
                            updateResumeState({ ...resume, projects: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className="builder-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ margin: 0 }}>Description & Quantifiable Highlights</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProjectForDesc(proj);
                            setProjectDescModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                          title="Generate concise, technical, role-targeted descriptions"
                        >
                          <Sparkles size={12} color="var(--accent-primary)" />
                          <span>✦ Generate Description</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        className="form-textarea"
                        value={proj.description || ''}
                        placeholder="Overview of the technical problem, solution architecture, and measurable results."
                        onChange={(e) => {
                          const updated = (resume.projects || []).map(item =>
                            item.id === proj.id ? { ...item, description: e.target.value } : item
                          );
                          updateResumeState({ ...resume, projects: updated });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSection === 'certifications' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Certifications</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Professional credentials, licenses, and verified certificates.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newCert = {
                      id: generateId(),
                      name: '',
                      issuer: '',
                      issueDate: '',
                      expiryDate: '',
                      credentialId: '',
                      credentialUrl: ''
                    };
                    updateResumeState({ ...resume, certifications: [newCert, ...(resume.certifications || [])] });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Certification
                </button>
              </div>

              {(resume.certifications || []).map((cert, idx) => (
                <div key={cert.id || idx} className="builder-item-card">
                  <div className="builder-item-card-header">
                    <strong className="builder-item-card-title">{cert.name || 'Certification Name'}</strong>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSectionImprovement({
                            type: 'certification',
                            title: cert.name || 'Certification',
                            itemContext: { name: cert.name, issuer: cert.issuer, credentialId: cert.credentialId },
                            originalText: `${cert.name || ''} issued by ${cert.issuer || ''}`.trim(),
                            onApply: (improvedText, newSkills) => {
                              if (newSkills && newSkills.length > 0) {
                                const existing = new Set((resume.skills || []).map(s => s.name?.toLowerCase()));
                                const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: cert.name || 'Certification' }));
                                if (toAdd.length > 0) {
                                  updateResumeState({ ...resume, skills: [...(resume.skills || []), ...toAdd] });
                                  addToast(`Added ${toAdd.length} certification skill(s)!`, 'success');
                                }
                              }
                            }
                          });
                          setSectionImprovementModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                        title="Suggest skills supported by this certification"
                      >
                        <Sparkles size={12} color="var(--accent-primary)" />
                        <span>✦ Suggest Certification Skills</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = resume.certifications.filter((_, i) => i !== idx);
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Delete Certification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Certification Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cert.name || ''}
                        placeholder="e.g. AWS Certified Solutions Architect"
                        onChange={(e) => {
                          const updated = [...resume.certifications];
                          updated[idx].name = e.target.value;
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Issuing Organization</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cert.issuer || ''}
                        placeholder="e.g. Amazon Web Services"
                        onChange={(e) => {
                          const updated = [...resume.certifications];
                          updated[idx].issuer = e.target.value;
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Issue Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cert.issueDate || ''}
                        placeholder="e.g. 2023 or June 2025"
                        onChange={(e) => {
                          const updated = [...resume.certifications];
                          updated[idx].issueDate = e.target.value;
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Expiry Date (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cert.expiryDate || ''}
                        placeholder="e.g. 2026 or June 2028"
                        onChange={(e) => {
                          const updated = [...resume.certifications];
                          updated[idx].expiryDate = e.target.value;
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ margin: '-0.25rem 0 0.5rem 0' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!cert.expiryDate}
                        onChange={(e) => {
                          const updated = [...resume.certifications];
                          if (e.target.checked) {
                            updated[idx].expiryDate = '';
                          }
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                      />
                      Does not expire / Lifetime credential
                    </label>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Credential ID / License #</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cert.credentialId || ''}
                        placeholder="e.g. AWS-PSA-123456"
                        onChange={(e) => {
                          const updated = [...resume.certifications];
                          updated[idx].credentialId = e.target.value;
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Verification URL / Link</label>
                      <input
                        type="url"
                        className="form-input"
                        value={cert.credentialUrl || cert.url || ''}
                        placeholder="https://verify.certificate"
                        onChange={(e) => {
                          const updated = [...resume.certifications];
                          updated[idx].credentialUrl = e.target.value;
                          updated[idx].url = e.target.value;
                          updateResumeState({ ...resume, certifications: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'publications' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Publications & Research</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Academic research papers, conference presentations, and technical writing.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newPub = {
                      id: generateId(),
                      title: '',
                      publisher: '',
                      date: '',
                      url: '',
                      summary: '',
                      description: ''
                    };
                    const visibility = { ...(resume.sectionVisibility || {}), publications: true };
                    updateResumeState({ ...resume, publications: [newPub, ...(resume.publications || [])], sectionVisibility: visibility });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Publication
                </button>
              </div>

              {(resume.publications || []).map((pub, idx) => (
                <div key={pub.id || idx} className="builder-item-card">
                  <div className="builder-item-card-header">
                    <strong className="builder-item-card-title">{pub.title || 'Publication Title'}</strong>
                    <button
                      onClick={() => {
                        const updated = resume.publications.filter((_, i) => i !== idx);
                        updateResumeState({ ...resume, publications: updated });
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Publication"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={pub.title || ''}
                        placeholder="e.g. Distributed Consensus in Cloud Systems"
                        onChange={(e) => {
                          const updated = [...resume.publications];
                          updated[idx].title = e.target.value;
                          updateResumeState({ ...resume, publications: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Publisher / Journal</label>
                      <input
                        type="text"
                        className="form-input"
                        value={pub.publisher || ''}
                        placeholder="e.g. IEEE Transactions on Software Engineering"
                        onChange={(e) => {
                          const updated = [...resume.publications];
                          updated[idx].publisher = e.target.value;
                          updateResumeState({ ...resume, publications: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={pub.date || ''}
                        placeholder="e.g. Oct 2023"
                        onChange={(e) => {
                          const updated = [...resume.publications];
                          updated[idx].date = e.target.value;
                          updateResumeState({ ...resume, publications: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Link / DOI URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={pub.url || ''}
                        placeholder="https://doi.org/..."
                        onChange={(e) => {
                          const updated = [...resume.publications];
                          updated[idx].url = e.target.value;
                          updateResumeState({ ...resume, publications: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="builder-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ margin: 0 }}>Summary / Abstract</label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSectionImprovement({
                            type: 'publication',
                            title: pub.title || 'Publication',
                            itemContext: { title: pub.title, publisher: pub.publisher, date: pub.date },
                            originalText: pub.summary || pub.description || `${pub.title || ''} published with ${pub.publisher || ''}`.trim(),
                            onApply: (improvedText, newSkills) => {
                              const updated = [...resume.publications];
                              updated[idx].summary = improvedText;
                              updated[idx].description = improvedText;
                              let updatedSkills = resume.skills || [];
                              if (newSkills && newSkills.length > 0) {
                                const existing = new Set(updatedSkills.map(s => s.name?.toLowerCase()));
                                const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: 'Publication' }));
                                updatedSkills = [...updatedSkills, ...toAdd];
                              }
                              updateResumeState({ ...resume, publications: updated, skills: updatedSkills });
                            }
                          });
                          setSectionImprovementModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                        title="Improve publication description"
                      >
                        <Sparkles size={12} color="var(--accent-primary)" />
                        <span>✦ Improve Publication Description</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      value={pub.summary || pub.description || ''}
                      placeholder="Brief summary or abstract of the research contribution..."
                      onChange={(e) => {
                        const updated = [...resume.publications];
                        updated[idx].summary = e.target.value;
                        updated[idx].description = e.target.value;
                        updateResumeState({ ...resume, publications: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'awards' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Honors & Awards</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Competitive accomplishments, hackathon wins, and recognition.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newAward = {
                      id: generateId(),
                      title: '',
                      issuer: '',
                      date: '',
                      description: ''
                    };
                    const visibility = { ...(resume.sectionVisibility || {}), awards: true };
                    updateResumeState({ ...resume, awards: [newAward, ...(resume.awards || [])], sectionVisibility: visibility });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Award
                </button>
              </div>

              {(resume.awards || []).map((award, idx) => (
                <div key={award.id || idx} className="builder-item-card">
                  <div className="builder-item-card-header">
                    <strong className="builder-item-card-title">{award.title || 'Award Title'}</strong>
                    <button
                      onClick={() => {
                        const updated = resume.awards.filter((_, i) => i !== idx);
                        updateResumeState({ ...resume, awards: updated });
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Award"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Award Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={award.title || ''}
                        placeholder="e.g. 1st Place - Global Hackathon"
                        onChange={(e) => {
                          const updated = [...resume.awards];
                          updated[idx].title = e.target.value;
                          updateResumeState({ ...resume, awards: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Issuing Organization</label>
                      <input
                        type="text"
                        className="form-input"
                        value={award.issuer || ''}
                        placeholder="e.g. TechCrunch / Major League Hacking"
                        onChange={(e) => {
                          const updated = [...resume.awards];
                          updated[idx].issuer = e.target.value;
                          updateResumeState({ ...resume, awards: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Date Received</label>
                      <input
                        type="text"
                        className="form-input"
                        value={award.date || ''}
                        placeholder="e.g. 2024 or Oct 2023"
                        onChange={(e) => {
                          const updated = [...resume.awards];
                          updated[idx].date = e.target.value;
                          updateResumeState({ ...resume, awards: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ margin: 0 }}>Description & Scope</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSectionImprovement({
                              type: 'award',
                              title: award.title || 'Award',
                              itemContext: { title: award.title, issuer: award.issuer, date: award.date },
                              originalText: award.description || `${award.title || ''} awarded by ${award.issuer || ''}`.trim(),
                              onApply: (improvedText, newSkills) => {
                                const updated = [...resume.awards];
                                updated[idx].description = improvedText;
                                let updatedSkills = resume.skills || [];
                                if (newSkills && newSkills.length > 0) {
                                  const existing = new Set(updatedSkills.map(s => s.name?.toLowerCase()));
                                  const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: 'Award' }));
                                  updatedSkills = [...updatedSkills, ...toAdd];
                                }
                                updateResumeState({ ...resume, awards: updated, skills: updatedSkills });
                              }
                            });
                            setSectionImprovementModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                          title="Improve achievement description"
                        >
                          <Sparkles size={12} color="var(--accent-primary)" />
                          <span>✦ Improve Achievement Description</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        value={award.description || ''}
                        placeholder="Brief note on context and accomplishment"
                        onChange={(e) => {
                          const updated = [...resume.awards];
                          updated[idx].description = e.target.value;
                          updateResumeState({ ...resume, awards: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'volunteer' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Volunteer Experience</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Community contributions, non-profit leadership, and mentorship.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newVol = {
                      id: generateId(),
                      organization: '',
                      role: '',
                      startDate: '',
                      endDate: '',
                      description: ''
                    };
                    const visibility = { ...(resume.sectionVisibility || {}), volunteer: true };
                    updateResumeState({ ...resume, volunteer: [newVol, ...(resume.volunteer || [])], sectionVisibility: visibility });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Volunteer
                </button>
              </div>

              {(resume.volunteer || []).map((vol, idx) => (
                <div key={vol.id || idx} className="builder-item-card">
                  <div className="builder-item-card-header">
                    <strong className="builder-item-card-title">{vol.organization || 'Organization'}</strong>
                    <button
                      onClick={() => {
                        const updated = resume.volunteer.filter((_, i) => i !== idx);
                        updateResumeState({ ...resume, volunteer: updated });
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Volunteer Entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Role</label>
                      <input
                        type="text"
                        className="form-input"
                        value={vol.role || ''}
                        placeholder="e.g. Code Mentor"
                        onChange={(e) => {
                          const updated = [...resume.volunteer];
                          updated[idx].role = e.target.value;
                          updateResumeState({ ...resume, volunteer: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>Organization</label>
                      <input
                        type="text"
                        className="form-input"
                        value={vol.organization || ''}
                        placeholder="e.g. Women Who Code"
                        onChange={(e) => {
                          const updated = [...resume.volunteer];
                          updated[idx].organization = e.target.value;
                          updateResumeState({ ...resume, volunteer: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="builder-grid-2">
                    <div className="builder-field">
                      <label>Start Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={vol.startDate || ''}
                        placeholder="e.g. 2022"
                        onChange={(e) => {
                          const updated = [...resume.volunteer];
                          updated[idx].startDate = e.target.value;
                          updateResumeState({ ...resume, volunteer: updated });
                        }}
                      />
                    </div>
                    <div className="builder-field">
                      <label>End Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={vol.endDate || ''}
                        placeholder="e.g. Present or 2024"
                        onChange={(e) => {
                          const updated = [...resume.volunteer];
                          updated[idx].endDate = e.target.value;
                          updateResumeState({ ...resume, volunteer: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="builder-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ margin: 0 }}>Description</label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSectionImprovement({
                            type: 'volunteer',
                            title: `${vol.role || 'Volunteer'} at ${vol.organization || 'Org'}`,
                            itemContext: { role: vol.role, organization: vol.organization, startDate: vol.startDate, endDate: vol.endDate },
                            originalText: vol.description || `${vol.role || ''} at ${vol.organization || ''}`.trim(),
                            onApply: (improvedText, newSkills) => {
                              const updated = [...resume.volunteer];
                              updated[idx].description = improvedText;
                              let updatedSkills = resume.skills || [];
                              if (newSkills && newSkills.length > 0) {
                                const existing = new Set(updatedSkills.map(s => s.name?.toLowerCase()));
                                const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: 'Volunteer' }));
                                updatedSkills = [...updatedSkills, ...toAdd];
                              }
                              updateResumeState({ ...resume, volunteer: updated, skills: updatedSkills });
                            }
                          });
                          setSectionImprovementModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                        title="Improve volunteer description"
                      >
                        <Sparkles size={12} color="var(--accent-primary)" />
                        <span>✦ Improve Volunteer Description</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      value={vol.description || ''}
                      placeholder="Details of volunteer contributions and community impact."
                      onChange={(e) => {
                        const updated = [...resume.volunteer];
                        updated[idx].description = e.target.value;
                        updateResumeState({ ...resume, volunteer: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'custom' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Custom Sections</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Add bespoke sections for patents, speaking engagements, languages, or personal interests.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newCs = {
                      id: generateId(),
                      title: '',
                      content: ''
                    };
                    const visibility = { ...(resume.sectionVisibility || {}), custom: true };
                    updateResumeState({ ...resume, customSections: [newCs, ...(resume.customSections || [])], sectionVisibility: visibility });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add Custom Section
                </button>
              </div>

              {(resume.customSections || []).map((cs, idx) => (
                <div key={cs.id || idx} className="builder-item-card">
                  <div className="builder-item-card-header">
                    <strong className="builder-item-card-title">{cs.title || 'Custom Section'}</strong>
                    <button
                      onClick={() => {
                        const updated = resume.customSections.filter((_, i) => i !== idx);
                        updateResumeState({ ...resume, customSections: updated });
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Custom Section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="builder-field">
                    <label>Section Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cs.title || ''}
                      placeholder="e.g. Languages / Patents / Speaking"
                      onChange={(e) => {
                        const updated = [...resume.customSections];
                        updated[idx].title = e.target.value;
                        updateResumeState({ ...resume, customSections: updated });
                      }}
                    />
                  </div>
                  <div className="builder-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ margin: 0 }}>Content</label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSectionImprovement({
                            type: 'custom',
                            title: cs.title || 'Custom Section',
                            itemContext: { title: cs.title },
                            originalText: cs.content || cs.title || '',
                            onApply: (improvedText, newSkills) => {
                              const updated = [...resume.customSections];
                              updated[idx].content = improvedText;
                              let updatedSkills = resume.skills || [];
                              if (newSkills && newSkills.length > 0) {
                                const existing = new Set(updatedSkills.map(s => s.name?.toLowerCase()));
                                const toAdd = newSkills.filter(s => !existing.has(s.toLowerCase())).map(name => ({ id: generateId(), name, note: cs.title || 'Custom' }));
                                updatedSkills = [...updatedSkills, ...toAdd];
                              }
                              updateResumeState({ ...resume, customSections: updated, skills: updatedSkills });
                            }
                          });
                          setSectionImprovementModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '4px', fontSize: '0.75rem', padding: '2px 8px', height: '26px' }}
                        title="Improve description"
                      >
                        <Sparkles size={12} color="var(--accent-primary)" />
                        <span>✦ Improve Description</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      value={cs.content || ''}
                      placeholder="Enter section content or details..."
                      onChange={(e) => {
                        const updated = [...resume.customSections];
                        updated[idx].content = e.target.value;
                        updateResumeState({ ...resume, customSections: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'formatting' && (
            <div className="builder-content-section">
              <div className="builder-section-header">
                <div>
                  <h4 className="builder-section-title">Typography & Layout Styling</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Customize visual layout theme presets and primary brand accents.
                  </p>
                </div>
              </div>

              <div className="builder-field">
                <label>Template Preset</label>
                <select
                  className="form-select"
                  value={resume.template || 'ats-classic'}
                  onChange={(e) => updateResumeState({ ...resume, template: e.target.value })}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="builder-field">
                <label>Accent Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                  {['#0284c7', '#059669', '#7c2d12', '#312e81', '#18181b', '#ec4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateResumeState({ ...resume, formatting: { ...(resume.formatting || {}), accentColor: c } })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: resume.formatting?.accentColor === c ? '2px solid #ffffff' : 'none',
                        outline: resume.formatting?.accentColor === c ? '2px solid var(--accent-primary)' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                      title={`Select ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      }
      rightPane={
        <div
          className="builder-preview-pane"
          style={{
            height: '100%',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Zoom controls */}
          <div className="no-print" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                LIVE CANONICAL PREVIEW
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)', backgroundColor: 'rgba(2, 132, 199, 0.1)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                ✎ Click any section to edit
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setZoomScale(Math.max(0.6, zoomScale - 0.1))} className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>-</button>
              <span style={{ fontSize: '0.75rem', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoomScale * 100)}%</span>
              <button onClick={() => setZoomScale(Math.min(1.3, zoomScale + 0.1))} className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>+</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ResumeRenderer
              resume={resume}
              scale={zoomScale}
              onSectionClick={(secKey) => {
                setActiveWorkflowTab('content');
                const target = secKey === 'summary' ? 'personal' : secKey;
                setActiveSection(target);
                addToast(`Editing ${target.charAt(0).toUpperCase() + target.slice(1)} section`, 'info');
              }}
            />
          </div>
        </div>
      }
    />

      {/* Signature Modals */}
      {parserPreviewOpen && (
        <ParserPreviewModal
          resume={resume}
          isOpen={true}
          onClose={() => setParserPreviewOpen(false)}
        />
      )}

      {truthLedgerOpen && (
        <TruthLedgerModal
          resume={resume}
          onUpdateResume={(updated) => updateResumeState(updated)}
          isOpen={true}
          onClose={() => setTruthLedgerOpen(false)}
        />
      )}

      {evidenceCoachOpen && (
        <EvidenceCoachModal
          initialText={activeCoachBullet?.text || ''}
          initialRole={activeCoachBullet?.role || resume.targetRole || resume.personal?.title || ''}
          onApplyBullet={handleApplyCoachBullet}
          isOpen={true}
          onClose={() => setEvidenceCoachOpen(false)}
        />
      )}

      {diffModalOpen && (
        <VersionDiffModal
          originalResume={originalResume}
          tailoredResume={resume}
          isOpen={true}
          onClose={() => setDiffModalOpen(false)}
        />
      )}

      {exportModalFormat && (
        <ExportValidatorModal
          resume={resume}
          format={exportModalFormat}
          onConfirmExport={executeExport}
          onCancel={() => setExportModalFormat(null)}
        />
      )}

      {shareModalOpen && (
        <ShareResumeModal
          resume={resume}
          isOpen={true}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {templateSelectorOpen && (
        <TemplateSelectorModal
          currentTemplate={resume.template || 'ats-classic'}
          onSelectTemplate={(newTmpl) => {
            const photoReadyTemplates = ['modern-professional', 'creative', 'silicon-valley', 'berlin-modern', 'corporate-navy', 'emerald-compact'];
            const isPhotoTmpl = photoReadyTemplates.includes(newTmpl);
            const updatedPersonal = { ...resume.personal };
            if (isPhotoTmpl && !updatedPersonal.photoUrl) {
              updatedPersonal.photoUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(resume.personal?.fullName || user?.name || 'User')}`;
            }
            if (isPhotoTmpl && updatedPersonal.showPhoto === undefined) {
              updatedPersonal.showPhoto = true;
            }
            updateResumeState({ ...resume, template: newTmpl, personal: updatedPersonal });
          }}
          isOpen={true}
          onClose={() => setTemplateSelectorOpen(false)}
        />
      )}

      {/* Gemini AI Resume Review Modal */}
      {aiReviewOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                    Gemini AI Resume Review
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    AI-powered diagnostic and specific modification advice
                  </span>
                </div>
              </div>
              <button onClick={() => setAiReviewOpen(false)} className="btn btn-ghost btn-icon btn-sm">
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
              {aiReviewLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={28} className="spin-slow" style={{ margin: '0 auto 12px auto', color: 'var(--accent-primary)' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Analyzing resume with Google Gemini 2.5...</p>
                  <span style={{ fontSize: '0.75rem' }}>Evaluating ATS parser safety, keyword density, and bullet impact</span>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  {aiReviewData?.split('\n').map((line, idx) => {
                    const escapeHtml = (str) => {
                      if (!str) return '';
                      return String(str)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    };

                    if (line.startsWith('### ')) {
                      return <h4 key={idx} style={{ margin: '14px 0 6px 0', fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('## ') || line.startsWith('# ')) {
                      return <h3 key={idx} style={{ margin: '16px 0 8px 0', fontSize: '1.05rem', fontWeight: 700 }}>{line.replace(/^#+\s*/, '')}</h3>;
                    }
                    if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
                      const bullet = line.replace(/^[-•*]\s+/, '');
                      const safeHtml = escapeHtml(bullet).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return (
                        <li key={idx} style={{ margin: '4px 0', fontSize: '0.8125rem' }}>
                          <span dangerouslySetInnerHTML={{ __html: safeHtml }} />
                        </li>
                      );
                    }
                    if (/^\d+\.\s+/.test(line)) {
                      const safeHtml = escapeHtml(line).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return (
                        <div key={idx} style={{ margin: '6px 0', fontSize: '0.8125rem', paddingLeft: '4px' }}>
                          <span dangerouslySetInnerHTML={{ __html: safeHtml }} />
                        </div>
                      );
                    }
                    if (!line.trim()) return <div key={idx} style={{ height: '6px' }} />;
                    const safeHtml = escapeHtml(line).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return (
                      <p key={idx} style={{ margin: '4px 0', fontSize: '0.8125rem' }} dangerouslySetInnerHTML={{ __html: safeHtml }} />
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Powered by Gemini 2.5 Flash
              </span>
              <button onClick={() => setAiReviewOpen(false)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Context-Aware AI Modals */}
      {projectAnalyzerOpen && activeProjectForAnalyzer && (
        <ProjectAnalyzerModal
          project={activeProjectForAnalyzer}
          targetRole={resume.targetRole || resume.personal?.title}
          jobDescription={typeof resume.jobDescription === 'string' ? resume.jobDescription : resume.jobDescription?.rawText}
          isOpen={true}
          onClose={() => {
            setProjectAnalyzerOpen(false);
            setActiveProjectForAnalyzer(null);
          }}
          onApplyToProject={(updates) => {
            const updatedProjects = (resume.projects || []).map(p => {
              if (p.id !== activeProjectForAnalyzer.id) return p;
              let newTech = p.technologies || [];
              if (updates.technologies && updates.technologies.length > 0) {
                const existingTech = new Set(newTech.map(t => t.toLowerCase()));
                const toAdd = updates.technologies.filter(t => !existingTech.has(t.toLowerCase()));
                newTech = [...newTech, ...toAdd];
              }
              return {
                ...p,
                description: updates.description || p.description,
                technologies: newTech
              };
            });
            updateResumeState({ ...resume, projects: updatedProjects });
            addToast('Project updated with accepted analysis!', 'success');
            setProjectAnalyzerOpen(false);
            setActiveProjectForAnalyzer(null);
          }}
        />
      )}

      {projectDescModalOpen && activeProjectForDesc && (
        <ProjectDescriptionModal
          project={activeProjectForDesc}
          targetRole={resume.targetRole || resume.personal?.title}
          jobDescription={typeof resume.jobDescription === 'string' ? resume.jobDescription : resume.jobDescription?.rawText}
          isOpen={true}
          onClose={() => {
            setProjectDescModalOpen(false);
            setActiveProjectForDesc(null);
          }}
          onApplyDescription={(newDesc) => {
            const updatedProjects = (resume.projects || []).map(p =>
              p.id === activeProjectForDesc.id ? { ...p, description: newDesc } : p
            );
            updateResumeState({ ...resume, projects: updatedProjects });
            addToast('Updated project description!', 'success');
            setProjectDescModalOpen(false);
            setActiveProjectForDesc(null);
          }}
        />
      )}

      {projectSkillsModalOpen && activeProjectForSkills && (
        <SkillSuggestionsModal
          resume={resume}
          targetRole={resume.targetRole || resume.personal?.title}
          jobDescription={typeof resume.jobDescription === 'string' ? resume.jobDescription : resume.jobDescription?.rawText}
          projectContext={{
            name: activeProjectForSkills.name,
            description: activeProjectForSkills.description,
            technologies: activeProjectForSkills.technologies
          }}
          isOpen={true}
          onClose={() => {
            setProjectSkillsModalOpen(false);
            setActiveProjectForSkills(null);
          }}
          onAddSkills={(newSkills) => {
            let updatedProjects = resume.projects || [];
            if (activeProjectForSkills.id) {
              updatedProjects = updatedProjects.map(p => {
                if (p.id !== activeProjectForSkills.id) return p;
                const existingTech = new Set((p.technologies || []).map(t => t.toLowerCase()));
                const toAdd = newSkills.filter(s => !existingTech.has(s.toLowerCase()));
                return { ...p, technologies: [...(p.technologies || []), ...toAdd] };
              });
            }
            const existingResumeSkills = new Set((resume.skills || []).map(s => s.name?.toLowerCase()));
            const toAddToResume = newSkills
              .filter(s => !existingResumeSkills.has(s.toLowerCase()))
              .map(name => ({ id: generateId(), name, note: activeProjectForSkills.name || '' }));

            updateResumeState({
              ...resume,
              projects: updatedProjects,
              skills: [...(resume.skills || []), ...toAddToResume]
            });
            addToast(`Added ${newSkills.length} skill(s)!`, 'success');
            setProjectSkillsModalOpen(false);
            setActiveProjectForSkills(null);
          }}
        />
      )}

      {resumeSkillsModalOpen && (
        <SkillSuggestionsModal
          resume={resume}
          targetRole={resume.targetRole || resume.personal?.title}
          jobDescription={typeof resume.jobDescription === 'string' ? resume.jobDescription : resume.jobDescription?.rawText}
          isOpen={true}
          onClose={() => setResumeSkillsModalOpen(false)}
          onAddSkills={(newSkills) => {
            const existing = new Set((resume.skills || []).map(s => s.name?.toLowerCase()));
            const toAdd = newSkills
              .filter(s => !existing.has(s.toLowerCase()))
              .map(name => ({ id: generateId(), name, note: '' }));
            if (toAdd.length > 0) {
              updateResumeState({ ...resume, skills: [...(resume.skills || []), ...toAdd] });
              addToast(`Added ${toAdd.length} evidence-backed skill(s)!`, 'success');
            }
            setResumeSkillsModalOpen(false);
          }}
        />
      )}

      {sectionImprovementModalOpen && activeSectionImprovement && (
        <SectionImprovementModal
          type={activeSectionImprovement.type}
          title={activeSectionImprovement.title}
          itemContext={activeSectionImprovement.itemContext}
          originalText={activeSectionImprovement.originalText}
          targetRole={resume.targetRole || resume.personal?.title}
          jobDescription={typeof resume.jobDescription === 'string' ? resume.jobDescription : resume.jobDescription?.rawText}
          isOpen={true}
          onClose={() => {
            setSectionImprovementModalOpen(false);
            setActiveSectionImprovement(null);
          }}
          onApply={(improvedText, newSkills) => {
            if (activeSectionImprovement.onApply) {
              activeSectionImprovement.onApply(improvedText, newSkills);
            }
            setSectionImprovementModalOpen(false);
            setActiveSectionImprovement(null);
          }}
        />
      )}

      {roleAnalysisModalOpen && (
        <RoleAnalysisModal
          resume={resume}
          initialTab={roleAnalysisInitialTab}
          isOpen={true}
          onClose={() => setRoleAnalysisModalOpen(false)}
          onApplyOptimization={(proposed) => {
            let updatedResume = { ...resume };
            if (proposed.summary) {
              updatedResume.personal = { ...updatedResume.personal, summary: proposed.summary };
            }
            if (proposed.experiences && proposed.experiences.length > 0) {
              updatedResume.experiences = (updatedResume.experiences || []).map(exp => {
                const match = proposed.experiences.find(pe => pe.id === exp.id || (pe.role === exp.role && pe.company === exp.company));
                if (match && match.suggestedBullets) {
                  return {
                    ...exp,
                    bullets: match.suggestedBullets.map((text, i) => ({
                      id: (exp.bullets && exp.bullets[i]?.id) || generateId(),
                      text
                    }))
                  };
                }
                return exp;
              });
            }
            if (proposed.projects && proposed.projects.length > 0) {
              updatedResume.projects = (updatedResume.projects || []).map(proj => {
                const match = proposed.projects.find(pp => pp.id === proj.id || pp.name === proj.name);
                if (match && match.suggestedDescription) {
                  return { ...proj, description: match.suggestedDescription };
                }
                return proj;
              });
            }
            if (proposed.skills && proposed.skills.length > 0) {
              const existing = new Set((updatedResume.skills || []).map(s => s.name?.toLowerCase()));
              const toAdd = proposed.skills
                .filter(s => !existing.has(s.toLowerCase()))
                .map(name => ({ id: generateId(), name, note: 'Target Role' }));
              updatedResume.skills = [...(updatedResume.skills || []), ...toAdd];
            }
            updateResumeState(updatedResume);
            addToast('Applied accepted role-targeted optimizations!', 'success');
          }}
        />
      )}
      </div>
    </PageTransition>
  );
};

export default ResumeBuilder;
