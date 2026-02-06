import type { MarketplaceItem } from "@/lib/types";

export interface MarketplaceListResponse {
  items: MarketplaceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MarketplaceListParams {
  status?: string;
  category?: string;
  is_featured?: boolean;
  page?: number;
  pageSize?: number;
}

class MarketplaceAPIService {
  private baseUrl = "/api/marketplace";

  private parseJson(value: any): any {
    if (!value) return null;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  }

  private toMarketplaceItem(item: any): MarketplaceItem {
    const listing = this.parseJson(item.listing) ?? {};
    const signing = this.parseJson(item.signing) ?? {};
    const state = this.parseJson(item.state) ?? {};
    const media = this.parseJson(item.media) ?? {};

    return {
      id: item.id,
      title: listing.title ?? "Untitled",
      athlete: signing.signers?.[0] ?? listing.category ?? "—",
      category: listing.category ?? "collector",
      status: (state.lifecycle ?? "draft") as MarketplaceItem["status"],
      is_featured: state.featured?.is ?? false,
      price_usd: listing.price?.amount ?? 0,
      updated_at: state.updated_at ?? item.updated_at ?? undefined,
      cover_image_url: media.hero_id ?? undefined,
      featured_order: state.featured?.order ?? null,
    };
  }

  async list(params?: MarketplaceListParams): Promise<MarketplaceListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.is_featured !== undefined) searchParams.set("is_featured", String(params.is_featured));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const url = `${this.baseUrl}?${searchParams.toString()}`;
    const response = await fetch(url);
    
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

    const data = await response.json();
    
    return {
      items: (data.items || []).map((item: any) => this.toMarketplaceItem(item)),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
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
}

export const marketplaceAPIService = new MarketplaceAPIService();
