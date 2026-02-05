import type { IVerifyService } from "@relique/shared/domain";
import type { Result } from "@relique/shared/domain";
import { ok, err } from "@relique/shared/domain";
import {
  validationError,
  unknownError,
} from "@relique/shared/domain";
import type {
  VerifyHistoryEntry,
} from "@relique/shared/domain";
import {
  VerifyHistoryEntrySchema,
} from "@relique/shared/domain";
import {
  getVerifyHistory,
  addVerifyHistoryEntry,
  clearVerifyHistory,
} from "@relique/shared/domain";

/**
 * Portal verify service (read-only for history)
 * Uses same storage keys as web app for sync
 */
export const verifyServiceLocal: IVerifyService = {
  async verifyByCode() {
    // Portal doesn't perform verification, only reads history
    return err(validationError("Verify not available in portal app"));
  },

  async verifyByQr() {
    return err(validationError("Verify not available in portal app"));
  },

  async getVerifyHistory(): Promise<Result<VerifyHistoryEntry[]>> {
    try {
      const history = getVerifyHistory();
      const validated = history
        .map((entry) => {
          const result = VerifyHistoryEntrySchema.safeParse(entry);
          if (result.success) {
            return result.data;
          }
          return null;
        })
        .filter((entry): entry is VerifyHistoryEntry => entry !== null);
      
      return ok(validated);
    } catch (error) {
      return err(unknownError("Failed to get verify history", error));
    }
  },

  async saveVerifyHistory(item: VerifyHistoryEntry): Promise<Result<void>> {
    try {
      const validation = VerifyHistoryEntrySchema.safeParse(item);
      if (!validation.success) {
        return err(validationError("Invalid verify history entry", validation.error));
      }

      addVerifyHistoryEntry(validation.data);
      return ok(undefined);
    } catch (error) {
      return err(unknownError("Failed to save verify history", error));
    }
  },

  async clearVerifyHistory(): Promise<Result<void>> {
    try {
      clearVerifyHistory();
      return ok(undefined);
    } catch (error) {
      return err(unknownError("Failed to clear verify history", error));
    }
  },
};

