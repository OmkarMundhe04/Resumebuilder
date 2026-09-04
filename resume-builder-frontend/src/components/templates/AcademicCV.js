import React from 'react';
import ResumeLink from '../common/ResumeLink';

const AcademicCV = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#312e81';
  const fontFamily = formatting?.fontFamily || 'Times New Roman, serif';

  return (
    <div 
      className="canonical-resume academic-cv"
      style={{
        fontFamily,
        color: '#111827',
        backgroundColor: '#ffffff',
        padding: '36px 42px',
        lineHeight: 1.5,
        fontSize: '10pt',
        minHeight: '100%'
      }}
    >
      {/* Academic Header */}
      <header data-section="personal" style={{ textAlign: 'center', marginBottom: '18px', borderBottom: '1px solid #111827', paddingBottom: '14px' }}>
        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #9ca3af', marginBottom: '6px' }}
          />
        )}
        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, color: '#1e1b4b' }}>
          {personal?.fullName || 'Curriculum Vitae'}
        </h1>
        {personal?.title && (
          <div style={{ fontSize: '11pt', fontStyle: 'italic', color: '#4b5563', marginTop: '2px' }}>
            {personal.title}
          </div>
        )}
        <div style={{ fontSize: '9pt', color: '#374151', marginTop: '6px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {personal?.email && <ResumeLink href={personal.email} style={{ color: '#374151' }} />}
          {personal?.phone && <span>| <ResumeLink href={personal.phone} style={{ color: '#374151' }} /></span>}
          {personal?.location && <span>| {personal.location}</span>}
          {personal?.linkedin && <span>| <ResumeLink href={personal.linkedin} label="LinkedIn" style={{ color: accentColor }} /></span>}
          {personal?.github && <span>| <ResumeLink href={personal.github} label="GitHub" style={{ color: accentColor }} /></span>}
          {personal?.portfolio && <span>| <ResumeLink href={personal.portfolio} label="Portfolio" style={{ color: accentColor }} /></span>}
          {personal?.website && <span>| <ResumeLink href={personal.website} style={{ color: accentColor }} /></span>}
        </div>
      </header>

      {/* Ordered Sections */}
      {(sectionOrder || ['education', 'experience', 'publications', 'awards', 'projects', 'skills', 'certifications', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Research Interests & Academic Focus
                </h2>
                <p style={{ margin: 0, fontSize: '9.5pt', color: '#1f2937', textAlign: 'justify', lineHeight: 1.5 }}>
                  {personal.summary}
                </p>
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <span><strong>{edu.degree}</strong>, {edu.institution} {edu.location && `(${edu.location})`}</span>
                      <span>{edu.startDate} – {edu.endDate}</span>
                    </div>
                    {edu.gpa && <div style={{ fontSize: '8.5pt', color: '#4b5563' }}>GPA: {edu.gpa}</div>}
                    {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                      <div style={{ fontSize: '8.5pt', color: '#4b5563', fontStyle: 'italic' }}>
                        Specialization / Coursework: {Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework}
                      </div>
                    )}
                    {edu.honors && (Array.isArray(edu.honors) ? edu.honors.length > 0 : edu.honors) && (
                      <div style={{ fontSize: '8.5pt', color: '#047857' }}>
                        Academic Honors: {Array.isArray(edu.honors) ? edu.honors.join(' • ') : edu.honors}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            );

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Academic Appointments & Research Experience
                </h2>
                {experiences.map((exp, idx) => {
                  const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <span><strong>{exp.role}</strong>, {exp.company} {exp.location && `(${exp.location})`}</span>
                        <span>{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                      </div>
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 20px', padding: 0, fontSize: '9.5pt' }}>
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

          case 'publications':
            if (!publications || publications.length === 0) return null;
            return (
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications & Papers
                </h2>
                <ul style={{ margin: '0 0 0 20px', padding: 0, fontSize: '9.5pt' }}>
                  {publications.map((p, idx) => (
                    <li key={p.id || idx} className="publication-item" style={{ marginBottom: '4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      "{p.title}", <em>{p.publisher}</em> ({p.date}). {p.url && <ResumeLink href={p.url} label="[Link]" style={{ color: accentColor }} />}
                      {p.summary && <div style={{ fontSize: '8.5pt', color: '#4b5563' }}>{p.summary}</div>}
                    </li>
                  ))}
                </ul>
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Honors, Grants & Fellowships
                </h2>
                <ul style={{ margin: '0 0 0 20px', padding: 0, fontSize: '9.5pt' }}>
                  {awards.map((a, idx) => (
                    <li key={a.id || idx} className="award-item" style={{ marginBottom: '3px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <strong>{a.title}</strong>, {a.issuer} {a.date ? `(${a.date})` : ''}
                      {a.description && <span>: {a.description}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            );

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" data-section="projects" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Research Projects & Grants
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <strong>{proj.name}</strong>
                          {proj.role && <span style={{ fontStyle: 'italic', color: '#4b5563' }}> ({proj.role})</span>}
                        </div>
                        {proj.link && (
                          <ResumeLink 
                            href={proj.link} 
                            label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                            style={{ fontSize: '8.5pt', color: accentColor }}
                          />
                        )}
                      </div>
                      {techStr && <div style={{ fontSize: '8.5pt', color: '#4b5563', margin: '1px 0' }}>Methodology/Tools: {techStr}</div>}
                      {proj.description && <p style={{ margin: 0, fontSize: '9pt', color: '#1f2937' }}>{proj.description}</p>}
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 20px', padding: 0, fontSize: '8.5pt', color: '#1f2937' }}>
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

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" data-section="skills" className="resume-section" style={{ marginBottom: '14px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Technical & Methodological Expertise
                </h2>
                <div style={{ fontSize: '9.5pt', lineHeight: 1.6 }}>
                  {skills.map(s => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    return note ? `${s.name} — ${note}` : s.name;
                  }).join('  •  ')}
                </div>
              </section>
            );

          case 'certifications':
            if (!certifications || certifications.length === 0) return null;
            return (
              <section key="certifications" data-section="certifications" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Professional Certifications
                </h2>
                {certifications.map((c, idx) => {
                  const certUrl = c.credentialUrl || c.url;
                  return (
                    <div key={c.id || idx} className="certification-item" style={{ fontSize: '9.5pt', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <strong>{c.name}</strong> — {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                      {c.credentialId && <span style={{ color: '#4b5563', fontSize: '8.5pt' }}> [ID: {c.credentialId}]</span>}
                      {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '4px', color: accentColor }} />}
                    </div>
                  );
                })}
              </section>
            );

          case 'volunteer':
            if (!volunteer || volunteer.length === 0) return null;
            return (
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Academic Service & Reviewing
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9.5pt', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{v.role}</strong>, {v.organization} {v.startDate ? `(${v.startDate}${v.endDate ? ` – ${v.endDate}` : ' – Present'})` : ''}
                    {v.description && <div style={{ fontSize: '8.5pt', color: '#4b5563' }}>{v.description}</div>}
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
                    <h2 style={{ fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111827', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                      {cs.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: '9.5pt', whiteSpace: 'pre-line' }}>{cs.content}</p>
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

export default AcademicCV;
