import React from 'react';
import ResumeLink from '../common/ResumeLink';

const NordicSlate = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#475569';
  const fontFamily = formatting?.fontFamily || '"Plus Jakarta Sans", Inter, sans-serif';

  return (
    <div 
      className="canonical-resume nordic-slate"
      style={{
        fontFamily,
        color: '#1e293b',
        backgroundColor: '#ffffff',
        padding: '34px 38px',
        lineHeight: 1.48,
        fontSize: '9.8pt',
        minHeight: '100%'
      }}
    >
      {/* Header */}
      <header data-section="personal" style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20pt', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            {personal?.fullName || 'Your Name'}
          </h1>
          {personal?.title && (
            <div style={{ fontSize: '10.5pt', fontWeight: 600, color: accentColor, marginTop: '2px' }}>
              {personal?.title || 'Engineer'}
            </div>
          )}
          <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {personal?.email && <ResumeLink href={personal.email} style={{ color: '#64748b' }} />}
            {personal?.phone && <span>• <ResumeLink href={personal.phone} style={{ color: '#64748b' }} /></span>}
            {personal?.location && <span>• {personal.location}</span>}
            {personal?.linkedin && <span>• <ResumeLink href={personal.linkedin} label="LinkedIn" style={{ color: accentColor }} /></span>}
            {personal?.github && <span>• <ResumeLink href={personal.github} label="GitHub" style={{ color: accentColor }} /></span>}
            {personal?.portfolio && <span>• <ResumeLink href={personal.portfolio} label="Portfolio" style={{ color: accentColor }} /></span>}
            {personal?.website && <span>• <ResumeLink href={personal.website} style={{ color: accentColor }} /></span>}
          </div>
        </div>

        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: `1px solid #cbd5e1` }}
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
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '12px' }}>
                <p style={{ margin: 0, color: '#334155', fontSize: '9.5pt', lineHeight: 1.45 }}>
                  {personal.summary}
                </p>
              </section>
            );

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" data-section="skills" className="resume-section" style={{ marginBottom: '14px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((s, idx) => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    return (
                      <span key={s.id || idx} style={{ fontSize: '8.5pt', padding: '2px 8px', background: '#f1f5f9', color: '#334155', borderRadius: '4px', fontWeight: 500 }}>
                        {note ? `${s.name} — ${note}` : s.name}
                      </span>
                    );
                  })}
                </div>
              </section>
            );

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 8px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Professional Experience
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {experiences.map((exp, idx) => {
                    const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                    return (
                      <div key={exp.id || idx} className="experience-item" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <div>
                            <strong style={{ fontSize: '10pt', color: '#0f172a' }}>{exp.role}</strong>
                            <span style={{ fontSize: '9pt', color: '#475569' }}> — {exp.company}</span>
                            {exp.location && <span style={{ fontSize: '8.5pt', color: '#64748b' }}> ({exp.location})</span>}
                          </div>
                          <span style={{ fontSize: '8.5pt', color: '#64748b' }}>
                            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        {validBullets.length > 0 && (
                          <ul style={{ margin: '3px 0 0 16px', padding: 0, fontSize: '9.5pt', color: '#334155' }}>
                            {validBullets.map((b, bIdx) => (
                              <li key={b.id || bIdx} style={{ marginBottom: '2px' }}>{b.text}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" data-section="projects" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Key Engineering Projects
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: '9.5pt', color: '#0f172a' }}>{proj.name}</strong>
                          {proj.role && <span style={{ fontSize: '8.5pt', color: '#64748b' }}> ({proj.role})</span>}
                        </div>
                        {proj.link && (
                          <ResumeLink 
                            href={proj.link} 
                            label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                            style={{ fontSize: '8.5pt', color: accentColor, fontWeight: 500 }}
                          />
                        )}
                      </div>
                      {techStr && <div style={{ fontSize: '8.5pt', color: '#64748b', margin: '1px 0' }}>Tech: {techStr}</div>}
                      {proj.description && <div style={{ fontSize: '9pt', color: '#334155' }}>{proj.description}</div>}
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

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                      <div>
                        <strong>{edu.degree}</strong>, {edu.institution}
                        {edu.location && <span style={{ color: '#64748b', fontSize: '8pt' }}> ({edu.location})</span>}
                        {edu.gpa && <span style={{ color: accentColor, fontSize: '8pt', fontWeight: 600 }}> | GPA: {edu.gpa}</span>}
                      </div>
                      <span style={{ color: '#64748b', fontSize: '8.5pt' }}>{edu.startDate} — {edu.endDate}</span>
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
              <section key="certifications" data-section="certifications" className="resume-section" style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Certifications
                </h2>
                {certifications.map((c, idx) => {
                  const certUrl = c.credentialUrl || c.url;
                  return (
                    <div key={c.id || idx} className="certification-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <strong>{c.name}</strong> — {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                      {c.credentialId && <span style={{ color: '#64748b', fontSize: '8pt' }}> [ID: {c.credentialId}]</span>}
                      {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '4px', color: accentColor }} />}
                    </div>
                  );
                })}
              </section>
            );

          case 'publications':
            if (!publications || publications.length === 0) return null;
            return (
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications
                </h2>
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="publication-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    "{p.title}", {p.publisher} {p.date ? `(${p.date})` : ''}
                    {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '4px', color: accentColor }} />}
                    {p.summary && <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{p.summary}</div>}
                  </div>
                ))}
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Awards
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
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Volunteer Experience
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9pt', color: '#334155', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{v.role}</strong>, {v.organization} {v.startDate ? `(${v.startDate}${v.endDate ? ` – ${v.endDate}` : ' – Present'})` : ''}
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
                  <section key={cs.id || idx} data-section="custom" className="resume-section" style={{ marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, margin: '0 0 6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
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

export default NordicSlate;
