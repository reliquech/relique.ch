"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  marketplaceAPIService,
  type MarketplaceListParams,
  type MarketplaceListResponse,
} from "@/features/marketplace/services/marketplaceService";
import {
  statusParamFromUrl,
  type MarketplaceItemsUrlState,
} from "@/features/marketplace/types/itemsList";

/** Stale-while-revalidate TTL for marketplace items list cache. */
const CACHE_TTL_MS = 30_000;
/** Max in-memory cache entries before oldest-key eviction. */
const MAX_CACHE_ENTRIES = 20;

type MarketplaceItemsCacheEntry = {
  data: MarketplaceListResponse;
  updatedAt: number;
};

const marketplaceItemsCache = new Map<string, MarketplaceItemsCacheEntry>();

/** Build API list params from URL state; excludes presentation-only fields. */
export function getMarketplaceItemsListParams(
  state: MarketplaceItemsUrlState
): Omit<MarketplaceListParams, "signal"> {
  const status = statusParamFromUrl(state);
  const priceMin = state.priceMin.trim() ? parseFloat(state.priceMin) : undefined;
  const priceMax = state.priceMax.trim() ? parseFloat(state.priceMax) : undefined;

  return {
    q: state.q.trim() || undefined,
    status,
    featured: state.featured === "all" ? undefined : state.featured === "true",
    athlete: state.athlete.trim() || undefined,
    price_min: priceMin !== undefined && !Number.isNaN(priceMin) ? priceMin : undefined,
    price_max: priceMax !== undefined && !Number.isNaN(priceMax) ? priceMax : undefined,
    sort: state.sort,
    order: state.order,
    page: state.page,
    pageSize: state.pageSize,
  };
}

/** Deterministic cache key from data-affecting list params only. */
export function getMarketplaceItemsQueryKey(state: MarketplaceItemsUrlState): string {
  return JSON.stringify(getMarketplaceItemsListParams(state));
}

/** Read a cache entry by query key; TTL staleness is checked by consumers. */
function readMarketplaceItemsCache(key: string): MarketplaceItemsCacheEntry | null {
  return marketplaceItemsCache.get(key) ?? null;
}

/** Write list response to cache; evicts oldest entry when over max size. */
function writeMarketplaceItemsCache(key: string, data: MarketplaceListResponse): void {
  marketplaceItemsCache.set(key, { data, updatedAt: Date.now() });
  while (marketplaceItemsCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = marketplaceItemsCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    marketplaceItemsCache.delete(oldestKey);
  }
}

/** Invalidate one cache entry or clear all when key is omitted. */
export function invalidateMarketplaceItemsCache(key?: string): void {
  if (key) {
    marketplaceItemsCache.delete(key);
    return;
  }
  marketplaceItemsCache.clear();
}

/** `force` bypasses cache hydration and always requests fresh list data. */
interface RefetchOptions {
  force?: boolean;
}

/**
 * List query with stale-while-revalidate cache.
 * Hydrates `data` from cache when available; `loading` is false while `refreshing` tracks background fetches.
 */
export function useMarketplaceItemsQuery(state: MarketplaceItemsUrlState) {
  const queryKey = getMarketplaceItemsQueryKey(state);
  const initialCache = readMarketplaceItemsCache(queryKey);
  const [data, setData] = useState<MarketplaceListResponse | null>(initialCache?.data ?? null);
  const [loading, setLoading] = useState(!initialCache);
  const [refreshing, setRefreshing] = useState(false);
  const [isStale, setIsStale] = useState(
    initialCache ? Date.now() - initialCache.updatedAt > CACHE_TTL_MS : false
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeKeyRef = useRef(queryKey);

  useEffect(() => {
    activeKeyRef.current = queryKey;
  }, [queryKey]);

  const fetchList = useCallback(async (options?: RefetchOptions) => {
    const key = getMarketplaceItemsQueryKey(state);
    activeKeyRef.current = key;
    const cached = readMarketplaceItemsCache(key);
    const hasCachedData = Boolean(cached);
    const stale = cached ? Date.now() - cached.updatedAt > CACHE_TTL_MS : true;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (cached && !options?.force) {
      setData(cached.data);
      setLoading(false);
      setIsStale(stale);
      setRefreshing(true);
    } else {
      setLoading(!hasCachedData);
      setRefreshing(hasCachedData);
      setIsStale(stale);
    }
    setError(null);

    try {
      const response = await marketplaceAPIService.list({
        ...getMarketplaceItemsListParams(state),
        signal: controller.signal,
      });

      if (!controller.signal.aborted && activeKeyRef.current === key) {
        // Ignore stale responses when query key changed mid-flight (T15-03).
        writeMarketplaceItemsCache(key, response);
        setData(response);
        setIsStale(false);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Couldn't load items");
    } finally {
      if (!controller.signal.aborted && activeKeyRef.current === key) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [state]);

  useEffect(() => {
    fetchList();
    return () => abortRef.current?.abort();
  }, [fetchList]);

  const invalidateCache = useCallback((key?: string) => {
    invalidateMarketplaceItemsCache(key);
  }, []);

  return { data, loading, refreshing, isStale, error, refetch: fetchList, queryKey, invalidateCache };
}
