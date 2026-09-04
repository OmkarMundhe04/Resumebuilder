import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TagInput from '../components/ui/TagInput';
import ATSClassic from '../components/templates/ATSClassic';
import ModernProfessional from '../components/templates/ModernProfessional';
import TechnicalResume from '../components/templates/TechnicalResume';
import TokyoMinimal from '../components/templates/TokyoMinimal';
import RubyExecutive from '../components/templates/RubyExecutive';
import EmeraldCompact from '../components/templates/EmeraldCompact';

// Canonical pure reorder function mirroring the TagInput / ResumeBuilder logic
const reorderArray = (list, sourceIndex, targetIndex) => {
  if (sourceIndex === targetIndex) return list;
  if (sourceIndex < 0 || sourceIndex >= list.length || targetIndex < 0 || targetIndex >= list.length) return list;
  const copy = [...list];
  const [moved] = copy.splice(sourceIndex, 1);
  copy.splice(targetIndex, 0, moved);
  return copy;
};

describe('Key Projects — Rearrange Technologies Inside Each Project (Unit & State Logic)', () => {
  const initialTechs = ['React', 'Node.js', 'MongoDB', 'Express', 'PostgreSQL'];

  test('Permutation Sequence: Arbitrary reorder to [MongoDB, React, PostgreSQL, Express, Node.js]', () => {
    let techs = [...initialTechs];
    expect(techs).toEqual(['React', 'Node.js', 'MongoDB', 'Express', 'PostgreSQL']);

    // Step 1: Move MongoDB (idx 2) to top (idx 0)
    techs = reorderArray(techs, 2, 0);
    expect(techs).toEqual(['MongoDB', 'React', 'Node.js', 'Express', 'PostgreSQL']);

    // Step 2: Move PostgreSQL (idx 4) to idx 2
    techs = reorderArray(techs, 4, 2);
    expect(techs).toEqual(['MongoDB', 'React', 'PostgreSQL', 'Node.js', 'Express']);

    // Step 3: Move Express (idx 4) to idx 3
    techs = reorderArray(techs, 4, 3);
    expect(techs).toEqual(['MongoDB', 'React', 'PostgreSQL', 'Express', 'Node.js']);
  });

  test('Reverse Permutation: [1, 2, 3, 4] -> [4, 3, 2, 1]', () => {
    let techs = ['A', 'B', 'C', 'D'];
    // Move D to 0: D, A, B, C
    techs = reorderArray(techs, 3, 0);
    // Move C to 1: D, C, A, B
    techs = reorderArray(techs, 3, 1);
    // Move B to 2: D, C, B, A
    techs = reorderArray(techs, 3, 2);
    expect(techs).toEqual(['D', 'C', 'B', 'A']);
  });

  test('Multiple Projects Independence: Reordering Project A does not affect Project B', () => {
    const resume = {
      projects: [
        { id: 'proj-A', name: 'Project A', technologies: ['React', 'Node.js', 'MongoDB'] },
        { id: 'proj-B', name: 'Project B', technologies: ['Python', 'FastAPI', 'PostgreSQL'] }
      ]
    };

    // User rearranges Project A: Move MongoDB to top
    const updatedProjects = resume.projects.map(proj => {
      if (proj.id === 'proj-A') {
        return { ...proj, technologies: reorderArray(proj.technologies, 2, 0) };
      }
      return proj;
    });

    expect(updatedProjects[0].technologies).toEqual(['MongoDB', 'React', 'Node.js']);
    expect(updatedProjects[1].technologies).toEqual(['Python', 'FastAPI', 'PostgreSQL']);
  });

  test('Edge Cases: 0 items, 1 item, boundary checks, duplicate names', () => {
    // 0 items
    expect(reorderArray([], 0, 1)).toEqual([]);

    // 1 item
    expect(reorderArray(['React'], 0, 0)).toEqual(['React']);
    expect(reorderArray(['React'], 0, 1)).toEqual(['React']);
    expect(reorderArray(['React'], 0, -1)).toEqual(['React']);

    // 2 items swap
    expect(reorderArray(['React', 'Node.js'], 1, 0)).toEqual(['Node.js', 'React']);

    // Out-of-bounds indices
    expect(reorderArray(['A', 'B'], -1, 1)).toEqual(['A', 'B']);
    expect(reorderArray(['A', 'B'], 0, 5)).toEqual(['A', 'B']);

    // Duplicate technology names (e.g. accidentally added twice)
    const withDups = ['React', 'Node.js', 'React'];
    const reorderedDups = reorderArray(withDups, 1, 0);
    expect(reorderedDups).toEqual(['Node.js', 'React', 'React']);
  });
});

