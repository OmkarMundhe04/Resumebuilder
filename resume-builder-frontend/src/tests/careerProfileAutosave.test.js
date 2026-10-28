import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAutosave } from '../hooks/useAutosave';
import isCareerProfileEqual from '../utils/deepEqual';
import CareerProfile from '../pages/CareerProfile';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
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

// Mock ToastContext with stable callback
const mockAddToast = jest.fn();
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({
    addToast: mockAddToast
  }),
  ToastProvider: ({ children }) => children
}));

const mockProfile = {
  personal: {
    fullName: 'Jane Doe',
    title: 'Software Engineer',
    email: 'jane@example.com',
    summary: 'Experienced dev'
  },
  experiences: [
    {
      id: 'exp-1',
      company: 'Acme Corp',
      role: 'Staff Engineer',
      bullets: [{ id: 'b-1', text: 'Built autosave engine.' }]
    }
  ],
  education: [
    { id: 'edu-1', institution: 'MIT', degree: 'B.S. CS' }
  ],
  skills: [
    { id: 'sk-1', name: 'React', note: 'Frontend' },
    { id: 'sk-2', name: 'Node.js', note: 'Backend' }
  ],
  projects: [
    { id: 'proj-1', name: 'Resume Builder', description: 'Career SaaS' }
  ],
  certifications: [
    { id: 'cert-1', name: 'AWS SA' }
  ],
  publications: [],
  awards: [],
  volunteer: [],
  customSections: []
};

