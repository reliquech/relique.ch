/**
 * @deprecated Use services from impl/ instead
 * This file is kept for backward compatibility during Phase 4 migration.
 */
import { activityService as activityServiceImpl } from "./impl";
import type { ActivityEvent } from "@relique/shared/domain";

export type ActivityType =
  | "verify_saved"
  | "draft_autosaved"
  | "draft_submitted_mock"
  | "favorite_added"
  | "collection_created"
  | "export_done"
  | "data_reset";

export interface ActivityLogEntry {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export const activityService = {
  log(type: ActivityType, message: string, metadata?: Record<string, unknown>): void {
    // Use new contract-based service
    activityServiceImpl.track({
      type,
      message,
      metadata,
    }).catch((error) => {
      console.error("Failed to track activity:", error);
    });
  },

  getLog(limit?: number): ActivityLogEntry[] {
    // For backward compatibility, return sync
    // Note: This is a sync wrapper - in future should be async
    // For now, return empty array (callers should migrate to async)
    console.warn("getLog() is deprecated, use activityServiceImpl.list() instead");
    return [];
  },

  clear(): void {
    activityServiceImpl.clear().catch((error) => {
      console.error("Failed to clear activities:", error);
    });
  },
};
