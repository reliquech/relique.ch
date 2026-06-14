/**
 * @deprecated Use services from impl/ instead
 * This file is kept for backward compatibility during Phase 4 migration.
 */
import { verifyService as verifyServiceImpl } from "./impl";
import { activityService } from "./activityService";
import type { VerifyHistoryEntry, VerifyResult } from "@relique/shared/domain";

export const verifyService = {
  history: {
    async list(): Promise<VerifyHistoryEntry[]> {
      const result = await verifyServiceImpl.getVerifyHistory();
      if (result.ok) {
        return result.data;
      }
      console.error("Failed to get verify history:", result.error);
      return [];
    },
    
    async add(result: VerifyResult): Promise<void> {
      const entry: VerifyHistoryEntry = {
        productId: result.productId,
        result: result.status,
        timestamp: new Date(result.date).getTime(),
      };
      
      const saveResult = await verifyServiceImpl.saveVerifyHistory(entry);
      if (saveResult.ok) {
        // Track activity (using legacy activityService for now)
        activityService.log("verify_saved", `Verified ${result.productId} - ${result.status}`, {
          productId: result.productId,
          status: result.status,
        });
      } else {
        console.error("Failed to save verify history:", saveResult.error);
      }
    },
    
    async clear(): Promise<void> {
      const result = await verifyServiceImpl.clearVerifyHistory();
      if (!result.ok) {
        console.error("Failed to clear verify history:", result.error);
      }
    },
  },
};
