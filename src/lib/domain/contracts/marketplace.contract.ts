import type { Result } from "./result";
import type { ServiceError } from "./errors";
import type {
  MarketplaceListing,
  MarketplaceFilters,
  SortOption,
} from "../types/marketplace";

/**
 * Marketplace Service Contract
 */

export interface MarketplaceListQuery {
  q?: string;
  filters?: MarketplaceFilters;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ListingPage {
  items: MarketplaceListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query?: string;
  filters?: MarketplaceFilters;
  createdAt: number;
}

export interface IMarketplaceService {
  /**
   * List marketplace listings with query
   */
  listListings(query?: MarketplaceListQuery): Promise<Result<ListingPage, ServiceError>>;

  /**
   * Get listing by slug
   */
  getListingBySlug(slug: string): Promise<Result<MarketplaceListing, ServiceError>>;

  /**
   * Toggle favorite status for a listing
   */
  toggleFavorite(listingId: string): Promise<Result<{ favorited: boolean }, ServiceError>>;

  /**
   * Get all favorite listing IDs
   */
  getFavorites(): Promise<Result<string[], ServiceError>>;

  /**
   * Get saved searches
   */
  getSavedSearches(): Promise<Result<SavedSearch[], ServiceError>>;

  /**
   * Save a search
   */
  saveSearch(search: Omit<SavedSearch, "id" | "createdAt">): Promise<Result<SavedSearch, ServiceError>>;

  /**
   * Remove a saved search
   */
  removeSearch(searchId: string): Promise<Result<void, ServiceError>>;
}

