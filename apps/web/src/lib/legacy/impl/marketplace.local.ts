import type { IMarketplaceService } from "@relique/shared/domain";
import type { Result } from "@relique/shared/domain";
import { ok, err } from "@relique/shared/domain";
import { unknownError } from "@relique/shared/domain";
import { getMarketplaceFavorites } from "@relique/shared/domain";
import type { SavedSearch } from "@relique/shared/domain";
import { getSavedSearches } from "@relique/shared/domain";

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

