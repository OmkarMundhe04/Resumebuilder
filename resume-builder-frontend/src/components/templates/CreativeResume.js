import React from 'react';
import ResumeLink from '../common/ResumeLink';

const CreativeResume = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, formatting } = resume;

  const accentColor = formatting?.accentColor || '#ec4899';
  const fontFamily = formatting?.fontFamily || 'Inter, sans-serif';

  return (
    <div 
      className="canonical-resume creative-resume"
      style={{
        fontFamily,
        color: '#1e293b',
        backgroundColor: '#ffffff',
        padding: '36px 40px',
        lineHeight: 1.5,
        fontSize: '9.5pt',
        minHeight: '100%'
      }}
    >
      {/* Creative Header */}
      <header data-section="personal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${accentColor}`, paddingBottom: '16px', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22pt', fontWeight: 900, margin: 0, color: '#0f172a' }}>
            {personal?.fullName || 'Full Name'}
          </h1>
          <div style={{ fontSize: '11pt', fontWeight: 600, color: accentColor, marginTop: '2px' }}>
            {personal?.title || 'Creative Technologist'}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {personal?.email && <ResumeLink href={personal.email} style={{ color: '#64748b' }} />}
          {personal?.phone && <ResumeLink href={personal.phone} style={{ color: '#64748b' }} />}
          {personal?.location && <div>{personal.location}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
            {personal?.linkedin && <ResumeLink href={personal.linkedin} label="LinkedIn ↗" style={{ color: accentColor, fontWeight: 600 }} />}
            {personal?.github && <ResumeLink href={personal.github} label="GitHub ↗" style={{ color: accentColor, fontWeight: 600 }} />}
            {personal?.portfolio && <ResumeLink href={personal.portfolio} label="Portfolio ↗" style={{ color: accentColor, fontWeight: 600 }} />}
            {personal?.website && <ResumeLink href={personal.website} label="Web ↗" style={{ color: accentColor, fontWeight: 600 }} />}
          </div>
        </div>
      </header>

      {/* Grid Layout for Creative Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Column: Avatar & Skills & Education & Certs */}
        <div>
          {personal?.showPhoto && personal?.photoUrl && (
            <div data-section="personal" style={{ marginBottom: '16px', textAlign: 'center' }}>
              <img 
                src={personal.photoUrl} 
                alt={personal.fullName || 'Photo'} 
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3px solid ${accentColor}`,
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)',
                  margin: '0 auto'
                }}
              />
            </div>
          )}

          {skills && skills.length > 0 && (
            <section data-section="skills" className="resume-section" style={{ marginBottom: '18px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Skills
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {skills.map((s, idx) => {
                  const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                  return (
                    <span key={s.id || idx} style={{ fontSize: '8pt', backgroundColor: '#fce7f3', color: '#9d174d', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {note ? `${s.name} — ${note}` : s.name}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {education && education.length > 0 && (
            <section data-section="education" className="resume-section" style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Education
              </h2>
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="education-item" style={{ marginBottom: '8px', fontSize: '8.5pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{edu.degree}</strong>
                  <span style={{ color: '#64748b' }}>{edu.institution} {edu.location && `(${edu.location})`}</span>
                  <div style={{ color: '#94a3b8', fontSize: '8pt' }}>{edu.startDate} – {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
                  {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                    <div style={{ color: '#64748b', fontSize: '8pt' }}>
                      Courses: {Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework}
                    </div>
                  )}
                  {edu.honors && (Array.isArray(edu.honors) ? edu.honors.length > 0 : edu.honors) && (
                    <div style={{ color: accentColor, fontSize: '8pt' }}>
                      Honors: {Array.isArray(edu.honors) ? edu.honors.join(', ') : edu.honors}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {certifications && certifications.length > 0 && (
            <section data-section="certifications" className="resume-section" style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Certifications
              </h2>
              {certifications.map((c, idx) => {
                const certUrl = c.credentialUrl || c.url;
                return (
                  <div key={c.id || idx} className="certification-item" style={{ marginBottom: '6px', fontSize: '8.5pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong style={{ color: '#0f172a', display: 'block' }}>{c.name}</strong>
                    <span style={{ color: '#64748b' }}>{c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : (c.expiryDate ? `(Expires: ${c.expiryDate})` : '')}</span>
                    {c.credentialId && <div style={{ color: '#94a3b8', fontSize: '7.5pt' }}>ID: {c.credentialId}</div>}
                    {certUrl && <ResumeLink href={certUrl} label="Verify ↗" style={{ color: accentColor, fontSize: '8pt' }} />}
                  </div>
                );
              })}
            </section>
          )}

          {awards && awards.length > 0 && (
            <section data-section="awards" className="resume-section" style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Awards
              </h2>
              {awards.map((a, idx) => (
                <div key={a.id || idx} className="award-item" style={{ marginBottom: '6px', fontSize: '8.5pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <strong style={{ color: '#0f172a' }}>{a.title}</strong>
                  <div style={{ color: '#64748b' }}>{a.issuer} {a.date ? `(${a.date})` : ''}</div>
                  {a.description && <div style={{ color: '#94a3b8', fontSize: '8pt' }}>{a.description}</div>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right Column: Experience, Projects, Publications, Volunteer, Custom */}
        <div>
          {personal?.summary && (
            <section data-section="summary" className="resume-section" style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '4px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Summary
              </h2>
              <p style={{ margin: 0, fontSize: '9pt', color: '#334155', lineHeight: 1.5 }}>{personal.summary}</p>
            </section>
          )}

          {experiences && experiences.length > 0 && (
            <section data-section="experience" className="resume-section" style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Experience
              </h2>
              {experiences.map((exp, idx) => {
                const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                return (
                  <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '10px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '9.5pt' }}>{exp.role}</span>
                      <span style={{ fontSize: '8pt', color: '#64748b' }}>{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                    </div>
                    <div style={{ fontSize: '8.5pt', color: '#64748b', marginBottom: '2px' }}>
                      {exp.company} {exp.location ? `— ${exp.location}` : ''}
                    </div>
                    {validBullets.length > 0 && (
                      <ul style={{ margin: '2px 0 0 14px', padding: 0, fontSize: '8.5pt', color: '#334155' }}>
                        {validBullets.map((b, bIdx) => (
                          <li key={b.id || bIdx}>{b.text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {projects && projects.length > 0 && (
            <section data-section="projects" className="resume-section" style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Key Projects
              </h2>
              {projects.map((proj, idx) => {
                const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                return (
                  <div key={proj.id || idx} className="project-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ fontSize: '9pt', color: '#0f172a' }}>{proj.name}</strong>
                        {proj.role && <span style={{ fontSize: '8.5pt', color: '#64748b' }}> — {proj.role}</span>}
                      </div>
                      {proj.link && (
                        <ResumeLink 
                          href={proj.link} 
                          label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                          style={{ fontSize: '8pt', color: accentColor, fontWeight: 600 }}
                        />
                      )}
                    </div>
                    {techStr && <div style={{ fontSize: '8pt', color: '#ec4899', fontWeight: 500, margin: '1px 0' }}>{techStr}</div>}
                    {proj.description && <p style={{ margin: 0, fontSize: '8.5pt', color: '#475569' }}>{proj.description}</p>}
                    {validBullets.length > 0 && (
                      <ul style={{ margin: '2px 0 0 14px', padding: 0, fontSize: '8.5pt', color: '#334155' }}>
                        {validBullets.map((b, bIdx) => (
                          <li key={b.id || bIdx}>{b.text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {publications && publications.length > 0 && (
            <section data-section="publications" className="resume-section" style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Publications
              </h2>
              {publications.map((p, idx) => (
                <div key={p.id || idx} className="publication-item" style={{ marginBottom: '6px', fontSize: '8.5pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>"{p.title}"</span> — {p.publisher} ({p.date})
                  {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '4px', color: accentColor }} />}
                  {p.summary && <div style={{ fontSize: '8pt', color: '#64748b' }}>{p.summary}</div>}
                </div>
              ))}
            </section>
          )}

          {volunteer && volunteer.length > 0 && (
            <section data-section="volunteer" className="resume-section" style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                Volunteer Experience
              </h2>
              {volunteer.map((v, idx) => (
                <div key={v.id || idx} className="volunteer-item" style={{ marginBottom: '6px', fontSize: '8.5pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <strong style={{ color: '#0f172a' }}>{v.role}</strong>, {v.organization}
                  {v.description && <div style={{ fontSize: '8pt', color: '#64748b' }}>{v.description}</div>}
                </div>
              ))}
            </section>
          )}

          {customSections && customSections.length > 0 && (
            <React.Fragment>
              {customSections.map((cs, idx) => (
                <section key={cs.id || idx} data-section="custom" className="resume-section" style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', color: accentColor, letterSpacing: '0.05em', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                    {cs.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: '8.5pt', color: '#475569', whiteSpace: 'pre-line' }}>{cs.content}</p>
                </section>
              ))}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeResume;
