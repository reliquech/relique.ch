/**
 * Result type for service methods
 * Discriminated union: Ok<T> | Err<E>
 * 
 * UI always handles one output type (no try/catch needed)
 */

import type { ServiceError } from "./errors";

export type Result<T, E = ServiceError> = Ok<T> | Err<E>;

export type Ok<T> = {
  ok: true;
  data: T;
};

export type Err<E> = {
  ok: false;
  error: E;
};

/**
 * Helper functions to create Result
 */
export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Check if result is ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

/**
 * Check if result is error
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

/**
 * Unwrap result (throws if error - use with caution)
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwrap result with default value
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.ok) {
    return result.data;
  }
  return defaultValue;
}

