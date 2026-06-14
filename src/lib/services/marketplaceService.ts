/**
 * Marketplace service - uses API routes to fetch from Supabase
 */
import { marketplaceAPIService } from "./api/marketplaceService";
import type {
  IMarketplaceService,
  MarketplaceListParams,
  MarketplaceListResponse,
} from "./contracts";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

export const marketplaceService: IMarketplaceService = {
  async list(params?: MarketplaceListParams): Promise<MarketplaceListResponse> {
    try {
      const response = await marketplaceAPIService.list(params);
      return {
        items: response.items,
        pageInfo: {
          data: response.items,
          total: response.total,
          page: response.page,
          limit: response.pageSize,
          totalPages: response.totalPages,
        },
      };
    } catch (error) {
      console.error("Failed to list marketplace items:", error);
      // Return empty result on error
      return {
        items: [],
        pageInfo: {
          data: [],
          total: 0,
          page: 1,
          limit: params?.pageSize || 100,
          totalPages: 0,
        },
      };
    }
  },

  async getBySlug(slug: string): Promise<MarketplaceListing | null> {
    try {
      return await marketplaceAPIService.getBySlug(slug);
    } catch (error) {
      console.error("Failed to get marketplace item:", error);
      return null;
    }
  },

  async toggleFavorite(id: string): Promise<string[]> {
    // Favorites are still stored in localStorage
    // This is client-side only functionality
    if (typeof window === "undefined") return [];
    
    try {
      const { getMarketplaceFavorites, toggleMarketplaceFavorite } = await import("@/lib/domain");
      toggleMarketplaceFavorite(id);
      return getMarketplaceFavorites();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      return [];
    }
  },

  async getFavorites(): Promise<string[]> {
    // Favorites are still stored in localStorage
    if (typeof window === "undefined") return [];
    
    try {
      const { getMarketplaceFavorites } = await import("@/lib/domain");
      return getMarketplaceFavorites();
    } catch (error) {
      console.error("Failed to get favorites:", error);
      return [];
    }
  },
};
