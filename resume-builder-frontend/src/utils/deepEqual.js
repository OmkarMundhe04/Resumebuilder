/**
 * Deep Equality & Normalization Utility for Career Profile Autosave
 * Compares two profile objects accurately without false positives.
 */

// Ignored metadata properties that should not trigger dirty state
const IGNORED_KEYS = new Set(['__v', 'createdAt', 'updatedAt', '_id', 'userId']);

/**
 * Normalizes primitive values so null, undefined, and empty strings don't cause false dirty flags.
 */
function normalizePrimitive(val) {
  if (val === undefined || val === null) return '';
  return val;
}

/**
 * Checks if a value is a plain JavaScript object.
 */
function isPlainObject(item) {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Canonical deep equality check for Career Profile structures.
 * Preserves array order (so item reordering is recognized as a change).
 * Ignores server-generated metadata fields (_id, updatedAt, __v, userId).
 */
export function isCareerProfileEqual(a, b) {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  // Handle primitives
  if (typeof a !== 'object' || typeof b !== 'object') {
    if (typeof a === 'string' || typeof b === 'string') {
      return normalizePrimitive(a) === normalizePrimitive(b);
    }
    return a === b;
  }

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isCareerProfileEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // If one is array and other isn't
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Handle Objects
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a).filter(k => !IGNORED_KEYS.has(k));
    const keysB = Object.keys(b).filter(k => !IGNORED_KEYS.has(k));

    const allKeys = new Set([...keysA, ...keysB]);

    for (const key of allKeys) {
      const valA = a[key];
      const valB = b[key];

      // If both are empty or undefined
      if ((valA === undefined || valA === null || valA === '') &&
          (valB === undefined || valB === null || valB === '')) {
        continue;
      }

      if (!isCareerProfileEqual(valA, valB)) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export default isCareerProfileEqual;
