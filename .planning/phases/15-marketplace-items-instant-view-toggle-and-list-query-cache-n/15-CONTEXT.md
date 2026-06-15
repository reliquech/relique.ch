---
phase: 15
slug: marketplace-items-instant-view-toggle-and-list-query-cache-n
status: ready-for-planning
created: 2026-06-15
source: inferred-from-roadmap
---

# Phase 15: Marketplace Items Instant View Toggle & List Query Cache - Context

<domain>
## Phase Boundary

Make `/admin/items` feel instant when operators switch Table/Grid view and revisit recent list states. The phase is limited to client-side list query behavior and cache invalidation for Marketplace Items admin.

Out of scope:
- No redesign of table/grid visuals.
- No API schema or Supabase migration changes.
- No React Query/SWR package install.
- No public marketplace changes.
- No Phase 13 media editor binding fix.
</domain>

<decisions>
## Implementation Decisions

### Locked Scope
- Table/Grid switching must not refetch marketplace list data.
- Query cache must be local to the admin marketplace feature and preserve current service/API contracts.
- Use stale-while-revalidate behavior: cached data renders immediately, then a background request refreshes it.
- Keep explicit `refetch()` support for retry buttons and mutation follow-ups.
- Cache key must derive only from data-affecting list params: q, status, featured, athlete, price, sort, order, page, pageSize. It must not include table/grid view or non-data presentation state.
- Bulk/status/duplicate/delete actions must invalidate or refresh affected list caches.
- Follow v1 quality gate: targeted lint, `npm run check-types`, `npm run build`; full repo lint may remain blocked by unrelated existing lint debt.

### the agent's Discretion
- Cache TTL and max entries can be conservative.
- Implementation can live in `useMarketplaceItemsQuery.ts` or a colocated helper under `src/features/marketplace/hooks/`.
- Manual UAT may be used for network-refetch observation because no browser test framework exists.
</decisions>

<canonical_refs>
## Canonical References

### Current Admin Items Flow
- `src/components/admin/marketplace/pages/ItemsPage.tsx` — owns table/grid rendering, filters, selection, mutations, and calls `useMarketplaceItemsQuery`.
- `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts` — current uncached list fetch hook.
- `src/features/marketplace/hooks/useMarketplaceItemsView.ts` — current persisted view preference hook; must remain independent from list query.
- `src/features/marketplace/hooks/useMarketplaceItemsUrl.ts` — URL-backed data query state.
- `src/features/marketplace/services/marketplaceService.ts` — existing API client and list response types.
- `src/features/marketplace/types/itemsList.ts` — current list URL state and query-affecting fields.

### Prior Phase Context
- `.planning/phases/13-marketplace-items-table-grid-toggle-full-page-create-edit-ed/13-REVIEW.md` — documents Phase 13 remaining media binding warning; not part of Phase 15.
</canonical_refs>

<specifics>
## Specific Ideas

- Add `getMarketplaceItemsQueryKey(state)` returning a deterministic key excluding `density` and view.
- Add `useMarketplaceItemsQueryCache` or module-level cache helpers with:
  - `CACHE_TTL_MS` around 30 seconds
  - small `MAX_CACHE_ENTRIES` around 20
  - cache entry shape `{ data, updatedAt }`
  - stale flag exposed to UI as `refreshing` or `isStale`
- `useMarketplaceItemsQuery` should return cached data immediately when available and fetch in background.
- `loading` should mean initial empty load, while background refresh uses `refreshing`.
- `refetch({ force: true })` should bypass TTL and refresh the active key.
- Mutations in `ItemsPage` should call `refetch({ force: true })` after success.
</specifics>

<deferred>
## Deferred Ideas

- Cross-tab cache sync.
- Persistent IndexedDB/localStorage cache.
- Server-side cache headers.
- React Query/SWR adoption.
- Automated Playwright network-count test framework.
</deferred>

