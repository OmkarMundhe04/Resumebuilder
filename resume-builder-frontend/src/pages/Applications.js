import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, Clock, LayoutGrid, GripVertical, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Modal } from '../components/ui';
import PageTransition from '../components/motion/PageTransition';

const STAGES = [
  { id: 'Wishlist', label: 'Wishlist', color: 'var(--text-muted)' },
  { id: 'Applied', label: 'Applied', color: 'var(--info)' },
  { id: 'Screening', label: 'Screening', color: 'var(--accent-primary)' },
  { id: 'Interviewing', label: 'Interviewing', color: 'var(--warning)' },
  { id: 'Offer', label: 'Offer Received', color: 'var(--success)' },
  { id: 'Rejected', label: 'Archived / Rejected', color: 'var(--danger)' }
];

const Applications = () => {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'timeline'
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'company'
  const [showAddModal, setShowAddModal] = useState(false);

  // Drag and Drop State
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    stage: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    salary: '',
    notes: ''
  });

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch {
      addToast('Failed to fetch applications.', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) {
      addToast('Company and Role are required.', 'warning');
      return;
    }

    try {
      const res = await api.post('/applications', formData);
      if (res.data.success) {
        addToast('Application tracked successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          company: '',
          role: '',
          location: '',
          stage: 'Applied',
          appliedDate: new Date().toISOString().split('T')[0],
          salary: '',
          notes: ''
        });
        fetchApplications();
      }
    } catch {
      addToast('Failed to create application.', 'error');
    }
  };

  const handleStageChange = async (appId, newStage) => {
    // Optimistic local update
    setApplications(prev => prev.map(a => a._id === appId ? { ...a, stage: newStage, status: newStage } : a));
    try {
      const res = await api.put(`/applications/${appId}`, { stage: newStage, status: newStage });
      if (res.data.success) {
        addToast(`Moved to ${newStage}`, 'info');
      }
    } catch {
      addToast('Failed to update stage.', 'error');
      fetchApplications();
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e, stageId) => {
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (appId) {
      handleStageChange(appId, targetStage);
    }
    setDraggedAppId(null);
    setDragOverStage(null);
  };

  const handleDelete = async (appId) => {
    if (window.confirm('Delete this tracked application?')) {
      try {
        const res = await api.delete(`/applications/${appId}`);
        if (res.data.success) {
          addToast('Application removed.', 'info');
          setApplications(prev => prev.filter(a => a._id !== appId));
        }
      } catch {
        addToast('Failed to delete application.', 'error');
      }
    }
  };

  // Search & Filter & Sort Pipeline
  const filteredApps = applications.filter(app => {
    const roleName = app.role || app.position || '';
    const matchesSearch =
      (app.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const appStage = app.stage || app.status || 'Applied';
    const matchesStage = stageFilter === 'ALL' || appStage === stageFilter;

    return matchesSearch && matchesStage;
  }).sort((a, b) => {
    if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
    return new Date(b.dateApplied || b.appliedDate || b.createdAt || 0) - new Date(a.dateApplied || a.appliedDate || a.createdAt || 0);
  });

  return (
    <PageTransition>
      <div className="page-container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        {/* Editorial Header */}
      <section style={{ marginBottom: 'var(--space-xl)', paddingTop: 'var(--space-sm)' }}>
        <span className="eyebrow">Pipeline</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="display-md" style={{ margin: '0 0 var(--space-xs) 0' }}>
              Applications Tracker
            </h1>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Drag and drop tracked opportunities across interview stages or review chronological progress.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setViewMode('kanban')}
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                <LayoutGrid size={14} /> Kanban
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                <Clock size={14} /> Timeline
              </button>
            </div>

            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} icon={Plus}>
              Track Application
            </Button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '220px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search company, role, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="form-input"
            style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Stages ({applications.length})</option>
            {STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
            style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
          >
            <option value="newest">Sort: Recent First</option>
            <option value="company">Sort: Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main View Render */}
      {viewMode === 'kanban' ? (
        /* KANBAN VIEW WITH DRAG & DROP */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'start' }}>
          {STAGES.map(stage => {
            const stageApps = filteredApps.filter(a => (a.stage || a.status || 'Applied') === stage.id);
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                style={{
                  backgroundColor: isOver ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: isOver ? '2px dashed var(--accent-primary)' : '1px solid var(--border-subtle)',
                  padding: '1rem',
                  minHeight: '450px',
                  transition: 'background-color 0.15s, border 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: stage.color }}>
                    {stage.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-app)' }}>
                    {stageApps.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stageApps.map(app => {
                    const isDragging = draggedAppId === app._id;
                    const roleTitle = app.role || app.position || 'Role';

                    return (
                      <motion.div
                        key={app._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: isDragging ? 0.4 : 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, app._id)}
                        onDragEnd={handleDragEnd}
                        style={{
                          padding: '12px',
                          backgroundColor: 'var(--bg-app)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          boxShadow: 'var(--shadow-sm)',
                          cursor: 'grab',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <GripVertical size={12} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>{app.company}</h4>
                          </div>
                          <button onClick={() => handleDelete(app._id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)', padding: '2px' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '6px', marginLeft: '16px' }}>
                          {roleTitle}
                        </div>

                        {app.location && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', marginLeft: '16px' }}>
                            📍 {app.location}
                          </div>
                        )}

                        {/* Stage Selector Dropdown */}
                        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                          <select
                            value={app.stage || app.status || 'Applied'}
                            onChange={(e) => handleStageChange(app._id, e.target.value)}
                            className="form-input"
                            style={{ width: '100%', fontSize: '0.75rem', padding: '4px 6px' }}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>Move to: {s.label}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    );
                  })}

                  {stageApps.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                      Drag applications here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CHRONOLOGICAL TIMELINE VIEW */
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
          {filteredApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No applications match your filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredApps.map(app => {
                const roleTitle = app.role || app.position || 'Target Role';
                const currentStage = app.stage || app.status || 'Applied';

                return (
                  <div
                    key={app._id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-app)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>
                          {roleTitle} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>at</span> {app.company}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Applied on {app.dateApplied || app.appliedDate ? new Date(app.dateApplied || app.appliedDate).toLocaleDateString() : 'Recent'} {app.location ? `• ${app.location}` : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: 'rgba(2, 132, 199, 0.12)', color: 'var(--accent-primary)' }}>
                          Stage: {currentStage}
                        </span>
                        <button onClick={() => handleDelete(app._id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Visual Progression Steps */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {STAGES.map((stg, i) => {
                        const isCurrent = currentStage === stg.id;
                        const isPast = STAGES.findIndex(s => s.id === currentStage) >= i;
                        return (
                          <React.Fragment key={stg.id}>
                            <div
                              onClick={() => handleStageChange(app._id, stg.id)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: isCurrent ? 700 : 500,
                                cursor: 'pointer',
                                background: isCurrent ? 'var(--accent-primary)' : isPast ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                                color: isCurrent ? '#ffffff' : isPast ? 'var(--success)' : 'var(--text-muted)',
                                border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {stg.label}
                            </div>
                            {i < STAGES.length - 1 && (
                              <ChevronRight size={12} color="var(--text-muted)" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Create New Application"
          subtitle="Record job opportunity details and set pipeline status."
        >
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Stripe"
                />
              </div>

              <div>
                <label className="form-label">Role / Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Backend Engineer"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco / Remote"
                  />
                </div>
                <div>
                  <label className="form-label">Initial Stage</label>
                  <select
                    className="form-input"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Application
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
      </div>
    </PageTransition>
  );
};

export default Applications;
