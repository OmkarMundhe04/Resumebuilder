import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TagInput from '../components/ui/TagInput';
import ATSClassic from '../components/templates/ATSClassic';
import ModernProfessional from '../components/templates/ModernProfessional';
import TechnicalResume from '../components/templates/TechnicalResume';
import StudentResume from '../components/templates/StudentResume';
import ExecutiveResume from '../components/templates/ExecutiveResume';
import AcademicCV from '../components/templates/AcademicCV';
import MinimalistResume from '../components/templates/MinimalistResume';
import CreativeResume from '../components/templates/CreativeResume';
import SwissClean from '../components/templates/SwissClean';
import SiliconValley from '../components/templates/SiliconValley';
import CorporateNavy from '../components/templates/CorporateNavy';
import EmeraldCompact from '../components/templates/EmeraldCompact';
import TokyoMinimal from '../components/templates/TokyoMinimal';
import NordicSlate from '../components/templates/NordicSlate';
import RubyExecutive from '../components/templates/RubyExecutive';
import BerlinModern from '../components/templates/BerlinModern';

describe('TagInput Comma, Space and Paste Edge Cases', () => {
  test('allows spaces in skill input and creates tag on comma', () => {
    const onChange = jest.fn();
    const { container } = render(<TagInput tags={['React']} onChange={onChange} />);
    const input = container.querySelector('input');

    // Type "Data Structures" with spaces
    fireEvent.change(input, { target: { value: 'Data Structures' } });
    expect(input.value).toBe('Data Structures');

    // Press comma to submit
    fireEvent.keyDown(input, { key: ',' });
    expect(onChange).toHaveBeenCalledWith(['React', 'Data Structures']);
  });

  test('splits comma and newline separated pasted text into separate tags', () => {
    const onChange = jest.fn();
    const { container } = render(<TagInput tags={[]} onChange={onChange} />);
    const input = container.querySelector('input');

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => 'Docker, Kubernetes, CI/CD Pipeline\nAWS Cloud'
      }
    });

    expect(onChange).toHaveBeenCalledWith(['Docker', 'Kubernetes', 'CI/CD Pipeline', 'AWS Cloud']);
  });
});

describe('16 Resume Templates - Skills Rendering Verification', () => {
  const mockResumeData = {
    personal: { fullName: 'Alex Mercer', email: 'alex@example.com' },
    sectionOrder: ['skills'],
    sectionVisibility: { skills: true },
    skills: [
      { id: '1', name: 'Python', note: 'Advanced' },
      { id: '2', name: 'Git', note: '' },
      { id: '3', name: 'Docker', proficiency: 'Intermediate' } // legacy backward compatibility
    ]
  };

  const templates = [
    { name: 'ATSClassic', Component: ATSClassic },
    { name: 'ModernProfessional', Component: ModernProfessional },
    { name: 'TechnicalResume', Component: TechnicalResume },
    { name: 'StudentResume', Component: StudentResume },
    { name: 'ExecutiveResume', Component: ExecutiveResume },
    { name: 'AcademicCV', Component: AcademicCV },
    { name: 'MinimalistResume', Component: MinimalistResume },
    { name: 'CreativeResume', Component: CreativeResume },
    { name: 'SwissClean', Component: SwissClean },
    { name: 'SiliconValley', Component: SiliconValley },
    { name: 'CorporateNavy', Component: CorporateNavy },
    { name: 'EmeraldCompact', Component: EmeraldCompact },
    { name: 'TokyoMinimal', Component: TokyoMinimal },
    { name: 'NordicSlate', Component: NordicSlate },
    { name: 'RubyExecutive', Component: RubyExecutive },
    { name: 'BerlinModern', Component: BerlinModern },
  ];

  templates.forEach(({ name, Component }) => {
    test(`${name} renders note when present, no dash when note empty, and legacy proficiency`, () => {
      const { container } = render(<Component resume={mockResumeData} />);
      const text = container.textContent;

      // Python has note "Advanced" -> should contain Python — Advanced or Python (Advanced)
      expect(text).toContain('Python');
      expect(text).toContain('Advanced');

      // Git has empty note -> should contain Git, must NOT contain "Git —"
      expect(text).toContain('Git');
      expect(text).not.toContain('Git —');

      // Docker has legacy proficiency "Intermediate" -> should contain Docker and Intermediate
      expect(text).toContain('Docker');
      expect(text).toContain('Intermediate');

      // Category headers should NOT appear
      expect(text).not.toContain('Languages & Frameworks:');
      expect(text).not.toContain('Tools & Infrastructure:');
      expect(text).not.toContain('Technical:');
    });
  });
});
