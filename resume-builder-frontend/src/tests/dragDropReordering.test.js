import React from 'react';
import { render, screen } from '@testing-library/react';
import ATSClassic from '../components/templates/ATSClassic';
import ModernProfessional from '../components/templates/ModernProfessional';
import TechnicalResume from '../components/templates/TechnicalResume';
import MinimalistResume from '../components/templates/MinimalistResume';

// Pure canonical reorder logic mirroring ResumeBuilder implementation
const reorderArray = (list, sourceIndex, targetIndex) => {
  if (sourceIndex === targetIndex) return list;
  if (sourceIndex < 0 || sourceIndex >= list.length || targetIndex < 0 || targetIndex >= list.length) return list;
  const copy = [...list];
  const [moved] = copy.splice(sourceIndex, 1);
  copy.splice(targetIndex, 0, moved);
  return copy;
};

const normalizeItemsWithIds = (items) => {
  return (items || []).map((item, idx) => ({
    ...item,
    id: item.id || `generated-stable-id-${idx + 1}`
  }));
};

describe('Projects & Education Drag-and-Drop / Reordering Logic', () => {
  const p1 = { id: 'proj-1', name: 'Project 1: Real-Time Messaging', technologies: ['React', 'WebSocket'] };
  const p2 = { id: 'proj-2', name: 'Project 2: Distributed Database', technologies: ['Go', 'Raft'] };
  const p3 = { id: 'proj-3', name: 'Project 3: AI Resume Engine', technologies: ['Python', 'NLP'] };

  const e1 = { id: 'edu-1', degree: 'B.S. in Computer Science', institution: 'UC Berkeley', startDate: '2016', endDate: '2020' };
  const e2 = { id: 'edu-2', degree: 'M.S. in Software Engineering', institution: 'Carnegie Mellon', startDate: '2020', endDate: '2022' };
  const e3 = { id: 'edu-3', degree: 'Ph.D. in Computer Science', institution: 'Stanford University', startDate: '2022', endDate: '2026' };

  const exp1 = { id: 'exp-1', company: 'Stripe', role: 'Staff Software Engineer', startDate: '2022', endDate: 'Present', bullets: [{ text: 'Architected payment processing engine' }] };
  const exp2 = { id: 'exp-2', company: 'Google', role: 'Senior Software Engineer', startDate: '2019', endDate: '2022', bullets: [{ text: 'Scaled distributed cache systems' }] };
  const exp3 = { id: 'exp-3', company: 'Meta', role: 'Software Engineer', startDate: '2017', endDate: '2019', bullets: [{ text: 'Built real-time analytics pipeline' }] };

  test('Projects: Permutation sequence (3->top, 1->bottom, 2->top) with stable IDs', () => {
    let projects = [p1, p2, p3];
    expect(projects.map(p => p.id)).toEqual(['proj-1', 'proj-2', 'proj-3']);

    // Step 1: Move P3 (index 2) to top (index 0)
    projects = reorderArray(projects, 2, 0);
    expect(projects.map(p => p.id)).toEqual(['proj-3', 'proj-1', 'proj-2']);
    expect(projects[0].name).toBe('Project 3: AI Resume Engine');
    expect(projects[1].name).toBe('Project 1: Real-Time Messaging');
    expect(projects[2].name).toBe('Project 2: Distributed Database');

    // Step 2: Move P1 (index 1) to bottom (index 2)
    projects = reorderArray(projects, 1, 2);
    expect(projects.map(p => p.id)).toEqual(['proj-3', 'proj-2', 'proj-1']);

    // Step 3: Move P2 (index 1) to top (index 0)
    projects = reorderArray(projects, 1, 0);
    expect(projects.map(p => p.id)).toEqual(['proj-2', 'proj-3', 'proj-1']);

    // Verify IDs never changed
    expect(projects.find(p => p.name === 'Project 1: Real-Time Messaging').id).toBe('proj-1');
    expect(projects.find(p => p.name === 'Project 2: Distributed Database').id).toBe('proj-2');
    expect(projects.find(p => p.name === 'Project 3: AI Resume Engine').id).toBe('proj-3');
  });

  test('Education: Permutation sequence with stable IDs', () => {
    let education = [e1, e2, e3];
    expect(education.map(e => e.id)).toEqual(['edu-1', 'edu-2', 'edu-3']);

    // Move E3 (index 2) to top (index 0)
    education = reorderArray(education, 2, 0);
    expect(education.map(e => e.id)).toEqual(['edu-3', 'edu-1', 'edu-2']);
    expect(education[0].institution).toBe('Stanford University');
    expect(education[1].institution).toBe('UC Berkeley');
    expect(education[2].institution).toBe('Carnegie Mellon');

    // Move E1 (index 1) to bottom (index 2)
    education = reorderArray(education, 1, 2);
    expect(education.map(e => e.id)).toEqual(['edu-3', 'edu-2', 'edu-1']);

    // Move E2 (index 1) to top (index 0)
    education = reorderArray(education, 1, 0);
    expect(education.map(e => e.id)).toEqual(['edu-2', 'edu-3', 'edu-1']);
    expect(education[0].id).toBe('edu-2');
  });

  test('Experiences: Permutation sequence (3->top, 1->bottom, 2->top) with stable IDs', () => {
    let experiences = [exp1, exp2, exp3];
    expect(experiences.map(e => e.id)).toEqual(['exp-1', 'exp-2', 'exp-3']);

    // Step 1: Move Exp3 (Meta, index 2) to top (index 0)
    experiences = reorderArray(experiences, 2, 0);
    expect(experiences.map(e => e.id)).toEqual(['exp-3', 'exp-1', 'exp-2']);
    expect(experiences[0].company).toBe('Meta');
    expect(experiences[1].company).toBe('Stripe');
    expect(experiences[2].company).toBe('Google');

    // Step 2: Move Exp1 (Stripe, index 1) to bottom (index 2)
    experiences = reorderArray(experiences, 1, 2);
    expect(experiences.map(e => e.id)).toEqual(['exp-3', 'exp-2', 'exp-1']);
    expect(experiences[0].company).toBe('Meta');
    expect(experiences[1].company).toBe('Google');
    expect(experiences[2].company).toBe('Stripe');

    // Step 3: Move Exp2 (Google, index 1) to top (index 0)
    experiences = reorderArray(experiences, 1, 0);
    expect(experiences.map(e => e.id)).toEqual(['exp-2', 'exp-3', 'exp-1']);
    expect(experiences[0].company).toBe('Google');
    expect(experiences[1].company).toBe('Meta');
    expect(experiences[2].company).toBe('Stripe');

    // Verify IDs never changed or were lost
    expect(experiences.find(e => e.company === 'Stripe').id).toBe('exp-1');
    expect(experiences.find(e => e.company === 'Google').id).toBe('exp-2');
    expect(experiences.find(e => e.company === 'Meta').id).toBe('exp-3');
  });

  test('Edge cases: 0 items, 1 item, out-of-bounds indices, and 10+ items', () => {
    // 0 items
    expect(reorderArray([], 0, 1)).toEqual([]);

    // 1 item
    const single = [p1];
    expect(reorderArray(single, 0, 0)).toEqual([p1]);
    expect(reorderArray(single, 0, 1)).toEqual([p1]);
    expect(reorderArray(single, 0, -1)).toEqual([p1]);

    // Out of bounds
    const list = [p1, p2];
    expect(reorderArray(list, -1, 0)).toEqual([p1, p2]);
    expect(reorderArray(list, 0, 5)).toEqual([p1, p2]);

    // 10+ items: move 9th to 2nd position
    const tenItems = Array.from({ length: 12 }, (_, i) => ({ id: `item-${i}`, name: `Item ${i}` }));
    const reordered = reorderArray(tenItems, 9, 2);
    expect(reordered[2].id).toBe('item-9');
    expect(reordered[3].id).toBe('item-2');
    expect(reordered).toHaveLength(12);
  });

  test('Data migration: Assigns stable IDs to items lacking them without reordering', () => {
    const legacyProjects = [
      { name: 'Legacy Project A' },
      { id: 'custom-id-b', name: 'Project B' },
      { name: 'Legacy Project C' }
    ];

    const normalized = normalizeItemsWithIds(legacyProjects);
    expect(normalized[0].id).toBeDefined();
    expect(normalized[1].id).toBe('custom-id-b');
    expect(normalized[2].id).toBeDefined();
    expect(normalized.map(p => p.name)).toEqual(['Legacy Project A', 'Project B', 'Legacy Project C']);

    const legacyExperiences = [
      { company: 'Startup 1' },
      { id: 'exp-keep-id', company: 'Startup 2' },
      { company: 'Startup 3' }
    ];
    const normalizedExp = normalizeItemsWithIds(legacyExperiences);
    expect(normalizedExp[0].id).toBeDefined();
    expect(normalizedExp[1].id).toBe('exp-keep-id');
    expect(normalizedExp[2].id).toBeDefined();
    expect(normalizedExp.map(e => e.company)).toEqual(['Startup 1', 'Startup 2', 'Startup 3']);
  });
});

