import type { IVerifyService } from "@relique/shared/domain";
import type { Result } from "@relique/shared/domain";
import { ok, err } from "@relique/shared/domain";
import {
  notFoundError,
  unknownError,
} from "@relique/shared/domain";
import type {
  VerifyResult,
  VerifyHistoryEntry,
  VerifyRunInput,
} from "@relique/shared/domain";

async function fetchVerifyResult(code: string): Promise<Result<VerifyResult>> {
  try {
    const res = await fetch(
      `/api/public/verify?code=${encodeURIComponent(code)}`,
      { method: "GET" }
    );
    const json = (await res.json()) as { found?: boolean; result?: VerifyResult; error?: string };

    if (!res.ok) {
      return err(unknownError(json.error ?? "Verify request failed"));
    }
    if (!json.found || !json.result) {
      return err(notFoundError("Product not found", "marketplace_item"));
    }
    return ok(json.result);
  } catch (error) {
    return err(unknownError("Failed to verify product", error));
  }
}

export const verifyServiceSupabase: IVerifyService = {
  async verifyByCode(input: VerifyRunInput): Promise<Result<VerifyResult>> {
    return fetchVerifyResult(input.code);
  },

  async verifyByQr(input: VerifyRunInput): Promise<Result<VerifyResult>> {
    return fetchVerifyResult(input.code);
  },

  async getVerifyHistory(): Promise<Result<VerifyHistoryEntry[]>> {
    return ok([]);
  },

  async saveVerifyHistory(): Promise<Result<void>> {
    return ok(undefined);
  },

  async clearVerifyHistory(): Promise<Result<void>> {
    return ok(undefined);
  },
};
