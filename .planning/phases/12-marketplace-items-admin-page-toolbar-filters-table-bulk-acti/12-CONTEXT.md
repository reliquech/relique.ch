# Phase 12 Context

**Source:** `/gsd-add-phase` user specification (2026-06-15)  
**Scope:** **Only** Marketplace Items management page (`/admin/items`) — no unrelated admin pages

## Role

Senior product designer + frontend engineer. Upgrade Items management UX while preserving dark visual identity and business logic.

## Hard constraints

- Do NOT redesign unrelated pages
- Do NOT install a new table library unless existing architecture cannot meet requirements
- Preserve current dark admin visual identity (stitch/surface tokens, existing patterns)
- No API-contract or route regressions for existing consumers
- shadcn guard: do not edit `components/ui/**` — wrap in `components/admin/marketplace/` or `components/shared/`
- Files ≤300 lines — split into subcomponents/hooks

## Current state (codebase inventory)

| Area | Path | Notes |
|------|------|-------|
| Route | `src/app/admin/(portal)/items/page.tsx` | Thin re-export → `ItemsPage` |
| Page | `src/components/admin/marketplace/pages/ItemsPage.tsx` | ~128 lines; fetches `pageSize: 1000`, client-side search filter |
| Service | `src/features/marketplace/services/marketplaceService.ts` | `marketplaceAPIService.list()`, `delete()` |
| API GET | `src/app/api/marketplace/route.ts` `adminGet` | Query: `status`, `category`, `is_featured`, `page`, `pageSize` |
| Type | `src/lib/types/admin.ts` `MarketplaceItem` | id, title, athlete, category, status, is_featured, price_usd, updated_at, cover_image_url |
| Status enum | `MarketplaceStatus` | draft, published, archived |
| Shared UI | `DataTable`, `DeleteConfirmModal`, `getStatusPill`, `useDebounce` | CRM pages use similar patterns |
| New item | `/admin/marketplace/new` | "Add Item" target |

### API gaps (likely backend work in phase)

| Requirement | API today | Needed |
|-------------|-----------|--------|
| Search title/athlete/ID | ❌ client-only | `q` param + DB ilike or RPC |
| Sort column + direction | ❌ fixed `created_at desc` | `sort`, `order` params |
| Status tab counts | ❌ | `counts` endpoint or aggregate query |
| Min/max price | ❌ | `price_min`, `price_max` on JSON listing |
| Athlete filter | ❌ | filter on `listing` JSON or denormalized column |
| Bulk publish/archive/delete | ❌ | `PATCH /api/marketplace/bulk` or loop with idempotency |
| Duplicate item | ❌ | `POST` clone or client-side create from GET |

> Planner MUST decide: extend `adminGet` in phase vs. ship UI with client fallbacks only where API missing. User expects server-side pagination when supported — **extend API** is the default.

## Locked UX requirements

### 1. Toolbar

- Debounced search: title, athlete, ID
- Status tabs: All, Draft, Published, Archived **with counts**
- Filter button → popover or drawer
- Sort selector
- Clear-all filters
- **Add Item** remains primary CTA → `/admin/marketplace/new`

### 2. Filters

- Status multi-select
- Featured: All / Yes / No
- Athlete searchable select
- Min / max price
- Active filters as **removable chips**
- Sync search, filters, sort, page, pageSize with **URL query params** (shareable, back/forward)

### 3. Table

- Columns: checkbox, thumbnail, title, athlete, status, featured, price, updated date, actions
- Sortable headers with visible direction
- Density: Comfortable / Compact
- Sticky header
- Row hover, selected, keyboard-focus states
- Truncate + tooltip for long text
- **Row click → edit**; interactive cells (checkbox, menu) must `stopPropagation`

### 4. Selection & bulk actions

- Per-row checkbox + select-all **current page**
- Sticky bulk toolbar with selected count
- Bulk: Publish, Archive, Restore, Delete
- Disable invalid actions for mixed statuses
- Confirm dialog for destructive ops
- On filter change: **preserve or explicitly clear** selection — never act on hidden rows silently
- Toast with partial-failure details; Undo where safe

### 5. Pagination & states

- Server-side pagination, filtering, sorting when API supports
- Page sizes: 10, 25, 50, 100
- States: loading skeleton, empty marketplace, no-results, API error + retry
- Abort stale requests / dedupe (request id or AbortController)

### 6. Row actions (overflow menu, ≥24×24px targets)

- Edit, Preview, Duplicate, Publish/Unpublish, Archive/Restore, Delete
- Accessible menu (Radix/shadcn wrapper pattern)

## Validation (phase done when)

- Responsive: desktop / tablet / mobile
- Keyboard + screen reader accessible
- `npm run lint`, `check-types`, `build` pass
- Deliverable: files changed, behavior added, assumptions, remaining backend gaps

## Design tokens / patterns to reuse

- Admin shell: `AdminPortalLayout`, `PageHeader` (if used elsewhere)
- CRM reference: `LeadsPage` — selection, bulk toolbar, `ResponsiveDataTable`, `CrmViewBar` URL patterns
- Colors: `bg-surface`, `border-border`, `text-white`, `bg-accent` for primary CTA
- Notifications: `sonner` toast

## Claude's discretion

- Popover vs drawer for filters on mobile (drawer preferred &lt;768px)
- Hook name/location: `useMarketplaceItemsQuery` under `features/marketplace/hooks/`
- Whether to extend `DataTable` vs build `MarketplaceItemsTable` wrapper
- Preview URL: public `/marketplace/[slug]` if slug available on item

## Out of scope

- Featured page (`/admin/featured`)
- Marketplace form (new/edit) redesign
- Public marketplace browse UI
- New table library (e.g. TanStack Table) unless plan proves blockers

## Depends on

Phase 11 (stable admin module paths under `components/admin/marketplace/`)

## Canonical references

- `src/components/admin/marketplace/pages/ItemsPage.tsx` — current implementation
- `src/app/api/marketplace/route.ts` — list API
- `src/features/marketplace/services/marketplaceService.ts` — client facade
- `src/components/admin/crm/pages/LeadsPage.tsx` — selection/bulk patterns
- `.cursor/rules/shadcn-guard.mdc` — UI wrapper rule
