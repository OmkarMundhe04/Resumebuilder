import React from 'react';
import ATSClassic from './ATSClassic';
import ModernProfessional from './ModernProfessional';
import TechnicalResume from './TechnicalResume';
import StudentResume from './StudentResume';
import ExecutiveResume from './ExecutiveResume';
import AcademicCV from './AcademicCV';
import MinimalistResume from './MinimalistResume';
import CreativeResume from './CreativeResume';
import SwissClean from './SwissClean';
import SiliconValley from './SiliconValley';
import CorporateNavy from './CorporateNavy';
import EmeraldCompact from './EmeraldCompact';
import TokyoMinimal from './TokyoMinimal';
import NordicSlate from './NordicSlate';
import RubyExecutive from './RubyExecutive';
import BerlinModern from './BerlinModern';

const ResumeRenderer = ({ resume, containerId = 'resume-preview-document', scale = 1, onSectionClick }) => {
  if (!resume) return null;

  const templateId = resume?.template || 'ats-classic';

  const handleDocumentClick = (e) => {
    if (!onSectionClick) return;
    const targetSectionEl = e.target.closest('[data-section]');
    if (targetSectionEl) {
      const sectionKey = targetSectionEl.getAttribute('data-section');
      if (sectionKey) {
        onSectionClick(sectionKey);
      }
    }
  };

  const renderTemplate = () => {
    switch (templateId) {
      case 'modern-professional':
        return <ModernProfessional resume={resume} />;
      case 'technical':
        return <TechnicalResume resume={resume} />;
      case 'student-graduate':
        return <StudentResume resume={resume} />;
      case 'executive':
        return <ExecutiveResume resume={resume} />;
      case 'academic':
        return <AcademicCV resume={resume} />;
      case 'minimal':
        return <MinimalistResume resume={resume} />;
      case 'creative':
        return <CreativeResume resume={resume} />;
      case 'swiss-clean':
        return <SwissClean resume={resume} />;
      case 'silicon-valley':
        return <SiliconValley resume={resume} />;
      case 'corporate-navy':
        return <CorporateNavy resume={resume} />;
      case 'emerald-compact':
        return <EmeraldCompact resume={resume} />;
      case 'tokyo-minimal':
        return <TokyoMinimal resume={resume} />;
      case 'nordic-slate':
        return <NordicSlate resume={resume} />;
      case 'ruby-executive':
        return <RubyExecutive resume={resume} />;
      case 'berlin-modern':
        return <BerlinModern resume={resume} />;
      case 'ats-classic':
      default:
        return <ATSClassic resume={resume} />;
    }
  };

  return (
    <div 
      className={`resume-sheet-wrapper ${onSectionClick ? 'interactive-preview' : ''}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div
        id={containerId}
        onClick={handleDocumentClick}
        className="resume-sheet print-only-resume"
        style={{
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
          cursor: onSectionClick ? 'pointer' : 'default',
          boxSizing: 'border-box'
        }}
        title={onSectionClick ? 'Click any section in this preview to edit its content' : undefined}
      >
        {renderTemplate()}
      </div>
    </div>
  );
};

export default ResumeRenderer;

