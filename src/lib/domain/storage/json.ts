import type { z } from "zod";

/**
 * Generic JSON storage helpers with safe parsing
 */

/**
 * Get JSON value from localStorage with fallback
 */
export function getJson<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch {
    // Invalid JSON, return default
  }
  return defaultValue;
}

/**
 * Set JSON value to localStorage
 */
export function setJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
  }
}

/**
 * Get JSON value with Zod schema validation
 */
export function getJsonWithSchema<T>(
  key: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      const result = schema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      console.warn(`Invalid data format for key "${key}", using default`);
    }
  } catch {
    // Invalid JSON or parse error
  }
  return defaultValue;
}

/**
 * Set JSON value with Zod schema validation
 */
export function setJsonWithSchema<T>(key: string, value: T, schema: z.ZodSchema<T>): void {
  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(`Invalid data format for key "${key}":`, result.error);
    return;
  }
  setJson(key, result.data);
}

/**
 * Remove item from localStorage
 */
export function removeJson(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

