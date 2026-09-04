/**
 * Native Microsoft Word Document Exporter
 * Generates an ATS-compliant Word document formatted to ISO A4 with standard styling, headers, semantic sections, and clickable hyperlinks.
 */
export const exportToDocx = async (resume, filename) => {
  if (!resume) throw new Error('Resume data is required');

  const {
    personal,
    experiences,
    education,
    skills,
    projects,
    certifications,
    publications,
    awards,
    volunteer,
    customSections,
    sectionOrder,
    sectionVisibility,
    formatting
  } = resume;

  const accent = formatting?.accentColor || '#0284c7';
  const fontFamily = formatting?.fontFamily || 'Calibri';
  const docTitle = `${(personal?.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.doc`;
  const outName = filename || docTitle;

  const formatLink = (url, label) => {
    if (!url) return '';
    let href = url;
    if (url.includes('@') && !url.startsWith('mailto:')) {
      href = `mailto:${url}`;
    } else if (/^\+?[0-9\s\-()]{7,}$/.test(url.trim()) && !url.startsWith('tel:')) {
      href = `tel:${url.replace(/\s+/g, '')}`;
    } else if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      href = `https://${url}`;
    }
    const display = label || url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `<a href="${href}" style="color: ${accent}; text-decoration: underline;">${display}</a>`;
  };

  const contactItems = [];
  if (personal?.email) contactItems.push(formatLink(personal.email, personal.email));
  if (personal?.phone) contactItems.push(formatLink(personal.phone, personal.phone));
  if (personal?.location) contactItems.push(personal.location);
  if (personal?.linkedin) contactItems.push(formatLink(personal.linkedin, 'LinkedIn'));
  if (personal?.github) contactItems.push(formatLink(personal.github, 'GitHub'));
  if (personal?.portfolio) contactItems.push(formatLink(personal.portfolio, 'Portfolio'));
  if (personal?.website) contactItems.push(formatLink(personal.website, personal.website.replace(/^https?:\/\//, '')));

  let contentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${personal?.fullName || 'Resume'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* ISO A4 */
          margin: 0.7in 0.75in 0.7in 0.75in;
          mso-header-margin: 36pt;
          mso-footer-margin: 36pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: '${fontFamily}', 'Calibri', 'Arial', sans-serif;
          font-size: 10.5pt;
          line-height: 1.35;
          color: #111827;
        }
        h1 {
          font-size: 20pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 2pt;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .header-title {
          font-size: 11pt;
          text-align: center;
          color: ${accent};
          font-weight: 600;
          margin-bottom: 4pt;
        }
        .header-contacts {
          font-size: 9.5pt;
          text-align: center;
          color: #334155;
          margin-bottom: 12pt;
          border-bottom: 1.5pt solid ${accent};
          padding-bottom: 6pt;
        }
        h2 {
          font-size: 11.5pt;
          font-weight: bold;
          text-transform: uppercase;
          color: ${accent};
          border-bottom: 1pt solid #cbd5e1;
          margin-top: 12pt;
          margin-bottom: 5pt;
          padding-bottom: 2pt;
          letter-spacing: 0.5px;
        }
        .item-row {
          margin-bottom: 8pt;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 10.5pt;
          color: #0f172a;
        }
        .item-sub {
          font-size: 9.5pt;
          color: #475569;
          font-style: italic;
          margin-bottom: 3pt;
        }
        ul {
          margin-top: 2pt;
          margin-bottom: 4pt;
          padding-left: 18pt;
        }
        li {
          font-size: 9.5pt;
          margin-bottom: 2pt;
          line-height: 1.3;
        }
        .skills-table {
          width: 100%;
          font-size: 9.5pt;
          border-collapse: collapse;
          margin-top: 4pt;
        }
        .skills-table td {
          padding: 2pt 0;
          vertical-align: top;
        }
        .skills-label {
          font-weight: bold;
          width: 130pt;
          color: #1e293b;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <h1>${(personal?.fullName || 'Full Name').toUpperCase()}</h1>
        ${personal?.title ? `<div class='header-title'>${personal.title}</div>` : ''}
        <div class='header-contacts'>
          ${contactItems.join(' &nbsp;|&nbsp; ')}
        </div>
  `;

  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : [
    'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'publications', 'awards', 'volunteer', 'custom'
  ];

  order.forEach(secKey => {
    if (sectionVisibility && sectionVisibility[secKey] === false) return;

    switch (secKey) {
      case 'summary':
        if (personal?.summary) {
          contentHtml += `
            <h2>Professional Summary</h2>
            <p style='font-size: 10pt; text-align: justify; margin: 4pt 0 8pt 0;'>${personal.summary}</p>
          `;
        }
        break;

      case 'experience':
        if (experiences && experiences.length > 0) {
          contentHtml += `<h2>Professional Experience</h2>`;
          experiences.forEach(exp => {
            const validBullets = (exp.bullets || []).filter(b => b && b.text && b.text.trim());
            contentHtml += `
              <div class='item-row'>
                <table style='width: 100%; border-collapse: collapse;'>
                  <tr>
                    <td style='font-weight: bold; font-size: 10.5pt; color: #0f172a;'>${exp.role || 'Role'} — ${exp.company || 'Company'}</td>
                    <td style='text-align: right; font-size: 9.5pt; color: #64748b;'>${exp.startDate || ''} – ${exp.isCurrent ? 'Present' : (exp.endDate || '')}</td>
                  </tr>
                </table>
                ${exp.location ? `<div class='item-sub'>${exp.location}</div>` : ''}
                ${validBullets.length > 0 ? `
                  <ul>
                    ${validBullets.map(b => `<li>${b.text}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `;
          });
        }
        break;

      case 'education':
        if (education && education.length > 0) {
          contentHtml += `<h2>Education</h2>`;
          education.forEach(edu => {
            const courseworkStr = Array.isArray(edu.coursework) ? edu.coursework.join(', ') : (edu.coursework || '');
            const honorsStr = Array.isArray(edu.honors) ? edu.honors.join(', ') : (edu.honors || '');
            contentHtml += `
              <div class='item-row'>
                <table style='width: 100%; border-collapse: collapse;'>
                  <tr>
                    <td style='font-weight: bold; font-size: 10.5pt; color: #0f172a;'>${edu.degree || 'Degree'}, ${edu.institution || 'Institution'}</td>
                    <td style='text-align: right; font-size: 9.5pt; color: #64748b;'>${edu.startDate || ''} – ${edu.endDate || ''}</td>
                  </tr>
                </table>
                ${edu.gpa ? `<div class='item-sub'>GPA: ${edu.gpa}</div>` : ''}
                ${courseworkStr ? `<div style='font-size: 9.5pt; color: #475569;'>Relevant Coursework: ${courseworkStr}</div>` : ''}
                ${honorsStr ? `<div style='font-size: 9.5pt; color: ${accent};'>Honors: ${honorsStr}</div>` : ''}
              </div>
            `;
          });
        }
        break;

      case 'skills':
        if (skills && skills.length > 0) {
          contentHtml += `<h2>Skills</h2><div style='font-size: 9.5pt; color: #334155; line-height: 1.6; margin-bottom: 8pt;'>`;
          const formatted = skills
            .map(s => {
              const name = s.name || '';
              const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
              return note ? `${name} — ${note}` : name;
            })
            .filter(Boolean);
          contentHtml += formatted.join('  •  ');
          contentHtml += `</div>`;
        }
        break;

      case 'projects':
        if (projects && projects.length > 0) {
          contentHtml += `<h2>Projects</h2>`;
          projects.forEach(p => {
            const techStr = Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || '');
            const validBullets = (p.bullets || []).filter(b => b && b.text && b.text.trim());
            contentHtml += `
              <div class='item-row'>
                <table style='width: 100%; border-collapse: collapse;'>
                  <tr>
                    <td style='font-weight: bold; font-size: 10.5pt; color: #0f172a;'>${p.name || 'Project'}${p.role ? ` (${p.role})` : ''}</td>
                    <td style='text-align: right; font-size: 9.5pt; color: #64748b;'>${p.link ? formatLink(p.link, 'Link ↗') : ''}</td>
                  </tr>
                </table>
                ${techStr ? `<div class='item-sub'>Stack: ${techStr}</div>` : ''}
                ${p.description ? `<p style='font-size: 9.5pt; margin: 2pt 0;'>${p.description}</p>` : ''}
                ${validBullets.length > 0 ? `
                  <ul>
                    ${validBullets.map(b => `<li>${b.text}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `;
          });
        }
        break;

      case 'certifications':
        if (certifications && certifications.length > 0) {
          contentHtml += `<h2>Certifications</h2><ul>`;
          certifications.forEach(c => {
            const certUrl = c.credentialUrl || c.url;
            const dateStr = c.issueDate ? `${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''}` : (c.expiryDate ? `Expires: ${c.expiryDate}` : '');
            const metaStr = [dateStr, c.credentialId ? `ID: ${c.credentialId}` : ''].filter(Boolean).join(' | ');
            contentHtml += `<li><strong>${c.name}</strong> — ${c.issuer}${metaStr ? ` (${metaStr})` : ''} ${certUrl ? `[${formatLink(certUrl, 'Verify ↗')}]` : ''}</li>`;
          });
          contentHtml += `</ul>`;
        }
        break;

      case 'publications':
        if (publications && publications.length > 0) {
          contentHtml += `<h2>Publications & Research</h2><ul>`;
          publications.forEach(pub => {
            contentHtml += `<li><strong>${pub.title}</strong> — <em>${pub.publisher}</em> (${pub.date || ''}) ${pub.url ? `[${formatLink(pub.url, 'Link ↗')}]` : ''}</li>`;
          });
          contentHtml += `</ul>`;
        }
        break;

      case 'awards':
        if (awards && awards.length > 0) {
          contentHtml += `<h2>Honors & Awards</h2><ul>`;
          awards.forEach(aw => {
            contentHtml += `<li><strong>${aw.title}</strong> — ${aw.issuer} (${aw.date || ''})${aw.description ? `: ${aw.description}` : ''}</li>`;
          });
          contentHtml += `</ul>`;
        }
        break;

      case 'volunteer':
        if (volunteer && volunteer.length > 0) {
          contentHtml += `<h2>Volunteer & Leadership</h2>`;
          volunteer.forEach(v => {
            contentHtml += `
              <div class='item-row'>
                <div style='font-weight: bold; font-size: 10pt;'>${v.role || 'Volunteer'} — ${v.organization || ''} (${v.startDate || ''} – ${v.endDate || 'Present'})</div>
                ${v.description ? `<p style='font-size: 9.5pt; margin: 2pt 0;'>${v.description}</p>` : ''}
              </div>
            `;
          });
        }
        break;

      case 'custom':
        if (customSections && customSections.length > 0) {
          customSections.forEach(cs => {
            contentHtml += `
              <h2>${cs.title || 'Additional Section'}</h2>
              <div style='font-size: 9.5pt; white-space: pre-line; margin: 4pt 0;'>${cs.content}</div>
            `;
          });
        }
        break;

      default:
        break;
    }
  });

  contentHtml += `
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', contentHtml], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = outName.endsWith('.doc') || outName.endsWith('.docx') ? outName : `${outName}.doc`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
};
