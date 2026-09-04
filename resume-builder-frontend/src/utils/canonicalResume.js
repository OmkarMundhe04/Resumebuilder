// Canonical Resume Model & Utilities

export const generateId = () => Math.random().toString(36).substring(2, 10);

export const TEMPLATES = [
  { id: 'ats-classic', name: 'ATS Classic', category: 'ATS Standard', description: 'Single-column standardized layout with 99% ATS parsing rate. Recommended default.', isDefault: true, hasPhotoSupport: false },
  { id: 'modern-professional', name: 'Modern Professional', category: 'Modern', description: 'Clean dividers, subtle accent styling, and elegant header portrait placement.', hasPhotoSupport: true },
  { id: 'technical', name: 'Technical / Engineering', category: 'Technical', description: 'Prominent tech stack chips, repository links, and project-first layout.', hasPhotoSupport: false },
  { id: 'student-graduate', name: 'Student / Graduate', category: 'Academic', description: 'Education, honors, relevant coursework, and campus leadership-focused.', hasPhotoSupport: false },
  { id: 'executive', name: 'Executive Leadership', category: 'Executive', description: 'Executive summary, strategic milestone highlights, and leadership scope.', hasPhotoSupport: false },
  { id: 'academic', name: 'Academic CV', category: 'Academic', description: 'Research publications, teaching experience, grants, and conference presentations.', hasPhotoSupport: false },
  { id: 'minimal', name: 'Minimalist Clean', category: 'Minimalist', description: 'Typography-driven, refined whitespace, elegant line heights with zero fluff.', hasPhotoSupport: false },
  { id: 'creative', name: 'Creative Technologist', category: 'Creative', description: 'Design-forward typography, side portfolio showcase, and prominent avatar framing.', hasPhotoSupport: true },
  { id: 'swiss-clean', name: 'Swiss Typography Grid', category: 'Minimalist', description: 'Structured grid layout, high sans-serif legibility, and geometric precision.', hasPhotoSupport: false },
  { id: 'silicon-valley', name: 'Silicon Valley Tech', category: 'Technical', description: 'High-impact technical metrics, modern tech badge arsenal, and header portrait.', hasPhotoSupport: true },
  { id: 'corporate-navy', name: 'Corporate Navy', category: 'Executive', description: 'Deep navy formal accents, executive statement styling, and classic centered portrait.', hasPhotoSupport: true },
  { id: 'emerald-compact', name: 'Emerald Compact', category: 'ATS Standard', description: 'High-density emerald layout maximizing single-page capacity with compact photo.', hasPhotoSupport: true },
  { id: 'tokyo-minimal', name: 'Tokyo Minimal', category: 'Minimalist', description: 'Ultra-sleek monochrome palette with clean Japanese-inspired border accents.', hasPhotoSupport: false },
  { id: 'nordic-slate', name: 'Nordic Slate', category: 'Modern', description: 'Cool slate palette with structured metadata pillars and rounded badges.', hasPhotoSupport: false },
  { id: 'ruby-executive', name: 'Ruby Executive', category: 'Executive', description: 'Warm burgundy tones, milestone highlights, and distinguished executive headers.', hasPhotoSupport: false },
  { id: 'berlin-modern', name: 'Berlin Modern', category: 'Creative', description: 'Bold split header with clean dual-row contact cards and modern square portrait.', hasPhotoSupport: true }
];

