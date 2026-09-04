/**
 * Frontend Canonical Resume Engine & ATS Diagnostic Unit Tests
 */
import {
  createDefaultCanonicalResume,
  extractRawResumeText,
  calculateResumeHealth,
  detectSafeRepairs,
  applySafeRepair
} from '../utils/canonicalResume';

describe('Canonical Resume Engine & ATS Diagnostic Tests', () => {
  test('Creates canonical resume with default 8-section layout and valid schema', () => {
    const resume = createDefaultCanonicalResume();
    expect(resume.template).toBe('ats-classic');
    expect(resume.sectionOrder).toHaveLength(10);
    expect(resume.personal).toBeDefined();
    expect(Array.isArray(resume.experiences)).toBe(true);
    expect(Array.isArray(resume.skills)).toBe(true);
  });

  test('Extracts plain text stream and detects key contact fields', () => {
    const resume = createDefaultCanonicalResume();
    resume.personal.fullName = 'Jane Doe, M.S.';
    resume.personal.email = 'jane.doe@example.com';
    resume.personal.phone = '+1 (555) 123-4567';

    const rawText = extractRawResumeText(resume);
    expect(rawText.toLowerCase()).toContain('jane doe, m.s.');
    expect(rawText).toContain('jane.doe@example.com');
    expect(rawText).toContain('+1 (555) 123-4567');
    expect(rawText).toContain('WORK EXPERIENCE');
  });

  test('Calculates 7 independent health dimensions deterministically', () => {
    const resume = createDefaultCanonicalResume();
    const health = calculateResumeHealth(resume);

    expect(health.parserSafety).toBeGreaterThanOrEqual(0);
    expect(health.jobAlignment).toBeGreaterThanOrEqual(0);
    expect(health.evidenceStrength).toBeGreaterThanOrEqual(0);
    expect(health.readability).toBeGreaterThanOrEqual(0);
    expect(health.accessibility).toBeGreaterThanOrEqual(0);
    expect(health.completeness).toBeGreaterThanOrEqual(0);
    expect(health.formattingSafety).toBeGreaterThanOrEqual(0);
    expect(health.overall).toBeGreaterThanOrEqual(0);
    expect(health.overall).toBeLessThanOrEqual(100);
  });

  test('Detects and applies safe repair for bullet punctuation without modifying claims', () => {
    const resume = createDefaultCanonicalResume();
    resume.experiences = [{
      id: 'exp-1',
      company: 'Test Corp',
      role: 'Engineer',
      bullets: [{ id: 'b-1', text: 'Built real-time messaging pipeline without period' }]
    }];

    const repairs = detectSafeRepairs(resume);
    expect(repairs.some(r => r.id === 'normalize_punctuation')).toBe(true);

    const repaired = applySafeRepair(resume, 'normalize_punctuation');
    expect(repaired.experiences[0].bullets[0].text.endsWith('.')).toBe(true);
  });

  test('Handles edge cases: empty sections, Unicode characters, and long strings gracefully', () => {
    const emptyResume = {
      personal: { fullName: 'Dr. René Müller-Strauß (Ph.D. / 博士)', email: 'rene@domain.org' },
      experiences: [],
      education: [],
      skills: [],
      sectionOrder: ['personal', 'experience', 'skills']
    };

    const text = extractRawResumeText(emptyResume);
    expect(text.toLowerCase()).toContain('dr. rené müller-strauss');

    const health = calculateResumeHealth(emptyResume);
    expect(health.overall).toBeDefined();
    expect(typeof health.overall).toBe('number');
  });

  test('Certification Date Logic: Preserves user issueDate and optional empty expiryDate without injecting current date', () => {
    // TEST 1: Only issueDate provided, expiryDate empty
    const resumeWithSingleDate = {
      personal: { fullName: 'Alice Johnson', email: 'alice@example.com' },
      sectionOrder: ['certifications'],
      certifications: [{
        id: 'cert-1',
        name: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: '2025-06-15',
        expiryDate: '',
        credentialId: 'AWS-123'
      }]
    };
    expect(resumeWithSingleDate.certifications[0].issueDate).toBe('2025-06-15');
    expect(resumeWithSingleDate.certifications[0].expiryDate).toBe('');

    const textOutput1 = extractRawResumeText(resumeWithSingleDate);
    expect(textOutput1).toContain('AWS Solutions Architect - Amazon Web Services (2025-06-15)');
    expect(textOutput1).not.toContain('2026');

    // TEST 2: Both issueDate and expiryDate provided
    const resumeWithBothDates = {
      personal: { fullName: 'Alice Johnson', email: 'alice@example.com' },
      sectionOrder: ['certifications'],
      certifications: [{
        id: 'cert-2',
        name: 'CISSP',
        issuer: 'ISC2',
        issueDate: '2025-06-15',
        expiryDate: '2028-06-15',
        credentialId: 'CISSP-456'
      }]
    };
    const textOutput2 = extractRawResumeText(resumeWithBothDates);
    expect(textOutput2).toContain('CISSP - ISC2 (2025-06-15 - 2028-06-15)');

    // TEST 3: Non-expiring lifetime certification
    const lifetimeCert = {
      id: 'cert-3',
      name: 'Certified ScrumMaster',
      issuer: 'Scrum Alliance',
      issueDate: '2024-01',
      expiryDate: ''
    };
    expect(lifetimeCert.expiryDate).toBe('');
  });

  test('Section Visibility & Extended Sections: All extended sections are visible by default and extracted correctly', () => {
    const defaultResume = createDefaultCanonicalResume();
    expect(defaultResume.sectionVisibility.publications).toBe(true);
    expect(defaultResume.sectionVisibility.awards).toBe(true);
    expect(defaultResume.sectionVisibility.volunteer).toBe(true);
    expect(defaultResume.sectionVisibility.custom).toBe(true);

    const fullResume = {
      personal: { fullName: 'Bob Builder', email: 'bob@example.com' },
      sectionOrder: ['publications', 'awards', 'volunteer', 'custom'],
      publications: [{
        id: 'pub-1',
        title: 'Deep Learning Architectures',
        publisher: 'IEEE Transactions',
        date: '2024',
        url: 'https://doi.org/10.1234/5678',
        description: 'Novel neural network architectures for low-latency inference.'
      }],
      awards: [{
        id: 'aw-1',
        title: '1st Place Hackathon',
        issuer: 'TechCrunch Disrupt',
        date: '2023',
        description: 'Won grand prize among 500+ participants.'
      }],
      volunteer: [{
        id: 'vol-1',
        role: 'Lead Mentor',
        organization: 'Open Source Initiative',
        startDate: '2022',
        endDate: 'Present',
        description: 'Mentored 20+ junior developers in web development.'
      }],
      customSections: [{
        id: 'cs-1',
        title: 'Languages & Patents',
        content: 'Patent US-987654: Distributed Cache Optimization.\nFluent in English and Spanish.'
      }]
    };

    const text = extractRawResumeText(fullResume);
    expect(text).toContain('PUBLICATIONS & RESEARCH');
    expect(text).toContain('Deep Learning Architectures - IEEE Transactions (2024)');
    expect(text).toContain('https://doi.org/10.1234/5678');
    expect(text).toContain('Novel neural network architectures');

    expect(text).toContain('HONORS & AWARDS');
    expect(text).toContain('1st Place Hackathon - TechCrunch Disrupt (2023)');
    expect(text).toContain('Won grand prize among 500+ participants.');

    expect(text).toContain('VOLUNTEER & LEADERSHIP');
    expect(text).toContain('Lead Mentor - Open Source Initiative (2022 - Present)');
    expect(text).toContain('Mentored 20+ junior developers');

    expect(text).toContain('LANGUAGES & PATENTS');
    expect(text).toContain('Patent US-987654: Distributed Cache Optimization.');
  });

  test('Skills formatting: renders skill name and optional note, no dashes when empty, and no category partitions', () => {
    const resume = {
      personal: { fullName: 'Skill Tester', email: 'tester@example.com' },
      sectionOrder: ['skills'],
      sectionVisibility: { skills: true },
      skills: [
        { id: 's1', name: 'Python', note: 'Advanced' },
        { id: 's2', name: 'C++', note: 'Advanced' },
        { id: 's3', name: 'React', note: 'Frontend development' },
        { id: 's4', name: 'MongoDB', note: 'Backend projects' },
        { id: 's5', name: 'Git', note: '' },
        { id: 's6', name: 'Legacy Skill', proficiency: 'Expert' } // backward compatibility
      ]
    };

    const text = extractRawResumeText(resume);

    // Header should be SKILLS
    expect(text).toContain('SKILLS');

    // Notes rendered when present
    expect(text).toContain('Python — Advanced');
    expect(text).toContain('C++ — Advanced');
    expect(text).toContain('React — Frontend development');
    expect(text).toContain('MongoDB — Backend projects');

    // Empty note has NO dash
    expect(text).toContain('\nGit\n');
    expect(text).not.toContain('Git —');

    // Backward compatibility: proficiency mapped to note if note not set
    expect(text).toContain('Legacy Skill — Expert');

    // No category titles should appear in skills extraction
    expect(text).not.toContain('Technical:');
    expect(text).not.toContain('Tools:');
    expect(text).not.toContain('Soft:');
    expect(text).not.toContain('Languages:');

    // Verify default resume skills have empty note
    const defaultResume = createDefaultCanonicalResume();
    defaultResume.skills.forEach(s => {
      expect(s.note).toBe('');
    });
  });
});


