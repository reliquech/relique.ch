---
phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n
plan: 03
subsystem: frontend
tags: [react, cache, marketplace, toolbar, mutations, swr]
requires:
  - phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n
    plan: 02
    provides: useMarketplaceItemsQuery with refreshing, isStale, invalidateCache, force refetch
provides:
  - ItemsPage mutation paths invalidate cache and force active list refresh
  - View toggle remains presentation-only (no refetch)
  - Compact Refreshing/Cached indicator in toolbar count area
affects: [15-04, ItemsPage, MarketplaceItemsToolbar]
tech-stack:
  added: []
  patterns:
    - "invalidateCache + refetch({ force: true }) after every successful mutation"
    - "Compact text stale/refresh signal beside count summary (no layout shift)"
key-files:
  created: []
  modified:
    - src/components/admin/marketplace/pages/ItemsPage.tsx
    - src/components/admin/marketplace/items/MarketplaceItemsToolbar.tsx
key-decisions:
  - "Ưu tiên text nhỏ cạnh count summary thay badge Syncing ở header (T15-06)"
  - "refreshing hiển thị Refreshing; isStale hiển thị Cached — không dùng Syncing"
patterns-established:
  - "Mutation success luôn invalidate toàn bộ list cache rồi force refetch query đang active"
requirements-completed: [CACHE-15-01, CACHE-15-04]
duration: 6min
completed: 2026-06-15
---

# Phase 15 Plan 03: Wire Cached Query to Items Page Summary

**ItemsPage dùng cache SWR đầy đủ: mutation force refresh, view toggle không fetch, indicator Refreshing/Cached gọn cạnh count**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-06-15T12:00:00Z
- **Completed:** 2026-06-15T12:06:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Sau bulk/duplicate/publish/unpublish/restore/archive/delete: `invalidateCache()` + `refetch({ force: true })`.
- Nút Retry gọi `refetch({ force: true })`; `onViewChange={setView}` — không refetch khi đổi table/grid.
- Toolbar nhận `refreshing` và `isStale`; hiển thị "Refreshing" hoặc "Cached" cạnh count summary.
- Gỡ badge "Syncing" animated ở header để tránh layout shift (T15-06).

## Task Commits

1. **Task 1: Force refresh after mutations and retry** — pre-existing trong `655b292` (không có diff mới; acceptance criteria đã đạt)
2. **Task 2a: Add non-blocking refresh signal (toolbar)** — `6a0bb3c` (feat)
3. **Task 2b: Pass isStale to toolbar** — `b025515` (feat)

## Files Created/Modified

- `src/components/admin/marketplace/pages/ItemsPage.tsx` — truyền `isStale={isStale}`; mutation/retry logic đã có sẵn
- `src/components/admin/marketplace/items/MarketplaceItemsToolbar.tsx` — props `isStale`, indicator compact Refreshing/Cached

## Decisions Made

- Indicator đặt cạnh `MarketplaceItemsCountSummary` với `min-h-[20px]` để giữ chiều cao ổn định.
- `refreshing` ưu tiên hơn `isStale` khi cả hai đúng (background fetch đang chạy).

## Deviations from Plan

### Pre-existing implementation (Task 1)

- **Found during:** Task 1
- **Issue:** Logic `invalidateCache`, `refetch({ force: true })` sau mutations và Retry đã implement trong `655b292` trước plan 15-03.
- **Action:** Xác minh acceptance criteria; không tạo commit rỗng. Task 2 commit bổ sung `isStale` wiring và toolbar UI.

**Total deviations:** 1 (pre-existing work documented)
**Impact on plan:** Không ảnh hưởng kết quả; tất cả success criteria đạt.

## Issues Encountered

None — `eslint` và `npm run check-types` pass.

## User Setup Required

None.

## Next Phase Readiness

- Plan 15-04 có thể mở rộng invalidation cross-tab hoặc mutation hooks nếu cần.
- Manual check: table/grid toggle không gọi `/api/marketplace` (presentation state ngoài query key).

## Self-Check: PASSED

- FOUND: `src/components/admin/marketplace/pages/ItemsPage.tsx`
- FOUND: `src/components/admin/marketplace/items/MarketplaceItemsToolbar.tsx`
- FOUND: `6a0bb3c`
- FOUND: `b025515`
- FOUND: `655b292` (task 1 pre-existing)

---
*Phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n*
*Completed: 2026-06-15*