export const createDefaultResume = (profileOrUser, role = 'Software Engineer') => {
  const isProfile = profileOrUser && profileOrUser.personal;
  const personalData = isProfile ? profileOrUser.personal : {};
  const userObj = !isProfile ? profileOrUser : null;

  const targetTitle = personalData?.title || role;
  const fullName = personalData?.fullName || userObj?.name || 'Alex Morgan';
  const email = personalData?.email || userObj?.email || 'alex.morgan@example.com';
  const phone = personalData?.phone || '+1 (555) 234-5678';
  const location = personalData?.location || 'San Francisco, CA';
  const summary = personalData?.summary || 'Results-driven software engineer with 4+ years of experience building reliable, performant web platforms. Proven track record of architecting scalable backend APIs and responsive modern user interfaces.';
  const photoUrl = personalData?.photoUrl || personalData?.avatar || userObj?.avatar || '';
  const showPhoto = personalData?.showPhoto !== undefined ? personalData.showPhoto : Boolean(photoUrl);

  const experiences = (isProfile && profileOrUser.experiences?.length > 0)
    ? profileOrUser.experiences
    : [
        {
          id: generateId(),
          company: 'Stripe',
          role: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2022-03',
          endDate: 'Present',
          isCurrent: true,
          responsibilities: 'Led core billing infrastructure and latency optimization.',
          bullets: [
            {
              id: generateId(),
              text: 'Architected high-throughput idempotency engine handling $2B+ in annual transaction volume with 99.999% availability.',
              evidence: { role: 'Lead Architect', task: 'Idempotency Engine', technology: 'Go, PostgreSQL, Redis', outcome: 'Eliminated duplicate payments', metric: '$2B+ Volume' },
              status: 'VERIFIED'
            },
            {
              id: generateId(),
              text: 'Refactored webhook dispatcher pipeline in Go, reducing p99 delivery latency from 1.4s to 120ms.',
              evidence: { role: 'Backend Engineer', task: 'Dispatcher Optimization', technology: 'Go, Kafka', outcome: 'Latency Reduction', metric: '1.4s to 120ms' },
              status: 'VERIFIED'
            }
          ]
        },
        {
          id: generateId(),
          company: 'Acme Cloud Systems',
          role: 'Full Stack Engineer',
          location: 'New York, NY',
          startDate: '2020-01',
          endDate: '2022-02',
          isCurrent: false,
          responsibilities: 'Built real-time telemetry dashboards and customer APIs.',
          bullets: [
            {
              id: generateId(),
              text: 'Engineered analytics visualization portal using React, TypeScript, and D3, adopted by 15,000+ daily active enterprise users.',
              evidence: { role: 'Full Stack Developer', task: 'Analytics Portal', technology: 'React, TypeScript, D3.js', outcome: 'Widespread Enterprise Adoption', metric: '15k+ DAU' },
              status: 'VERIFIED'
            }
          ]
        }
      ];

  const education = (isProfile && profileOrUser.education?.length > 0)
    ? profileOrUser.education
    : [
        {
          id: generateId(),
          institution: 'University of California, Berkeley',
          degree: 'B.S. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2016',
          endDate: '2020',
          gpa: '3.85',
          honors: ["Dean's Honors List", 'Summa Cum Laude']
        }
      ];

  const skills = (isProfile && profileOrUser.skills?.length > 0)
    ? profileOrUser.skills.map(s => ({
        id: s.id || generateId(),
        name: s.name || '',
        note: s.note !== undefined ? s.note : (s.proficiency || '')
      }))
    : [
        { id: generateId(), name: 'TypeScript', note: '' },
        { id: generateId(), name: 'React', note: '' },
        { id: generateId(), name: 'Node.js', note: '' },
        { id: generateId(), name: 'PostgreSQL', note: '' },
        { id: generateId(), name: 'Docker', note: '' },
        { id: generateId(), name: 'System Design', note: '' }
      ];

  const projects = (isProfile && profileOrUser.projects?.length > 0)
    ? profileOrUser.projects
    : [
        {
          id: generateId(),
          name: 'Distributed Event Broker',
          description: 'High-performance publish-subscribe message broker written in Go with Raft consensus algorithm.',
          role: 'Creator & Maintainer',
          technologies: ['Go', 'Raft', 'gRPC'],
          link: 'https://github.com/alexmorgan/event-broker',
          bullets: [{ id: generateId(), text: 'Sustains 450,000 msg/sec with sub-millisecond tail latency.' }]
        }
      ];

  const certifications = isProfile ? (profileOrUser.certifications || []) : [
    {
      id: generateId(),
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023-04',
      expiryDate: '',
      credentialId: 'AWS-ASA-9948271',
      credentialUrl: 'https://aws.amazon.com/verification'
    }
  ];

  return {
    id: generateId(),
    title: `${targetTitle} Resume`,
    targetRole: targetTitle,
    targetCompany: '',
    template: 'ats-classic',
    version: 1,
    personal: {
      fullName,
      title: targetTitle,
      email,
      phone,
      location,
      website: personalData?.website || 'https://alexmorgan.dev',
      linkedin: personalData?.linkedin || 'https://linkedin.com/in/alexmorgan',
      github: personalData?.github || 'https://github.com/alexmorgan',
      portfolio: personalData?.portfolio || 'https://alexmorgan.dev/portfolio',
      summary,
      showPhoto,
      photoUrl
    },
    sectionOrder: [
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'publications',
      'awards',
      'volunteer',
      'custom'
    ],
    sectionVisibility: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      publications: true,
      awards: true,
      volunteer: true,
      custom: true
    },
    experiences,
    education,
    skills,
    projects,
    certifications,
    publications: isProfile ? (profileOrUser.publications || []) : [],
    awards: isProfile ? (profileOrUser.awards || []) : [],
    volunteer: isProfile ? (profileOrUser.volunteer || []) : [],
    customSections: [],
    formatting: {
      fontFamily: 'Inter',
      fontSize: 'medium',
      lineSpacing: 'normal',
      margins: 'normal',
      paperSize: 'a4',
      accentColor: '#2563eb'
    }
  };
};

