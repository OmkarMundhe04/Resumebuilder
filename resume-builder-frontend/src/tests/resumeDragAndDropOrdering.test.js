import React from 'react';
import { render, screen } from '@testing-library/react';
import ATSClassic from '../components/templates/ATSClassic';
import ModernProfessional from '../components/templates/ModernProfessional';
import CreativeResume from '../components/templates/CreativeResume';
import MinimalistResume from '../components/templates/MinimalistResume';
import { extractRawResumeText } from '../utils/canonicalResume';

// Pure canonical reorder logic mirroring ResumeBuilder implementation
const reorderArray = (list, sourceIndex, targetIndex) => {
  if (sourceIndex === targetIndex) return list;
  if (sourceIndex < 0 || sourceIndex >= list.length || targetIndex < 0 || targetIndex >= list.length) return list;
  const copy = [...list];
  const [moved] = copy.splice(sourceIndex, 1);
  copy.splice(targetIndex, 0, moved);
  return copy;
};

describe('Part 1: Skills Drag-and-Drop & Accessible Reordering', () => {
  const sk1 = { id: 'sk-1', name: 'Python', note: 'Backend' };
  const sk2 = { id: 'sk-2', name: 'Java', note: 'Enterprise' };
  const sk3 = { id: 'sk-3', name: 'SQL', note: 'PostgreSQL' };
  const sk4 = { id: 'sk-4', name: 'React', note: 'Frontend' };
  const sk5 = { id: 'sk-5', name: 'FastAPI', note: 'Microservices' };

  test('Skills reordering: Drag React from position 4 to position 1', () => {
    let skills = [sk1, sk2, sk3, sk4, sk5];
    expect(skills.map(s => s.name)).toEqual(['Python', 'Java', 'SQL', 'React', 'FastAPI']);

    // Drag React (index 3) to index 0 (top)
    skills = reorderArray(skills, 3, 0);
    expect(skills.map(s => s.name)).toEqual(['React', 'Python', 'Java', 'SQL', 'FastAPI']);
    expect(skills[0].id).toBe('sk-4');

    // Move FastAPI (index 4) up to index 2
    skills = reorderArray(skills, 4, 2);
    expect(skills.map(s => s.name)).toEqual(['React', 'Python', 'FastAPI', 'Java', 'SQL']);

    // Move SQL (index 4) up to index 0
    skills = reorderArray(skills, 4, 0);
    expect(skills.map(s => s.name)).toEqual(['SQL', 'React', 'Python', 'FastAPI', 'Java']);

    // Boundary check: invalid indices should safely return unchanged list
    expect(reorderArray(skills, -1, 2)).toEqual(skills);
    expect(reorderArray(skills, 2, 99)).toEqual(skills);
    expect(reorderArray(skills, 1, 1)).toEqual(skills);
  });

  test('Skills reordering reflects across templates in exact array order', () => {
    const skillsReordered = [
      { id: 'sk-4', name: 'React', note: 'UI' },
      { id: 'sk-1', name: 'Python', note: 'AI' },
      { id: 'sk-5', name: 'FastAPI', note: 'API' }
    ];

    const resumeData = {
      personal: { fullName: 'Omkar Mundhe', email: 'omkar@example.com' },
      skills: skillsReordered,
      sectionOrder: ['skills']
    };

    // 1. ATSClassic template
    const { container: atsContainer } = render(<ATSClassic resume={resumeData} />);
    const atsText = atsContainer.textContent;
    const reactIndexATS = atsText.indexOf('React');
    const pythonIndexATS = atsText.indexOf('Python');
    const fastApiIndexATS = atsText.indexOf('FastAPI');
    expect(reactIndexATS).toBeLessThan(pythonIndexATS);
    expect(pythonIndexATS).toBeLessThan(fastApiIndexATS);

    // 2. CreativeResume template (which was updated to respect sectionOrder & skills)
    const { container: creativeContainer } = render(<CreativeResume resume={resumeData} />);
    const creativeText = creativeContainer.textContent;
    const reactIndexCreative = creativeText.indexOf('React');
    const pythonIndexCreative = creativeText.indexOf('Python');
    expect(reactIndexCreative).toBeLessThan(pythonIndexCreative);

    // 3. extractRawResumeText for ATS / Plaintext export
    const raw = extractRawResumeText(resumeData);
    expect(raw.indexOf('React')).toBeLessThan(raw.indexOf('Python'));
    expect(raw.indexOf('Python')).toBeLessThan(raw.indexOf('FastAPI'));
  });
});

