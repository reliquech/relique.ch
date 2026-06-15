export type MarketplaceItemsSort = "updated_at" | "title" | "price_usd";
export type MarketplaceItemsOrder = "asc" | "desc";
export type MarketplaceItemsDensity = "comfortable" | "compact";
export type MarketplaceStatusTab = "all" | "draft" | "published" | "archived";
export type MarketplaceFeaturedFilter = "all" | "true" | "false";

export interface MarketplaceItemsUrlState {
  q: string;
  statusTab: MarketplaceStatusTab;
  statusMulti: string[];
  featured: MarketplaceFeaturedFilter;
  athlete: string;
  priceMin: string;
  priceMax: string;
  sort: MarketplaceItemsSort;
  order: MarketplaceItemsOrder;
  page: number;
  pageSize: number;
  density: MarketplaceItemsDensity;
}

export interface MarketplaceStatusCounts {
  all: number;
  draft: number;
  published: number;
  archived: number;
}

export const DEFAULT_MARKETPLACE_ITEMS_URL: MarketplaceItemsUrlState = {
  q: "",
  statusTab: "all",
  statusMulti: [],
  featured: "all",
  athlete: "",
  priceMin: "",
  priceMax: "",
  sort: "updated_at",
  order: "desc",
  page: 1,
  pageSize: 25,
  density: "comfortable",
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function statusParamFromUrl(state: MarketplaceItemsUrlState): string | undefined {
  if (state.statusMulti.length > 0) {
    return state.statusMulti.join(",");
  }
  if (state.statusTab !== "all") {
    return state.statusTab;
  }
  return undefined;
}
