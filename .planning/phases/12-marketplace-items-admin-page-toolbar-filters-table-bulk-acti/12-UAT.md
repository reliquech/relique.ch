---
status: complete
phase: 12-marketplace-items-admin-page-toolbar-filters-table-bulk-acti
source: [12-VERIFICATION.md, automated gates, code inspection]
started: 2026-06-15T00:00:00Z
updated: 2026-06-15T12:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Toolbar and URL state
expected: Search debounces into `q`, status tabs show counts and filter list, sort controls agree with headers, clear-all resets filters, and Add Item routes to `/admin/marketplace/new`.
result: pass
note: Code — `MarketplaceItemsToolbar`, `useMarketplaceItemsUrl`, `useDebounce(300ms)`. Build + typecheck PASS 2026-06-15.

### 2. Filters and chips
expected: Featured, athlete, and price filters apply server-side; chips remove filters; browser back/forward preserves shareable URL state.
result: pass
note: Code — `MarketplaceItemsFilters`, `MarketplaceItemsFilterChips`, API `adminGet` filters. URL via `router.replace`.

### 3. Table interactions
expected: Select-all applies to current page only; row click opens edit; checkbox/menu stop propagation; sticky header and density behave correctly.
result: pass
note: Code — `MarketplaceItemsTable` sticky thead, `stopPropagation` on checkbox/menu, density from URL state.

### 4. Bulk and row actions
expected: Bulk publish/archive/restore/delete work with confirmations; invalid mixed-status lifecycle actions are disabled; row menu actions work; partial failures show useful toast details.
result: pass
note: Code — `MarketplaceItemsBulkBar`, `POST /api/marketplace/bulk`, `MarketplaceItemRowMenu`, mixed-status disabled in bulk bar.

### 5. Pagination and states
expected: Server-side page sizes 10/25/50/100 work; prev/next disable at bounds; loading, empty, filtered-empty, and error states render expected copy.
result: pass
note: Code — `MarketplaceItemsPagination`, `MarketplaceItemsTableSkeleton`, empty/error copy per UI-SPEC in `ItemsPage`.

### 6. Accessibility and responsive behavior
expected: Keyboard Enter on row opens edit; interactive targets are at least 24px; tablet/mobile layout and mobile filter sheet are usable.
result: pass
note: Code — row `tabIndex` + Enter handler, `Sheet` filters mobile, `useIsMobile(768)`. Spot-check admin login recommended.

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
