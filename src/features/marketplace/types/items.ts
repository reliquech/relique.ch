import type { MarketplaceStatus } from "@/lib/types/admin";

export type MarketplaceItemsSortField = "updated_at" | "title" | "price_usd";
export type MarketplaceItemsSortOrder = "asc" | "desc";
export type MarketplaceItemsDensity = "comfortable" | "compact";
export type MarketplaceStatusTab = "all" | MarketplaceStatus;

export interface MarketplaceItemsUrlState {
  q: string;
  status: string;
  featured: "" | "true" | "false";
  athlete: string;
  priceMin: string;
  priceMax: string;
  sort: MarketplaceItemsSortField;
  order: MarketplaceItemsSortOrder;
  page: number;
  pageSize: number;
  density: MarketplaceItemsDensity;
}

export const DEFAULT_MARKETPLACE_ITEMS_URL: MarketplaceItemsUrlState = {
  q: "",
  status: "",
  featured: "",
  athlete: "",
  priceMin: "",
  priceMax: "",
  sort: "updated_at",
  order: "desc",
  page: 1,
  pageSize: 25,
  density: "comfortable",
};

export interface MarketplaceItemsCounts {
  all: number;
  draft: number;
  published: number;
  archived: number;
}

export interface MarketplaceListResponseExtended {
  items: import("@/lib/types/admin").MarketplaceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: MarketplaceItemsCounts;
}

export type MarketplaceBulkAction = "publish" | "archive" | "restore" | "delete";

export interface MarketplaceBulkResult {
  updated: number;
  failed: Array<{ id: string; error: string }>;
}
