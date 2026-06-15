import { parseFetchError } from "@/lib/api/errorMessage";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

export interface MarketplaceListResponse {
  items: MarketplaceListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MarketplaceListParams {
  filters?: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
  };
  sort?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}

class MarketplaceAPIService {
  private baseUrl = "/api/marketplace";

  async list(params?: MarketplaceListParams): Promise<MarketplaceListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("scope", "public");
    if (params?.filters?.category) {
      searchParams.set("category", params.filters.category);
    }
    if (params?.filters?.priceMin !== undefined && params?.filters?.priceMin !== null) {
      searchParams.set("price_min", String(params.filters.priceMin));
    }
    if (params?.filters?.priceMax !== undefined && params?.filters?.priceMax !== null) {
      searchParams.set("price_max", String(params.filters.priceMax));
    }
    if (params?.q) {
      searchParams.set("q", params.q);
    }
    if (params?.sort) {
      searchParams.set("sort", params.sort);
    }
    if (params?.page) {
      searchParams.set("page", String(params.page));
    }
    if (params?.pageSize) {
      searchParams.set("pageSize", String(params.pageSize));
    }

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) {
      await parseFetchError(response, "Failed to fetch marketplace items");
    }

    const data = await response.json();
    return data;
  }

  async getBySlug(slug: string): Promise<MarketplaceListing | null> {
    const response = await fetch(`${this.baseUrl}/${slug}?scope=public`);
    if (!response.ok) {
      if (response.status === 404) return null;
      await parseFetchError(response, "Failed to fetch marketplace item");
    }

    return await response.json();
  }
}

export const marketplaceAPIService = new MarketplaceAPIService();