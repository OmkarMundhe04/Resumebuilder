import React from 'react';
import ResumeLink from '../common/ResumeLink';

const ExecutiveResume = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#7c2d12';
  const fontFamily = formatting?.fontFamily || 'Georgia, serif';

  return (
    <div 
      className="canonical-resume executive-resume"
      style={{
        fontFamily,
        color: '#1c1917',
        backgroundColor: '#ffffff',
        padding: '34px 40px',
        lineHeight: 1.5,
        fontSize: '10pt',
        minHeight: '100%'
      }}
    >
      {/* Executive Header */}
      <header data-section="personal" style={{ textAlign: 'center', borderBottom: `2px double #d6d3d1`, paddingBottom: '14px', marginBottom: '16px' }}>
        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accentColor}`, marginBottom: '6px' }}
          />
        )}
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0, letterSpacing: '0.04em', color: '#441a0e' }}>
          {personal?.fullName || 'Executive Name'}
        </h1>
        {personal?.title && (
          <div style={{ fontSize: '11pt', fontStyle: 'italic', color: '#78716c', marginTop: '2px' }}>
            {personal.title}
          </div>
        )}
        <div style={{ fontSize: '8.5pt', color: '#57534e', marginTop: '6px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {personal?.email && <ResumeLink href={personal.email} style={{ color: '#57534e' }} />}
          {personal?.phone && <span>| <ResumeLink href={personal.phone} style={{ color: '#57534e' }} /></span>}
          {personal?.location && <span>| {personal.location}</span>}
          {personal?.linkedin && <span>| <ResumeLink href={personal.linkedin} label="LinkedIn" style={{ color: accentColor }} /></span>}
          {personal?.github && <span>| <ResumeLink href={personal.github} label="GitHub" style={{ color: accentColor }} /></span>}
          {personal?.portfolio && <span>| <ResumeLink href={personal.portfolio} label="Portfolio" style={{ color: accentColor }} /></span>}
          {personal?.website && <span>| <ResumeLink href={personal.website} style={{ color: accentColor }} /></span>}
        </div>
      </header>

      {/* Ordered Sections */}
      {(sectionOrder || ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'publications', 'awards', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Executive Profile & Strategic Scope
                </h2>
                <p style={{ margin: 0, fontSize: '9.5pt', color: '#292524', textAlign: 'justify', lineHeight: 1.6 }}>
                  {personal.summary}
                </p>
              </section>
            );

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '8px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Professional History & Operational Impact
                </h2>
                {experiences.map((exp, idx) => {
                  const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '12px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '10.5pt', color: '#1c1917' }}>{exp.role}</span>
                        <span style={{ fontSize: '9pt', color: '#78716c', fontStyle: 'italic' }}>
                          {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '9.5pt', color: accentColor, fontWeight: 600, marginBottom: '4px' }}>
                        {exp.company} {exp.location ? `— ${exp.location}` : ''}
                      </div>
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '0 0 0 18px', padding: 0, fontSize: '9.5pt', color: '#292524' }}>
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
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Areas of Expertise
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px', fontSize: '9pt', color: '#292524' }}>
                  {skills.map((s, idx) => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    return (
                      <div key={s.id || idx}>• {note ? `${s.name} — ${note}` : s.name}</div>
                    );
                  })}
                </div>
              </section>
            );

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" data-section="projects" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Strategic Initiatives & Ventures
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: '10pt', color: '#1c1917' }}>{proj.name}</strong>
                          {proj.role && <span style={{ fontSize: '9pt', color: '#78716c', fontStyle: 'italic' }}> — {proj.role}</span>}
                        </div>
                        {proj.link && (
                          <ResumeLink 
                            href={proj.link} 
                            label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                            style={{ fontSize: '8.5pt', color: accentColor }}
                          />
                        )}
                      </div>
                      {techStr && <div style={{ fontSize: '8.5pt', color: '#78716c', margin: '1px 0' }}>Tech: {techStr}</div>}
                      {proj.description && <div style={{ fontSize: '9pt', color: '#292524' }}>{proj.description}</div>}
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 18px', padding: 0, fontSize: '9pt', color: '#292524' }}>
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
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education & Governance
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5pt' }}>
                      <div>
                        <strong>{edu.degree}</strong>, {edu.institution}
                        {edu.location && <span style={{ color: '#78716c', fontSize: '8.5pt' }}> ({edu.location})</span>}
                        {edu.gpa && <span style={{ color: accentColor, fontSize: '8.5pt' }}> | GPA: {edu.gpa}</span>}
                      </div>
                      <span style={{ color: '#78716c', fontSize: '8.5pt' }}>{edu.startDate} – {edu.endDate}</span>
                    </div>
                    {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                      <div style={{ fontSize: '8.5pt', color: '#78716c' }}>
                        Coursework: {Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework}
                      </div>
                    )}
                    {edu.honors && (Array.isArray(edu.honors) ? edu.honors.length > 0 : edu.honors) && (
                      <div style={{ fontSize: '8.5pt', color: accentColor }}>
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
              <section key="certifications" data-section="certifications" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Board Certifications & Credentials
                </h2>
                {certifications.map((c, idx) => {
                  const certUrl = c.credentialUrl || c.url;
                  return (
                    <div key={c.id || idx} className="certification-item" style={{ fontSize: '9.5pt', color: '#292524', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      • <strong>{c.name}</strong>, {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                      {c.credentialId && <span style={{ color: '#78716c', fontSize: '8pt' }}> [ID: {c.credentialId}]</span>}
                      {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '4px', color: accentColor }} />}
                    </div>
                  );
                })}
              </section>
            );

          case 'publications':
            if (!publications || publications.length === 0) return null;
            return (
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications & Research
                </h2>
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="publication-item" style={{ fontSize: '9.5pt', color: '#292524', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    • "{p.title}", {p.publisher} {p.date ? `(${p.date})` : ''}
                    {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '4px', color: accentColor }} />}
                    {p.summary && <div style={{ fontSize: '8.5pt', color: '#78716c' }}>{p.summary}</div>}
                  </div>
                ))}
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Honors & Recognitions
                </h2>
                {awards.map((a, idx) => (
                  <div key={a.id || idx} className="award-item" style={{ fontSize: '9.5pt', color: '#292524', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    • <strong>{a.title}</strong>, {a.issuer} {a.date ? `(${a.date})` : ''}
                    {a.description && <span style={{ color: '#78716c' }}>: {a.description}</span>}
                  </div>
                ))}
              </section>
            );

          case 'volunteer':
            if (!volunteer || volunteer.length === 0) return null;
            return (
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Board & Civic Leadership
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9.5pt', color: '#292524', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    • <strong>{v.role}</strong>, {v.organization} {v.startDate ? `(${v.startDate}${v.endDate ? ` – ${v.endDate}` : ' – Present'})` : ''}
                    {v.description && <div style={{ fontSize: '8.5pt', color: '#78716c' }}>{v.description}</div>}
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
                    <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#441a0e', borderBottom: '1px solid #e7e5e4', paddingBottom: '2px', marginBottom: '6px', fontFamily: 'sans-serif', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                      {cs.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: '9.5pt', color: '#292524', whiteSpace: 'pre-line' }}>{cs.content}</p>
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

export default ExecutiveResume;
