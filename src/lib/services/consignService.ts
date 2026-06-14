/**
 * @deprecated Use services from impl/ instead
 * This file is kept for backward compatibility during Phase 4 migration.
 */
import { consignService as consignServiceImpl } from "./impl";
import type { IConsignService } from "./contracts";
import type { ConsignDraft, ConsignSubmission, SubmissionStatus } from "@/lib/domain";

export const consignService: IConsignService = {
  drafts: {
    async list(): Promise<ConsignDraft[]> {
      const result = await consignServiceImpl.listDrafts();
      if (result.ok) {
        return result.data;
      }
      console.error("Failed to list drafts:", result.error);
      return [];
    },
    
    async save(draftData: Partial<ConsignDraft>): Promise<ConsignDraft> {
      // Try to update existing draft first
      const draftsResult = await consignServiceImpl.listDrafts();
      if (draftsResult.ok && draftsResult.data.length > 0) {
        const latest = draftsResult.data[draftsResult.data.length - 1];
        if (!latest) {
          const createResult = await consignServiceImpl.createDraft(draftData);
          if (createResult.ok) return createResult.data;
          throw new Error("Failed to create draft");
        }
        const updateResult = await consignServiceImpl.updateDraft(String(latest.timestamp), draftData);
        if (updateResult.ok) {
          return updateResult.data;
        }
      }
      
      // Create new draft
      const createResult = await consignServiceImpl.createDraft(draftData);
      if (createResult.ok) {
        return createResult.data;
      }
      
      throw new Error(createResult.error.message);
    },
    
    async remove(id: string): Promise<void> {
      const result = await consignServiceImpl.deleteDraft(id);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
    },
    
    async get(id: string): Promise<ConsignDraft | null> {
      const result = await consignServiceImpl.getDraft(id);
      if (result.ok) {
        return result.data;
      }
      return null;
    },
  },
  
  async submitMock(draftId?: string) {
    const result = await consignServiceImpl.submitDraft(draftId);
    if (result.ok) {
      return result.data;
    }
    throw new Error(result.error.message);
  },
  
  async list(status?: SubmissionStatus): Promise<ConsignSubmission[]> {
    const result = await consignServiceImpl.listSubmissions(status);
    if (result.ok) {
      return result.data;
    }
    console.error("Failed to list submissions:", result.error);
    return [];
  },
  
  async get(id: string): Promise<ConsignSubmission | null> {
    const result = await consignServiceImpl.getSubmission(id);
    if (result.ok) {
      return result.data;
    }
    return null;
  },
};