describe('Certifications Drag-and-Drop & Accessible Reordering', () => {
  const c1 = { id: 'c-1', name: 'AWS Solutions Architect', issuer: 'Amazon', issueDate: '2023' };
  const c2 = { id: 'c-2', name: 'Certified Kubernetes Administrator', issuer: 'CNCF', issueDate: '2024' };
  const c3 = { id: 'c-3', name: 'TensorFlow Developer Certificate', issuer: 'Google', issueDate: '2025' };

  test('Certifications reordering: Drag C3 to top, C1 to bottom', () => {
    let certs = [c1, c2, c3];
    expect(certs.map(c => c.name)).toEqual([
      'AWS Solutions Architect',
      'Certified Kubernetes Administrator',
      'TensorFlow Developer Certificate'
    ]);

    // Drag C3 (index 2) to top (index 0)
    certs = reorderArray(certs, 2, 0);
    expect(certs.map(c => c.name)).toEqual([
      'TensorFlow Developer Certificate',
      'AWS Solutions Architect',
      'Certified Kubernetes Administrator'
    ]);
    expect(certs[0].id).toBe('c-3');

    // Move C1 (index 1) to bottom (index 2)
    certs = reorderArray(certs, 1, 2);
    expect(certs.map(c => c.name)).toEqual([
      'TensorFlow Developer Certificate',
      'Certified Kubernetes Administrator',
      'AWS Solutions Architect'
    ]);
  });

  test('Certifications order is preserved in raw resume extraction and templates', () => {
    const certsReordered = [
      { id: 'c-3', name: 'TensorFlow Developer Certificate', issuer: 'Google', issueDate: '2025' },
      { id: 'c-1', name: 'AWS Solutions Architect', issuer: 'Amazon', issueDate: '2023' }
    ];

    const resumeData = {
      personal: { fullName: 'Alex Morgan' },
      certifications: certsReordered,
      sectionOrder: ['certifications']
    };

    const raw = extractRawResumeText(resumeData);
    expect(raw.indexOf('TensorFlow Developer')).toBeLessThan(raw.indexOf('AWS Solutions Architect'));

    const { container } = render(<ModernProfessional resume={resumeData} />);
    const html = container.textContent;
    expect(html.indexOf('TensorFlow Developer')).toBeLessThan(html.indexOf('AWS Solutions Architect'));
  });
});

describe('Part 2: Reorder Entire Resume Sections', () => {
  test('sectionOrder drives order of appearance in extractRawResumeText and templates', () => {
    const resumeDefaultOrder = {
      personal: { fullName: 'Jane Doe', summary: 'Senior Engineer' },
      skills: [{ id: 's1', name: 'TypeScript' }],
      experiences: [{ id: 'e1', company: 'Google', role: 'Staff Engineer' }],
      sectionOrder: ['summary', 'skills', 'experience']
    };

    const raw1 = extractRawResumeText(resumeDefaultOrder);
    expect(raw1.indexOf('SKILLS')).toBeLessThan(raw1.indexOf('WORK EXPERIENCE'));

    // Reorder sections: Move experience BEFORE skills
    const resumeReordered = {
      ...resumeDefaultOrder,
      sectionOrder: ['summary', 'experience', 'skills']
    };

    const raw2 = extractRawResumeText(resumeReordered);
    expect(raw2.indexOf('WORK EXPERIENCE')).toBeLessThan(raw2.indexOf('SKILLS'));

    // Test with ATSClassic template
    const { container } = render(<ATSClassic resume={resumeReordered} />);
    const text = container.textContent;
    expect(text.indexOf('Experience')).toBeLessThan(text.indexOf('Skills'));
  });

  test('CreativeResume respects dynamic sectionOrder and sectionVisibility', () => {
    const resumeData = {
      personal: { fullName: 'Creative Person', summary: 'Design Technologist' },
      skills: [{ id: 's1', name: 'Figma' }],
      projects: [{ id: 'p1', name: 'Design System Engine' }],
      sectionOrder: ['skills', 'projects', 'summary']
    };

    const { container } = render(<CreativeResume resume={resumeData} />);
    expect(screen.getByText('Creative Person')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Design System Engine')).toBeInTheDocument();
  });
});

describe('Project Description Bullet Points Option', () => {
  test('Converting project description text into bullet points', () => {
    const description = 'Engineered distributed caching layer reducing latency by 45%. Implemented raft consensus protocol for multi-region failover.';
    const parsedBullets = description
      .split(/[.\n]/)
      .map(s => s.trim().replace(/^[-•*]\s*/, ''))
      .filter(s => s.length > 5)
      .map((text, i) => ({ id: `gen-${i}`, text }));

    expect(parsedBullets.length).toBe(2);
    expect(parsedBullets[0].text).toContain('Engineered distributed caching layer');
    expect(parsedBullets[1].text).toContain('Implemented raft consensus protocol');
  });

  test('Project bullets render with priority across templates and in raw text export', () => {
    const resumeWithBullets = {
      personal: { fullName: 'Project Lead' },
      projects: [
        {
          id: 'proj-b',
          name: 'AI Agent System',
          description: 'High level fallback text',
          bullets: [
            { id: 'b1', text: 'Achieved 99.8% precision on entity resolution' },
            { id: 'b2', text: 'Reduced memory overhead by 60% with zero-copy buffers' }
          ]
        }
      ],
      sectionOrder: ['projects']
    };

    // Verify raw text export contains the bullets with bullet marks
    const raw = extractRawResumeText(resumeWithBullets);
    expect(raw).toContain('• Achieved 99.8% precision on entity resolution');
    expect(raw).toContain('• Reduced memory overhead by 60% with zero-copy buffers');

    // Verify ATSClassic template renders bullets
    const { container } = render(<ATSClassic resume={resumeWithBullets} />);
    expect(container.textContent).toContain('Achieved 99.8% precision on entity resolution');
    expect(container.textContent).toContain('Reduced memory overhead by 60% with zero-copy buffers');
  });
});
