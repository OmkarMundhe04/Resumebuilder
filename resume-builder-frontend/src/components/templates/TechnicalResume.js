import React from 'react';
import ResumeLink from '../common/ResumeLink';

const TechnicalResume = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#0284c7';
  const fontFamily = formatting?.fontFamily || 'Inter, monospace, sans-serif';

  return (
    <div 
      className="canonical-resume technical-resume"
      style={{
        fontFamily,
        color: '#0f172a',
        backgroundColor: '#ffffff',
        padding: '34px 38px',
        lineHeight: 1.45,
        fontSize: '10pt',
        minHeight: '100%'
      }}
    >
      {/* Header */}
      <header data-section="personal" style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '20pt', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {personal?.fullName || 'Full Name'}
            </h1>
            <span style={{ fontSize: '10.5pt', fontWeight: 600, color: accentColor }}>
              {personal?.title || 'Software Engineer'}
            </span>
          </div>
          <div style={{ fontSize: '8.5pt', color: '#475569', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {personal?.email && <span>email: <ResumeLink href={personal.email} style={{ fontWeight: 600, color: '#0f172a' }} /></span>}
            {personal?.phone && <span>phone: <ResumeLink href={personal.phone} style={{ fontWeight: 600, color: '#0f172a' }} /></span>}
            {personal?.location && <span>loc: <strong>{personal.location}</strong></span>}
            {personal?.github && <span>github: <ResumeLink href={personal.github} label={personal.github.replace(/^https?:\/\//, '')} style={{ color: accentColor }} /></span>}
            {personal?.linkedin && <span>in: <ResumeLink href={personal.linkedin} label={personal.linkedin.replace(/^https?:\/\//, '')} style={{ color: accentColor }} /></span>}
            {personal?.portfolio && <span>web: <ResumeLink href={personal.portfolio} label={personal.portfolio.replace(/^https?:\/\//, '')} style={{ color: accentColor }} /></span>}
            {personal?.website && <span>site: <ResumeLink href={personal.website} label={personal.website.replace(/^https?:\/\//, '')} style={{ color: accentColor }} /></span>}
          </div>
        </div>
        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '64px', height: '64px', borderRadius: '6px', objectFit: 'cover', border: `2px solid ${accentColor}`, marginLeft: '16px' }}
          />
        )}
      </header>

      {/* Sections */}
      {(sectionOrder || ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'publications', 'awards', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Summary
                </h2>
                <p style={{ margin: 0, fontSize: '9pt', color: '#334155', lineHeight: 1.45 }}>{personal.summary}</p>
              </section>
            );

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" data-section="skills" className="resume-section" style={{ marginBottom: '14px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Technical Skills
                </h2>
                <div style={{ fontSize: '9pt', color: '#334155', lineHeight: 1.6 }}>
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
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Featured Projects & Architecture
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(' | ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '9.5pt', color: '#0f172a' }}>
                            {proj.name}
                          </span>
                          {proj.role && <span style={{ fontSize: '8.5pt', color: '#475569', fontWeight: 600 }}>{' // '}{proj.role}</span>}
                        </div>
                        <div style={{ fontSize: '8.5pt', display: 'flex', gap: '8px' }}>
                          {proj.link && (
                            <ResumeLink 
                              href={proj.link} 
                              label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                              style={{ color: accentColor, fontWeight: 600 }}
                            />
                          )}
                        </div>
                      </div>
                      {techStr && (
                        <div style={{ fontSize: '8pt', color: '#64748b', fontFamily: 'monospace', margin: '1px 0' }}>
                          [{techStr}]
                        </div>
                      )}
                      {proj.description && <p style={{ margin: '2px 0 0 0', fontSize: '9pt', color: '#334155' }}>{proj.description}</p>}
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '8.5pt', color: '#334155' }}>
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

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Engineering Experience
                </h2>
                {experiences.map((exp, idx) => {
                  const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '10px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '9.5pt', color: '#0f172a' }}>
                          {exp.role} @ {exp.company} {exp.location ? `(${exp.location})` : ''}
                        </span>
                        <span style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic' }}>
                          {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '3px 0 0 16px', padding: 0, fontSize: '9pt', color: '#334155' }}>
                          {validBullets.map((b, bIdx) => (
                            <li key={b.id || bIdx} style={{ marginBottom: '2px' }}>{b.text}</li>
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
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                      <span><strong>{edu.degree}</strong>, {edu.institution} {edu.location ? `(${edu.location})` : ''} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
                      <span style={{ color: '#64748b' }}>{edu.startDate} – {edu.endDate}</span>
                    </div>
                    {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                      <div style={{ fontSize: '8pt', color: '#64748b' }}>
                        Coursework: {Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework}
                      </div>
                    )}
                    {edu.honors && (Array.isArray(edu.honors) ? edu.honors.length > 0 : edu.honors) && (
                      <div style={{ fontSize: '8pt', color: '#047857' }}>
                        Honors: {Array.isArray(edu.honors) ? edu.honors.join(', ') : edu.honors}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            );

          case 'certifications':
            if (!certifications || certifications.length === 0) return null;
            return (
              <section key="certifications" data-section="certifications" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Certifications
                </h2>
                <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '9pt', color: '#334155' }}>
                  {certifications.map((c, idx) => {
                    const certUrl = c.credentialUrl || c.url;
                    return (
                      <li key={c.id || idx} className="certification-item" style={{ marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <strong>{c.name}</strong> — {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                        {c.credentialId && <span style={{ color: '#64748b' }}> [ID: {c.credentialId}]</span>}
                        {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '4px', color: accentColor }} />}
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
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications & Research
                </h2>
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="publication-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{p.title}</strong> — {p.publisher} {p.date ? `(${p.date})` : ''}
                    {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '4px', color: accentColor }} />}
                    {p.summary && <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{p.summary}</div>}
                  </div>
                ))}
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Honors & Awards
                </h2>
                {awards.map((a, idx) => (
                  <div key={a.id || idx} className="award-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{a.title}</strong> — {a.issuer} {a.date ? `(${a.date})` : ''}
                    {a.description && <span style={{ color: '#64748b' }}>: {a.description}</span>}
                  </div>
                ))}
              </section>
            );

          case 'volunteer':
            if (!volunteer || volunteer.length === 0) return null;
            return (
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Volunteer
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{v.role}</strong> — {v.organization} ({v.startDate} – {v.endDate || 'Present'})
                    {v.description && <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{v.description}</div>}
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
                    <h2 style={{ fontSize: '10.5pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                      {cs.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: '9pt', color: '#334155', whiteSpace: 'pre-line' }}>{cs.content}</p>
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

export default TechnicalResume;
