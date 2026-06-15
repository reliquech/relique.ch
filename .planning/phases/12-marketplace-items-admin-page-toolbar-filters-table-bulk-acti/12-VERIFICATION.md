---
status: complete
phase: 12-marketplace-items-admin-page-toolbar-filters-table-bulk-acti
updated: 2026-06-15
human_verification:
  - "Optional spot-check: bulk publish/delete on /admin/items while logged in as admin."
---

# Phase 12 Verification

**Status:** ✅ Complete — automated gates PASS; UAT signed off in `12-UAT.md`

## Automated gates

| Gate | Result |
|------|--------|
| `npm run check-types` | PASS |
| `npm run build` | PASS |
| Targeted Phase 12 lint | PASS |
| `npm run lint` | BLOCKED by pre-existing repo errors outside phase scope |
| Code review | PASS after fixes |

## UAT checklist

### Toolbar
- [x] Search debounces and updates URL `q`
- [x] Status tabs show counts; filter list by tab
- [x] Filters panel (collapsible desktop / sheet mobile)
- [x] Sort dropdown and column header sort agree
- [x] Clear all resets filters
- [x] Add Item → `/admin/marketplace/new`

### Filters & URL
- [x] Featured, athlete, price range apply server-side
- [x] Filter chips removable; URL shareable/back-forward works
- [x] `page`, `pageSize`, `density` in URL

### Table
- [x] Checkbox select-all current page only
- [x] Row click → edit; checkbox/menu stop propagation
- [x] Sticky header; comfortable density default
- [x] Empty global vs filtered copy

### Bulk & row actions
- [x] Bulk publish/archive/restore/delete with confirmations
- [x] Mixed-status selection disables lifecycle bulk buttons
- [x] Row menu: edit, preview (slug), duplicate, lifecycle, delete
- [x] Partial failure toast on bulk errors

### Pagination
- [x] Server-side pages 10/25/50/100
- [x] Prev/Next disabled at bounds

### A11y / responsive
- [x] Keyboard row Enter → edit
- [x] Targets ≥24px
- [x] Tablet hides Updated column; mobile filter sheet

## Known limitations

- Tab counts are global (not filter-scoped)
- Athlete filter matches first signer JSON path only
- Cover thumbnail only when `cover_image_url` is HTTP(S)
- Desktop filters use Collapsible (no Popover component in repo)
- Full repo lint remains blocked by unrelated existing lint debt outside Phase 12.

## Assumptions

- Editors/admins authenticated via existing portal session
- `POST /api/marketplace/bulk` and `POST .../duplicate` require admin/editor role
