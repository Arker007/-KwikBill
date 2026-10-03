export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'server-error') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Invalid request', code: string = 'bad-request') {
    super(message, 400, code);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found', code: string = 'not-found') {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict with existing resource', code: string = 'conflict') {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Refused', code: string = 'forbidden') {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', code: string = 'server-error') {
    super(message, 500, code);
    this.name = 'ServerError';
  }
}
