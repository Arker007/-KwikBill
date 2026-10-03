import path from 'path';

/**
 * Strips disallowed characters (/ \ : * ? " < > |) from an ID to form a safe filename base.
 * @param {string|number} id
 * @returns {string}
 */
export function safeFileName(id) {
  return String(id).replace(/[/\\:*?"<>|]/g, '_');
}

/**
 * Path-traversal-safe user-string -> single path segment.
 * Strips path separators, drive letters, and every `..` occurrence (including URL-encoded variants).
 * Never returns an empty string; falls back to a sentinel.
 * @param {string} input
 * @param {string} [fallback='Untitled']
 * @returns {string}
 */
export function safePathSegment(input, fallback = 'Untitled') {
  if (input === undefined || input === null) return fallback;
  let s;
  try {
    s = decodeURIComponent(String(input));
  } catch {
    s = String(input);
  }
  s = s.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-'); // reserved / control chars
  s = s.replace(/\.{2,}/g, '-'); // squash .. and ...
  s = s.replace(/^[.\s]+|[.\s]+$/g, ''); // trim leading/trailing dots and spaces
  s = s.slice(0, 120); // cap length
  return s || fallback;
}

/**
 * Enforces that `resolved` lives strictly inside `root`.
 * Returns true if inside, false otherwise.
 * @param {string} resolved
 * @param {string} root
 * @returns {boolean}
 */
export function isPathInside(resolved, root) {
  const r = path.resolve(root);
  const p = path.resolve(resolved);
  return p === r || p.startsWith(r + path.sep);
}

/**
 * Sanitizes an ID string ensuring it cannot contain path traversal patterns.
 * @param {string|number} id
 * @returns {string}
 */
export function sanitizeId(id) {
  if (id === undefined || id === null) return '';
  return safeFileName(String(id).trim()).replace(/\.{2,}/g, '');
}
