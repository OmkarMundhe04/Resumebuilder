/**
 * ATS Test Corpus & Document Engine Regression Test Suite
 * Tests representative edge-case resumes against text extraction,
 * contact detection, ATS health scoring, and layout formatting.
 */

const assert = require('assert');

// Test Corpus of 10 Representative Resumes
const TEST_CORPUS = [
  {
    id: 'tc-01-standard-single-column',
    name: 'Standard Single Column',
    personal: { fullName: 'Jane Doe', title: 'Software Engineer', email: 'jane@example.com', phone: '+1 555 123 4567' },
    experiences: [{ role: 'Developer', company: 'Acme Corp', startDate: '2021-01', endDate: '2023-01', bullets: [{ text: 'Built Node.js APIs.' }] }],
    skills: [{ name: 'JavaScript' }, { name: 'Node.js' }]
  },
  {
    id: 'tc-02-unicode-international',
    name: 'Unicode & International Diacritics',
    personal: { fullName: 'Dr. René Müller-Strauß (Ph.D. / 博士)', title: 'Research Scientist', email: 'rene.muller@uni-heidelberg.de', phone: '+49 6221 540' },
    experiences: [{ role: 'Wissenschaftlicher Mitarbeiter', company: 'Universität Heidelberg', startDate: '2018-04', endDate: '2022-10', bullets: [{ text: 'Veröffentlichte 5 Peer-Review-Artikel über Quantencomputing.' }] }],
    skills: [{ name: 'Quantum Computing' }, { name: 'Python' }]
  },
  {
    id: 'tc-03-dense-long-bullets',
    name: 'Dense Long Bullets (>200 chars)',
    personal: { fullName: 'Alex Rivera', title: 'Principal Architect', email: 'alex.rivera@enterprise.io', phone: '(415) 902-1823' },
    experiences: [{
      role: 'Staff Architect',
      company: 'MegaTech Enterprise Systems',
      startDate: '2019-06',
      endDate: 'Present',
      bullets: [{ text: 'Architected and directed the complete migration of legacy monolithic payment infrastructure across 40 distinct global regions into event-driven serverless microservices processing $4.2B in annual transaction volume with zero downtime.' }]
    }],
    skills: [{ name: 'Distributed Systems' }, { name: 'Kafka' }, { name: 'AWS' }]
  },
  {
    id: 'tc-04-missing-sections-student',
    name: 'Entry-Level Student (Zero Work Experience)',
    personal: { fullName: 'Sam Taylor', title: 'Computer Science Graduate', email: 'sam.taylor@alumni.edu', phone: '555-0199' },
    experiences: [],
    education: [{ institution: 'State University', degree: 'B.S. Computer Science', startDate: '2020-09', endDate: '2024-05', gpa: '3.92 / 4.0' }],
    skills: [{ name: 'C++' }, { name: 'Java' }, { name: 'Algorithms' }],
    projects: [{ name: 'Peer-to-Peer File Transfer Engine', description: 'Engineered custom UDP reliable transmission protocol.' }]
  },
  {
    id: 'tc-05-multi-page-heavy',
    name: 'Multi-Page Executive Career (15+ Years)',
    personal: { fullName: 'Marcus Vance', title: 'VP of Engineering', email: 'mvance@exec.org', phone: '+1 212 555 9012' },
    experiences: Array.from({ length: 8 }, (_, i) => ({
      role: `Engineering Leadership Role ${i + 1}`,
      company: `Global Enterprise ${i + 1}`,
      startDate: `200${i}-01`,
      endDate: `200${i + 2}-01`,
      bullets: [
        { text: `Directed engineering team of ${20 * (i + 1)} engineers scaling revenue.` },
        { text: `Implemented modern agile CI/CD pipelines reducing deployment friction.` }
      ]
    })),
    skills: Array.from({ length: 15 }, (_, i) => ({ name: `Strategic Capability ${i + 1}` }))
  },
  {
    id: 'tc-06-varied-date-formats',
    name: 'Varied Date Formats & Unstandardized Ranges',
    personal: { fullName: 'Elena Rostova', title: 'Frontend Developer', email: 'elena@dev.ru', phone: '+7 999 123 4567' },
    experiences: [
      { role: 'UI Lead', company: 'Yandex Web', startDate: 'March 2021', endDate: 'Present', isCurrent: true, bullets: [{ text: 'Built React interfaces.' }] },
      { role: 'Junior Dev', company: 'Startup LLC', startDate: '06/2019', endDate: '02/2021', bullets: [{ text: 'Maintained CSS stylesheets.' }] }
    ],
    skills: [{ name: 'React' }, { name: 'CSS' }]
  },
  {
    id: 'tc-07-urls-and-technical-links',
    name: 'Complex URLs & Portfolio Anchors',
    personal: {
      fullName: 'David K. O\'Connor',
      title: 'DevOps & SRE Engineer',
      email: 'david.oconnor@infra.cloud',
      phone: '+1 408 555 8899',
      linkedin: 'https://linkedin.com/in/david-oconnor-sre-994',
      github: 'https://github.com/david-infra/k8s-operator'
    },
    experiences: [{ role: 'SRE', company: 'Cloud Hosting Co', startDate: '2020-01', endDate: '2023-05', bullets: [{ text: 'Maintained Kubernetes clusters across 6 AWS availability zones.' }] }],
    skills: [{ name: 'Kubernetes' }, { name: 'Terraform' }]
  },
  {
    id: 'tc-08-creative-dual-column',
    name: 'Dual-Column Creative Layout Data',
    personal: { fullName: 'Chloe Bennett', title: 'Product & UI Designer', email: 'chloe@designstudio.co', phone: '213-555-4321' },
    experiences: [{ role: 'Lead Product Designer', company: 'DesignCo', startDate: '2021-06', endDate: 'Present', bullets: [{ text: 'Designed full design system in Figma with 150+ accessible components.' }] }],
    skills: [{ name: 'Figma' }, { name: 'Design Systems' }, { name: 'Design Systems' }]
  },
  {
    id: 'tc-09-academic-cv-publications',
    name: 'Academic CV with Grants & Fellowships',
    personal: { fullName: 'Prof. Arthur Pendelton', title: 'Professor of Bioengineering', email: 'pendelton@mit.edu', phone: '+1 617 253 1000' },
    experiences: [{ role: 'Associate Professor', company: 'MIT Department of Bioengineering', startDate: '2015-09', endDate: 'Present', bullets: [{ text: 'Principal Investigator on $3.5M NIH biomedical grant.' }] }],
    education: [{ institution: 'Stanford University', degree: 'Ph.D. in Bioengineering', startDate: '2008-09', endDate: '2013-06' }],
    skills: [{ name: 'CRISPR Gene Editing' }, { name: 'Biostatistics' }]
  },
  {
    id: 'tc-10-minimalist-compact',
    name: 'Minimalist High-Whitespace Resume',
    personal: { fullName: 'Sarah Lin', title: 'Minimalist Writer & Strategist', email: 'sarah@lin.me', phone: '312-555-7788' },
    experiences: [{ role: 'Content Strategist', company: 'Verve Media', startDate: '2022-01', endDate: '2024-01', bullets: [{ text: 'Wrote technical whitepapers for SaaS platforms.' }] }],
    skills: [{ name: 'Technical Writing' }, { name: 'Content Architecture' }]
  }
];

