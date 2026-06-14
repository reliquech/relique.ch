import type { IConsignService } from "@relique/shared/domain";
import type { Result } from "@relique/shared/domain";
import { ok, err } from "@relique/shared/domain";
import {
  notFoundError,
  validationError,
  unknownError,
} from "@relique/shared/domain";
import type {
  ConsignDraft,
  ConsignSubmission,
  SubmissionStatus,
  ConsignFile,
} from "@relique/shared/domain";

const unsupported = validationError("Not supported in public consign flow");

export const consignServiceSupabase: IConsignService = {
  async createDraft(): Promise<Result<ConsignDraft>> {
    return err(unsupported);
  },
  async updateDraft(): Promise<Result<ConsignDraft>> {
    return err(unsupported);
  },
  async getDraft(): Promise<Result<ConsignDraft>> {
    return err(notFoundError("Draft not found", "consign_draft"));
  },
  async listDrafts(): Promise<Result<ConsignDraft[]>> {
    return ok([]);
  },
  async deleteDraft(): Promise<Result<void>> {
    return err(unsupported);
  },
  async addDraftFiles(): Promise<Result<ConsignDraft>> {
    return err(unsupported);
  },
  async removeDraftFile(): Promise<Result<ConsignDraft>> {
    return err(unsupported);
  },
  async submitDraft(): Promise<Result<{ submissionId: string; status: SubmissionStatus }>> {
    return err(unsupported);
  },
  async listSubmissions(): Promise<Result<ConsignSubmission[]>> {
    return ok([]);
  },
  async getSubmission(): Promise<Result<ConsignSubmission>> {
    return err(notFoundError("Submission not found", "consign_submission"));
  },
};

export async function submitPublicConsign(
  formData: FormData
): Promise<{ id: string; status: string }> {
  const res = await fetch("/api/public/consign", {
    method: "POST",
    body: formData,
  });
  const json = (await res.json()) as { id?: string; status?: string; error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? "Failed to submit consignment");
  }
  if (!json.id) {
    throw new Error("Invalid consign response");
  }
  return { id: json.id, status: json.status ?? "submitted" };
}
