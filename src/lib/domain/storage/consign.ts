import { STORAGE_KEYS, STORAGE_LIMITS } from "./keys";
import { getJson, setJson } from "./json";
import { pruneByLimit } from "./utils";
import type { ConsignDraft, ConsignSubmission } from "../schemas/consign";

/**
 * Typed storage helpers for Consign domain
 */

export function getConsignDrafts(): ConsignDraft[] {
  return getJson<ConsignDraft[]>(STORAGE_KEYS.CONSIGN_DRAFTS, []);
}

export function setConsignDrafts(drafts: ConsignDraft[]): void {
  // Cap to limit (LRU - keep most recent)
  const capped = pruneByLimit(drafts, STORAGE_LIMITS.CONSIGN_DRAFTS);
  setJson(STORAGE_KEYS.CONSIGN_DRAFTS, capped);
}

export function addConsignDraft(draft: ConsignDraft): void {
  const drafts = getConsignDrafts();
  // Remove existing draft with same timestamp if exists
  const filtered = drafts.filter((d) => d.timestamp !== draft.timestamp);
  setConsignDrafts([...filtered, draft]);
}

export function removeConsignDraft(timestamp: number): void {
  const drafts = getConsignDrafts();
  setConsignDrafts(drafts.filter((d) => d.timestamp !== timestamp));
}

export function getLastDraftId(): string | null {
  return getJson<string | null>(STORAGE_KEYS.CONSIGN_LAST_DRAFT_ID, null);
}

export function setLastDraftId(id: string | null): void {
  setJson(STORAGE_KEYS.CONSIGN_LAST_DRAFT_ID, id);
}

export function getConsignSubmissions(): ConsignSubmission[] {
  return getJson<ConsignSubmission[]>(STORAGE_KEYS.CONSIGN_SUBMISSIONS, []);
}

export function setConsignSubmissions(submissions: ConsignSubmission[]): void {
  setJson(STORAGE_KEYS.CONSIGN_SUBMISSIONS, submissions);
}

export function addConsignSubmission(submission: ConsignSubmission): void {
  const submissions = getConsignSubmissions();
  setConsignSubmissions([...submissions, submission]);
}

