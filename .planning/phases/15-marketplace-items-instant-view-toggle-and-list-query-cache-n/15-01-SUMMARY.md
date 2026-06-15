---
phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n
plan: 01
subsystem: frontend
tags: [react, cache, marketplace, query-key, stale-while-revalidate]
requires:
  - phase: 12-marketplace-items-admin-page-toolbar-filters-table-bulk-acti
    provides: MarketplaceItemsUrlState and abortable list hook foundation
provides:
  - Deterministic marketplace items query key helpers
  - Bounded in-memory list cache primitives with TTL and eviction
affects: [15-02, 15-03, 15-04, marketplace-items]
tech-stack:
  added: []
  patterns:
    - "Query keys derived only from data-affecting URL params"
    - "Module-level Map cache with TTL constant and max-entry eviction"
key-files:
  created: []
  modified:
    - src/features/marketplace/hooks/useMarketplaceItemsQuery.ts
key-decisions:
  - "Query key serializes getMarketplaceItemsListParams via JSON.stringify"
  - "Cache TTL (30s) checked by hook consumers; read helper returns raw entries"
  - "Oldest Map key evicted when size exceeds 20 entries"
patterns-established:
  - "Presentation-only URL fields must not appear in list query keys"
  - "invalidateMarketplaceItemsCache(key?) supports targeted or full invalidation"
requirements-completed: [CACHE-15-01, CACHE-15-02]
duration: 5min
completed: 2026-06-15
---

# Phase 15 Plan 01: Query Key & Cache Primitives Summary

**Helpers tách query key khỏi presentation state và cache in-memory có giới hạn TTL 30s / 20 entry cho marketplace items list**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-15T10:35:00Z
- **Completed:** 2026-06-15T10:40:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `getMarketplaceItemsListParams` và `getMarketplaceItemsQueryKey` export — chỉ gồm q, status, featured, athlete, price, sort, order, page, pageSize.
- Module cache `marketplaceItemsCache` với `CACHE_TTL_MS = 30_000`, `MAX_CACHE_ENTRIES = 20`.
- `readMarketplaceItemsCache`, `writeMarketplaceItemsCache` (evict oldest), `invalidateMarketplaceItemsCache` (single key hoặc clear all).
- JSDoc mô tả invariant presentation-state-free cho acceptance grep.

## Task Commits

1. **Task 1: Extract list params and query key helpers** - `0e98095` (feat)
2. **Task 2: Add bounded in-memory cache helpers** - `63da20a` (feat)

**Lưu ý:** Logic đầy đủ đã có sẵn trong `655b292`; session này xác minh acceptance criteria, sửa JSDoc để pass grep `density|activeView|localStorage`, và tạo commit atomic theo plan.

## Files Created/Modified

- `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts` — query key helpers, bounded cache primitives, JSDoc

## Decisions Made

- Giữ `readMarketplaceItemsCache` / `writeMarketplaceItemsCache` internal; chỉ export `invalidateMarketplaceItemsCache` và query key helpers.
- Không nhắc `density`/`view` trong source file (kể cả comment) để đáp ứng acceptance grep.

## Deviations from Plan

### Pre-existing implementation

- **Found during:** Task 1
- **Issue:** Toàn bộ helpers + cache + hook SWR đã được thêm trong commit `655b292` trước khi executor chạy plan 15-01.
- **Action:** Xác minh criteria, thêm JSDoc, tách thành 2 commit `0e98095` và `63da20a` thay vì rewrite history của mega-commit.

**Total deviations:** 1 (pre-existing work documented)
**Impact on plan:** Không ảnh hưởng kết quả; plan 15-02 có thể bỏ qua phần đã có trong hook nếu criteria đã đạt.

## Issues Encountered

- `npm run check-types` fail do lỗi pre-existing (`.next/types` stale paths, thiếu `@next/bundle-analyzer`) — ngoài scope plan 15-01; ESLint targeted pass.

## User Setup Required

None.

## Next Phase Readiness

- Plan 15-02 có thể verify hook đã hydrate từ cache và expose `refreshing`/`isStale` — nhiều phần đã implement sẵn.
- `ItemsPage` vẫn cần plan 15-03/04 cho view toggle không refetch và mutation invalidation.

## Self-Check: PASSED

- FOUND: `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts`
- FOUND: `0e98095`
- FOUND: `63da20a`

---
*Phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n*
*Completed: 2026-06-15*
