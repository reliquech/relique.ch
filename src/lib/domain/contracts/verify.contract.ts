import type { Result } from "./result";
import type { ServiceError } from "./errors";
import type {
  VerifyResult,
  VerifyHistoryEntry,
  VerifyRunInput,
} from "../types/verify";

/**
 * Verify Service Contract
 * Defines WHAT the service does, not HOW
 */

export interface IVerifyService {
  /**
   * Verify by product code
   */
  verifyByCode(input: VerifyRunInput): Promise<Result<VerifyResult, ServiceError>>;

  /**
   * Verify by QR code (mock: alias for verifyByCode)
   */
  verifyByQr(input: VerifyRunInput): Promise<Result<VerifyResult, ServiceError>>;

  /**
   * Get verify history
   */
  getVerifyHistory(): Promise<Result<VerifyHistoryEntry[], ServiceError>>;

  /**
   * Save verify result to history
   */
  saveVerifyHistory(item: VerifyHistoryEntry): Promise<Result<void, ServiceError>>;

  /**
   * Clear verify history
   */
  clearVerifyHistory(): Promise<Result<void, ServiceError>>;
}

