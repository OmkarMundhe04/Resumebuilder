import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/motion/PageTransition';

const GUIDES = [
  {
    id: 'ats-mechanics',
    title: 'How Modern ATS Parsers Actually Work',
    category: 'ATS Mechanics',
    readTime: '4 min read',
    content: `
### What Applicant Tracking Systems (ATS) Really Do

An ATS is fundamentally a database paired with a document parsing pipeline (like Sovren, Textkernel, or in-house models). When you submit a resume to Workday, Taleo, Greenhouse, or Lever, here is what happens:

1. **Text Stream Ingestion**: The system converts your PDF or DOCX file into an unstructured text stream.
2. **Entity Extraction**: Machine learning algorithms look for standard header anchors ("Experience", "Education", "Skills") and regex patterns for emails, phone numbers, and dates.
3. **Structured Candidate Profile**: The parsed data populates a candidate profile for recruiters to search by keywords, skills, and years of experience.

### Why Resumes Fail ATS Parsing
- **Complex Multi-Column Tables**: Unordered table cells can cause reading order to jump horizontally across columns.
- **Header & Footer Storage**: Information placed in Microsoft Word header/footer metadata zones is often stripped by parsers.
- **Graphic Elements / Text Inside Images**: Text stored in raster images cannot be read by OCR parsers without manual configuration.
- **Non-Standard Section Headings**: Titles like "Where I've Been" or "My Superpowers" cause the parser to fail to classify your work history.
    `
  },
  {
    id: 'action-verbs',
    title: 'High-Impact Action Verbs & Formula (Action + Context + Metric)',
    category: 'Writing Strategy',
    readTime: '3 min read',
    content: `
### The Universal Truth Formula for High-Impact Bullets

Every strong resume bullet point follows a proven three-part structure:

> **[Strong Action Verb]** + **[Context / Problem Solved & Technologies]** + **[Verified Outcome / Metric]**

#### High-Impact Engineering Verbs:
- **Architecture & Build**: *Architected, Engineered, Developed, Deployed, Refactored, Integrated*
- **Optimization & Performance**: *Accelerated, Optimized, Streamlined, Reduced, Scaled*
- **Leadership & Coordination**: *Spearheaded, Mentored, Orchestrated, Standardized*

#### Examples (Before vs. Truthful After):
- **Weak**: "Worked on the frontend with React and improved performance."
- **Strong**: "Refactored legacy React UI components into modular hooks, cutting initial bundle size by 35% and improving page load times."
    `
  },
  {
    id: 'tailoring-truth',
    title: 'Ethical Tailoring: How to Align Without Lying',
    category: 'Career Ethics',
    readTime: '3 min read',
    content: `
### Tailoring vs. Fabricating

Tailoring is about **emphasis and vocabulary alignment**, not inventing work history you didn't perform.

#### Acceptable Tailoring:
- Moving relevant technologies and projects to the top of your resume.
- Matching synonyms (e.g., changing "Node backend" to "RESTful API services in Node.js" if the job emphasizes REST).
- Highlighting existing coursework or freelance builds that directly match the role.

#### What to NEVER Do:
- Claiming mastery of languages you have never run locally.
- Inserting hidden white text keywords (modern ATS flag this instantly as candidate manipulation).
- Fabricating numerical percentages out of thin air.
    `
  }
];

const LearningCenter = () => {
  const [selectedGuide, setSelectedGuide] = useState(GUIDES[0]);

  const renderInlineFormatting = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const renderGuideContent = (content) => {
    if (!content) return null;
    const lines = content.trim().split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: '0.75rem' }} />;
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} style={{ fontSize: '1.15rem', fontWeight: 700, margin: '1.5rem 0 0.5rem 0', color: 'var(--text-primary)' }}>{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx} style={{ fontSize: '0.95rem', fontWeight: 600, margin: '1rem 0 0.35rem 0', color: 'var(--text-primary)' }}>{trimmed.replace('#### ', '')}</h4>;
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} style={{ borderLeft: '3px solid var(--border-default)', paddingLeft: '1rem', margin: '1rem 0', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {renderInlineFormatting(trimmed.replace('> ', ''))}
          </blockquote>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
            {renderInlineFormatting(trimmed.replace(/^[-•*]\s+/, ''))}
          </li>
        );
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '4px', listStyleType: 'decimal', color: 'var(--text-primary)' }}>
            {renderInlineFormatting(trimmed.replace(/^\d+\.\s+/, ''))}
          </li>
        );
      }
      return (
        <p key={idx} style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });
  };

  return (
    <PageTransition>
      <div className="page-container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        {/* Editorial Header */}
        <section style={{ marginBottom: 'var(--space-2xl)', paddingTop: 'var(--space-sm)' }}>
          <span className="eyebrow">Career Knowledge Hub</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '6px 0 8px 0' }}>ATS Learning & Writing Guides</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', fontSize: '0.9375rem' }}>
            Authoritative, engineering-grade breakdowns of modern Applicant Tracking Systems, high-impact bullet formulas, and verified career storytelling.
          </p>
        </section>

        {/* Master-Detail Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
          {/* Guide Selector List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {GUIDES.map((guide) => (
              <div
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedGuide.id === guide.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  backgroundColor: selectedGuide.id === guide.id ? 'var(--bg-surface-raised)' : 'var(--bg-surface)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {guide.category}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{guide.readTime}</span>
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {guide.title}
                </h4>
              </div>
            ))}
          </div>

          {/* Selected Guide Reader */}
          <div style={{ padding: 'var(--space-2xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGuide.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                  <span className="badge badge-verified" style={{ marginBottom: '8px' }}>{selectedGuide.category}</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '6px 0' }}>{selectedGuide.title}</h2>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedGuide.readTime}</span>
                </div>

                <div style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                  {renderGuideContent(selectedGuide.content)}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LearningCenter;
