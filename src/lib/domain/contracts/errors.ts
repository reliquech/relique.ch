/**
 * Service error types
 * All service errors follow this structure
 */

export type ServiceError =
  | ValidationError
  | NotFoundError
  | QuotaExceededError
  | RateLimitedError
  | UnknownError;

export interface ValidationError {
  type: "ValidationError";
  code: "VALIDATION_ERROR";
  message: string;
  details?: unknown;
  retryable: false;
}

export interface NotFoundError {
  type: "NotFoundError";
  code: "NOT_FOUND";
  message: string;
  resource?: string;
  retryable: false;
}

export interface QuotaExceededError {
  type: "QuotaExceededError";
  code: "QUOTA_EXCEEDED";
  message: string;
  limit?: number;
  retryable: false;
}

export interface RateLimitedError {
  type: "RateLimitedError";
  code: "RATE_LIMITED";
  message: string;
  retryAfter?: number;
  retryable: true;
}

export interface UnknownError {
  type: "UnknownError";
  code: "UNKNOWN_ERROR";
  message: string;
  originalError?: unknown;
  retryable: false;
}

/**
 * Error factory functions
 */
export function validationError(
  message: string,
  details?: unknown
): ValidationError {
  return {
    type: "ValidationError",
    code: "VALIDATION_ERROR",
    message,
    details,
    retryable: false,
  };
}

export function notFoundError(
  message: string,
  resource?: string
): NotFoundError {
  return {
    type: "NotFoundError",
    code: "NOT_FOUND",
    message,
    resource,
    retryable: false,
  };
}

export function quotaExceededError(
  message: string,
  limit?: number
): QuotaExceededError {
  return {
    type: "QuotaExceededError",
    code: "QUOTA_EXCEEDED",
    message,
    limit,
    retryable: false,
  };
}

export function rateLimitedError(
  message: string,
  retryAfter?: number
): RateLimitedError {
  return {
    type: "RateLimitedError",
    code: "RATE_LIMITED",
    message,
    retryAfter,
    retryable: true,
  };
}

export function unknownError(
  message: string,
  originalError?: unknown
): UnknownError {
  return {
    type: "UnknownError",
    code: "UNKNOWN_ERROR",
    message,
    originalError,
    retryable: false,
  };
}