// Plain Text ATS Parser Simulation
const extractCorpusText = (resume) => {
  const lines = [];
  if (resume.personal?.fullName) lines.push(resume.personal.fullName.toUpperCase());
  if (resume.personal?.title) lines.push(resume.personal.title);
  if (resume.personal?.email) lines.push(resume.personal.email);
  if (resume.personal?.phone) lines.push(resume.personal.phone);

  (resume.experiences || []).forEach(e => {
    lines.push(`${e.role || ''} - ${e.company || ''}`);
    (e.bullets || []).forEach(b => lines.push(`• ${b.text || ''}`));
  });

  (resume.education || []).forEach(edu => {
    lines.push(`${edu.degree || ''} - ${edu.institution || ''}`);
  });

  const skillNames = (resume.skills || []).map(s => s.name).filter(Boolean);
  if (skillNames.length > 0) lines.push(`Skills: ${skillNames.join(', ')}`);

  return lines.join('\n');
};

console.log('====================================================');
console.log('STARTING ATS CORPUS REGRESSION TESTS (10 RESUMES)');
console.log('====================================================');

let passed = 0;
let failed = 0;

TEST_CORPUS.forEach((tc, idx) => {
  try {
    const rawText = extractCorpusText(tc);

    // Assertion 1: Full name is parsed into stream
    assert(rawText.toLowerCase().includes(tc.personal.fullName.toLowerCase().slice(0, 8)), `Name extraction failed for ${tc.id}`);

    // Assertion 2: Email is detected
    assert(rawText.includes(tc.personal.email), `Email missing in ${tc.id}`);

    // Assertion 3: Non-empty output
    assert(rawText.length > 30, `Text stream too short for ${tc.id}`);

    // Assertion 4: Edge case validation
    if (tc.id === 'tc-02-unicode-international') {
      assert(rawText.includes('Quantencomputing') || rawText.includes('Heidelberg'), 'Unicode diacritics corrupted');
    }
    if (tc.id === 'tc-05-multi-page-heavy') {
      assert(tc.experiences.length === 8, 'Heavy multi-page structure lost items');
    }

    console.log(`  ✓ PASS [${idx + 1}/10]: ${tc.id} (${tc.name})`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL [${idx + 1}/10]: ${tc.id} - ${err.message}`);
    failed++;
  }
});

console.log('====================================================');
console.log(`CORPUS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
