import type { IMarketplaceService } from "@/lib/domain";
import type { Result } from "@/lib/domain";
import { ok, err } from "@/lib/domain";
import { unknownError } from "@/lib/domain";
import { getMarketplaceFavorites } from "@/lib/domain";
import type { SavedSearch } from "@/lib/domain";
import { getSavedSearches } from "@/lib/domain";

/**
 * Portal marketplace service (read-only for favorites)
 */
export const marketplaceServiceLocal: IMarketplaceService = {
  async listListings() {
    return err(unknownError("List listings not available in portal app"));
  },

  async getListingBySlug() {
    return err(unknownError("Get listing not available in portal app"));
  },

  async toggleFavorite() {
    return err(unknownError("Toggle favorite not available in portal app"));
  },

  async getFavorites(): Promise<Result<string[]>> {
    try {
      const favorites = getMarketplaceFavorites();
      return ok(favorites);
    } catch (error) {
      return err(unknownError("Failed to get favorites", error));
    }
  },

  async getSavedSearches(): Promise<Result<SavedSearch[]>> {
    try {
      const searches = getSavedSearches();
      return ok(searches);
    } catch (error) {
      return err(unknownError("Failed to get saved searches", error));
    }
  },

  async saveSearch() {
    return err(unknownError("Save search not available in portal app"));
  },

  async removeSearch() {
    return err(unknownError("Remove search not available in portal app"));
  },
};

