import type { Result } from "./result";
import type { ServiceError } from "./errors";
import type {
  ConsignDraft,
  ConsignSubmission,
  SubmissionStatus,
  ConsignFile,
} from "../types/consign";

/**
 * Consign Service Contract
 */

export interface IConsignService {
  /**
   * Create a new draft
   */
  createDraft(initial: Partial<ConsignDraft>): Promise<Result<ConsignDraft, ServiceError>>;

  /**
   * Update an existing draft
   */
  updateDraft(draftId: string, patch: Partial<ConsignDraft>): Promise<Result<ConsignDraft, ServiceError>>;

  /**
   * Get a draft by ID
   */
  getDraft(draftId: string): Promise<Result<ConsignDraft, ServiceError>>;

  /**
   * List all drafts
   */
  listDrafts(): Promise<Result<ConsignDraft[], ServiceError>>;

  /**
   * Delete a draft
   */
  deleteDraft(draftId: string): Promise<Result<void, ServiceError>>;

  /**
   * Add files to a draft (frontend-only: metadata only)
   */
  addDraftFiles(draftId: string, filesMeta: ConsignFile[]): Promise<Result<ConsignDraft, ServiceError>>;

  /**
   * Remove a file from a draft
   */
  removeDraftFile(draftId: string, fileId: string): Promise<Result<ConsignDraft, ServiceError>>;

  /**
   * Submit a draft (mock: creates submission)
   */
  submitDraft(draftId?: string): Promise<Result<{ submissionId: string; status: SubmissionStatus }, ServiceError>>;

  /**
   * List submissions (optionally filtered by status)
   */
  listSubmissions(status?: SubmissionStatus): Promise<Result<ConsignSubmission[], ServiceError>>;

  /**
   * Get a submission by ID
   */
  getSubmission(id: string): Promise<Result<ConsignSubmission, ServiceError>>;
}

