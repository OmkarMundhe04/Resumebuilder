import React from 'react';
import ResumeLink from '../common/ResumeLink';

const StudentResume = ({ resume }) => {
  if (!resume) return null;
  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility, formatting } = resume;

  const accentColor = formatting?.accentColor || '#059669';
  const fontFamily = formatting?.fontFamily || 'Inter, sans-serif';

  return (
    <div 
      className="canonical-resume student-resume"
      style={{
        fontFamily,
        color: '#111827',
        backgroundColor: '#ffffff',
        padding: '34px 38px',
        lineHeight: 1.45,
        fontSize: '10pt',
        minHeight: '100%'
      }}
    >
      {/* Header */}
      <header data-section="personal" style={{ textAlign: 'center', borderBottom: `2px solid ${accentColor}`, paddingBottom: '12px', marginBottom: '14px' }}>
        {personal?.showPhoto && personal?.photoUrl && (
          <img 
            src={personal.photoUrl} 
            alt={personal.fullName || 'Photo'} 
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accentColor}`, marginBottom: '6px' }}
          />
        )}
        <h1 style={{ fontSize: '20pt', fontWeight: 800, margin: 0, color: '#064e3b' }}>
          {personal?.fullName || 'Student Name'}
        </h1>
        {personal?.title && (
          <div style={{ fontSize: '10.5pt', fontWeight: 600, color: accentColor, marginTop: '2px' }}>
            {personal.title}
          </div>
        )}
        <div style={{ fontSize: '9pt', color: '#4b5563', marginTop: '4px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
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
      {(sectionOrder || ['education', 'skills', 'projects', 'experience', 'certifications', 'publications', 'awards', 'volunteer', 'custom']).map((secKey) => {
        if (sectionVisibility && sectionVisibility[secKey] === false) return null;

        switch (secKey) {
          case 'summary':
            if (!personal?.summary) return null;
            return (
              <section key="summary" data-section="summary" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '4px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Objective / Profile
                </h2>
                <p style={{ margin: 0, color: '#374151', fontSize: '9.5pt', lineHeight: 1.45 }}>
                  {personal.summary}
                </p>
              </section>
            );

          case 'education':
            if (!education || education.length === 0) return null;
            return (
              <section key="education" data-section="education" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Education & Academic Honors
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="education-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '9.5pt' }}>
                        {edu.degree} — {edu.institution} {edu.location && `(${edu.location})`}
                      </span>
                      <span style={{ fontSize: '8.5pt', color: '#64748b' }}>{edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate || 'Present'}</span>
                    </div>
                    {edu.gpa && <div style={{ fontSize: '8.5pt', color: accentColor, fontWeight: 600 }}>Cumulative GPA: {edu.gpa}</div>}
                    {edu.coursework && (Array.isArray(edu.coursework) ? edu.coursework.length > 0 : edu.coursework) && (
                      <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '2px' }}>
                        <strong>Relevant Coursework:</strong> {Array.isArray(edu.coursework) ? edu.coursework.join(', ') : edu.coursework}
                      </div>
                    )}
                    {edu.honors && (Array.isArray(edu.honors) ? edu.honors.length > 0 : edu.honors) && (
                      <div style={{ fontSize: '8.5pt', color: '#065f46', marginTop: '2px' }}>
                        <strong>Honors & Awards:</strong> {Array.isArray(edu.honors) ? edu.honors.join(' • ') : edu.honors}
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
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Skills & Competencies
                </h2>
                <div style={{ fontSize: '9pt', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((s, idx) => {
                    const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
                    return (
                      <span key={s.id || idx} style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '8.5pt', fontWeight: 500 }}>
                        {note ? `${s.name} — ${note}` : s.name}
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
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Projects & Coursework Builds
                </h2>
                {projects.map((proj, idx) => {
                  const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
                  const validBullets = (proj.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={proj.id || idx} className="project-item" style={{ marginBottom: '6px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: '9.5pt' }}>{proj.name}</strong>
                          {proj.role && <span style={{ fontSize: '8.5pt', color: '#4b5563' }}> ({proj.role})</span>}
                        </div>
                        {proj.link && (
                          <ResumeLink 
                            href={proj.link} 
                            label={`🔗 ${proj.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                            style={{ fontSize: '8.5pt', color: accentColor, fontWeight: 600 }}
                          />
                        )}
                      </div>
                      {techStr && <div style={{ fontSize: '8.5pt', color: '#64748b', margin: '1px 0' }}>Tech: {techStr}</div>}
                      {proj.description && <p style={{ margin: 0, fontSize: '9pt', color: '#374151' }}>{proj.description}</p>}
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

          case 'experience':
            if (!experiences || experiences.length === 0) return null;
            return (
              <section key="experience" data-section="experience" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Experience & Internships
                </h2>
                {experiences.map((exp, idx) => {
                  const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
                  return (
                    <div key={exp.id || idx} className="experience-item" style={{ marginBottom: '8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '9.5pt' }}>
                          {exp.role} — {exp.company} {exp.location && `(${exp.location})`}
                        </span>
                        <span style={{ fontSize: '8.5pt', color: '#64748b' }}>
                          {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {validBullets.length > 0 && (
                        <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: '9pt', color: '#374151' }}>
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
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Certifications
                </h2>
                {certifications.map((c, idx) => {
                  const certUrl = c.credentialUrl || c.url;
                  return (
                    <div key={c.id || idx} className="certification-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
              <section key="publications" data-section="publications" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Publications
                </h2>
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="publication-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
              <section key="awards" data-section="awards" className="resume-section" style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Honors & Awards
                </h2>
                {awards.map((a, idx) => (
                  <div key={a.id || idx} className="award-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
                <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                  Campus Leadership & Activities
                </h2>
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="volunteer-item" style={{ fontSize: '9pt', color: '#374151', marginBottom: '2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
                  <section key={cs.id || idx} data-section="custom" className="resume-section" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', color: accentColor, borderBottom: '1px solid #d1fae5', paddingBottom: '2px', marginBottom: '6px', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
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

export default StudentResume;
