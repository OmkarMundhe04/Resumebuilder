/**
 * Client Storage Service for Draft Persistence & Recent History Management
 * Provides safe localStorage operations with isolated namespaces and error boundaries.
 */

export const STORAGE_KEYS = {
  JOB_MATCH_DRAFT: 'resumeBuilder.jobMatchDraft',
  JOB_MATCH_HISTORY: 'resumeBuilder.jobMatchHistory',
  COVER_LETTER_DRAFT: 'resumeBuilder.coverLetterDraft',
  COVER_LETTER_HISTORY: 'resumeBuilder.coverLetterHistory'
};

const MAX_HISTORY_LIMIT = 5;

/**
 * Safely retrieves and parses a draft from localStorage.
 */
export function getDraft(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storageService] Failed to load draft for key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Safely persists a draft into localStorage.
 */
export function saveDraft(key, data) {
  try {
    if (data === null || data === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[storageService] Failed to save draft for key "${key}":`, err);
  }
}

/**
 * Explicitly removes a draft from localStorage.
 */
export function clearDraft(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storageService] Failed to clear draft for key "${key}":`, err);
  }
}

/**
 * Safely retrieves recent history items.
 */
export function getHistory(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY_LIMIT) : [];
  } catch (err) {
    console.warn(`[storageService] Failed to load history for key "${key}":`, err);
    return [];
  }
}

/**
 * Adds a new entry to the top of the history list, applies deduplication, and enforces max 5 items.
 * @param {string} key - Storage key
 * @param {object} newItem - History record to add
 * @param {function} dedupeFn - (existingItem, newItem) => boolean
 * @param {number} maxItems - Maximum items to keep (default: 5)
 */
export function addToHistory(key, newItem, dedupeFn, maxItems = MAX_HISTORY_LIMIT) {
  try {
    const current = getHistory(key);
    
    // Filter out duplicates if deduplication logic is supplied
    let filtered = current;
    if (typeof dedupeFn === 'function') {
      filtered = current.filter(item => !dedupeFn(item, newItem));
    } else {
      // Default dedupe by ID or role + company
      filtered = current.filter(item => item.id !== newItem.id);
    }

    // Add new item to the front and keep only the latest maxItems
    const updated = [newItem, ...filtered].slice(0, maxItems);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn(`[storageService] Failed to add to history for key "${key}":`, err);
    return [];
  }
}

/**
 * Removes a specific history item by ID.
 */
export function removeFromHistory(key, itemId) {
  try {
    const current = getHistory(key);
    const updated = current.filter(item => item.id !== itemId);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn(`[storageService] Failed to remove item from history for key "${key}":`, err);
    return [];
  }
}

/**
 * Clears all history for a specific key.
 */
export function clearHistory(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storageService] Failed to clear history for key "${key}":`, err);
  }
}
