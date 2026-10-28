import { useState, useEffect, useRef, useCallback } from 'react';
import isCareerProfileEqual from '../utils/deepEqual';

/**
 * Production-Grade useAutosave Hook
 *
 * Provides:
 * - Debounced automatic saving (default 1500ms)
 * - Race condition protection via monotonically increasing request sequence IDs
 * - In-flight change preservation (new edits during saving are never lost or overwritten)
 * - Revert-to-saved detection (backspacing to saved state cancels pending save)
 * - Manual save prioritization (cancels pending debounces, updates baseline)
 * - Error handling with retry functionality
 * - Proper cleanup on component unmount to prevent leaks and state updates
 */
export function useAutosave({
  data,
  onSave,
  debounceMs = 1500,
  enabled = true,
  isEqual = isCareerProfileEqual,
  onSuccess,
  onError
}) {
  const [status, setStatus] = useState('saved'); // 'saved' | 'dirty' | 'saving' | 'error' | 'disabled'
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [error, setError] = useState(null);

  const statusRef = useRef(status);
  statusRef.current = status;

  // Mutable refs to prevent stale closures and avoid unnecessary re-renders
  const latestDataRef = useRef(data);
  latestDataRef.current = data;

  const lastSavedDataRef = useRef(null);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  const timerRef = useRef(null);
  const requestIdRef = useRef(0);
  const isSavingRef = useRef(false);
  const isMountedRef = useRef(true);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Clear pending debounce timer
  const cancelPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Core save executor with sequence protection
   */
  const executeSave = useCallback(async ({ isAutosave = false, force = false } = {}) => {
    cancelPendingTimer();

    const currentSnapshot = latestDataRef.current;
    if (!currentSnapshot) return null;

    // Check if data actually changed unless force is true
    if (!force && lastSavedDataRef.current && isEqual(currentSnapshot, lastSavedDataRef.current)) {
      if (isMountedRef.current) {
        setIsDirty(false);
        setStatus('saved');
      }
      return null;
    }

    const currentSeq = ++requestIdRef.current;
    isSavingRef.current = true;

    if (isMountedRef.current) {
      setStatus('saving');
      setError(null);
    }

    try {
      const result = await onSaveRef.current(currentSnapshot, { isAutosave, seq: currentSeq });

      // Guard: If unmounted or a newer request was dispatched, discard this response
      if (!isMountedRef.current || currentSeq !== requestIdRef.current) {
        return null;
      }

      isSavingRef.current = false;
      lastSavedDataRef.current = currentSnapshot;
      const now = new Date();
      setLastSavedAt(now);

      // Check if user continued editing while this request was in-flight
      const isStillIdentical = isEqual(latestDataRef.current, currentSnapshot);

      if (isStillIdentical) {
        setIsDirty(false);
        setStatus('saved');
      } else {
        // User typed new content while saving; keep dirty and schedule next save
        setIsDirty(true);
        setStatus('dirty');
        if (enabledRef.current) {
          timerRef.current = setTimeout(() => {
            executeSave({ isAutosave: true }).catch(() => {});
          }, debounceMs);
        }
      }

      if (onSuccessRef.current) {
        onSuccessRef.current(result, { isAutosave });
      }

      return result;
    } catch (err) {
      if (!isMountedRef.current || currentSeq !== requestIdRef.current) {
        return null;
      }

      isSavingRef.current = false;
      setIsDirty(true);
      setStatus('error');
      setError(err);

      if (onErrorRef.current) {
        onErrorRef.current(err, { isAutosave });
      }

      throw err;
    }
  }, [cancelPendingTimer, debounceMs, isEqual]);

  /**
   * Set or update baseline saved data (e.g. after initial API fetch)
   */
  const setSavedBaseline = useCallback((savedData) => {
    cancelPendingTimer();
    lastSavedDataRef.current = savedData;
    setIsDirty(false);
    setError(null);
    setStatus('saved');
  }, [cancelPendingTimer]);

  /**
   * Immediate manual save triggering
   */
  const saveImmediately = useCallback(async (opts = {}) => {
    return executeSave({ isAutosave: false, force: true, ...opts });
  }, [executeSave]);

  /**
   * Retry failed save
   */
  const retry = useCallback(() => {
    return executeSave({ isAutosave: false, force: true });
  }, [executeSave]);

  /**
   * Main Change Listener & Debounce Trigger
   */
  useEffect(() => {
    // If no initial baseline set yet, do not trigger autosave
    if (!lastSavedDataRef.current || !data) {
      return;
    }

    const changed = !isEqual(data, lastSavedDataRef.current);

    if (!changed) {
      // Reverted to original saved state
      cancelPendingTimer();
      setIsDirty(false);
      if (statusRef.current !== 'saving') {
        setStatus('saved');
        setError(null);
      }
      return;
    }

    // Meaningful changes exist
    setIsDirty(true);

    if (!enabled) {
      cancelPendingTimer();
      if (statusRef.current !== 'saving') {
        setStatus('disabled');
      }
      return;
    }

    // Autosave is enabled: schedule debounced save
    if (statusRef.current !== 'saving') {
      setStatus('dirty');
    }

    cancelPendingTimer();
    timerRef.current = setTimeout(() => {
      executeSave({ isAutosave: true }).catch(() => {});
    }, debounceMs);

    return () => {
      cancelPendingTimer();
    };
  }, [data, enabled, debounceMs, isEqual, cancelPendingTimer, executeSave]);

  /**
   * Handle enabled toggling
   */
  useEffect(() => {
    if (!enabled) {
      cancelPendingTimer();
      if (statusRef.current !== 'saving') {
        setStatus(isDirtyRef.current ? 'disabled' : 'saved');
      }
    } else if (isDirtyRef.current && statusRef.current !== 'saving') {
      // Toggled back to ON with dirty data -> schedule save
      cancelPendingTimer();
      setStatus('dirty');
      timerRef.current = setTimeout(() => {
        executeSave({ isAutosave: true }).catch(() => {});
      }, debounceMs);
    }
  }, [enabled, cancelPendingTimer, debounceMs, executeSave]);

  /**
   * Component Unmount Cleanup & Safe Flush
   */
  useEffect(() => {
    isMountedRef.current = true;

    // Optional beforeunload prompt only when dirty to prevent accidental tab closing
    const handleBeforeUnload = (e) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMountedRef.current = false;
      cancelPendingTimer();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cancelPendingTimer]);

  return {
    status,         // 'saved' | 'dirty' | 'saving' | 'error' | 'disabled'
    isDirty,
    lastSavedAt,
    error,
    saveImmediately,
    retry,
    setSavedBaseline,
    cancelPending: cancelPendingTimer
  };
}

export default useAutosave;