describe('Career Profile Autosave Engine (Hook & Unit Tests)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('1. Autosave ON saves after 1500ms debounce', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data, enabled }) => useAutosave({ data, onSave, debounceMs: 1500, enabled }),
      { initialProps: { data: mockProfile, enabled: true } }
    );

    // Initialize baseline
    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    expect(result.current.status).toBe('saved');
    expect(result.current.isDirty).toBe(false);

    // Edit full name
    const updated = {
      ...mockProfile,
      personal: { ...mockProfile.personal, fullName: 'Jane Smith' }
    };
    rerender({ data: updated, enabled: true });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.status).toBe('dirty');
    expect(onSave).not.toHaveBeenCalled();

    // Fast-forward 1000ms (not yet 1500ms)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onSave).not.toHaveBeenCalled();

    // Fast-forward remaining 500ms
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(updated, expect.objectContaining({ isAutosave: true }));
    expect(result.current.status).toBe('saved');
    expect(result.current.isDirty).toBe(false);
  });

  test('2. Multiple rapid changes produce a single save request (debouncing)', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    // Rapid edits every 300ms for 5 strokes
    let current = mockProfile;
    for (let i = 1; i <= 5; i++) {
      current = {
        ...current,
        personal: { ...current.personal, summary: `Draft ${i}` }
      };
      rerender({ data: current });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(onSave).not.toHaveBeenCalled();
    }

    // Advance 1500ms after the final change
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(current, expect.objectContaining({ isAutosave: true }));
  });

  test('3. Autosave OFF produces zero automatic save requests', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data, enabled }) => useAutosave({ data, onSave, debounceMs: 1500, enabled }),
      { initialProps: { data: mockProfile, enabled: false } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    const updated = {
      ...mockProfile,
      personal: { ...mockProfile.personal, title: 'VP of Tech' }
    };
    rerender({ data: updated, enabled: false });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.status).toBe('disabled');

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  test('4. Manual Save works when Autosave is OFF', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data, enabled }) => useAutosave({ data, onSave, debounceMs: 1500, enabled }),
      { initialProps: { data: mockProfile, enabled: false } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    const updated = {
      ...mockProfile,
      personal: { ...mockProfile.personal, phone: '+1 555 000 1111' }
    };
    rerender({ data: updated, enabled: false });

    await act(async () => {
      await result.current.saveImmediately();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(updated, expect.objectContaining({ isAutosave: false }));
    expect(result.current.isDirty).toBe(false);
    expect(result.current.status).toBe('saved');
  });

  test('5. Manual Save cancels pending debounced autosave', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    const updated = {
      ...mockProfile,
      personal: { ...mockProfile.personal, location: 'Berlin, Germany' }
    };
    rerender({ data: updated });

    // Wait 500ms into debounce, then trigger manual save
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await act(async () => {
      await result.current.saveImmediately();
    });

    expect(onSave).toHaveBeenCalledTimes(1);

    // Advance past original 1500ms
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Still exactly 1 call (no duplicate debounce save)
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  test('6. No save occurs when data has not changed', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    // Re-render with deep copy of same data
    rerender({ data: JSON.parse(JSON.stringify(mockProfile)) });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.isDirty).toBe(false);
  });

  test('7. Reverting a field to its saved value cancels pending save and marks clean', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    // Change title
    const modified = {
      ...mockProfile,
      personal: { ...mockProfile.personal, title: 'Temporary Title' }
    };
    rerender({ data: modified });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.status).toBe('dirty');

    // User backspaces back to original title before timer fires
    act(() => {
      jest.advanceTimersByTime(800);
    });
    rerender({ data: mockProfile });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.status).toBe('saved');

    // Timer expires
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  test('8. Status transitions correctly through the lifecycle', async () => {
    let resolveSave;
    const onSave = jest.fn(() => new Promise((resolve) => { resolveSave = resolve; }));

    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });
    expect(result.current.status).toBe('saved');

    // Trigger edit
    rerender({
      data: { ...mockProfile, personal: { ...mockProfile.personal, fullName: 'Status Test' } }
    });
    expect(result.current.status).toBe('dirty');

    // Advance timers to trigger save
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current.status).toBe('saving');

    // Resolve network save
    await act(async () => {
      resolveSave({ success: true });
    });
    expect(result.current.status).toBe('saved');
  });

  test('9. Failed autosave keeps profile marked as dirty and exposes retry', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Network error'));
    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    const modified = {
      ...mockProfile,
      personal: { ...mockProfile.personal, fullName: 'Error Test' }
    };
    rerender({ data: modified });

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('error');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.error).toBeTruthy();

    // 10. Retry recovers cleanly
    onSave.mockResolvedValueOnce({ success: true });
    await act(async () => {
      await result.current.retry();
    });

    expect(onSave).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('saved');
    expect(result.current.isDirty).toBe(false);
  });

  test('11. Component unmount cleans up timers safely', () => {
    const onSave = jest.fn();
    const { unmount, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    rerender({
      data: { ...mockProfile, personal: { ...mockProfile.personal, fullName: 'Unmount' } }
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  test('14. Race Condition Protection: Older save responses do not overwrite newer user edits', async () => {
    let resolveFirst;
    const savePromise1 = new Promise(resolve => { resolveFirst = resolve; });

    const onSave = jest.fn()
      .mockImplementationOnce(() => savePromise1)
      .mockResolvedValueOnce({ success: true });

    const { result, rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave, debounceMs: 1500 }),
      { initialProps: { data: mockProfile } }
    );

    act(() => {
      result.current.setSavedBaseline(mockProfile);
    });

    // 1st change
    const stateA = { ...mockProfile, personal: { ...mockProfile.personal, fullName: 'State A' } };
    rerender({ data: stateA });

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(onSave).toHaveBeenCalledTimes(1);

    // User types State B while State A save is in flight!
    const stateB = { ...mockProfile, personal: { ...mockProfile.personal, fullName: 'State B' } };
    rerender({ data: stateB });

    // 1st request now resolves
    await act(async () => {
      resolveFirst({ success: true });
    });

    // Crucial: State B was NOT overwritten! Profile remains dirty!
    expect(result.current.isDirty).toBe(true);
    expect(result.current.status).toBe('dirty');

    // Debounce for State B fires
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith(stateB, expect.objectContaining({ isAutosave: true }));
    expect(result.current.status).toBe('saved');
    expect(result.current.isDirty).toBe(false);
  });

  test('16. All Career Profile sections are tracked by deepEqual and trigger dirty state', () => {
    // Experiences
    expect(isCareerProfileEqual(mockProfile, {
      ...mockProfile,
      experiences: [{ ...mockProfile.experiences[0], role: 'Senior Staff' }]
    })).toBe(false);

    // Experience reordering
    const exp2 = { id: 'exp-2', company: 'Second Co' };
    const list1 = [mockProfile.experiences[0], exp2];
    const list2 = [exp2, mockProfile.experiences[0]];
    expect(isCareerProfileEqual({ ...mockProfile, experiences: list1 }, { ...mockProfile, experiences: list2 })).toBe(false);

    // Education
    expect(isCareerProfileEqual(mockProfile, {
      ...mockProfile,
      education: [{ ...mockProfile.education[0], gpa: '3.9' }]
    })).toBe(false);

    // Skills
    expect(isCareerProfileEqual(mockProfile, {
      ...mockProfile,
      skills: [...mockProfile.skills, { id: 'sk-3', name: 'GraphQL' }]
    })).toBe(false);

    // Projects
    expect(isCareerProfileEqual(mockProfile, {
      ...mockProfile,
      projects: [{ ...mockProfile.projects[0], link: 'https://example.com' }]
    })).toBe(false);

    // Certifications
    expect(isCareerProfileEqual(mockProfile, {
      ...mockProfile,
      certifications: [{ id: 'cert-2', name: 'GCP Architect' }]
    })).toBe(false);

    // Custom sections
    expect(isCareerProfileEqual(mockProfile, {
      ...mockProfile,
      customSections: [{ id: 'cs-1', title: 'Patents', content: 'Method A' }]
    })).toBe(false);

    // Metadata ignored (__v, updatedAt)
    expect(isCareerProfileEqual(mockProfile, {
      ...mockProfile,
      updatedAt: '2026-09-05T12:00:00Z',
      __v: 1
    })).toBe(true);
  });
});

describe('Career Profile Component UI Integration', () => {
  beforeEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('15. Autosave UI renders in CareerProfile, toggle button switches ON/OFF and persists preference', async () => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'Jane', preferences: { careerProfileAutosave: true } }));

    api.get.mockImplementation((url) => {
      if (url && url.includes('auth/me')) {
        return Promise.resolve({
          data: {
            success: true,
            user: { id: 'user-1', name: 'Jane', preferences: { careerProfileAutosave: true } }
          }
        });
      }
      return Promise.resolve({
        data: { success: true, profile: mockProfile }
      });
    });

    api.put.mockResolvedValue({
      data: { success: true, profile: mockProfile, preferences: { careerProfileAutosave: false } }
    });

    await act(async () => {
      render(
        <AuthProvider>
          <ToastProvider>
            <CareerProfile />
          </ToastProvider>
        </AuthProvider>
      );
    });

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /Toggle Career Profile Autosave/i })).toBeInTheDocument();
    });

    const toggleBtn = screen.getByRole('switch', { name: /Toggle Career Profile Autosave/i });
    expect(toggleBtn).toHaveAttribute('aria-checked', 'true'); // Defaults to ON

    // Click to toggle OFF
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(toggleBtn).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('OFF')).toBeInTheDocument();
    expect(localStorage.getItem('careerProfileAutosave')).toBe('false');

    // Click to toggle back ON
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(toggleBtn).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('ON')).toBeInTheDocument();
    expect(localStorage.getItem('careerProfileAutosave')).toBe('true');

    // Manual save button exists and is clickable
    const saveBtn = screen.getByRole('button', { name: /Save Profile/i });
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).not.toBeDisabled();
  });
});
