import type { IConsignService } from "@relique/shared/domain";
import type { Result } from "@relique/shared/domain";
import { ok, err } from "@relique/shared/domain";
import {
  notFoundError,
  unknownError,
} from "@relique/shared/domain";
import type {
  ConsignDraft,
  ConsignSubmission,
  SubmissionStatus,
} from "@relique/shared/domain";
import {
  getConsignDrafts,
  getConsignSubmissions,
} from "@relique/shared/domain";

/**
 * Portal consign service (read-only)
 */
export const consignServiceLocal: IConsignService = {
  async createDraft() {
    return err(notFoundError("Create draft not available in portal app", "draft"));
  },

  async updateDraft() {
    return err(notFoundError("Update draft not available in portal app", "draft"));
  },

  async getDraft(draftId: string): Promise<Result<ConsignDraft>> {
    try {
      const drafts = getConsignDrafts();
      const timestamp = parseInt(draftId, 10);
      const draft = drafts.find((d) => d.timestamp === timestamp);
      
      if (!draft) {
        return err(notFoundError(`Draft not found: ${draftId}`, "draft"));
      }
      
      return ok(draft);
    } catch (error) {
      return err(unknownError("Failed to get draft", error));
    }
  },

  async listDrafts(): Promise<Result<ConsignDraft[]>> {
    try {
      const drafts = getConsignDrafts();
      return ok(drafts);
    } catch (error) {
      return err(unknownError("Failed to list drafts", error));
    }
  },

  async deleteDraft() {
    return err(notFoundError("Delete draft not available in portal app", "draft"));
  },

  async addDraftFiles() {
    return err(notFoundError("Add files not available in portal app", "draft"));
  },

  async removeDraftFile() {
    return err(notFoundError("Remove file not available in portal app", "draft"));
  },

  async submitDraft() {
    return err(notFoundError("Submit draft not available in portal app", "draft"));
  },

  async listSubmissions(status?: SubmissionStatus): Promise<Result<ConsignSubmission[]>> {
    try {
      let submissions = getConsignSubmissions();
      
      if (status) {
        submissions = submissions.filter((s) => s.status === status);
      }
      
      const sorted = submissions.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      return ok(sorted);
    } catch (error) {
      return err(unknownError("Failed to list submissions", error));
    }
  },

  async getSubmission(id: string): Promise<Result<ConsignSubmission>> {
    try {
      const submissions = getConsignSubmissions();
      const submission = submissions.find((s) => s.id === id);
      
      if (!submission) {
        return err(notFoundError(`Submission not found: ${id}`, "submission"));
      }
      
      return ok(submission);
    } catch (error) {
      return err(unknownError("Failed to get submission", error));
    }
  },
};

