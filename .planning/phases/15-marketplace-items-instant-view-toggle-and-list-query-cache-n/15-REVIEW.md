---
phase: 15-marketplace-items-instant-view-toggle-and-list-query-cache-n
reviewed: 2026-06-15T14:30:00Z
depth: standard
advisory: true
files_reviewed: 3
files_reviewed_list:
  - src/features/marketplace/hooks/useMarketplaceItemsQuery.ts
  - src/components/admin/marketplace/pages/ItemsPage.tsx
  - src/components/admin/marketplace/items/MarketplaceItemsToolbar.tsx
findings:
  critical: 0
  warning: 4
  info: 2
  total: 6
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-06-15T14:30:00Z  
**Depth:** standard (advisory only)  
**Files Reviewed:** 3  
**Status:** issues_found

## Summary

Phase 15 thêm stale-while-revalidate cache cho marketplace items list, tách `loading`/`refreshing`/`isStale`, và wire view toggle + toolbar indicators. Ba file nguồn chính có kiến trúc hợp lý: query key loại trừ presentation fields, `activeKeyRef` chặn race condition, abort controller cleanup đúng, mutation paths gọi `invalidateCache()` + `refetch({ force: true })`.

Không phát hiện lỗ hổng bảo mật hay rủi ro mất dữ liệu. Có **4 cảnh báo** về hành vi UI/logic lệch với mục tiêu phase (đặc biệt error state che cached rows, và refetch thừa khi đổi `density`). Toolbar component sạch, không có vấn đề đáng kể.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Error banner che toàn bộ cached list

**File:** `src/components/admin/marketplace/pages/ItemsPage.tsx:275-288`  
**Issue:** Hook `useMarketplaceItemsQuery` giữ `data` khi fetch lỗi (plan 15-02: "Errors surface without clearing last good cached data"), nhưng `ItemsPage` dùng nhánh `error ? … : loading ? …` — khi `error` truthy, user chỉ thấy banner lỗi, không thấy rows đã cache. Background refresh fail trên cache hit = mất khả năng xem dữ liệu cũ cho đến khi Retry thành công.  
**Fix:** Render error inline phía trên list khi `data` còn tồn tại; chỉ thay toàn bộ content bằng error khi `!data && error`:

```tsx
{error && !data ? (
  <ErrorBanner onRetry={() => void refetch({ force: true })} />
) : loading && !data ? (
  <MarketplaceItemsTableSkeleton density={state.density} />
) : (
  <>
    {error ? (
      <InlineErrorBanner message={error} onRetry={() => void refetch({ force: true })} />
    ) : null}
    {/* existing empty / table / grid branches */}
  </>
)}
```

### WR-02: Đổi `density` gây refetch mạng dù query key không đổi

**File:** `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts:147-152`  
**Issue:** `fetchList` phụ thuộc `[state]` (cả object URL state). Khi user đổi `density` (presentation-only, không có trong `getMarketplaceItemsQueryKey`), `useEffect` vẫn gọi `fetchList()` và bắn request `/api/marketplace` — trái mục tiêu phase "presentation state không trigger refetch" (tương tự view toggle đã được tách).  
**Fix:** Thay dependency `state` bằng `queryKey` (hoặc serialize list params), và đọc `state` mới nhất qua ref nếu cần:

```ts
const stateRef = useRef(state);
useEffect(() => { stateRef.current = state; }, [state]);

const fetchList = useCallback(async (options?: RefetchOptions) => {
  const currentState = stateRef.current;
  const key = getMarketplaceItemsQueryKey(currentState);
  // ... use currentState instead of state
}, [queryKey]); // hoặc [] + stateRef only
```

### WR-03: Query key selection-clearing trùng lặp, dễ lệch với hook

**File:** `src/components/admin/marketplace/pages/ItemsPage.tsx:50-62`  
**Issue:** `ItemsPage` tự `JSON.stringify` raw `statusTab`/`statusMulti` thay vì dùng `getMarketplaceItemsQueryKey(state)` đã export. Hai URL state khác nhau có thể map cùng API params (ví dụ `statusTab: "draft"` vs `statusTab: "all", statusMulti: ["draft"]`) — hook cache coi là query khác, selection-clearing coi là query khác (OK hiện tại), nhưng bất kỳ thay đổi normalization nào ở hook sẽ không sync sang selection logic.  
**Fix:** Import và dùng helper chung:

```ts
import { getMarketplaceItemsQueryKey } from "@/features/marketplace/hooks/useMarketplaceItemsQuery";

const queryKey = getMarketplaceItemsQueryKey(state);
```

### WR-04: Modal xác nhận đóng dù bulk action thất bại

**File:** `src/components/admin/marketplace/pages/ItemsPage.tsx:136-150`  
**Issue:** `runBulk` bắt lỗi nội bộ (`toast.error`) và không rethrow. `handleConfirm` luôn gọi `setConfirmKind(null)` / `setPendingIds([])` sau `await runBulk(...)`, kể cả khi delete/archive fail — user mất context modal, phải chọn lại items để retry.  
**Fix:** Cho `runBulk` return `boolean` success, hoặc rethrow sau toast; chỉ đóng modal khi thành công:

```ts
const ok = await runBulk("delete", pendingIds);
if (ok) {
  setConfirmKind(null);
  setPendingIds([]);
}
```

## Info

### IN-01: `isStale` không cập nhật khi background refresh lỗi

**File:** `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts:138-145`  
**Issue:** Nhánh `catch` set `error` nhưng không đặt lại `isStale`. Sau failed refresh, toolbar có thể không hiện "Cached" dù data đã quá TTL — indicator không phản ánh đúng trạng thái stale.  
**Fix:** Trong `catch`, khi còn cached entry: `setIsStale(true)`.

### IN-02: `isGlobalEmpty` dùng `state.q` thay vì input đang debounce

**File:** `src/components/admin/marketplace/pages/ItemsPage.tsx:214`  
**Issue:** Trong cửa sổ 300ms sau khi user xóa search input, `searchInput` đã rỗng nhưng `state.q` chưa cập nhật — `isGlobalEmpty` có thể false trong khi UI search trống và list filtered-empty. Edge case nhỏ, không crash.  
**Fix:** Dùng `debouncedQ` hoặc `searchInput` trong điều kiện empty global, hoặc chấp nhận delay 300ms.

---

_Reviewed: 2026-06-15T14:30:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard (advisory)_