describe('Live Canonical Preview Synchronization with Reordered Items', () => {
  const baseResume = {
    personal: { fullName: 'Alex Mercer', email: 'alex@example.com' },
    sectionOrder: ['experience', 'projects', 'education'],
    sectionVisibility: { experience: true, projects: true, education: true },
    experiences: [
      { id: 'exp-alpha', company: 'Alpha Technologies Inc', role: 'Staff Engineer', startDate: '2022', endDate: 'Present', bullets: [{ text: 'Built real-time messaging' }] },
      { id: 'exp-beta', company: 'Beta Global Systems', role: 'Senior Engineer', startDate: '2020', endDate: '2022', bullets: [{ text: 'Scaled distributed cache' }] },
      { id: 'exp-gamma', company: 'Gamma Robotics Labs', role: 'Software Engineer', startDate: '2018', endDate: '2020', bullets: [{ text: 'Wrote control loop algorithms' }] }
    ],
    projects: [
      { id: 'proj-alpha', name: 'Alpha Analytics Platform', description: 'Real-time OLAP dashboard', technologies: ['React'] },
      { id: 'proj-beta', name: 'Beta Cloud Storage Engine', description: 'Distributed object store', technologies: ['Go'] },
      { id: 'proj-gamma', name: 'Gamma Machine Learning Tool', description: 'Model inference server', technologies: ['Python'] }
    ],
    education: [
      { id: 'edu-mit', degree: 'B.S. in Computer Science', institution: 'MIT', startDate: '2016', endDate: '2020' },
      { id: 'edu-stanford', degree: 'M.S. in AI', institution: 'Stanford University', startDate: '2020', endDate: '2022' }
    ]
  };

  test('Templates render experiences, projects and education in exact canonical array order', () => {
    // Render initially
    const { container: initialContainer } = render(<ATSClassic resume={baseResume} />);
    const initialText = initialContainer.textContent;
    const alphaPos = initialText.indexOf('Alpha Analytics Platform');
    const betaPos = initialText.indexOf('Beta Cloud Storage Engine');
    const gammaPos = initialText.indexOf('Gamma Machine Learning Tool');

    expect(alphaPos).toBeLessThan(betaPos);
    expect(betaPos).toBeLessThan(gammaPos);

    const expAlphaPos = initialText.indexOf('Alpha Technologies Inc');
    const expBetaPos = initialText.indexOf('Beta Global Systems');
    const expGammaPos = initialText.indexOf('Gamma Robotics Labs');
    expect(expAlphaPos).toBeLessThan(expBetaPos);
    expect(expBetaPos).toBeLessThan(expGammaPos);

    // Reorder: Gamma (index 2) moved to top (index 0) for projects, education, and experiences
    const reorderedResume = {
      ...baseResume,
      experiences: reorderArray(baseResume.experiences, 2, 0),
      projects: reorderArray(baseResume.projects, 2, 0),
      education: reorderArray(baseResume.education, 1, 0)
    };

    const { container: reorderedContainer } = render(<ATSClassic resume={reorderedResume} />);
    const reorderedText = reorderedContainer.textContent;
    const newGammaPos = reorderedText.indexOf('Gamma Machine Learning Tool');
    const newAlphaPos = reorderedText.indexOf('Alpha Analytics Platform');
    const newBetaPos = reorderedText.indexOf('Beta Cloud Storage Engine');

    // Projects: Gamma must come before Alpha, and Alpha before Beta
    expect(newGammaPos).toBeLessThan(newAlphaPos);
    expect(newAlphaPos).toBeLessThan(newBetaPos);

    // Education: Stanford now before MIT
    const stanfordPos = reorderedText.indexOf('Stanford University');
    const mitPos = reorderedText.indexOf('MIT');
    expect(stanfordPos).toBeLessThan(mitPos);

    // Experiences: Gamma Robotics now before Alpha Technologies, and Alpha before Beta
    const newExpGammaPos = reorderedText.indexOf('Gamma Robotics Labs');
    const newExpAlphaPos = reorderedText.indexOf('Alpha Technologies Inc');
    const newExpBetaPos = reorderedText.indexOf('Beta Global Systems');
    expect(newExpGammaPos).toBeLessThan(newExpAlphaPos);
    expect(newExpAlphaPos).toBeLessThan(newExpBetaPos);
  });

  test('ModernProfessional, TechnicalResume, MinimalistResume respect reordered experiences and projects', () => {
    const reorderedResume = {
      ...baseResume,
      experiences: reorderArray(baseResume.experiences, 2, 0),
      projects: reorderArray(baseResume.projects, 2, 0)
    };

    [ModernProfessional, TechnicalResume, MinimalistResume].forEach(Template => {
      const { container } = render(<Template resume={reorderedResume} />);
      const text = container.textContent;
      const gammaIndex = text.indexOf('Gamma Machine Learning Tool');
      const alphaIndex = text.indexOf('Alpha Analytics Platform');
      expect(gammaIndex).toBeLessThan(alphaIndex);

      const expGammaIndex = text.indexOf('Gamma Robotics Labs');
      const expAlphaIndex = text.indexOf('Alpha Technologies Inc');
      expect(expGammaIndex).toBeLessThan(expAlphaIndex);
    });
  });
});
