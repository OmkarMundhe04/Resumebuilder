import React from 'react';
import ResumeLink from '../common/ResumeLink';

const ModernProfessional = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#2563eb';
  const fontFamily = formatting?.fontFamily || 'Inter, sans-serif';

  return (
    <div 
      className="canonical-resume modern-professional"
      style={{
        fontFamily,
        color: '#1e293b',
        backgroundColor: '#ffffff',
        padding: '34px 38px',
        lineHeight: 1.5,
        fontSize: '10pt',
        minHeight: '100%'
      }}
    >
      {/* Modern Accent Header */}
      <header data-section="personal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '18px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {personal?.showPhoto && personal?.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName || 'Profile'}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2.5px solid ${accentColor}`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                flexShrink: 0
              }}
            />
          )}
          <div>
            <h1 style={{ fontSize: '22pt', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {personal?.fullName || 'Full Name'}
            </h1>
            {personal?.title && (
              <div style={{ fontSize: '11pt', fontWeight: 600, color: accentColor, marginTop: '2px' }}>
                {personal.title}
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {personal?.email && <ResumeLink href={personal.email} style={{ color: '#64748b' }} />}
          {personal?.phone && <ResumeLink href={personal.phone} style={{ color: '#64748b' }} />}
          {personal?.location && <span>{personal.location}</span>}
          {personal?.linkedin && <ResumeLink href={personal.linkedin} label="LinkedIn" style={{ color: accentColor }} />}
          {personal?.github && <ResumeLink href={personal.github} label="GitHub" style={{ color: accentColor }} />}
          {personal?.portfolio && <ResumeLink href={personal.portfolio} label="Portfolio" style={{ color: accentColor }} />}
          {personal?.website && <ResumeLink href={personal.website} style={{ color: accentColor }} />}
        </div>
      </header>

      {/* Sections */}
      {(sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'publications', 'awards', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    About Me
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: '9.5pt', color: '#334155', lineHeight: 1.55 }}>
                  {personal.summary}
                </p>
              </section>
            );

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Experience
                  </h2>
                </div>
                {experiences.map((exp, idx) => {
                  const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '12px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>{exp.role}</span>
                        <span style={{ fontSize: '8.5pt', color: '#64748b', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                          {exp.startDate || ''} – {exp.isCurrent ? 'Present' : (exp.endDate || '')}
                        </span>
                      </div>
                      <div style={{ fontSize: '9pt', color: accentColor, fontWeight: 500, marginBottom: '4px' }}>
                        {exp.company} {exp.location ? `• ${exp.location}` : ''}
                      </div>
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '9pt', color: '#334155' }}>
                          {validBullets.map((b, bIdx) => (
                            <li key={b.id || bIdx} style={{ marginBottom: '3px' }}>{b.text}</li>
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
              <section key="skills" data-section="skills" className="resume-section" style={{ marginBottom: '16px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Skills
                  </h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skills.map((s, idx) => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    return (
                      <span 
                        key={s.id || idx}
                        style={{ 
                          fontSize: '8.5pt', 
                          padding: '2px 8px', 
                          backgroundColor: '#f8fafc', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '4px',
                          color: '#334155',
                          fontWeight: 500
                        }}
                      >
                        {note ? `${s.name} — ${note}` : s.name}
                      </span>
                    );
                  })}
                </div>
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Education
                  </h2>
                </div>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '9.5pt', color: '#0f172a' }}>{edu.degree}</span>
                      <span style={{ fontSize: '8.5pt', color: '#64748b' }}>{edu.startDate} – {edu.endDate}</span>
                    </div>
                    <div style={{ fontSize: '9pt', color: '#475569' }}>
                      {edu.institution} {edu.location ? `(${edu.location})` : ''} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}
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

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" data-section="projects" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Projects
                  </h2>
                </div>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '9.5pt', color: '#0f172a' }}>{proj.name}</span>
                          {proj.role && <span style={{ fontSize: '8.5pt', color: '#475569', fontWeight: 600 }}> ({proj.role})</span>}
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
                        <div style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic', margin: '1px 0' }}>
                          Tech: {techStr}
                        </div>
                      )}
                      {proj.description && <p style={{ margin: '2px 0 0 0', fontSize: '9pt', color: '#334155' }}>{proj.description}</p>}
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
              <section key="certifications" data-section="certifications" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Certifications
                  </h2>
                </div>
                {certifications.map((c, idx) => {
                  const certUrl = c.credentialUrl || c.url;
                  return (
                    <div key={c.id || idx} className="certification-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '3px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <strong>{c.name}</strong> — {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                      {c.credentialId && <span style={{ color: '#64748b', fontSize: '8.5pt' }}> [ID: {c.credentialId}]</span>}
                      {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '6px', color: accentColor }} />}
                    </div>
                  );
                })}
              </section>
            );

          case 'publications':
            if (!publications || publications.length === 0) return null;
            return (
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Publications
                  </h2>
                </div>
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="publication-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '3px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{p.title}</strong> — {p.publisher} {p.date ? `(${p.date})` : ''}
                    {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '6px', color: accentColor }} />}
                    {p.summary && <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{p.summary}</div>}
                  </div>
                ))}
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Honors & Awards
                  </h2>
                </div>
                {awards.map((a, idx) => (
                  <div key={a.id || idx} className="award-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '3px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{a.title}</strong> — {a.issuer} {a.date ? `(${a.date})` : ''}
                    {a.description && <span style={{ color: '#64748b' }}>: {a.description}</span>}
                  </div>
                ))}
              </section>
            );

          case 'volunteer':
            if (!volunteer || volunteer.length === 0) return null;
            return (
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    Volunteer
                  </h2>
                </div>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '3px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{v.role}</strong> — {v.organization} {v.startDate ? `(${v.startDate}${v.endDate ? ` – ${v.endDate}` : ' – Present'})` : ''}
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
                  <section key={cs.id || idx} data-section="custom" className="resume-section" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '4px', height: '14px', backgroundColor: accentColor, borderRadius: '2px' }}></div>
                      <h2 style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0, breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                        {cs.title}
                      </h2>
                    </div>
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

export default ModernProfessional;