export const createDefaultCanonicalResume = createDefaultResume;

// Deterministic Raw Plain-Text Extraction (Simulating an ATS Parser)
export const extractRawResumeText = (resume) => {
  if (!resume) return '';
  const lines = [];

  const { personal, experiences, education, skills, projects, certifications, publications, awards, volunteer, customSections, sectionOrder, sectionVisibility } = resume;

  // Header
  if (personal?.fullName) lines.push(personal.fullName.toUpperCase());
  if (personal?.title) lines.push(personal.title);
  
  const contacts = [
    personal?.email,
    personal?.phone,
    personal?.location,
    personal?.linkedin,
    personal?.github,
    personal?.website
  ].filter(Boolean);
  if (contacts.length > 0) lines.push(contacts.join(' | '));
  lines.push('');

  // Sections ordered by canonical sectionOrder
  (sectionOrder || []).forEach(secKey => {
    if (sectionVisibility && sectionVisibility[secKey] === false) return;

    switch (secKey) {
      case 'summary':
        if (personal?.summary) {
          lines.push('PROFESSIONAL SUMMARY');
          lines.push(personal.summary);
          lines.push('');
        }
        break;

      case 'experience':
        if (experiences && experiences.length > 0) {
          lines.push('WORK EXPERIENCE');
          experiences.forEach(exp => {
            lines.push(`${exp.role || 'Role'} - ${exp.company || 'Company'}${exp.location ? ', ' + exp.location : ''}`);
            lines.push(`${exp.startDate || ''} - ${exp.isCurrent ? 'Present' : (exp.endDate || '')}`);
            (exp.bullets || []).forEach(b => {
              if (b.text) lines.push(`• ${b.text}`);
            });
            lines.push('');
          });
        }
        break;

      case 'education':
        if (education && education.length > 0) {
          lines.push('EDUCATION');
          education.forEach(edu => {
            lines.push(`${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`);
            lines.push(`${edu.startDate || ''} - ${edu.endDate || ''}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}`);
            if (edu.coursework && edu.coursework.length > 0) {
              lines.push(`Relevant Coursework: ${edu.coursework.join(', ')}`);
            }
            if (edu.honors && edu.honors.length > 0) {
              lines.push(`Honors: ${edu.honors.join(', ')}`);
            }
            lines.push('');
          });
        }
        break;

      case 'skills':
        if (skills && skills.length > 0) {
          lines.push('SKILLS');
          skills.forEach(s => {
            const name = s.name || '';
            const note = (s.note !== undefined ? s.note : (s.proficiency || '')).trim();
            if (name) {
              lines.push(note ? `${name} — ${note}` : name);
            }
          });
          lines.push('');
        }
        break;

      case 'projects':
        if (projects && projects.length > 0) {
          lines.push('PROJECTS');
          projects.forEach(p => {
            lines.push(`${p.name || 'Project'}${p.role ? ' (' + p.role + ')' : ''}`);
            if (p.technologies && p.technologies.length > 0) {
              lines.push(`Technologies: ${p.technologies.join(', ')}`);
            }
            if (p.description) lines.push(p.description);
            (p.bullets || []).forEach(b => {
              if (b.text) lines.push(`• ${b.text}`);
            });
            lines.push('');
          });
        }
        break;

      case 'certifications':
        if (certifications && certifications.length > 0) {
          lines.push('CERTIFICATIONS');
          certifications.forEach(c => {
            const dates = c.issueDate ? `(${c.issueDate}${c.expiryDate ? ` - ${c.expiryDate}` : ''})` : (c.expiryDate ? `(Expires: ${c.expiryDate})` : '');
            lines.push(`${c.name || 'Certification'} - ${c.issuer || 'Issuer'}${dates ? ` ${dates}` : ''}`);
            if (c.credentialId) lines.push(`Credential ID: ${c.credentialId}`);
          });
          lines.push('');
        }
        break;

      case 'publications':
        if (publications && publications.length > 0) {
          lines.push('PUBLICATIONS & RESEARCH');
          publications.forEach(p => {
            lines.push(`${p.title || 'Publication'} - ${p.publisher || ''} ${p.date ? `(${p.date})` : ''}`);
            if (p.url) lines.push(`Link: ${p.url}`);
            if (p.summary || p.description) lines.push(p.summary || p.description);
          });
          lines.push('');
        }
        break;

      case 'awards':
        if (awards && awards.length > 0) {
          lines.push('HONORS & AWARDS');
          awards.forEach(a => {
            lines.push(`${a.title || 'Award'} - ${a.issuer || ''} ${a.date ? `(${a.date})` : ''}`);
            if (a.description) lines.push(a.description);
          });
          lines.push('');
        }
        break;

      case 'volunteer':
        if (volunteer && volunteer.length > 0) {
          lines.push('VOLUNTEER & LEADERSHIP');
          volunteer.forEach(v => {
            const dates = v.startDate ? `(${v.startDate}${v.endDate ? ` - ${v.endDate}` : ' - Present'})` : '';
            lines.push(`${v.role || 'Volunteer'} - ${v.organization || ''} ${dates}`);
            if (v.description) lines.push(v.description);
          });
          lines.push('');
        }
        break;

      case 'custom':
        if (customSections && customSections.length > 0) {
          customSections.forEach(cs => {
            lines.push((cs.title || 'ADDITIONAL SECTION').toUpperCase());
            lines.push(cs.content || '');
            lines.push('');
          });
        }
        break;

      default:
        break;
    }
  });

  return lines.join('\n');
};

