/**
 * @deprecated Use services from impl/ instead
 * This file is kept for backward compatibility during Phase 4 migration.
 * All new code should import from impl/
 */
import { verifyService as verifyServiceImpl } from "./impl";
import type { VerifyRunInput, VerifyResult, VerifyHistoryEntry } from "@/lib/domain";
import { unwrapOr } from "@/lib/domain";

// Legacy interface for backward compatibility
export interface IVerifyService {
  run(input: VerifyRunInput): Promise<VerifyResult>;
  history: {
    list(): Promise<VerifyHistoryEntry[]>;
    add(result: VerifyResult): Promise<void>;
    clear(): Promise<void>;
  };
}

export const verifyService: IVerifyService = {
  async run(input: VerifyRunInput): Promise<VerifyResult> {
    const result = await verifyServiceImpl.verifyByCode(input);
    if (result.ok) {
      return result.data;
    }
    throw new Error(result.error.message);
  },
  
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
      if (!saveResult.ok) {
        throw new Error(saveResult.error.message);
      }
    },
    
    async clear(): Promise<void> {
      const result = await verifyServiceImpl.clearVerifyHistory();
      if (!result.ok) {
        throw new Error(result.error.message);
      }
    },
  },
};
