import { STORAGE_KEYS, STORAGE_LIMITS } from "./keys";
import { getJson, setJson, getJsonWithSchema } from "./json";
import { pruneByLimit } from "./utils";
import { VerifyHistoryEntrySchema, type VerifyHistoryEntry } from "../schemas/verify";

/**
 * Typed storage helpers for Verify domain
 */

/**
 * Get verify history from localStorage (capped to limit)
 */
export function getVerifyHistory(): VerifyHistoryEntry[] {
  const history = getJsonWithSchema(STORAGE_KEYS.VERIFY_HISTORY, VerifyHistoryEntrySchema.array(), []);
  // Cap to limit (keep most recent)
  return pruneByLimit(history, STORAGE_LIMITS.VERIFY_HISTORY);
}

/**
 * Set verify history to localStorage (with cap)
 */
export function setVerifyHistory(history: VerifyHistoryEntry[]): void {
  const capped = pruneByLimit(history, STORAGE_LIMITS.VERIFY_HISTORY);
  setJson(STORAGE_KEYS.VERIFY_HISTORY, capped);
}

/**
 * Add a verify history entry (update if exists, append if new, with cap)
 */
export function addVerifyHistoryEntry(entry: VerifyHistoryEntry): void {
  const history = getVerifyHistory();
  const exists = history.some((h) => h.productId === entry.productId);
  if (exists) {
    const updated = history.map((h) =>
      h.productId === entry.productId ? entry : h
    );
    setVerifyHistory(updated);
  } else {
    setVerifyHistory([...history, entry]);
  }
}

/**
 * Clear verify history
 */
export function clearVerifyHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.VERIFY_HISTORY);
}

/**
 * Get last verify result
 */
export function getLastVerifyResult(): VerifyHistoryEntry | null {
  return getJson<VerifyHistoryEntry | null>(STORAGE_KEYS.VERIFY_LAST_RESULT, null);
}

/**
 * Set last verify result
 */
export function setLastVerifyResult(result: VerifyHistoryEntry | null): void {
  setJson(STORAGE_KEYS.VERIFY_LAST_RESULT, result);
}

/**
 * Get pinned verify items
 */
export function getVerifyPinned(): string[] {
  return getJson<string[]>(STORAGE_KEYS.VERIFY_PINNED, []);
}

/**
 * Set pinned verify items
 */
export function setVerifyPinned(pinnedIds: string[]): void {
  setJson(STORAGE_KEYS.VERIFY_PINNED, pinnedIds);
}

/**
 * Pin a verify item
 */
export function pinVerifyItem(productId: string): void {
  const pinned = getVerifyPinned();
  if (!pinned.includes(productId)) {
    setVerifyPinned([...pinned, productId]);
  }
}

/**
 * Unpin a verify item
 */
export function unpinVerifyItem(productId: string): void {
  const pinned = getVerifyPinned();
  setVerifyPinned(pinned.filter((id) => id !== productId));
}

