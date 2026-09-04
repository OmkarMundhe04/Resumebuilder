import React from 'react';
import ResumeLink from '../common/ResumeLink';

const MinimalistResume = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const fontFamily = formatting?.fontFamily || 'Helvetica Neue, Arial, sans-serif';

  return (
    <div 
      className="canonical-resume minimalist-resume"
      style={{
        fontFamily,
        color: '#18181b',
        backgroundColor: '#ffffff',
        padding: '36px 40px',
        lineHeight: 1.5,
        fontSize: '9.5pt',
        minHeight: '100%'
      }}
    >
      {/* Minimalist Header */}
      <header data-section="personal" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24pt', fontWeight: 300, margin: 0, letterSpacing: '-0.03em', color: '#09090b' }}>
            {personal?.fullName || 'Full Name'}
          </h1>
          {personal?.title && (
            <div style={{ fontSize: '10pt', fontWeight: 400, color: '#71717a', marginTop: '2px' }}>
              {personal.title}
            </div>
          )}
          <div style={{ fontSize: '8.5pt', color: '#71717a', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {personal?.email && <ResumeLink href={personal.email} style={{ color: '#71717a' }} />}
            {personal?.phone && <ResumeLink href={personal.phone} style={{ color: '#71717a' }} />}
            {personal?.location && <span>{personal.location}</span>}
            {personal?.linkedin && <ResumeLink href={personal.linkedin} label="LinkedIn" style={{ color: '#18181b' }} />}
            {personal?.github && <ResumeLink href={personal.github} label="GitHub" style={{ color: '#18181b' }} />}
            {personal?.portfolio && <ResumeLink href={personal.portfolio} label="Portfolio" style={{ color: '#18181b' }} />}
            {personal?.website && <ResumeLink href={personal.website} style={{ color: '#18181b' }} />}
          </div>
        </div>

        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #d4d4d8' }}
          />
        )}
      </header>

      {/* Sections */}
      {(sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'publications', 'awards', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '9pt', color: '#52525b', lineHeight: 1.6 }}>{personal.summary}</p>
              </section>
            );

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Experience
                </h2>
                {experiences.map((exp, idx) => {
                  const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '12px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#09090b' }}>
                          {exp.role}, {exp.company} {exp.location && `(${exp.location})`}
                        </span>
                        <span style={{ color: '#a1a1aa', fontSize: '8.5pt' }}>{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                      </div>
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '9pt', color: '#52525b' }}>
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

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" data-section="skills" className="resume-section" style={{ marginBottom: '18px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Skills
                </h2>
                <p style={{ margin: 0, fontSize: '9pt', color: '#52525b', lineHeight: 1.6 }}>
                  {skills.map(s => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    return note ? `${s.name} — ${note}` : s.name;
                  }).join('  /  ')}
                </p>
              </section>
            );

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" data-section="projects" className="resume-section" style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Selected Works & Projects
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: '9pt', color: '#09090b' }}>{proj.name}</strong>
                          {proj.role && <span style={{ fontSize: '8.5pt', color: '#71717a' }}> — {proj.role}</span>}
                        </div>
                        {proj.link && (
                          <ResumeLink 
                            href={proj.link} 
                            label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                            style={{ fontSize: '8pt', color: '#09090b' }}
                          />
                        )}
                      </div>
                      {techStr && <div style={{ fontSize: '8pt', color: '#a1a1aa', margin: '1px 0' }}>{techStr}</div>}
                      {proj.description && <p style={{ margin: 0, fontSize: '8.5pt', color: '#52525b' }}>{proj.description}</p>}
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '8.5pt', color: '#52525b' }}>
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
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#52525b' }}>
                      <span>
                        <strong>{edu.degree}</strong> — {edu.institution} {edu.location && `(${edu.location})`}
                        {edu.gpa && ` (GPA: ${edu.gpa})`}
                      </span>
                      <span style={{ color: '#a1a1aa' }}>{edu.startDate} – {edu.endDate}</span>
                    </div>
                    {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                      <div style={{ fontSize: '8pt', color: '#a1a1aa' }}>
                        Coursework: {Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework}
                      </div>
                    )}
                    {edu.honors && (Array.isArray(edu.honors) ? edu.honors.length > 0 : edu.honors) && (
                      <div style={{ fontSize: '8pt', color: '#059669' }}>
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
              <section key="certifications" data-section="certifications" className="resume-section" style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Certifications
                </h2>
                {certifications.map((c, idx) => {
                  const certUrl = c.credentialUrl || c.url;
                  return (
                    <div key={c.id || idx} className="certification-item" style={{ fontSize: '9pt', color: '#52525b', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      {c.name} — {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                      {c.credentialId && <span style={{ color: '#a1a1aa', fontSize: '8pt' }}> [ID: {c.credentialId}]</span>}
                      {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '4px', color: '#09090b' }} />}
                    </div>
                  );
                })}
              </section>
            );

          case 'publications':
            if (!publications || publications.length === 0) return null;
            return (
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications
                </h2>
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="publication-item" style={{ fontSize: '9pt', color: '#52525b', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    "{p.title}", {p.publisher} {p.date ? `(${p.date})` : ''}
                    {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '4px', color: '#09090b' }} />}
                    {p.summary && <div style={{ fontSize: '8.5pt', color: '#71717a' }}>{p.summary}</div>}
                  </div>
                ))}
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Awards
                </h2>
                {awards.map((a, idx) => (
                  <div key={a.id || idx} className="award-item" style={{ fontSize: '9pt', color: '#52525b', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    {a.title} — {a.issuer} {a.date ? `(${a.date})` : ''}
                    {a.description && <span style={{ color: '#71717a' }}>: {a.description}</span>}
                  </div>
                ))}
              </section>
            );

          case 'volunteer':
            if (!volunteer || volunteer.length === 0) return null;
            return (
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Volunteer
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9pt', color: '#52525b', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    {v.role}, {v.organization} {v.startDate ? `(${v.startDate}${v.endDate ? ` – ${v.endDate}` : ' – Present'})` : ''}
                    {v.description && <div style={{ fontSize: '8.5pt', color: '#71717a' }}>{v.description}</div>}
                  </div>
                ))}
              </section>
            );

          case 'custom':
            if (!customSections || customSections.length === 0) return null;
            return (
              <React.Fragment key="custom">
                {customSections.map((cs, idx) => (
                  <section key={cs.id || idx} data-section="custom" className="resume-section" style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '8.5pt', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                      {cs.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: '9pt', color: '#52525b', whiteSpace: 'pre-line' }}>{cs.content}</p>
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

export default MinimalistResume;
