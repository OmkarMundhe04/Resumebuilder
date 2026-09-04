import React from 'react';
import ResumeLink from '../common/ResumeLink';

const SwissClean = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#000000';
  const fontFamily = formatting?.fontFamily || 'Inter, -apple-system, sans-serif';

  return (
    <div 
      className="canonical-resume swiss-clean"
      style={{
        fontFamily,
        color: '#111827',
        backgroundColor: '#ffffff',
        padding: '34px 38px',
        lineHeight: 1.5,
        fontSize: '10pt',
        minHeight: '100%'
      }}
    >
      {/* Header */}
      <header data-section="personal" style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22pt', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: '#0f172a', textTransform: 'uppercase' }}>
            {personal?.fullName || 'Your Name'}
          </h1>
          {personal?.title && (
            <div style={{ fontSize: '11pt', fontWeight: 600, color: '#4b5563', marginTop: '2px' }}>
              {personal.title}
            </div>
          )}
          <div style={{ fontSize: '8.5pt', color: '#6b7280', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {personal?.email && <ResumeLink href={personal.email} style={{ color: '#6b7280' }} />}
            {personal?.phone && <span>/ <ResumeLink href={personal.phone} style={{ color: '#6b7280' }} /></span>}
            {personal?.location && <span>/ {personal.location}</span>}
            {personal?.linkedin && <span>/ <ResumeLink href={personal.linkedin} label="LinkedIn" style={{ color: '#111827' }} /></span>}
            {personal?.github && <span>/ <ResumeLink href={personal.github} label="GitHub" style={{ color: '#111827' }} /></span>}
            {personal?.portfolio && <span>/ <ResumeLink href={personal.portfolio} label="Portfolio" style={{ color: '#111827' }} /></span>}
            {personal?.website && <span>/ <ResumeLink href={personal.website} style={{ color: '#111827' }} /></span>}
          </div>
        </div>

        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #d1d5db' }}
          />
        )}
      </header>

      {/* Ordered Sections */}
      {(sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'publications', 'awards', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '4px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Professional Profile
                </h2>
                <p style={{ margin: 0, color: '#374151', fontSize: '9.5pt', lineHeight: 1.45 }}>
                  {personal.summary}
                </p>
              </section>
            );

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '8px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Experience
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {experiences.map((exp, idx) => {
                    const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                    return (
                      <div key={exp.id || idx} className="experience-item" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: '10pt', color: '#111827' }}>{exp.role}</strong>
                          <span style={{ fontSize: '8.5pt', color: '#6b7280', fontWeight: 500 }}>
                            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <div style={{ fontSize: '9pt', color: '#4b5563', fontWeight: 600, marginBottom: '3px' }}>
                          {exp.company} {exp.location && `• ${exp.location}`}
                        </div>
                        {validBullets.length > 0 && (
                          <ul style={{ margin: '3px 0 0 16px', padding: 0, fontSize: '9.5pt', color: '#374151' }}>
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

          case 'skills':
            if (!skills || skills.length === 0) return null;
            return (
              <section key="skills" data-section="skills" className="resume-section" style={{ marginBottom: '14px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Skills & Core Competencies
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {skills.map((s, idx) => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    return (
                      <span key={s.id || idx} style={{ fontSize: '8.5pt', padding: '2px 6px', background: '#f3f4f6', borderRadius: '3px', fontWeight: 500 }}>
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
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{ fontSize: '9.5pt' }}>{edu.degree}</strong> — {edu.institution}
                        {edu.location && <span style={{ fontSize: '8.5pt', color: '#6b7280' }}> ({edu.location})</span>}
                        {edu.gpa && <span style={{ fontSize: '8.5pt', color: '#6b7280' }}> (GPA: {edu.gpa})</span>}
                      </div>
                      <span style={{ fontSize: '8.5pt', color: '#6b7280' }}>
                        {edu.startDate} — {edu.endDate}
                      </span>
                    </div>
                    {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                      <div style={{ fontSize: '8pt', color: '#6b7280' }}>
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

          case 'projects':
            if (!projects || projects.length === 0) return null;
            return (
              <section key="projects" data-section="projects" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Projects
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: '9.5pt' }}>{proj.name}</strong>
                          {proj.role && <span style={{ fontSize: '8.5pt', color: '#4b5563', fontWeight: 600 }}> ({proj.role})</span>}
                        </div>
                        {proj.link && (
                          <ResumeLink 
                            href={proj.link} 
                            label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                            style={{ fontSize: '8.5pt', color: '#111827', fontWeight: 600 }}
                          />
                        )}
                      </div>
                      {techStr && (
                        <div style={{ fontSize: '8pt', color: '#6b7280', margin: '1px 0' }}>
                          Tech: {techStr}
                        </div>
                      )}
                      {proj.description && <div style={{ fontSize: '9pt', color: '#374151' }}>{proj.description}</div>}
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '8.5pt', color: '#374151' }}>
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
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Certifications
                </h2>
                {certifications.map((c, idx) => {
                  const certUrl = c.credentialUrl || c.url;
                  return (
                    <div key={c.id || idx} className="certification-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <strong>{c.name}</strong> — {c.issuer} {c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : ''}
                      {c.credentialId && <span style={{ color: '#6b7280', fontSize: '8pt' }}> [ID: {c.credentialId}]</span>}
                      {certUrl && <ResumeLink href={certUrl} label="[Verify]" style={{ marginLeft: '4px', color: '#111827' }} />}
                    </div>
                  );
                })}
              </section>
            );

          case 'publications':
            if (!publications || publications.length === 0) return null;
            return (
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications
                </h2>
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="publication-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    "{p.title}", {p.publisher} ({p.date})
                    {p.url && <ResumeLink href={p.url} label="[Link]" style={{ marginLeft: '4px', color: '#111827' }} />}
                    {p.summary && <div style={{ fontSize: '8.5pt', color: '#6b7280' }}>{p.summary}</div>}
                  </div>
                ))}
              </section>
            );

          case 'awards':
            if (!awards || awards.length === 0) return null;
            return (
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Honors & Awards
                </h2>
                {awards.map((a, idx) => (
                  <div key={a.id || idx} className="award-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{a.title}</strong> — {a.issuer} {a.date ? `(${a.date})` : ''}
                    {a.description && <span style={{ color: '#6b7280' }}>: {a.description}</span>}
                  </div>
                ))}
              </section>
            );

          case 'volunteer':
            if (!volunteer || volunteer.length === 0) return null;
            return (
              <section key="volunteer" data-section="volunteer" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Volunteer Experience
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <strong>{v.role}</strong>, {v.organization} {v.startDate ? `(${v.startDate}${v.endDate ? ` – ${v.endDate}` : ' – Present'})` : ''}
                    {v.description && <div style={{ fontSize: '8.5pt', color: '#6b7280' }}>{v.description}</div>}
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
                    <h2 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                      {cs.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: '9pt', color: '#374151', whiteSpace: 'pre-line' }}>{cs.content}</p>
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

export default SwissClean;