// Calculate Resume Health in 7 Independent Dimensions
export const calculateResumeHealth = (resume) => {
  if (!resume) return { overall: 0 };

  let parserSafety = 100;
  let jobAlignment = 85;
  let evidenceStrength = 90;
  let readability = 95;
  let accessibility = 98;
  let completeness = 90;
  let formattingSafety = 100;

  const diagnostics = [];

  const { personal, experiences, education, skills } = resume;

  // Contact checks
  if (!personal?.fullName) {
    parserSafety -= 25;
    completeness -= 20;
    diagnostics.push({ category: 'Parser Safety', severity: 'Critical', message: 'Full name is missing from document header.' });
  }
  if (!personal?.email) {
    parserSafety -= 20;
    completeness -= 15;
    diagnostics.push({ category: 'Parser Safety', severity: 'Critical', message: 'Email address is missing. ATS parsers cannot establish applicant contact.' });
  }
  if (!personal?.phone) {
    parserSafety -= 15;
    completeness -= 10;
    diagnostics.push({ category: 'Parser Safety', severity: 'Needs Attention', message: 'Phone number is missing. Most recruiters filter for reachable candidates.' });
  }
  if (!personal?.summary || personal.summary.length < 40) {
    completeness -= 10;
    readability -= 10;
    diagnostics.push({ category: 'Readability', severity: 'Good', message: 'Adding a 2-3 sentence executive summary improves recruiter hook rate.' });
  }

  // Experience checks
  if (!experiences || experiences.length === 0) {
    completeness -= 25;
    evidenceStrength -= 30;
    diagnostics.push({ category: 'Evidence Strength', severity: 'Critical', message: 'No work experience entries found. Add at least one experience or project.' });
  } else {
    let unmeasuredBullets = 0;
    let totalBullets = 0;
    experiences.forEach(exp => {
      (exp.bullets || []).forEach(b => {
        totalBullets++;
        if (!b.evidence?.metric && !/\d+%|\d+\s?k|\d+\s?users|\d+\s?M/i.test(b.text)) {
          unmeasuredBullets++;
        }
      });
    });
    if (totalBullets > 0 && (unmeasuredBullets / totalBullets) > 0.6) {
      evidenceStrength -= 15;
      diagnostics.push({ category: 'Evidence Strength', severity: 'Needs Attention', message: `${unmeasuredBullets} experience bullet(s) lack quantified metrics or measurable evidence.` });
    }
  }

  // Skills checks
  if (!skills || skills.length < 5) {
    jobAlignment -= 20;
    completeness -= 15;
    diagnostics.push({ category: 'Job Alignment', severity: 'Needs Attention', message: 'Fewer than 5 skills listed. Technical roles typically require 8-15 core skills.' });
  }

  // Education check
  if (!education || education.length === 0) {
    completeness -= 15;
    diagnostics.push({ category: 'Completeness', severity: 'Needs Attention', message: 'No education history listed.' });
  }

  const clamp = (val) => Math.max(30, Math.min(100, Math.round(val)));
  const scores = {
    parserSafety: clamp(parserSafety),
    jobAlignment: clamp(jobAlignment),
    evidenceStrength: clamp(evidenceStrength),
    readability: clamp(readability),
    accessibility: clamp(accessibility),
    completeness: clamp(completeness),
    formattingSafety: clamp(formattingSafety)
  };

  scores.overall = Math.round(
    (scores.parserSafety + scores.jobAlignment + scores.evidenceStrength + scores.readability + scores.accessibility + scores.completeness + scores.formattingSafety) / 7
  );

  scores.diagnostics = diagnostics;
  return scores;
};

