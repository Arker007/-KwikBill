/**
 * Base Application Error class for controlled HTTP error responses.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error description (for logging/internal use)
   * @param {number} [statusCode=500] - HTTP status code
   * @param {string} [code='server-error'] - Stable client-facing error code
   * @param {boolean} [isOperational=true] - Indicates trusted operational errors vs programmer bugs
   */
  constructor(message, statusCode = 500, code = 'server-error', isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request', code = 'bad-request') {
    super(message, 400, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found', code = 'not-found') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict with existing resource', code = 'conflict') {
    super(message, 409, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Refused', code = 'forbidden') {
    super(message, 403, code);
  }
}

export class InvalidPathError extends AppError {
  constructor(message = 'Invalid path', code = 'invalid-path') {
    super(message, 400, code);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Request body too large', code = 'payload-too-large') {
    super(message, 413, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', code = 'server-error') {
    super(message, 500, code);
  }
}
