import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Printer, Trash2, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/motion/PageTransition';
import AiProcessingIndicator from '../components/motion/AiProcessingIndicator';
import {
  STORAGE_KEYS,
  getDraft,
  saveDraft,
  clearDraft,
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory
} from '../utils/storageService';

const CoverLetterBuilder = () => {
  const { addToast } = useToast();

  // Hydrate draft synchronously on mount
  const savedDraft = getDraft(STORAGE_KEYS.COVER_LETTER_DRAFT, {});

  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(savedDraft?.selectedResumeId || '');
  const [jobTitle, setJobTitle] = useState(savedDraft?.jobTitle || '');
  const [company, setCompany] = useState(savedDraft?.company || '');
  const [hiringManager, setHiringManager] = useState(savedDraft?.hiringManager || '');
  const [jobDescription, setJobDescription] = useState(savedDraft?.jobDescription || '');
  const [tone, setTone] = useState(savedDraft?.tone || 'confident');
  const [generatedLetter, setGeneratedLetter] = useState(savedDraft?.generatedLetter || '');
  const [quality, setQuality] = useState(savedDraft?.quality || null);
  const [matchedSkills, setMatchedSkills] = useState(savedDraft?.matchedSkills || []);
  const [isGeminiPowered, setIsGeminiPowered] = useState(savedDraft?.isGeminiPowered || false);
  const [generationError, setGenerationError] = useState(null);
  const [recentHistory, setRecentHistory] = useState(() => getHistory(STORAGE_KEYS.COVER_LETTER_HISTORY));
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  // Sync draft to localStorage on any field or live editor change
  useEffect(() => {
    saveDraft(STORAGE_KEYS.COVER_LETTER_DRAFT, {
      selectedResumeId,
      jobTitle,
      company,
      hiringManager,
      jobDescription,
      tone,
      generatedLetter,
      quality,
      matchedSkills,
      isGeminiPowered
    });
  }, [selectedResumeId, jobTitle, company, hiringManager, jobDescription, tone, generatedLetter, quality, matchedSkills, isGeminiPowered]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, resumesRes] = await Promise.allSettled([
          api.get('/career-profile'),
          api.get('/resumes')
        ]);
        if (profileRes.status === 'fulfilled' && profileRes.value.data.success && profileRes.value.data.profile) {
          setProfile(profileRes.value.data.profile);
        }
        if (resumesRes.status === 'fulfilled' && resumesRes.value.data.success && Array.isArray(resumesRes.value.data.resumes)) {
          setResumes(resumesRes.value.data.resumes);
          if (resumesRes.value.data.resumes.length > 0 && !selectedResumeId) {
            setSelectedResumeId(resumesRes.value.data.resumes[0]._id);
          }
        }
      } catch {}
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearDraft = () => {
    setSelectedResumeId('');
    setJobTitle('');
    setCompany('');
    setHiringManager('');
    setJobDescription('');
    setTone('confident');
    setGeneratedLetter('');
    setQuality(null);
    setMatchedSkills([]);
    setIsGeminiPowered(false);
    setGenerationError(null);
    clearDraft(STORAGE_KEYS.COVER_LETTER_DRAFT);
    addToast('Cover letter draft cleared.', 'info');
  };

  const handleReopenHistory = (item) => {
    if (!item) return;
    setJobTitle(item.jobTitle || '');
    setCompany(item.company || '');
    setHiringManager(item.hiringManager || '');
    setTone(item.tone || 'confident');
    setJobDescription(item.jobDescription || '');
    setGeneratedLetter(item.letter || '');
    setQuality(item.quality || null);
    setMatchedSkills(item.matchedSkills || []);
    addToast(`Restored cover letter for ${item.jobTitle || 'role'} at ${item.company || 'company'}`, 'info');
  };

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !company.trim()) {
      addToast('Please enter both target role and company name.', 'warning');
      return;
    }

    if (jobDescription && jobDescription.length > 8000) {
      addToast('Job description exceeds 8,000 characters. Please condense it.', 'warning');
      return;
    }

    setLoading(true);
    setGenerationError(null);

    try {
      const res = await api.post('/cover-letter/generate', {
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        hiringManager: hiringManager.trim(),
        jobDescription: jobDescription.trim(),
        tone,
        resumeId: selectedResumeId || undefined
      });

      if (res.data.success) {
        const letter = res.data.fullLetter || res.data.coverLetter;
        if (letter) {
          setGeneratedLetter(letter);
          const letterQuality = res.data.quality || null;
          const letterSkills = res.data.matchedSkills || [];
          const geminiUsed = Boolean(res.data.isGeminiPowered);

          if (letterQuality) setQuality(letterQuality);
          if (letterSkills) setMatchedSkills(letterSkills);
          setIsGeminiPowered(geminiUsed);

          // Add to persistent recent history (max 5 items, deduplicated)
          const historyItem = {
            id: 'cl_' + Date.now(),
            createdAt: new Date().toISOString(),
            jobTitle: jobTitle || 'Target Role',
            company: company || 'Target Employer',
            hiringManager: hiringManager || '',
            tone,
            jobDescription,
            letter,
            quality: letterQuality,
            matchedSkills: letterSkills,
            isGeminiPowered: geminiUsed
          };
          const updated = addToHistory(STORAGE_KEYS.COVER_LETTER_HISTORY, historyItem, (existing, newItem) => {
            return (
              existing.jobTitle?.toLowerCase() === newItem.jobTitle?.toLowerCase() &&
              existing.company?.toLowerCase() === newItem.company?.toLowerCase() &&
              (existing.hiringManager || '') === (newItem.hiringManager || '') &&
              existing.tone === newItem.tone &&
              existing.jobDescription?.trim() === newItem.jobDescription?.trim()
            );
          });
          setRecentHistory(updated);

          addToast(geminiUsed ? '✨ Evidence-grounded cover letter generated with Gemini AI!' : 'Cover letter generated from verified profile facts.', 'success');
        } else {
          throw new Error('Server returned an empty cover letter.');
        }
      } else {
        throw new Error(res.data.message || 'Generation failed.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to generate cover letter. Please check your inputs and try again.';
      setGenerationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    addToast('Cover letter copied to clipboard.', 'success');
  };

  const handlePrintOrExport = () => {
    if (!generatedLetter) {
      addToast('Please generate or write your cover letter first.', 'warning');
      return;
    }
    window.print();
  };

  const candidateName = profile?.personal?.fullName || 'Candidate Name';
  const candidateEmail = profile?.personal?.email || '';
  const candidatePhone = profile?.personal?.phone || '';
  const candidateLocation = profile?.personal?.location || '';
  const todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PageTransition>
      <div className="page-container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        {/* Screen Header */}
        <div
          className="no-print"
          style={{
            marginBottom: 'var(--space-xl)',
            paddingTop: 'var(--space-sm)'
          }}
        >
        <span className="eyebrow">Document Intelligence</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="display-md" style={{ margin: '0 0 var(--space-xs) 0' }}>
              Cover Letter Generator
            </h1>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Generate tailored letters grounded in your verified career history, with live editing and ISO A4 PDF export.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {(jobTitle || company || jobDescription || generatedLetter) && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={14} /> Clear Draft
              </button>
            )}

            {generatedLetter && (
              <>
                <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                  <Copy size={14} /> Copy Text
                </button>
                <button onClick={handlePrintOrExport} className="btn btn-primary btn-sm">
                  <Printer size={14} /> Export PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Left: Input Form & Recent History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Target Role & Tone</h2>

            <div className="form-group">
              <label className="form-label">Target Role / Title *</label>
              <input
                type="text"
                className="form-input"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="form-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hiring Manager Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                placeholder="e.g. Jane Smith"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tone</label>
              <select
                className="form-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="confident">Confident & Action-Oriented</option>
                <option value="formal">Formal & Traditional</option>
                <option value="conversational">Conversational & Modern</option>
                <option value="technical">Technical & Systems-Focused</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Posting Requirements (Optional)</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key posting bullet points to guide keyword tailoring..."
              />
            </div>

            {resumes.length > 0 && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Grounding Source</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Truth Anchor</span>
                </label>
                <select
                  className="form-select"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                  <option value="">Full Career Profile (All Verified Facts)</option>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>
                      Resume: {r.title} ({r.targetRole || 'General'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !jobTitle.trim() || !company.trim()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Sparkles size={16} className={loading ? 'spin-slow' : ''} />
              {loading ? 'Generating cover letter...' : 'Generate Letter'}
            </button>
          </div>

          {/* Recent History */}
          {recentHistory.length > 0 && (
            <div style={{ padding: 'var(--space-md) var(--space-lg)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recent Letters ({recentHistory.length}/5)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearHistory(STORAGE_KEYS.COVER_LETTER_HISTORY);
                    setRecentHistory([]);
                    addToast('Recent cover letters history cleared.', 'info');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.7rem', padding: '2px 4px' }}
                >
                  Clear
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleReopenHistory(item)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    className="card-hover"
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.jobTitle || 'Target Role'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.company || 'Employer'} • <span style={{ textTransform: 'capitalize' }}>{item.tone || 'Confident'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = removeFromHistory(STORAGE_KEYS.COVER_LETTER_HISTORY, item.id);
                        setRecentHistory(updated);
                      }}
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ padding: '2px', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Editable Preview */}
        <div style={{ padding: 'var(--space-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-sm)', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Document Editor
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {generatedLetter ? `${generatedLetter.split(/\s+/).filter(Boolean).length} words` : 'Awaiting input'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: '4rem 1rem' }}
              >
                <AiProcessingIndicator
                  text="Generating cover letter with Google Gemini..."
                  subtext="Synthesizing verified career achievements with target company mission."
                  size="lg"
                />
              </motion.div>
            ) : generationError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: '3rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', margin: 'auto 0' }}
              >
                <AlertCircle size={36} color="var(--danger)" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--danger)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Cover Letter Generation Failed
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
                  {generationError}
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={13} /> Retry Generation
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <textarea
                  className="form-textarea"
                  style={{
                    flex: 1,
                    minHeight: '460px',
                    fontFamily: 'Charter, Georgia, serif',
                    fontSize: '11pt',
                    lineHeight: 1.7,
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  placeholder="Generated cover letter text will appear here in document format. You can edit any paragraph directly..."
                />

                <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {isGeminiPowered ? (
                      <span className="badge badge-verified" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        ✨ Powered by Google Gemini AI
                      </span>
                    ) : generatedLetter ? (
                      <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                        Grounded via Profile Facts
                      </span>
                    ) : null}

                    {matchedSkills && matchedSkills.length > 0 && matchedSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="badge badge-verified"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Formatted Printable Document (Hidden on screen, active in print / PDF dialog) */}
      <div
        ref={printRef}
        className="printable-cover-letter"
        style={{
          display: 'none',
          backgroundColor: '#ffffff',
          color: '#111827',
          padding: '2.5in 1in 1in 1in',
          fontFamily: 'Charter, Georgia, Cambria, serif',
          fontSize: '11pt',
          lineHeight: '1.6',
          maxWidth: '8.5in',
          margin: '0 auto'
        }}
      >
        {/* Candidate Header */}
        <div style={{ borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {candidateName}
          </h1>
          <div style={{ fontSize: '10pt', color: '#4b5563', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {candidateEmail && <span>{candidateEmail}</span>}
            {candidatePhone && <span>• {candidatePhone}</span>}
            {candidateLocation && <span>• {candidateLocation}</span>}
          </div>
        </div>

        {/* Date & Recipient */}
        <div style={{ marginBottom: '20px', fontSize: '10.5pt' }}>
          <div style={{ marginBottom: '12px' }}>{todayDate}</div>
          {hiringManager && <div><strong>{hiringManager}</strong></div>}
          {company && <div>{company} Hiring Team</div>}
          {company && <div>{company}</div>}
        </div>

        {/* Subject */}
        <div style={{ marginBottom: '16px', fontSize: '11pt', fontWeight: 700 }}>
          RE: Application for {jobTitle || 'Role'} Position
        </div>

        {/* Letter Body */}
        <div style={{ whiteSpace: 'pre-line', fontSize: '11pt', textAlign: 'justify' }}>
          {generatedLetter}
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-cover-letter, .printable-cover-letter * {
            visibility: visible;
          }
          .printable-cover-letter {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0.75in 0.75in !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      </div>
    </PageTransition>
  );
};

export default CoverLetterBuilder;