describe('TagInput Component Interaction & Accessibility', () => {
  test('Renders drag handles and accessible move buttons when allowReorder=true', () => {
    const onChange = jest.fn();
    render(
      <TagInput
        tags={['React', 'Node.js', 'MongoDB']}
        onChange={onChange}
        allowReorder={true}
        reorderAriaLabelPrefix="Project 1"
      />
    );

    // Verify all 3 tags rendered
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();

    // Verify drag handles exist
    const dragHandles = screen.getAllByTitle('Hold and drag to reorder');
    expect(dragHandles).toHaveLength(3);

    // Check accessibility move buttons
    const moveEarlierBtns = screen.getAllByTitle(/Move .* earlier/i);
    const moveLaterBtns = screen.getAllByTitle(/Move .* later/i);
    expect(moveEarlierBtns).toHaveLength(3);
    expect(moveLaterBtns).toHaveLength(3);

    // Boundary disabled states: First item cannot move earlier, last cannot move later
    expect(moveEarlierBtns[0]).toBeDisabled();
    expect(moveEarlierBtns[1]).not.toBeDisabled();
    expect(moveLaterBtns[2]).toBeDisabled();
    expect(moveLaterBtns[1]).not.toBeDisabled();
  });

  test('Clicking Move Later button reorders tags and invokes onChange', () => {
    const onChange = jest.fn();
    render(
      <TagInput
        tags={['React', 'Node.js', 'MongoDB']}
        onChange={onChange}
        allowReorder={true}
        reorderAriaLabelPrefix="Project 1"
      />
    );

    const moveLaterBtns = screen.getAllByTitle(/Move .* later/i);
    // Click Move Later on React (index 0)
    fireEvent.click(moveLaterBtns[0]);

    expect(onChange).toHaveBeenCalledWith(['Node.js', 'React', 'MongoDB']);
  });

  test('Clicking Move Earlier button reorders tags and invokes onChange', () => {
    const onChange = jest.fn();
    render(
      <TagInput
        tags={['React', 'Node.js', 'MongoDB']}
        onChange={onChange}
        allowReorder={true}
        reorderAriaLabelPrefix="Project 1"
      />
    );

    const moveEarlierBtns = screen.getAllByTitle(/Move .* earlier/i);
    // Click Move Earlier on MongoDB (index 2)
    fireEvent.click(moveEarlierBtns[2]);

    expect(onChange).toHaveBeenCalledWith(['React', 'MongoDB', 'Node.js']);
  });

  test('Does NOT render drag handles or move buttons when allowReorder is false (Default / Coursework / Skills)', () => {
    const onChange = jest.fn();
    render(
      <TagInput
        tags={['Data Structures', 'Algorithms']}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Data Structures')).toBeInTheDocument();
    expect(screen.getByText('Algorithms')).toBeInTheDocument();
    expect(screen.queryByTitle('Hold and drag to reorder')).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Move .* earlier/i)).not.toBeInTheDocument();
  });

  test('Normal tag addition and deletion remains fully functional with allowReorder=true', () => {
    const onChange = jest.fn();
    const { container } = render(
      <TagInput
        tags={['React', 'Node.js']}
        onChange={onChange}
        allowReorder={true}
      />
    );

    // Delete tag
    const removeBtns = screen.getAllByTitle(/Remove /i);
    fireEvent.click(removeBtns[0]);
    expect(onChange).toHaveBeenCalledWith(['Node.js']);

    // Add tag
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: 'TypeScript' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['React', 'Node.js', 'TypeScript']);
  });
});

describe('Live Canonical Preview Synchronization for Reordered Technologies', () => {
  const baseResume = {
    personal: { fullName: 'Alex Mercer', email: 'alex@example.com' },
    sectionOrder: ['projects'],
    sectionVisibility: { projects: true },
    projects: [
      {
        id: 'proj-1',
        name: 'Distributed Database',
        role: 'Lead Architect',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'PostgreSQL'],
        description: 'High throughput database'
      }
    ]
  };

  test('Templates render initial vs reordered technologies in exact user-specified order without sorting', () => {
    // Initial order: React -> Node.js -> MongoDB -> Express -> PostgreSQL
    const { container: initContainer } = render(<ATSClassic resume={baseResume} />);
    expect(initContainer.textContent).toContain('React, Node.js, MongoDB, Express, PostgreSQL');

    // Reordered order: MongoDB -> React -> PostgreSQL -> Express -> Node.js
    const reorderedTechnologies = ['MongoDB', 'React', 'PostgreSQL', 'Express', 'Node.js'];
    const reorderedResume = {
      ...baseResume,
      projects: [
        {
          ...baseResume.projects[0],
          technologies: reorderedTechnologies
        }
      ]
    };

    // ATS Classic (comma-separated)
    const { container: atsContainer } = render(<ATSClassic resume={reorderedResume} />);
    expect(atsContainer.textContent).toContain('MongoDB, React, PostgreSQL, Express, Node.js');

    // Modern Professional
    const { container: modernContainer } = render(<ModernProfessional resume={reorderedResume} />);
    expect(modernContainer.textContent).toContain('MongoDB, React, PostgreSQL, Express, Node.js');

    // Technical Resume (pipe-separated ' | ')
    const { container: techContainer } = render(<TechnicalResume resume={reorderedResume} />);
    expect(techContainer.textContent).toContain('MongoDB | React | PostgreSQL | Express | Node.js');

    // Tokyo Minimal (slash-separated ' / ')
    const { container: tokyoContainer } = render(<TokyoMinimal resume={reorderedResume} />);
    expect(tokyoContainer.textContent).toContain('MongoDB / React / PostgreSQL / Express / Node.js');

    // Ruby Executive
    const { container: rubyContainer } = render(<RubyExecutive resume={reorderedResume} />);
    expect(rubyContainer.textContent).toContain('MongoDB, React, PostgreSQL, Express, Node.js');

    // Emerald Compact
    const { container: emeraldContainer } = render(<EmeraldCompact resume={reorderedResume} />);
    expect(emeraldContainer.textContent).toContain('MongoDB, React, PostgreSQL, Express, Node.js');
  });
});
