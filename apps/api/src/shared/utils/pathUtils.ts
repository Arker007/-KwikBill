import path from 'path';

/**
 * Strips disallowed characters (/ \ : * ? " < > |) from an ID to form a safe filename base.
 */
export function safeFileName(id: string | number): string {
  return String(id).replace(/[/\\:*?"<>|]/g, '_');
}

/**
 * Path-traversal-safe user-string -> single path segment.
 * Strips path separators, drive letters, and every `..` occurrence (including URL-encoded variants).
 * Never returns an empty string; falls back to a sentinel.
 */
export function safePathSegment(input: string | number | null | undefined, fallback: string = 'Untitled'): string {
  if (input === undefined || input === null) return fallback;
  let s: string;
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
 */
export function isPathInside(resolved: string, root: string): boolean {
  const r = path.resolve(root);
  const p = path.resolve(resolved);
  return p === r || p.startsWith(r + path.sep);
}

/**
 * Sanitizes an ID string ensuring it cannot contain path traversal patterns.
 */
export function sanitizeId(id: string | number | null | undefined): string {
  if (id === undefined || id === null) return '';
  return safeFileName(String(id).trim()).replace(/\.{2,}/g, '');
}
