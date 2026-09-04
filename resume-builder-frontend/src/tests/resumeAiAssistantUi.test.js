import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectDescriptionModal from '../components/ai/ProjectDescriptionModal';
import SectionImprovementModal from '../components/ai/SectionImprovementModal';
import SkillSuggestionsModal from '../components/career/SkillSuggestionsModal';
import RoleAnalysisModal from '../components/ai/RoleAnalysisModal';
import api from '../services/api';

// Mock the api module with explicit factory to avoid ESM axios load in Jest
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

// Mock ToastContext
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({
    addToast: jest.fn()
  }),
  ToastProvider: ({ children }) => children
}));

describe('Resume AI Assistant Frontend Component Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('ProjectDescriptionModal Component', () => {
    const mockProject = {
      id: 'proj-1',
      name: 'Resume Engine',
      description: 'A tool for making resumes with Node.js.',
      technologies: ['React', 'Node.js', 'MongoDB']
    };

    test('Renders modal and generates role-targeted description variants on mount', async () => {
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          variants: {
            concise: 'Engineered a Resume Engine with React, Node.js, and MongoDB.',
            technical: 'Architected full-stack Resume Engine utilizing React and Node.js with MongoDB persistence.',
            roleTargeted: 'Developed backend API endpoints and data models for Resume Engine with Node.js and MongoDB.',
            portfolio: 'Resume Engine is a comprehensive application built with React and Node.js.'
          }
        }
      });

      const onApplyMock = jest.fn();
      const onCloseMock = jest.fn();

      render(
        <ProjectDescriptionModal
          isOpen={true}
          project={mockProject}
          targetRole="Backend Developer"
          onClose={onCloseMock}
          onApplyDescription={onApplyMock}
        />
      );

      expect(screen.getByText(/Generate Project Description/i)).toBeInTheDocument();
      expect(screen.getByText(/Resume Engine/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Architected full-stack Resume Engine/i)).toBeInTheDocument();
      });

      // User selects roleTargeted variant
      const useRoleTargetedBtn = screen.getAllByText(/Use This/i)[2];
      fireEvent.click(useRoleTargetedBtn);

      expect(onApplyMock).toHaveBeenCalledTimes(1);
      expect(onApplyMock).toHaveBeenCalledWith('Developed backend API endpoints and data models for Resume Engine with Node.js and MongoDB.');
    });

    test('Cancel/Close does not apply any changes', async () => {
      api.post.mockResolvedValueOnce({
        data: { success: true, variants: { concise: 'Test' } }
      });
      const onApplyMock = jest.fn();
      const onCloseMock = jest.fn();

      render(
        <ProjectDescriptionModal
          isOpen={true}
          project={mockProject}
          onClose={onCloseMock}
          onApplyDescription={onApplyMock}
        />
      );

      const cancelBtn = screen.getByText(/Cancel/i);
      fireEvent.click(cancelBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(onApplyMock).not.toHaveBeenCalled();
    });
  });

  describe('SectionImprovementModal Component', () => {
    test('Shows warning when attempting to enhance with empty content', () => {
      const onApplyMock = jest.fn();
      const onCloseMock = jest.fn();

      render(
        <SectionImprovementModal
          isOpen={true}
          type="experience"
          title="Senior Engineer"
          originalText=""
          onClose={onCloseMock}
          onApply={onApplyMock}
        />
      );

      expect(screen.getByText(/No User Content to Improve/i)).toBeInTheDocument();
      expect(screen.getByText(/Cannot improve empty section/i)).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    test('Generates 3 truthful variants for populated section text and applies selected variant', async () => {
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          suggestions: [
            {
              variant: 'concise',
              title: 'Concise & Direct',
              text: 'Managed cloud database operations and improved reliability.',
              explanation: 'Clean sentence phrasing'
            },
            {
              variant: 'highImpact',
              title: 'High Impact & Professional',
              text: 'Administered cloud database operations, improving system reliability.',
              explanation: 'Professional execution'
            },
            {
              variant: 'roleTargeted',
              title: 'Role-Targeted Optimization',
              text: 'Supported backend data workflows through managed cloud database operations.',
              explanation: 'Targeted to backend'
            }
          ],
          extractedSkills: [{ name: 'Cloud Database' }, { name: 'Backend' }]
        }
      });

      const onApplyMock = jest.fn();
      const onCloseMock = jest.fn();

      render(
        <SectionImprovementModal
          isOpen={true}
          type="experience"
          title="Cloud Operations"
          originalText="Managed cloud database operations."
          targetRole="Backend Engineer"
          onClose={onCloseMock}
          onApply={onApplyMock}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Managed cloud database operations and improved reliability/i)).toBeInTheDocument();
      });

      // Click "Use This" on concise variant
      const useThisButtons = screen.getAllByText(/Use This/i);
      fireEvent.click(useThisButtons[0]);

      expect(onApplyMock).toHaveBeenCalledWith(
        'Managed cloud database operations and improved reliability.',
        ['Cloud Database', 'Backend']
      );
    });
  });

  describe('SkillSuggestionsModal Component', () => {
    test('Displays evidenced skills with role relevance, flags unevidenced JD skills, and adds selected', async () => {
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          suggestedSkills: [
            {
              name: 'Python',
              evidence: 'Evidenced in Project A and Experience B',
              relevance: 'High',
              confidence: 96
            },
            {
              name: 'PostgreSQL',
              evidence: 'Used in Database layer of Project A',
              relevance: 'Medium',
              confidence: 88
            }
          ],
          missingJobSkills: ['Kubernetes', 'AWS Lambda']
        }
      });

      const onAddSkillsMock = jest.fn();
      const onCloseMock = jest.fn();

      render(
        <SkillSuggestionsModal
          isOpen={true}
          resume={{ skills: [{ name: 'Git' }] }}
          targetRole="Backend Engineer"
          jobDescription="Requires Kubernetes, AWS Lambda, Python"
          onClose={onCloseMock}
          onAddSkills={onAddSkillsMock}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Python/i)).toBeInTheDocument();
        expect(screen.getByText(/Evidenced in Project A and Experience B/i)).toBeInTheDocument();
      });

      // Verify unevidenced job skills warning is rendered
      expect(screen.getByText(/Job Description Requirements Lacking Candidate Evidence/i)).toBeInTheDocument();
      expect(screen.getByText(/Kubernetes/i)).toBeInTheDocument();

      // Add selected skills (Python & PostgreSQL are pre-selected)
      const addBtn = screen.getByRole('button', { name: /Add Selected Skills/i });
      fireEvent.click(addBtn);

      expect(onAddSkillsMock).toHaveBeenCalledWith(['Python', 'PostgreSQL']);
    });
  });

  describe('RoleAnalysisModal Component', () => {
    test('Renders role alignment diagnosis and switches to optimizer tab', async () => {
      api.post.mockImplementation((url) => {
        if (url.includes('role-analysis')) {
          return Promise.resolve({
            data: {
              success: true,
              analysis: {
                matchScore: 82,
                strongMatches: ['Node.js backend experience', 'MongoDB persistence'],
                missingEvidence: ['No production Kubernetes deployments documented'],
                relevantSkillsToHighlight: ['Node.js', 'MongoDB', 'REST APIs'],
                skillsToDeemphasize: [],
                atsKeywordAlignment: {
                  jobKeywordsFound: ['Node.js', 'MongoDB'],
                  jobKeywordsMissing: ['Kubernetes']
                }
              }
            }
          });
        }
        if (url.includes('optimize-for-role')) {
          return Promise.resolve({
            data: {
              success: true,
              proposals: {
                summary: 'Backend Engineer with proven expertise in Node.js and MongoDB APIs.',
                experiences: [
                  {
                    company: 'Acme Corp',
                    role: 'Software Engineer',
                    suggestedBullets: ['Engineered scalable Node.js services with MongoDB.']
                  }
                ],
                projects: [
                  {
                    name: 'Resume Builder',
                    suggestedDescription: 'Architected Node.js API layer with MongoDB database.'
                  }
                ],
                skills: ['Node.js', 'MongoDB', 'REST APIs']
              }
            }
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const onApplyOptMock = jest.fn();
      const onCloseMock = jest.fn();

      render(
        <RoleAnalysisModal
          isOpen={true}
          resume={{
            targetRole: 'Backend Engineer',
            personal: { fullName: 'Alex Rivera', title: 'Backend Engineer' },
            skills: [{ name: 'JavaScript' }],
            experiences: [{ company: 'Acme Corp', role: 'Software Engineer', bullets: [{ text: 'Built features.' }] }],
            projects: [{ name: 'Resume Builder', description: 'Built an app.' }]
          }}
          initialTab="analysis"
          onClose={onCloseMock}
          onApplyOptimization={onApplyOptMock}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/82%/i)).toBeInTheDocument();
        expect(screen.getByText(/Node.js backend experience/i)).toBeInTheDocument();
      });

      // Switch to optimizer tab
      const optimizerTabBtn = screen.getByRole('button', { name: /Role Optimization Proposals/i });
      fireEvent.click(optimizerTabBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use This Summary/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      // Accept summary proposal
      const useThisSummaryBtn = screen.getByRole('button', { name: /Use This Summary/i });
      fireEvent.click(useThisSummaryBtn);

      expect(onApplyOptMock).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: 'Backend Engineer with proven expertise in Node.js and MongoDB APIs.'
        })
      );
    });
  });
});
