import type { IMarketplaceService, MarketplaceListQuery, ListingPage, SavedSearch } from "@/lib/domain";
import type { Result } from "@/lib/domain";
import { ok, err } from "@/lib/domain";
import {
  validationError,
  notFoundError,
  unknownError,
} from "@/lib/domain";
import type { MarketplaceListing } from "@/lib/domain";
import { MarketplaceListingSchema } from "@/lib/domain";
import { marketplaceListings } from "@/lib/domain";
import {
  getMarketplaceFavorites,
  toggleMarketplaceFavorite,
  getSavedSearches,
  addSavedSearch,
  setSavedSearches,
} from "@/lib/domain";

function readSeed(): MarketplaceListing[] {
  return (marketplaceListings as MarketplaceListing[]).map((item) => {
    const validated = MarketplaceListingSchema.safeParse(item);
    if (validated.success) {
      return validated.data;
    }
    console.warn("Invalid marketplace item in seed:", item);
    return item as MarketplaceListing;
  });
}

function merge(seed: MarketplaceListing[], mutations: MarketplaceListing[]): MarketplaceListing[] {
  if (mutations.length === 0) {
    return seed;
  }
  
  const seedMap = new Map(seed.map((item) => [item.id, item]));
  mutations.forEach((mutated) => {
    seedMap.set(mutated.id, mutated);
  });
  
  return Array.from(seedMap.values());
}

function applySearch(items: MarketplaceListing[], q?: string): MarketplaceListing[] {
  if (!q) return items;
  
  const searchLower = q.toLowerCase();
  return items.filter(
    (item) =>
      item.listing.title.toLowerCase().includes(searchLower) ||
      item.listing.short.toLowerCase().includes(searchLower) ||
      item.signing.signers.join(" ").toLowerCase().includes(searchLower) ||
      item.listing.category.toLowerCase().includes(searchLower)
  );
}

function applyFilters(
  items: MarketplaceListing[],
  filters?: MarketplaceListQuery["filters"]
): MarketplaceListing[] {
  if (!filters) return items;
  
  let filtered = items;
  
  if (filters.category && filters.category.toLowerCase() !== "all") {
    filtered = filtered.filter((item) =>
      item.listing.category.toLowerCase().includes(filters.category!.toLowerCase())
    );
  }
  
  if (filters.sport) {
    filtered = filtered.filter((item) =>
      item.jersey.sport.toLowerCase().includes(filters.sport!.toLowerCase())
    );
  }
  
  if (filters.signedBy) {
    filtered = filtered.filter(
      (item) =>
        item.signing.signers.some((signer) => signer.toLowerCase() === filters.signedBy!.toLowerCase())
    );
  }
  
  if (filters.status) {
    filtered = filtered.filter((item) => item.auth.status === filters.status);
  }
  
  if (filters.coaIssuer) {
    filtered = filtered.filter(
      (item) =>
        item.auth.provider_id?.toLowerCase() === filters.coaIssuer!.toLowerCase()
    );
  }
  
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter((item) => item.listing.price.amount >= filters.priceMin!);
  }
  
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter((item) => item.listing.price.amount <= filters.priceMax!);
  }
  
  return filtered;
}

function applySort(items: MarketplaceListing[], sort?: string): MarketplaceListing[] {
  if (!sort) {
    return items.sort((a, b) => {
      const aDate = a.state.created_at ? new Date(a.state.created_at).getTime() : 0;
      const bDate = b.state.created_at ? new Date(b.state.created_at).getTime() : 0;
      return bDate - aDate;
    });
  }
  
  switch (sort) {
    case "newest":
      return items.sort((a, b) => {
        const aDate = a.state.created_at ? new Date(a.state.created_at).getTime() : 0;
        const bDate = b.state.created_at ? new Date(b.state.created_at).getTime() : 0;
        return bDate - aDate;
      });
    case "oldest":
      return items.sort((a, b) => {
        const aDate = a.state.created_at ? new Date(a.state.created_at).getTime() : 0;
        const bDate = b.state.created_at ? new Date(b.state.created_at).getTime() : 0;
        return aDate - bDate;
      });
    case "price-asc":
      return items.sort((a, b) => a.listing.price.amount - b.listing.price.amount);
    case "price-desc":
      return items.sort((a, b) => b.listing.price.amount - a.listing.price.amount);
    case "featured":
      return items;
    default:
      return items;
  }
}

function applyPagination<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number; page: number; limit: number; totalPages: number } {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);
  
  return {
    items: paginatedItems,
    total,
    page,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export const marketplaceServiceLocal: IMarketplaceService = {
  async listListings(query?: MarketplaceListQuery): Promise<Result<ListingPage>> {
    try {
      const seed = readSeed();
      const mutations: MarketplaceListing[] = []; // No storage mutations for now
      let items = merge(seed, mutations);
      
      // Apply query pipeline
      if (query?.q) {
        items = applySearch(items, query.q);
      }
      
      if (query?.filters) {
        items = applyFilters(items, query.filters);
      }
      
      if (query?.sort) {
        items = applySort(items, query.sort);
      } else {
        items = applySort(items, "newest");
      }
      
      // Pagination
      const page = query?.page ?? 1;
      const pageSize = query?.pageSize ?? 12;
      const paginated = applyPagination(items, page, pageSize);
      
      // Validate output
      const validatedItems = paginated.items.map((item) => {
        const validated = MarketplaceListingSchema.safeParse(item);
        if (validated.success) {
          return validated.data;
        }
        return item;
      });
      
      return ok({
        items: validatedItems,
        total: paginated.total,
        page: paginated.page,
        limit: paginated.limit,
        totalPages: paginated.totalPages,
      });
    } catch (error) {
      return err(unknownError("Failed to list marketplace listings", error));
    }
  },

  async getListingBySlug(slug: string): Promise<Result<MarketplaceListing>> {
    try {
      const seed = readSeed();
      const mutations: MarketplaceListing[] = [];
      const items = merge(seed, mutations);
      
      const item = items.find((item) => item.slug === slug);
      
      if (!item) {
        return err(notFoundError(`Listing not found: ${slug}`, "listing"));
      }
      
      const validated = MarketplaceListingSchema.safeParse(item);
      if (!validated.success) {
        return err(validationError("Invalid listing data", validated.error));
      }
      
      return ok(validated.data);
    } catch (error) {
      return err(unknownError("Failed to get listing", error));
    }
  },

  async toggleFavorite(listingId: string): Promise<Result<{ favorited: boolean }>> {
    try {
      toggleMarketplaceFavorite(listingId);
      const favorites = getMarketplaceFavorites();
      const favorited = favorites.includes(listingId);
      
      return ok({ favorited });
    } catch (error) {
      return err(unknownError("Failed to toggle favorite", error));
    }
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

  async saveSearch(search: Omit<SavedSearch, "id" | "createdAt">): Promise<Result<SavedSearch>> {
    try {
      const newSearch: SavedSearch = {
        ...search,
        id: `search-${Date.now()}`,
        createdAt: Date.now(),
      };
      addSavedSearch(newSearch);
      return ok(newSearch);
    } catch (error) {
      return err(unknownError("Failed to save search", error));
    }
  },

  async removeSearch(searchId: string): Promise<Result<void>> {
    try {
      const searches = getSavedSearches();
      const updated = searches.filter((s) => s.id !== searchId);
      setSavedSearches(updated);
      return ok(undefined);
    } catch (error) {
      return err(unknownError("Failed to remove search", error));
    }
  },
};
