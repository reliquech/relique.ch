---
phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n
plan: 02
subsystem: frontend
tags: [react, stale-while-revalidate, cache, marketplace, query-hook]
requires:
  - phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n
    plan: 01
    provides: Query key helpers and bounded in-memory cache primitives
provides:
  - useMarketplaceItemsQuery with SWR semantics (hydrate, refresh, isStale)
  - Background fetch without blanking cached rows
  - Force refetch via refetch({ force: true })
affects: [15-03, 15-04, ItemsPage, marketplace-items]
tech-stack:
  added: []
  patterns:
    - "loading false when cache hit; refreshing true during background fetch"
    - "activeKeyRef guards against stale response overwriting newer query"
    - "Errors surface without clearing last good cached data"
key-files:
  created: []
  modified:
    - src/features/marketplace/hooks/useMarketplaceItemsQuery.ts
key-decisions:
  - "Giữ API hook backward compatible: data, loading, error, refetch vẫn tồn tại"
  - "force refetch không xóa cached rows — chỉ bỏ qua cache hydration và gọi network"
patterns-established:
  - "isStale derived from CACHE_TTL_MS; consumers có thể hiển thị stale indicator"
  - "invalidateCache wrapper export cho mutation flows (plan 15-04)"
requirements-completed: [CACHE-15-02, CACHE-15-03]
duration: 8min
completed: 2026-06-15
---

# Phase 15 Plan 02: Stale-While-Revalidate Hook Summary

**Hook `useMarketplaceItemsQuery` hydrate từ cache, tách `loading`/`refreshing`/`isStale`, và fetch nền không xóa rows đã cache**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-15T11:34:00Z
- **Completed:** 2026-06-15T11:42:12Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `useMarketplaceItemsQuery` hydrate `data` từ `readMarketplaceItemsCache(queryKey)` — không skeleton khi có cache.
- `loading` chỉ `true` khi không có cache; `refreshing` bật trong background fetch khi đã có data.
- `isStale` phản ánh TTL 30s; `queryKey` và `invalidateCache` export cho caller.
- `fetchList({ force?: boolean })` hỗ trợ force refetch; `activeKeyRef` chặn response cũ ghi đè query mới (T15-03).
- Lỗi network giữ last good data và set `error` (T15-04); abort không làm sai `loading`/`refreshing`.

## Task Commits

1. **Task 1: Hydrate from cache and expose refresh state** - `dda3697` (feat)
2. **Task 2: Implement stale-while-revalidate fetch flow** - `a4b1497` (feat)

**Lưu ý:** Logic SWR đầy đủ đã có trong commit `655b292` / `63da20a` (plan 15-01). Session này xác minh acceptance criteria, bổ sung JSDoc, và tạo commit atomic theo plan 15-02.

## Files Created/Modified

- `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts` — SWR hook với hydrate, refreshing, isStale, force refetch, activeKeyRef guard

## Decisions Made

- Không thay đổi signature return — `ItemsPage` đã consume `refreshing`, `isStale`, `invalidateCache`.
- Comment `activeKeyRef` guard ghi rõ threat T15-03 thay vì refactor thêm abstraction.

## Deviations from Plan

### Pre-existing implementation

- **Found during:** Task 1
- **Issue:** Toàn bộ SWR flow đã implement trong `655b292` trước khi executor chạy plan 15-02.
- **Action:** Xác minh criteria, thêm JSDoc + comment guard, tách 2 commit `dda3697` và `a4b1497`.

**Total deviations:** 1 (pre-existing work documented)
**Impact on plan:** Không ảnh hưởng kết quả; acceptance criteria đạt đủ.

## Issues Encountered

None — `npm run check-types` pass sau `next typegen` regenerate route types.

## User Setup Required

None.

## Next Phase Readiness

- Plan 15-03 có thể wire view toggle không trigger refetch (presentation state ngoài query key).
- Plan 15-04 có thể dùng `invalidateCache` sau mutations bulk/delete.

## Self-Check: PASSED

- FOUND: `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts`
- FOUND: `dda3697`
- FOUND: `a4b1497`

---
*Phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n*
*Completed: 2026-06-15*
