---
phase: 15
slug: marketplace-items-instant-view-toggle-and-list-query-cache-n
status: complete
created: 2026-06-15
---

# Phase 15 Research

## Objective

Plan an implementation that makes Marketplace Items view switching instant and adds stale-while-revalidate caching for the admin list without changing APIs, adding dependencies, or redesigning UI.

## Current Architecture

- `ItemsPage.tsx` owns view rendering and calls `useMarketplaceItemsQuery(state)`.
- `useMarketplaceItemsView()` is localStorage-backed and independent of URL state.
- `useMarketplaceItemsUrl()` parses URL search params into `MarketplaceItemsUrlState`; `density` is a presentation setting inside URL state.
- `useMarketplaceItemsQuery()` currently:
  - depends on the entire `state` object
  - constructs API params inline
  - aborts previous fetches
  - sets `loading` true before every request
  - has no cache, no stale flag, and no stable query key helper
- `marketplaceAPIService.list()` already accepts all data params and an AbortSignal.

## Key Finding

The table/grid view itself is not part of `MarketplaceItemsUrlState`, so the current view toggle should not directly refetch. However, operators still see avoidable loading churn when returning to recent queries, changing non-data state, or after mutations because the hook has no cached response path. Phase 15 should make the invariant explicit and add cache-backed SWR semantics.

## Implementation Approach

1. Extract deterministic query-key helpers:
   - `getMarketplaceItemsListParams(state)`
   - `getMarketplaceItemsQueryKey(state)`
   - exclude presentation-only fields such as `density`
2. Add a small module-level LRU-ish cache:
   - TTL: 30 seconds
   - max entries: 20
   - helpers: read, write, invalidate all, invalidate active key
3. Update `useMarketplaceItemsQuery`:
   - hydrate from cache synchronously in initial state
   - if cached: render data immediately with `loading=false`, `refreshing=true`
   - if no cached data: use existing initial loading state
   - background fetch updates cache and state if not aborted
   - expose `refreshing`, `isStale`, `queryKey`, and `invalidateCache`
   - keep `refetch` backward compatible, with optional `{ force?: boolean }`
4. Update `ItemsPage`:
   - do not clear selection on view changes
   - mutation success calls `refetch({ force: true })`
   - retry button uses forced refetch
   - optionally show a subtle refreshing indicator without changing layout
5. Verify with static checks and manual network UAT.

## Risks / Pitfalls

- **Stale mutation result:** If bulk publish/delete only refreshes active key, other cached filter states may remain stale. Invalidate all marketplace list cache entries after mutations.
- **Abort race:** Background refresh should not overwrite newer active query data. Keep AbortController and compare current key before setting state.
- **Presentation-state refetch:** `density` or future view fields must not be part of cache key.
- **Loading flicker:** If cached data exists, do not set `loading=true` during background refresh.
- **Memory growth:** Cap cache entries.

## Validation Architecture

Automated:
- Targeted ESLint for `useMarketplaceItemsQuery.ts`, `ItemsPage.tsx`, and any cache helper.
- `npm run check-types`
- `npm run build`
- Grep assertions:
  - query key helper exists
  - key excludes `density`
  - cache TTL and max entries exist
  - hook returns `refreshing`
  - mutation path calls forced refetch/invalidation

Manual UAT:
- Open `/admin/items`; switch Table/Grid repeatedly; verify no loading skeleton or network list refetch is caused by view switch.
- Change filters; verify first load fetches and later return to same filter renders cached rows immediately.
- Publish/archive/delete; verify visible list updates after forced refresh.
- Retry error state still triggers network request.

## RESEARCH COMPLETE

