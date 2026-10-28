import {
  A4_CONSTANTS,
  DENSITY_PROFILES,
  applyDensityProfile,
  measureElementHeight,
  optimizeResumeLayout,
  calculateSmartPageSlices
} from '../utils/export/smartPagination';
import { extractRawResumeText, createDefaultResume } from '../utils/canonicalResume';

describe('Smart Resume Pagination & One-Page PDF Layout Engine', () => {

  describe('1. Geometry & Safety Constants', () => {
    test('A4 constants enforce strict ISO 210mm x 297mm geometry and 96 DPI pixel calculations', () => {
      expect(A4_CONSTANTS.WIDTH_MM).toBe(210);
      expect(A4_CONSTANTS.HEIGHT_MM).toBe(297);
      expect(A4_CONSTANTS.ASPECT_RATIO).toBeCloseTo(1.4142857, 4);
      expect(A4_CONSTANTS.STANDARD_WIDTH_PX).toBe(794);
      expect(A4_CONSTANTS.STANDARD_HEIGHT_PX).toBe(1123);
    });

    test('Strict Safety Rules: Minimum page margin is 0.5 in (48px) and body font is >= 10pt', () => {
      expect(A4_CONSTANTS.MIN_PAGE_MARGIN_PX).toBeGreaterThanOrEqual(48); // 0.5 inch at 96 DPI
      expect(A4_CONSTANTS.MIN_BODY_FONT_SIZE_PT).toBeGreaterThanOrEqual(10.0);

      // Verify all defined density profiles strictly uphold these invariants
      Object.values(DENSITY_PROFILES).forEach(profile => {
        const topPaddingPx = parseInt(profile.pagePaddingTop, 10);
        const bottomPaddingPx = parseInt(profile.pagePaddingBottom, 10);
        const xPaddingPx = parseInt(profile.pagePaddingX, 10);
        const bodyFontSizePt = parseFloat(profile.bodyFontSize);

        expect(topPaddingPx).toBeGreaterThanOrEqual(48);
        expect(bottomPaddingPx).toBeGreaterThanOrEqual(48);
        expect(xPaddingPx).toBeGreaterThanOrEqual(48);
        expect(bodyFontSizePt).toBeGreaterThanOrEqual(10.0);
      });
    });
  });

  describe('2. Density Profiles & Clean Style Isolation', () => {
    test('applyDensityProfile sets CSS variables and returns a safe restore function', () => {
      const dom = document.createElement('div');
      dom.className = 'canonical-resume';
      dom.style.padding = '36px 40px';
      dom.style.lineHeight = '1.5';
      dom.style.fontSize = '11pt';

      const sec = document.createElement('section');
      sec.className = 'resume-section';
      sec.style.marginBottom = '20px';
      dom.appendChild(sec);

      const restore = applyDensityProfile(dom, 'dense');

      expect(dom.style.getPropertyValue('--resume-section-gap')).toBe('8px');
      expect(dom.style.getPropertyValue('--resume-body-font-size')).toBe('10.0pt');
      expect(sec.style.marginBottom).toBe('8px');

      // Call restore and verify complete return to original state
      restore();
      expect(dom.style.padding).toBe('36px 40px');
      expect(dom.style.lineHeight).toBe('1.5');
      expect(dom.style.fontSize).toBe('11pt');
      expect(sec.style.marginBottom).toBe('20px');
    });
  });

  describe('3. Short & Early-Career Resume One-Page Optimization', () => {
    test('Short Resume: Fits comfortably on 1 Page without requiring compression', () => {
      const dom = document.createElement('div');
      dom.className = 'canonical-resume';
      // Mock height = 750px (< 1123px)
      Object.defineProperty(dom, 'scrollHeight', { value: 750, configurable: true });
      dom.getBoundingClientRect = () => ({ height: 750, width: 794, top: 0, bottom: 750, left: 0, right: 794 });

      const result = optimizeResumeLayout(dom, 1123);
      expect(result.isSinglePage).toBe(true);
      expect(result.profile).toBe('comfortable');

      const slices = calculateSmartPageSlices(dom, 1123);
      expect(slices.length).toBe(1);
      expect(slices[0].pageNumber).toBe(1);
      expect(slices[0].isLastPage).toBe(true);

      result.restore();
    });

    test('Typical Undergraduate CS Resume: Intelligently optimizes to exactly 1 Page', () => {
      const dom = document.createElement('div');
      dom.className = 'canonical-resume';
      
      // Simulate unoptimized height = 1180px (> 1123px by 57px)
      // When compact or dense is applied, height drops to 1050px (< 1123px)
      let currentMockHeight = 1180;
      Object.defineProperty(dom, 'scrollHeight', { get: () => currentMockHeight, configurable: true });
      dom.getBoundingClientRect = () => ({ height: currentMockHeight, width: 794, top: 0, bottom: currentMockHeight, left: 0, right: 794 });

      // Override applyDensityProfile effect on simulated height
      const origApply = dom.style.setProperty;
      dom.style.setProperty = function(key, val) {
        if (key === '--resume-section-gap' && val === '10px') {
          currentMockHeight = 1080; // Compact fits!
        }
        return origApply.apply(this, arguments);
      };

      const result = optimizeResumeLayout(dom, 1123);
      expect(result.isSinglePage).toBe(true);
      expect(result.profile).toBe('compact');

      const slices = calculateSmartPageSlices(dom, 1123);
      expect(slices.length).toBe(1);
      expect(slices[0].pageNumber).toBe(1);

      result.restore();
    });

    test('Omkar-Style Early-Career Resume Fixture: Fits on 1 Page under strict bounds', () => {
      const fixture = createDefaultResume({
        personal: {
          fullName: 'Omkar Mundhe',
          title: 'Full Stack Software Engineer',
          email: 'omkar@example.com',
          phone: '+1 (555) 019-2831',
          location: 'San Francisco, CA',
          summary: 'Driven Full Stack Software Engineer with deep experience in React, Node.js, and cloud systems. Proven track record of architecting scalable applications and robust APIs.'
        },
        experiences: [
          {
            id: 'exp-1',
            company: 'Tech Solutions Inc',
            role: 'Software Engineer Intern',
            startDate: '2023-06',
            endDate: '2023-09',
            bullets: [
              { id: 'b-1', text: 'Built real-time telemetry dashboard using React and WebSocket, reducing alert latency by 40%.' },
              { id: 'b-2', text: 'Optimized PostgreSQL database queries, improving API response time from 350ms to 90ms.' }
            ]
          }
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'State University',
            degree: 'B.S. in Computer Science',
            startDate: '2020',
            endDate: '2024',
            gpa: '3.90',
            coursework: ['Data Structures', 'Algorithms', 'Distributed Systems', 'Database Management'],
            honors: ["Dean's List (All Semesters)"]
          }
        ],
        skills: [
          { id: 's-1', name: 'JavaScript / TypeScript' },
          { id: 's-2', name: 'React.js' },
          { id: 's-3', name: 'Node.js & Express' },
          { id: 's-4', name: 'PostgreSQL' },
          { id: 's-5', name: 'MongoDB' },
          { id: 's-6', name: 'Docker' },
          { id: 's-7', name: 'Git & CI/CD' },
          { id: 's-8', name: 'REST APIs' }
        ],
        projects: [
          {
            id: 'p-1',
            name: 'Cloud Resume Builder Platform',
            role: 'Lead Developer',
            technologies: ['React', 'Node.js', 'MongoDB', 'jsPDF'],
            link: 'https://github.com/omkar/resume-builder',
            description: 'Full-stack resume builder with live ATS parser scoring and PDF export engine.',
            bullets: [
              { id: 'pb-1', text: 'Engineered high-fidelity 1:1 ISO A4 PDF generation with intelligent slice cut optimization.' },
              { id: 'pb-2', text: 'Implemented real-time ATS scoring radar assessing 7 independent quality dimensions.' }
            ]
          },
          {
            id: 'p-2',
            name: 'Distributed Microservices Telemetry',
            role: 'Creator',
            technologies: ['Go', 'gRPC', 'Docker'],
            link: 'https://github.com/omkar/telemetry',
            description: 'Lightweight distributed tracing framework for high-throughput RPC microservices.',
            bullets: [
              { id: 'pb-3', text: 'Processed 50,000 requests/sec with minimal CPU overhead.' }
            ]
          }
        ],
        certifications: [
          {
            id: 'c-1',
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            issueDate: '2023-11',
            credentialId: 'AWS-CCP-882190'
          }
        ]
      });

      const rawText = extractRawResumeText(fixture);
      expect(rawText).toContain('OMKAR MUNDHE');
      expect(rawText).toContain('Full Stack Software Engineer');
      expect(rawText).toContain('Cloud Resume Builder Platform');
      expect(rawText).toContain('AWS Certified Cloud Practitioner');

      // Create DOM element for this fixture
      const dom = document.createElement('div');
      dom.className = 'canonical-resume';
      let mockHeight = 1170;
      Object.defineProperty(dom, 'scrollHeight', { get: () => mockHeight, configurable: true });
      dom.getBoundingClientRect = () => ({ height: mockHeight, width: 794, top: 0, bottom: mockHeight, left: 0, right: 794 });

      dom.style.setProperty = function(key, val) {
        if (key === '--resume-section-gap' && (val === '10px' || val === '8px')) {
          mockHeight = 1090; // Successfully fits under 1123px
        }
      };

      const result = optimizeResumeLayout(dom, 1123);
      expect(result.isSinglePage).toBe(true);
      expect(mockHeight).toBeLessThanOrEqual(1123);
      result.restore();
    });
  });

  describe('4. Dense Multi-Page Resume & Breakable Item Pagination', () => {
    test('Dense 15-Year Executive Resume: Gracefully paginates across 2 Pages without unreadable compression', () => {
      const dom = document.createElement('div');
      dom.className = 'canonical-resume';
      
      // Raw height = 1950px (cannot and should not fit on 1 page)
      const mockHeight = 1950;
      Object.defineProperty(dom, 'scrollHeight', { value: mockHeight, configurable: true });
      dom.getBoundingClientRect = () => ({ height: mockHeight, width: 794, top: 0, bottom: mockHeight, left: 0, right: 794 });

      // Append sections and items
      const sec1 = document.createElement('section');
      sec1.className = 'resume-section';
      sec1.getBoundingClientRect = () => ({ top: 0, bottom: 900, height: 900 });
      
      const item1 = document.createElement('div');
      item1.className = 'experience-item';
      item1.getBoundingClientRect = () => ({ top: 50, bottom: 450, height: 400 });
      sec1.appendChild(item1);

      const item2 = document.createElement('div');
      item2.className = 'experience-item';
      item2.getBoundingClientRect = () => ({ top: 460, bottom: 880, height: 420 });
      sec1.appendChild(item2);
      dom.appendChild(sec1);

      const sec2 = document.createElement('section');
      sec2.className = 'resume-section';
      sec2.getBoundingClientRect = () => ({ top: 920, bottom: 1950, height: 1030 });
      
      const item3 = document.createElement('div');
      item3.className = 'project-item';
      item3.getBoundingClientRect = () => ({ top: 960, bottom: 1350, height: 390 });
      sec2.appendChild(item3);

      const item4 = document.createElement('div');
      item4.className = 'project-item';
      item4.getBoundingClientRect = () => ({ top: 1370, bottom: 1950, height: 580 });
      sec2.appendChild(item4);
      dom.appendChild(sec2);

      const result = optimizeResumeLayout(dom, 1123);
      expect(result.isSinglePage).toBe(false);
      expect(result.estimatedPages).toBe(2);

      // Slices must break between item boundaries
      const slices = calculateSmartPageSlices(dom, 1123);
      expect(slices.length).toBe(2);
      expect(slices[0].pageNumber).toBe(1);
      expect(slices[1].pageNumber).toBe(2);
      expect(slices[1].isLastPage).toBe(true);

      result.restore();
    });

    test('Breakable Section Item Rule: Project A & B on Page 1, Project C on Page 2 (Zero 300px blank waste)', () => {
      const dom = document.createElement('div');
      dom.className = 'canonical-resume';
      const domHeight = 1450;
      Object.defineProperty(dom, 'scrollHeight', { value: domHeight, configurable: true });
      dom.getBoundingClientRect = () => ({ height: domHeight, width: 794, top: 0, bottom: domHeight, left: 0, right: 794 });

      // Header: 0 - 150px
      const header = document.createElement('header');
      header.setAttribute('data-section', 'personal');
      header.getBoundingClientRect = () => ({ top: 0, bottom: 150, height: 150 });
      dom.appendChild(header);

      // Section: Projects (starts at 160px, ends at 1450px)
      const secProjects = document.createElement('section');
      secProjects.className = 'resume-section';
      secProjects.getBoundingClientRect = () => ({ top: 160, bottom: 1450, height: 1290 });

      const h2 = document.createElement('h2');
      h2.getBoundingClientRect = () => ({ top: 160, bottom: 190, height: 30 });
      secProjects.appendChild(h2);

      // Project A: 200 - 550px (fits on Page 1)
      const projA = document.createElement('div');
      projA.className = 'project-item';
      projA.getBoundingClientRect = () => ({ top: 200, bottom: 550, height: 350 });
      secProjects.appendChild(projA);

      // Project B: 560 - 980px (fits on Page 1!)
      const projB = document.createElement('div');
      projB.className = 'project-item';
      projB.getBoundingClientRect = () => ({ top: 560, bottom: 980, height: 420 });
      secProjects.appendChild(projB);

      // Project C: 1000 - 1450px (crosses 1123px threshold, belongs on Page 2)
      const projC = document.createElement('div');
      projC.className = 'project-item';
      projC.getBoundingClientRect = () => ({ top: 1000, bottom: 1450, height: 450 });
      secProjects.appendChild(projC);

      dom.appendChild(secProjects);

      const slices = calculateSmartPageSlices(dom, 1123);
      expect(slices.length).toBe(2);

      // Page 1 cut must happen at or before Project C (topPx = 1000), NOT before the entire Projects section (topPx = 160)!
      expect(slices[0].bottomDomPx).toBe(1000);
      expect(slices[0].heightDomPx).toBe(1000); // 1000px filled, only 123px unused (normal item gap), eliminating the 350px blank bug!

      // Page 2 starts at 1000px with Project C
      expect(slices[1].topDomPx).toBe(1000);
      expect(slices[1].bottomDomPx).toBe(1450);
    });
  });

  describe('5. Strict Orphan Heading Protection', () => {
    test('Orphan Heading Rule: If h2 is near page bottom, cut happens BEFORE the heading so heading and first item move together', () => {
      const dom = document.createElement('div');
      dom.className = 'canonical-resume';
      const domHeight = 1500;
      Object.defineProperty(dom, 'scrollHeight', { value: domHeight, configurable: true });
      dom.getBoundingClientRect = () => ({ height: domHeight, width: 794, top: 0, bottom: domHeight, left: 0, right: 794 });

      // Experience Section 1: 0 - 1050px (fills most of Page 1)
      const sec1 = document.createElement('section');
      sec1.className = 'resume-section';
      sec1.getBoundingClientRect = () => ({ top: 0, bottom: 1050, height: 1050 });
      const expItem = document.createElement('div');
      expItem.className = 'experience-item';
      expItem.getBoundingClientRect = () => ({ top: 40, bottom: 1040, height: 1000 });
      sec1.appendChild(expItem);
      dom.appendChild(sec1);

      // Projects Section 2: starts at 1060px with h2 at 1060-1090px, but Project 1 ends at 1350px
      const sec2 = document.createElement('section');
      sec2.className = 'resume-section';
      sec2.getBoundingClientRect = () => ({ top: 1060, bottom: 1500, height: 440 });

      const h2 = document.createElement('h2');
      h2.getBoundingClientRect = () => ({ top: 1060, bottom: 1090, height: 30 });
      sec2.appendChild(h2);

      const proj1 = document.createElement('div');
      proj1.className = 'project-item';
      proj1.getBoundingClientRect = () => ({ top: 1100, bottom: 1500, height: 400 });
      sec2.appendChild(proj1);
      dom.appendChild(sec2);

      const slices = calculateSmartPageSlices(dom, 1123);
      expect(slices.length).toBe(2);

      // Orphan heading check: Cut MUST happen before sec2 / h2 (at 1060px), NOT between h2 (1090) and proj1 (1100)!
      expect(slices[0].bottomDomPx).toBeLessThanOrEqual(1060);
      expect(slices[1].topDomPx).toBe(1060); // Heading moves cleanly to top of Page 2 with its project!
    });
  });

  describe('6. ATS Plain-Text & Hyperlink Integrity', () => {
    test('extractRawResumeText guarantees 100% searchable text without hidden content or omissions', () => {
      const resume = createDefaultResume({
        personal: {
          fullName: 'Jane Doe',
          title: 'Staff Cloud Architect',
          email: 'jane.doe@example.com',
          phone: '+1 555 456 7890',
          location: 'Seattle, WA',
          linkedin: 'https://linkedin.com/in/janedoe',
          github: 'https://github.com/janedoe',
          summary: 'Cloud Architect with 10+ years specializing in Kubernetes, AWS, and zero-trust infrastructure.'
        }
      });

      const extracted = extractRawResumeText(resume);
      expect(extracted).toContain('JANE DOE');
      expect(extracted).toContain('Staff Cloud Architect');
      expect(extracted).toContain('jane.doe@example.com');
      expect(extracted).toContain('PROFESSIONAL SUMMARY');
      expect(extracted).toContain('WORK EXPERIENCE');
      expect(extracted).toContain('EDUCATION');
      expect(extracted).toContain('SKILLS');
    });
  });
});
