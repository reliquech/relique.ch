/**
 * @deprecated Use services from impl/ instead
 * This file is kept for backward compatibility during Phase 4 migration.
 */
import { marketplaceService as marketplaceServiceImpl } from "./impl";

export const marketplaceService = {
  async getFavorites(): Promise<string[]> {
    const result = await marketplaceServiceImpl.getFavorites();
    if (result.ok) {
      return result.data;
    }
    console.error("Failed to get favorites:", result.error);
    return [];
  },
};
