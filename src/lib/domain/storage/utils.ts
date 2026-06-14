import type { z } from "zod";

/**
 * Cap array to max length (keep most recent items)
 */
export function capArray<T>(items: T[], maxLength: number): T[] {
  if (items.length <= maxLength) return items;
  return items.slice(-maxLength);
}

/**
 * Prune array by limit (LRU - keep most recent)
 */
export function pruneByLimit<T>(items: T[], limit: number): T[] {
  return capArray(items, limit);
}

/**
 * Safe parse with schema validation and fallback
 */
export function safeParseWithSchema<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  defaultValue: T
): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn("Invalid data format, using default:", result.error);
  return defaultValue;
}

/**
 * Estimate storage size (rough estimate in bytes)
 */
export function estimateStorageSize(key: string, value: unknown): number {
  try {
    const serialized = JSON.stringify(value);
    // Rough estimate: key length + value length + overhead
    return key.length + serialized.length + 50; // 50 bytes overhead
  } catch {
    return 0;
  }
}

/**
 * Get total estimated storage size for all keys
 */
export function estimateTotalStorageSize(keys: string[]): number {
  if (typeof window === "undefined") return 0;
  
  let total = 0;
  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        total += key.length + value.length + 50;
      }
    } catch {
      // Ignore errors
    }
  }
  return total;
}

