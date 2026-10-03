/**
 * Express middleware that enforces path traversal protection across all requests.
 * Rejects any request containing path traversal sequences (e.g. '..', null bytes, or encoded variants) in URL or query params.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function paramSanitizer(req, res, next) {
  const rawUrl = req.url || '';
  let decodedUrl = '';
  try {
    decodedUrl = decodeURIComponent(rawUrl);
  } catch {
    decodedUrl = rawUrl;
  }

  // Check URL & decoded URL for path traversal sequences
  if (
    rawUrl.includes('..') ||
    decodedUrl.includes('..') ||
    rawUrl.includes('\0') ||
    decodedUrl.includes('\0')
  ) {
    return res.status(400).json({ error: 'Invalid path parameter', code: 'bad-request' });
  }

  // Check req.params for path traversal and absolute path injection
  if (req.params) {
    for (const val of Object.values(req.params)) {
      if (typeof val === 'string' && (val.includes('..') || val.includes('\0') || val.startsWith('/') || val.startsWith('\\') || /^[a-zA-Z]:/.test(val))) {
        return res.status(400).json({ error: 'Invalid path parameter', code: 'bad-request' });
      }
    }
  }

  // Check req.query for path traversal and absolute path injection
  if (req.query) {
    for (const val of Object.values(req.query)) {
      if (typeof val === 'string' && (val.includes('..') || val.includes('\0') || val.startsWith('/') || val.startsWith('\\') || /^[a-zA-Z]:/.test(val))) {
        return res.status(400).json({ error: 'Invalid query parameter', code: 'bad-request' });
      }
    }
  }

  // Check req.body ID/filename fields for path traversal and absolute path injection
  if (req.body && typeof req.body === 'object') {
    const idFields = ['id', 'file', 'filename', 'fname', 'path'];
    for (const field of idFields) {
      const val = req.body[field];
      if (typeof val === 'string' && (val.includes('..') || val.includes('\0') || val.startsWith('/') || val.startsWith('\\') || /^[a-zA-Z]:/.test(val))) {
        return res.status(400).json({ error: 'Invalid ID or path parameter', code: 'bad-request' });
      }
    }
  }

  next();
}
