"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_MARKETPLACE_ITEMS_URL,
  type MarketplaceFeaturedFilter,
  type MarketplaceItemsDensity,
  type MarketplaceItemsOrder,
  type MarketplaceItemsSort,
  type MarketplaceItemsUrlState,
  type MarketplaceStatusTab,
} from "@/features/marketplace/types/itemsList";

function parseStatusTab(raw: string | null): MarketplaceStatusTab {
  if (raw === "draft" || raw === "published" || raw === "archived") return raw;
  return "all";
}

function parseFeatured(raw: string | null): MarketplaceFeaturedFilter {
  if (raw === "true" || raw === "false") return raw;
  return "all";
}

function parseSort(raw: string | null): MarketplaceItemsSort {
  if (raw === "title" || raw === "price_usd") return raw;
  return "updated_at";
}

function parseOrder(raw: string | null): MarketplaceItemsOrder {
  return raw === "asc" ? "asc" : "desc";
}

function parseDensity(raw: string | null): MarketplaceItemsDensity {
  return raw === "compact" ? "compact" : "comfortable";
}

function parsePageSize(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : DEFAULT_MARKETPLACE_ITEMS_URL.pageSize;
  if (n === 10 || n === 25 || n === 50 || n === 100) return n;
  return DEFAULT_MARKETPLACE_ITEMS_URL.pageSize;
}

export function parseMarketplaceItemsUrl(
  searchParams: URLSearchParams
): MarketplaceItemsUrlState {
  const tab = parseStatusTab(searchParams.get("tab"));
  const statusRaw = searchParams.get("status");
  const statusMulti =
    statusRaw && !searchParams.get("tab")
      ? statusRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  return {
    q: searchParams.get("q") ?? "",
    statusTab: tab,
    statusMulti,
    featured: parseFeatured(searchParams.get("featured")),
    athlete: searchParams.get("athlete") ?? "",
    priceMin: searchParams.get("price_min") ?? "",
    priceMax: searchParams.get("price_max") ?? "",
    sort: parseSort(searchParams.get("sort")),
    order: parseOrder(searchParams.get("order")),
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    pageSize: parsePageSize(searchParams.get("pageSize")),
    density: parseDensity(searchParams.get("density")),
  };
}

function serializeState(state: MarketplaceItemsUrlState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.statusTab !== "all") {
    params.set("tab", state.statusTab);
  } else if (state.statusMulti.length > 0) {
    params.set("status", state.statusMulti.join(","));
  }
  if (state.featured !== "all") params.set("featured", state.featured);
  if (state.athlete.trim()) params.set("athlete", state.athlete.trim());
  if (state.priceMin.trim()) params.set("price_min", state.priceMin.trim());
  if (state.priceMax.trim()) params.set("price_max", state.priceMax.trim());
  if (state.sort !== "updated_at") params.set("sort", state.sort);
  if (state.order !== "desc") params.set("order", state.order);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.pageSize !== 25) params.set("pageSize", String(state.pageSize));
  if (state.density !== "comfortable") params.set("density", state.density);

  return params;
}

export function useMarketplaceItemsUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parseMarketplaceItemsUrl(searchParams),
    [searchParams]
  );

  const setState = useCallback(
    (patch: Partial<MarketplaceItemsUrlState>, options?: { resetPage?: boolean }) => {
      const next = {
        ...state,
        ...patch,
        ...(options?.resetPage ? { page: 1 } : {}),
      };
      const qs = serializeState(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, state]
  );

  const clearFilters = useCallback(() => {
    setState(
      {
        q: "",
        statusTab: "all",
        statusMulti: [],
        featured: "all",
        athlete: "",
        priceMin: "",
        priceMax: "",
        page: 1,
      },
      { resetPage: true }
    );
  }, [setState]);

  return { state, setState, clearFilters };
}
