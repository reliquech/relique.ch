/**
 * @deprecated Use services from impl/ instead
 * This file is kept for backward compatibility during Phase 4 migration.
 */
import { consignService as consignServiceImpl } from "./impl";
import type { ConsignDraft, ConsignSubmission, SubmissionStatus } from "@relique/shared/domain";

export const consignService = {
  drafts: {
    async list(): Promise<ConsignDraft[]> {
      const result = await consignServiceImpl.listDrafts();
      if (result.ok) {
        return result.data;
      }
      console.error("Failed to list drafts:", result.error);
      return [];
    },
    
    async get(id: string): Promise<ConsignDraft | null> {
      const result = await consignServiceImpl.getDraft(id);
      if (result.ok) {
        return result.data;
      }
      return null;
    },
    
    async remove(id: string): Promise<void> {
      // Portal is read-only, so this is a no-op
      console.warn("Remove draft not available in portal app");
    },
  },
  
  submissions: {
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
  },
};
