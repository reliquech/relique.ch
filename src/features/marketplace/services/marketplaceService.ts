import type { MarketplaceItem } from "@/lib/types/admin";
import type {
  MarketplaceItemsOrder,
  MarketplaceItemsSort,
  MarketplaceStatusCounts,
} from "@/features/marketplace/types/itemsList";

type JsonRecord = Record<string, unknown>;

interface MarketplaceApiRow {
  id: string;
  slug?: string | null;
  listing?: unknown;
  signing?: unknown;
  state?: unknown;
  media?: unknown;
  updated_at?: string | null;
  featured_is?: boolean | null;
  featured_order?: number | null;
}

export interface MarketplaceListResponse {
  items: MarketplaceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts?: MarketplaceStatusCounts;
}

export interface MarketplaceListParams {
  status?: string;
  category?: string;
  is_featured?: boolean;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: MarketplaceItemsSort | "created_at";
  order?: MarketplaceItemsOrder;
  price_min?: number;
  price_max?: number;
  athlete?: string;
  signal?: AbortSignal;
}

export type MarketplaceBulkAction = "publish" | "archive" | "restore" | "delete";

export interface MarketplaceBulkResult {
  updated: number;
  failed: Array<{ id: string; error: string }>;
  total: number;
}

class MarketplaceAPIService {
  private baseUrl = "/api/marketplace";

  private parseJson(value: unknown): JsonRecord {
    if (!value) return {};
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value) as unknown;
        return parsed && typeof parsed === "object" ? (parsed as JsonRecord) : {};
      } catch {
        return {};
      }
    }
    return typeof value === "object" ? (value as JsonRecord) : {};
  }

  private toMarketplaceItem(item: MarketplaceApiRow): MarketplaceItem {
    const listing = this.parseJson(item.listing) ?? {};
    const signing = this.parseJson(item.signing) ?? {};
    const state = this.parseJson(item.state) ?? {};
    const media = this.parseJson(item.media) ?? {};
    const signers = Array.isArray(signing.signers) ? signing.signers : [];
    const featured =
      state.featured && typeof state.featured === "object"
        ? (state.featured as JsonRecord)
        : {};
    const rowFeatured = item.featured_is === true;
    const price =
      listing.price && typeof listing.price === "object"
        ? (listing.price as JsonRecord)
        : {};

    return {
      id: item.id,
      slug: item.slug ?? undefined,
      title: typeof listing.title === "string" ? listing.title : "Untitled",
      athlete:
        typeof signers[0] === "string"
          ? signers[0]
          : typeof listing.category === "string"
            ? listing.category
            : "—",
      category: typeof listing.category === "string" ? listing.category : "collector",
      status: (state.lifecycle ?? "draft") as MarketplaceItem["status"],
      is_featured: featured.is === true || rowFeatured,
      price_usd: typeof price.amount === "number" ? price.amount : 0,
      updated_at:
        typeof state.updated_at === "string"
          ? state.updated_at
          : item.updated_at ?? undefined,
      cover_image_url: typeof media.hero_id === "string" ? media.hero_id : undefined,
      featured_order:
        typeof featured.order === "number"
          ? featured.order
          : typeof item.featured_order === "number"
            ? item.featured_order
            : null,
    };
  }

  async list(params?: MarketplaceListParams): Promise<MarketplaceListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.is_featured !== undefined) searchParams.set("is_featured", String(params.is_featured));
    if (params?.featured !== undefined) searchParams.set("featured", String(params.featured));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.q) searchParams.set("q", params.q);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.order) searchParams.set("order", params.order);
    if (params?.price_min !== undefined) searchParams.set("price_min", String(params.price_min));
    if (params?.price_max !== undefined) searchParams.set("price_max", String(params.price_max));
    if (params?.athlete) searchParams.set("athlete", params.athlete);

    const url = `${this.baseUrl}?${searchParams.toString()}`;
    const response = await fetch(url, { signal: params?.signal });
    
    if (!response.ok) {
      // Try to parse error message from response body
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
        }
      } catch {
        // If parsing fails, use statusText
      }
      
      throw new Error(`Failed to fetch marketplace items: ${errorMessage}`);
    }

    const data = (await response.json()) as MarketplaceListResponse & {
      items?: MarketplaceApiRow[];
    };
    
    return {
      items: (data.items || []).map((item) => this.toMarketplaceItem(item)),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      counts: data.counts,
    };
  }

  async getById(id: string): Promise<MarketplaceItem | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch marketplace item: ${response.statusText}`);
    }

    const item = await response.json();
    return this.toMarketplaceItem(item);
  }

  async getRawById(id: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch marketplace item: ${response.statusText}`);
    }

    return await response.json();
  }

  async create(item: Omit<MarketplaceItem, "id" | "updated_at">): Promise<MarketplaceItem> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: item.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        title: item.title,
        description: item.title, // Use title as description for now
        price_usd: item.price_usd,
        image: item.cover_image_url || "",
        category: item.category,
        status: item.status,
        is_featured: item.is_featured,
        featured_order: item.featured_order,
        signed_by: item.athlete,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create marketplace item");
    }

    const data = await response.json();
    return this.toMarketplaceItem(data);
  }

  async update(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem> {
    const requestBody = {
      title: updates.title,
      price_usd: updates.price_usd,
      category: updates.category,
      status: updates.status,
      is_featured: updates.is_featured,
      featured_order: updates.featured_order,
      signed_by: updates.athlete,
      image: updates.cover_image_url,
    };

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Try to parse error message from response body
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
        }
      } catch {
        // If parsing fails, use statusText
      }
      
      throw new Error(`Failed to update marketplace item: ${errorMessage}`);
    }

    const data = await response.json();
    return this.toMarketplaceItem(data);
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete marketplace item");
    }
  }

  async updateStatus(id: string, status: MarketplaceItem["status"]): Promise<MarketplaceItem> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update status");
    }

    const data = await response.json();
    return this.toMarketplaceItem(data);
  }

  async bulk(ids: string[], action: MarketplaceBulkAction): Promise<MarketplaceBulkResult> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Bulk action failed");
    }

    return response.json();
  }

  async duplicate(id: string): Promise<MarketplaceItem> {
    const response = await fetch(`${this.baseUrl}/${id}/duplicate`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to duplicate item");
    }

    const data = await response.json();
    return this.toMarketplaceItem(data);
  }
}

export const marketplaceAPIService = new MarketplaceAPIService();
