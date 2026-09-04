import React, { useState } from 'react';
import { Check, ShieldCheck, FileText, Code, GraduationCap, Award, BookOpen, Minimize2, Palette, Grid, Sparkles, Terminal } from 'lucide-react';
import { Modal } from '../ui';
import { TEMPLATES } from '../../utils/canonicalResume';

const TEMPLATE_ICONS = {
  'ats-classic': FileText,
  'modern-professional': ShieldCheck,
  'technical': Code,
  'student-graduate': GraduationCap,
  'executive': Award,
  'academic': BookOpen,
  'minimal': Minimize2,
  'creative': Palette,
  'swiss-clean': Grid,
  'silicon-valley': Terminal,
  'corporate-navy': Award,
  'emerald-compact': FileText,
  'tokyo-minimal': Minimize2,
  'nordic-slate': ShieldCheck,
  'ruby-executive': Award,
  'berlin-modern': Sparkles
};

const CATEGORIES = ['All', '📷 Photo Ready', 'ATS Standard', 'Modern', 'Technical', 'Executive', 'Minimalist', 'Academic', 'Creative'];

const TemplateSelectorModal = ({ currentTemplate, onSelectTemplate, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = TEMPLATES.filter(tmpl => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === '📷 Photo Ready') return tmpl.hasPhotoSupport === true;
    return tmpl.category === selectedCategory;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose ATS-Friendly Template (16 Designs)"
      subtitle="Switch presentation instantly. 6 layouts include dedicated profile photo framing; 10 layouts focus on pure typography."
      maxWidth="920px"
    >
      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '4px'
        }}
      >
        {filteredTemplates.map((tmpl) => {
          const isSelected = currentTemplate === tmpl.id;
          const IconComponent = TEMPLATE_ICONS[tmpl.id] || FileText;

          return (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl.id);
                onClose();
              }}
              style={{
                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.06)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
              className="card-hover"
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: isSelected ? '#ffffff' : 'var(--accent-primary)' }}>
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                      {tmpl.name}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {tmpl.category || 'Template'}
                    </span>
                  </div>
                </div>

                <p style={{ margin: '6px 0 12px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {tmpl.description}
                </p>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isSelected ? 'Active Template' : 'Click to Apply'}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default TemplateSelectorModal;