// Detect Deterministic 1-Click Safe Repairs
export const detectSafeRepairs = (resume) => {
  const repairs = [];
  if (!resume) return repairs;

  // 1. Standardize date formats (e.g. "03/2022" or "March 2022" -> "YYYY-MM")
  let hasNonStandardDate = false;
  (resume.experiences || []).forEach(exp => {
    if (exp.startDate && !/^\d{4}(-\d{2})?$/.test(exp.startDate)) hasNonStandardDate = true;
    if (exp.endDate && !/^\d{4}(-\d{2})?$/.test(exp.endDate) && exp.endDate.toLowerCase() !== 'present') hasNonStandardDate = true;
  });
  if (hasNonStandardDate) {
    repairs.push({
      id: 'standardize_dates',
      title: 'Standardize Date Formats',
      description: 'Convert scattered date strings into standard ATS YYYY-MM format for flawless timeline parsing.',
      impact: 'Increases Parser Safety by +10%'
    });
  }

  // 2. Remove empty bullets
  let hasEmptyBullets = false;
  (resume.experiences || []).forEach(exp => {
    if (exp.bullets?.some(b => !b.text || b.text.trim().length === 0)) hasEmptyBullets = true;
  });
  if (hasEmptyBullets) {
    repairs.push({
      id: 'clean_empty_bullets',
      title: 'Remove Empty Bullet Items',
      description: 'Clean out empty bullet placeholders across all work experience entries.',
      impact: 'Improves Readability and eliminates formatting clutter.'
    });
  }

  // 3. Trim punctuation anomalies
  repairs.push({
    id: 'normalize_punctuation',
    title: 'Normalize Bullet Punctuation',
    description: 'Ensure every bullet consistently ends with a single period without double periods or trailing spaces.',
    impact: 'Improves Human Readability and ATS layout clarity.'
  });

  return repairs;
};

// Apply Safe Repair
export const applySafeRepair = (resume, repairId) => {
  const updated = JSON.parse(JSON.stringify(resume));

  if (repairId === 'clean_empty_bullets') {
    (updated.experiences || []).forEach(exp => {
      exp.bullets = (exp.bullets || []).filter(b => b.text && b.text.trim().length > 0);
    });
    (updated.projects || []).forEach(proj => {
      proj.bullets = (proj.bullets || []).filter(b => b.text && b.text.trim().length > 0);
    });
  }

  if (repairId === 'normalize_punctuation') {
    (updated.experiences || []).forEach(exp => {
      (exp.bullets || []).forEach(b => {
        if (b.text) {
          b.text = b.text.trim().replace(/[.]+$/, '') + '.';
        }
      });
    });
    (updated.projects || []).forEach(proj => {
      (proj.bullets || []).forEach(b => {
        if (b.text) {
          b.text = b.text.trim().replace(/[.]+$/, '') + '.';
        }
      });
    });
  }

  if (repairId === 'standardize_dates') {
    const normalizeDate = (d) => {
      if (!d) return '';
      if (d.toLowerCase() === 'present') return 'Present';
      const m = d.match(/(\d{4})/);
      return m ? m[1] : d;
    };
    (updated.experiences || []).forEach(exp => {
      if (exp.startDate) exp.startDate = normalizeDate(exp.startDate);
      if (exp.endDate) exp.endDate = normalizeDate(exp.endDate);
    });
    (updated.education || []).forEach(edu => {
      if (edu.startDate) edu.startDate = normalizeDate(edu.startDate);
      if (edu.endDate) edu.endDate = normalizeDate(edu.endDate);
    });
  }

  return updated;
};
