import type { IActivityService } from "@relique/shared/domain";
import type { Result } from "@relique/shared/domain";
import { ok, err } from "@relique/shared/domain";
import {
  validationError,
  unknownError,
  quotaExceededError,
} from "@relique/shared/domain";
import type { ActivityEvent } from "@relique/shared/domain";
import { storage } from "@/lib/storage";
import { STORAGE_LIMITS } from "@relique/shared/domain";

function pruneLog(log: ActivityEvent[]): ActivityEvent[] {
  const limit = STORAGE_LIMITS.ACTIVITY_LOG;
  if (log.length <= limit) return log;
  return log.slice(-limit);
}

export const activityServiceLocal: IActivityService = {
  async track(event: Omit<ActivityEvent, "id" | "timestamp">): Promise<Result<void>> {
    try {
      const log = storage.admin.activityLog.get();
      const entry: ActivityEvent = {
        ...event,
        id: `activity-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      
      const updated = pruneLog([...log, entry]);
      storage.admin.activityLog.set(updated);
      
      return ok(undefined);
    } catch (error) {
      // Check if quota exceeded
      if (error instanceof Error && error.message.includes("quota")) {
        return err(quotaExceededError("Storage quota exceeded", STORAGE_LIMITS.ACTIVITY_LOG));
      }
      return err(unknownError("Failed to track activity", error));
    }
  },

  async list(): Promise<Result<ActivityEvent[]>> {
    try {
      const log = storage.admin.activityLog.get();
      return ok(log);
    } catch (error) {
      return err(unknownError("Failed to list activities", error));
    }
  },

  async clear(): Promise<Result<void>> {
    try {
      storage.admin.activityLog.set([]);
      return ok(undefined);
    } catch (error) {
      return err(unknownError("Failed to clear activities", error));
    }
  },
};

