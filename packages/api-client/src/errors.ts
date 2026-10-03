/**
 * Standardized ApiError classes for the application HTTP client.
 */

export class ApiError extends Error {
  status: number;
  code?: string;
  body?: any;

  constructor(message: string, status: number = 500, code?: string, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0, 'ERR_NETWORK');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timed out') {
    super(message, 408, 'ERR_TIMEOUT');
    this.name = 'TimeoutError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', body?: any) {
    super(message, 404, 'ERR_NOT_FOUND', body);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict occurred', body?: any) {
    super(message, 409, 'ERR_CONFLICT', body);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation error', body?: any) {
    super(message, 400, 'ERR_VALIDATION', body);
    this.name = 'ValidationError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error', status: number = 500, body?: any) {
    super(message, status, 'ERR_SERVER', body);
    this.name = 'ServerError';
  }
}
