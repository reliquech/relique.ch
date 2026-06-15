# Phase 13 Context

**Source:** `/gsd-add-phase` user specification (2026-06-15)  
**Scope:** Marketplace Items list (`/admin/items`), create/edit (`/admin/marketplace/new`, `/admin/marketplace/edit/[id]`) — **no unrelated admin pages**

## Role

Senior UX engineer. Inspect existing architecture before editing. Preserve current APIs, routes, dark theme, and business logic.

## Hard constraints

- Do NOT redesign unrelated pages
- Preserve Phase 12 list API contract (`/api/marketplace` admin GET, bulk, duplicate, status)
- Preserve routes: `/admin/items`, `/admin/marketplace/new`, `/admin/marketplace/edit/[id]`
- Dark admin visual identity (`bg-surface`, `text-white`, `border-border`, `bg-primary` CTA)
- shadcn guard: do not edit `components/ui/**` — wrap only
- Files ≤300 lines — split into subcomponents/hooks
- `npm run lint`, `check-types`, `build` must pass (no new test framework in v1 unless repo already has one)

## Current state (codebase inventory)

| Area | Path | Notes |
|------|------|-------|
| Items list | `src/components/admin/marketplace/pages/ItemsPage.tsx` | Phase 12: toolbar, filters, URL sync, table, bulk, pagination |
| List components | `src/components/admin/marketplace/items/*` | Toolbar, table, bulk bar, filters, chips, row menu |
| URL/query hooks | `src/features/marketplace/hooks/useMarketplaceItemsUrl.ts`, `useMarketplaceItemsQuery.ts` | AbortController, searchParams sync |
| Service | `src/features/marketplace/services/marketplaceService.ts` | list, bulk, duplicate, updateStatus, CRUD |
| New page | `src/components/admin/marketplace/pages/NewMarketplacePage.tsx` | Thin wrapper → `MarketplaceForm` |
| Edit page | `src/components/admin/marketplace/pages/EditMarketplacePage.tsx` | Load by id → `MarketplaceForm` |
| Form | `src/components/admin/marketplace/MarketplaceForm.tsx` | ~127 lines; sections: BasicInfo, Image, AthleteAuth, Seller, Condition, Status |
| Form schema | `src/features/marketplace/schema` | `MarketplaceFormSchema` + Zod |
| Images hook | `src/features/marketplace/hooks/useMarketplaceFormImages.ts` | Upload integration |
| Upload API | `src/app/api/marketplace/upload/*` | Existing upload/finalize/cleanup routes |
| UI-SPEC (Phase 12) | `.planning/phases/12-.../12-UI-SPEC.md` | List page design contract — extend, do not contradict |

### Gaps vs. user requirements

| Requirement | Today | Needed |
|-------------|-------|--------|
| Table/Grid toggle | Table only | Segmented control + grid cards + localStorage preference |
| Grid selection/bulk | Table only | Card checkboxes + shared selection state |
| Full-page editor sections | Flat multi-section form | Basic Info, Media, Pricing, Ownership, Publishing, SEO |
| Drag/drop media | Partial via `MarketplaceImageSection` | DnD, progress, reorder, alt, primary, retry |
| Autosave drafts | ❌ | Debounced save + stale-response guard + status UI |
| Sticky action bar | `MarketplaceFormFooter` (basic) | Save Draft, Preview, Publish/Update sticky |
| Unsaved-change guard | ❌ | beforeunload + router block |
| Publish confirmation w/ warnings | ❌ | Modal summarizing unresolved warnings |
| Total + filtered counts | Tab counts only | `{filtered} of {total}` in list header |
| Delete confirm w/ item name | Generic `DeleteConfirmModal` | Type-to-confirm for permanent delete |
| Offline state | ❌ | `navigator.onLine` + retry |
| Undo toasts | Partial | Undo for reversible ops only |

## Locked UX requirements

### 1. Table/Grid switching

- Segmented **Table / Grid** toggle near search controls
- **Table:** optimized for bulk ops (keep Phase 12 behavior)
- **Grid cards:** image, title, athlete, price, status, featured, updated date, overflow actions
- Card selection + bulk actions (shared `selectedIds` with table)
- **Preference:** `localStorage` key with safe fallback (try/catch, SSR guard)
- Desktop: use saved preference; mobile: default **Grid** when no preference exists
- Switching preserves search, filters, sort, pagination, selection
- Smooth transition without layout shift (`opacity`/`transform`, reduced-motion fallback)
- Grid columns: 1 mobile, 2 tablet, 3–5 desktop (`auto-fit` or breakpoint grid)

### 2. Create/Edit workflow

Full-page editor with sections:

1. **Basic Information**
2. **Media**
3. **Pricing**
4. **Ownership**
5. **Publishing**
6. **SEO**

Media requirements:

- Drag/drop upload, progress, preview, reorder, alt text, primary-image selection, retry, removal

Form UX:

- Inline validation beside fields + error summary at top
- Autosave drafts after inactivity; states: Saving, Saved, Failed, Retry
- Prevent stale autosave responses overwriting newer edits (request id / version counter)
- Sticky action bar: Save Draft, Preview, Publish/Update
- Unsaved-change warning: navigation, reload, tab close
- Publish confirmation listing unresolved warnings
- Mobile: collapsible sections (Accordion/Collapsible wrappers)

### 3. UX polish (list + editor)

- Display **total item count** and **filtered count**
- Removable filter chips + Clear All (extend Phase 12 if gaps remain)
- States: skeleton, first-use empty, no-results, permission denied, offline, API error
- Toasts success/failure; **Undo** only for reversible operations
- Delete confirmation requires typing **item name** for permanent deletion
- Keyboard navigation, visible focus, accessible labels, `aria-live` status
- Min 24×24px action targets
- Restore focus after dialogs close

## Validation (phase done when)

- Responsive: desktop / tablet / mobile
- Table ↔ Grid switch preserves state; preference persists
- Editor autosave + unsaved guards work without data loss
- `npm run lint`, `check-types`, `build` pass
- Deliverable: files changed, state architecture, API assumptions, a11y notes, remaining backend gaps

## Design tokens / patterns to reuse

- Phase 12 list components and hooks — extend, don't rewrite from scratch
- `MarketplaceForm` sections — refactor into new section map; preserve submit payload shape unless API requires extension
- `DeleteConfirmModal` — wrap or replace with typed-delete wrapper under `components/admin/marketplace/`
- `sonner` toasts; `useProfile` for role/permission states

## Claude's discretion

- localStorage key name: `relique.admin.marketplace.itemsView`
- Grid card component path: `components/admin/marketplace/items/MarketplaceItemsGrid.tsx`
- Editor section file split under `components/admin/marketplace/editor/`
- Map legacy form sections → new 6-section IA (may merge AthleteAuth into Basic/Ownership)
- Autosave endpoint: reuse `PATCH /api/marketplace/[id]` for edits; `POST` for new drafts when id assigned

## Out of scope

- Public marketplace browse UI
- Featured carousel admin (`/admin/featured`)
- Stripe / payments
- New table library
- Redesign CRM or unrelated admin pages

## Depends on

Phase 12 (Marketplace Items list foundation)

## Canonical references

- `src/components/admin/marketplace/pages/ItemsPage.tsx`
- `src/components/admin/marketplace/MarketplaceForm.tsx`
- `src/features/marketplace/schema/`
- `src/app/api/marketplace/` routes
- `.planning/phases/12-marketplace-items-admin-page-toolbar-filters-table-bulk-acti/12-UI-SPEC.md`
