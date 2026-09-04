import React from 'react';
import ResumeLink from '../common/ResumeLink';

const ATSClassic = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#1e3a8a';
  const fontFamily = formatting?.fontFamily || 'Inter, Arial, sans-serif';

  return (
    <div 
      className="canonical-resume ats-classic"
      style={{
        fontFamily,
        color: '#111827',
        backgroundColor: '#ffffff',
        padding: '36px 40px',
        lineHeight: 1.45,
        fontSize: '10.5pt',
        minHeight: '100%'
      }}
    >
      {/* Header */}
      <header data-section="personal" style={{ textAlign: 'center', borderBottom: `2px solid ${accentColor}`, paddingBottom: '12px', marginBottom: '16px', position: 'relative' }}>
        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accentColor}`, position: 'absolute', right: 0, top: 0 }}
          />
        )}
        <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a' }}>
          {personal?.fullName || 'Your Name'}
        </h1>
        {personal?.title && (
          <div style={{ fontSize: '11pt', fontWeight: 600, color: accentColor, marginTop: '2px' }}>
            {personal.title}
          </div>
        )}
        <div style={{ fontSize: '9pt', color: '#4b5563', marginTop: '6px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {personal?.email && <ResumeLink href={personal.email} style={{ color: '#4b5563' }} />}
          {personal?.phone && <span>• <ResumeLink href={personal.phone} style={{ color: '#4b5563' }} /></span>}
          {personal?.location && <span>• {personal.location}</span>}
          {personal?.linkedin && <span>• <ResumeLink href={personal.linkedin} label="LinkedIn" style={{ color: accentColor }} /></span>}
          {personal?.github && <span>• <ResumeLink href={personal.github} label="GitHub" style={{ color: accentColor }} /></span>}
          {personal?.portfolio && <span>• <ResumeLink href={personal.portfolio} label="Portfolio" style={{ color: accentColor }} /></span>}
          {personal?.website && <span>• <ResumeLink href={personal.website} style={{ color: accentColor }} /></span>}
        </div>
      </header>

      {/* Ordered Sections */}
      {(sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'publications', 'awards', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Professional Summary
                </h2>
                <p style={{ margin: 0, fontSize: '9.5pt', color: '#334155', textAlign: 'justify' }}>
                  {personal.summary}
                </p>
              </section>
            );

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '8px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Work Experience
                </h2>
                {experiences.map((exp, idx) => {
                  const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '10px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>{exp.role || 'Role'}</span>
                        <span style={{ fontSize: '9pt', color: '#64748b', fontStyle: 'italic' }}>
                          {exp.startDate || ''} – {exp.isCurrent ? 'Present' : (exp.endDate || '')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '9.5pt', color: accentColor, fontWeight: 500, marginBottom: '4px' }}>
                        <span>{exp.company || 'Company'}</span>
                        <span style={{ color: '#64748b', fontSize: '8.5pt' }}>{exp.location || ''}</span>
                      </div>
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '9.5pt', color: '#334155' }}>
                          {validBullets.map((b, bIdx) => (
                            <li key={b.id || bIdx} style={{ marginBottom: '3px' }}>
                              {b.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '8px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>{edu.degree || 'Degree'}</span>
                        <span style={{ fontSize: '9.5pt', color: '#475569' }}> — {edu.institution || 'Institution'}</span>
                        {edu.location && <span style={{ fontSize: '8.5pt', color: '#64748b' }}> ({edu.location})</span>}
                        {edu.gpa && <span style={{ fontSize: '8.5pt', color: accentColor, fontWeight: 600 }}> | GPA: {edu.gpa}</span>}
                      </div>
                      <span style={{ fontSize: '9pt', color: '#64748b', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                        {edu.startDate || ''} – {edu.endDate || ''}
                      </span>
                    </div>
                    {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                      <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '2px' }}>
                        <strong>Coursework:</strong> {Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework}
                      </div>
                    )}
                    {edu.honors && (Array.isArray(edu.honors) ? edu.honors.length > 0 : edu.honors) && (
                      <div style={{ fontSize: '8.5pt', color: '#047857', marginTop: '2px' }}>
                        <strong>Honors:</strong> {Array.isArray(edu.honors) ? edu.honors.join(', ') : edu.honors}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            );

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" data-section="skills" className="resume-section" style={{ marginBottom: '14px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Skills
                </h2>
                <div style={{ fontSize: '9.5pt', color: '#334155', lineHeight: 1.6 }}>
                  {skills.map((s, idx) => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    const label = note ? `${s.name} — ${note}` : s.name;
                    return (
                      <span key={s.id || idx}>
                        {idx > 0 && '  •  '}
                        {label}
                      </span>
                    );
                  })}
                </div>
              </section>
            );

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" data-section="projects" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '8px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Key Projects
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>
                            {proj.name}
                          </span>
                          {proj.role && <span style={{ fontSize: '9pt', color: '#475569', fontWeight: 600 }}> ({proj.role})</span>}
                        </div>
                        {proj.link && (
                          <ResumeLink 
                            href={proj.link} 
                            label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                            style={{ fontSize: '8.5pt', color: accentColor, fontWeight: 600 }}
                          />
                        )}
                      </div>
                      {techStr && (
                        <div style={{ fontSize: '8.5pt', color: '#475569', fontStyle: 'italic', marginBottom: '2px' }}>
                          Tech: {techStr}
                        </div>
                      )}
                      {proj.description && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '9.5pt', color: '#334155' }}>{proj.description}</p>
                      )}
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '9pt', color: '#334155' }}>
                          {validBullets.map((b, bIdx) => (
                            <li key={b.id || bIdx}>{b.text}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </section>
            );

          case 'certifications':
            if (!certifications || certifications.length === 0) return null;
            return (
              <section key="certifications" data-section="certifications" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Certifications
                </h2>
                <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '9.5pt', color: '#334155' }}>
                  {certifications.map((c, idx) => {
                    const certUrl = c.credentialUrl || c.url;
                    return (
                      <li key={c.id || idx} className="certification-item" style={{ marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <strong>{c.name}</strong> — {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                        {c.credentialId && <span style={{ color: '#64748b', fontSize: '8.5pt' }}> [ID: {c.credentialId}]</span>}
                        {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '6px', color: accentColor }} />}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );

          case 'publications':
            if (!publications || publications.length === 0) return null;
            return (
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications & Research
                </h2>
                <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '9.5pt', color: '#334155' }}>
                  {publications.map((p, idx) => (
                    <li key={p.id || idx} className="publication-item" style={{ marginBottom: '3px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <strong>{p.title}</strong> — {p.publisher} {p.date ? `(${p.date})` : ''}
                      {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '6px', color: accentColor }} />}
                      {p.summary && <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{p.summary}</div>}
                    </li>
                  ))}
                </ul>
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Honors & Awards
                </h2>
                <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '9.5pt', color: '#334155' }}>
                  {awards.map((a, idx) => (
                    <li key={a.id || idx} className="award-item" style={{ marginBottom: '3px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <strong>{a.title}</strong> — {a.issuer} {a.date ? `(${a.date})` : ''}
                      {a.description && <span style={{ color: '#64748b' }}>: {a.description}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            );

          case 'volunteer':
            if (!volunteer || volunteer.length === 0) return null;
            return (
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Volunteer Experience
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', fontWeight: 700 }}>
                      <span>{v.role} — {v.organization}</span>
                      <span style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic' }}>{v.startDate} – {v.endDate || 'Present'}</span>
                    </div>
                    {v.description && <p style={{ margin: '2px 0 0 0', fontSize: '9pt', color: '#475569' }}>{v.description}</p>}
                  </div>
                ))}
              </section>
            );

          case 'custom':
            if (!customSections || customSections.length === 0) return null;
            return (
              <React.Fragment key="custom">
                {customSections.map((cs, idx) => (
                  <section key={cs.id || idx} data-section="custom" className="resume-section" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px', color: '#0f172a', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                      {cs.title || 'Additional Information'}
                    </h2>
                    <p style={{ margin: 0, fontSize: '9.5pt', color: '#334155', whiteSpace: 'pre-line' }}>{cs.content}</p>
                  </section>
                ))}
              </React.Fragment>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default ATSClassic;
