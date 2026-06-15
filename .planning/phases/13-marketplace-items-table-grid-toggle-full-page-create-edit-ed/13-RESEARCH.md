---
phase: 13-marketplace-items-table-grid-toggle-full-page-create-edit-ed
status: complete
created: 2026-06-15
source: inline-plan-phase
---

# Phase 13 Research

## Objective

Research how to plan Phase 13 well: extend the Phase 12 Marketplace Items admin list with a Table/Grid toggle and rebuild create/edit into a production-grade full-page editor while preserving APIs, routes, dark admin visual identity, and shadcn wrapper rules.

## Current Architecture

### List Foundation

- `/admin/items` routes to `src/components/admin/marketplace/pages/ItemsPage.tsx`.
- Phase 12 list state is URL-backed through `useMarketplaceItemsUrl` and fetched through `useMarketplaceItemsQuery`.
- `MarketplaceItemsTable`, `MarketplaceItemsBulkBar`, toolbar, filters, chips, pagination, and row menu are already split under `src/components/admin/marketplace/items/`.
- Selection currently lives in `ItemsPage` as `selectedIds`, which is the right seam for sharing selection between Table and Grid.
- Counts available today:
  - `data.total` = filtered total for current query.
  - `data.counts.all` = global lifecycle total.
  - `data.items.length` = visible count on current page.

### Editor Foundation

- New page: `src/components/admin/marketplace/pages/NewMarketplacePage.tsx`.
- Edit page: `src/components/admin/marketplace/pages/EditMarketplacePage.tsx`.
- Shared form: `src/components/admin/marketplace/MarketplaceForm.tsx`.
- Current form is a compact two-column form with sections:
  - `BasicInfoSection`
  - `MarketplaceImageSection`
  - `AthleteAuthSection`
  - `SellerInfoSection`
  - `ConditionProvenanceSection`
  - `StatusSettingsSection`
- Form schema lives at `src/features/marketplace/schema.ts`.
- Image upload state lives in `useMarketplaceFormImages`, which already handles upload, temporary path tracking, cleanup, and finalization.
- Temp upload lifecycle uses `/api/marketplace/upload`, `/api/marketplace/upload/finalize`, and `/api/marketplace/upload/cleanup`.

### API Compatibility

- Preserve existing routes:
  - `/admin/items`
  - `/admin/marketplace/new`
  - `/admin/marketplace/edit/[id]`
  - `/api/marketplace`
  - `/api/marketplace/[param]`
  - `/api/marketplace/bulk`
  - `/api/marketplace/[param]/duplicate`
  - `/api/marketplace/[param]/status`
- `POST /api/marketplace` accepts legacy flat form payloads and structured payloads.
- `PATCH /api/marketplace/[param]` accepts legacy flat updates and structured updates.
- `normalizeMarketplaceCreate` / `normalizeMarketplaceUpdate` map legacy form fields into structured JSON columns.
- The phase should preserve the legacy form payload shape unless a plan explicitly extends the schema and API mapping.

## Implementation Approach

### 1. List View Toggle

Create a small `useMarketplaceItemsView` hook:

- localStorage key: `relique.admin.marketplace.itemsView`
- return `{ view, setView, mounted }`
- SSR guard: default to `"table"` until mounted
- mobile default: if no stored preference and `window.matchMedia("(max-width: 767px)")` matches, default `"grid"`
- accepted values: `"table" | "grid"`
- ignore malformed storage values

Integrate without moving list state out of `ItemsPage`. The query, filters, selected IDs, and pagination stay unchanged.

### 2. Grid Cards

Add grid components that consume the same `items`, `selectedIds`, `onToggleOne`, and `rowActions` contracts as the table:

- `MarketplaceItemsGrid.tsx`: responsive container and empty-safe body.
- `MarketplaceItemsGridCard.tsx`: card rendering and interactions.
- Reuse `MarketplaceItemRowMenu`.
- Reuse `getStatusPill`.
- Card body click routes to edit.
- Checkbox and menu stop propagation.
- Keyboard Enter opens edit.

### 3. List Polish

Add `MarketplaceItemsCountSummary`:

- If filters are active: `Showing {visible} of {filtered} filtered items`
- If no filters: `Showing {visible} of {total} items`
- Compute `total = data.counts?.all ?? data.total`.

Add offline and permission handling:

- `useOnlineStatus` can be shared by list and editor.
- Viewers should see list data but not Add Item, bulk actions, or mutating row actions.
- Existing `useProfile` role check can drive permission UI.

Typed delete should be a wrapper under `components/admin/marketplace/`, not a mutation of shadcn primitives.

### 4. Full-Page Editor

Refactor from `MarketplaceForm` into a full-page editor shell while retaining schema and payload compatibility:

- `MarketplaceEditorPage` owns `react-hook-form`, image/media state, autosave, warnings, dirty state, and submit/publish orchestration.
- New/edit pages become thin wrappers that load/create item data and pass mode/id.
- Existing section components can be migrated into six new IA sections rather than deleted:
  - Basic Information
  - Media
  - Pricing
  - Ownership
  - Publishing
  - SEO
- Keep file size under 300 lines by moving each section and hook to its own file.

### 5. Autosave

Use `react-hook-form` dirty state plus a debounced watcher:

- Debounce 800-1200ms.
- Use `requestSeqRef`; each save captures a sequence number.
- Ignore responses where `seq !== latestSeqRef.current`.
- Do not mark clean on failed or stale responses.
- For new items, first autosave creates a draft via `POST /api/marketplace`; store returned id and switch future saves to `PATCH`.
- For edit items, patch existing id.
- Do not autosave while upload queue has `uploading` items.
- Manual Save Draft flushes current values and cancels pending debounce.

### 6. Unsaved Guard

Use a shared hook:

- `beforeunload` only when dirty and not successfully saved.
- Internal navigation should use an app-level confirmation flow rather than blocking all route changes silently.
- If online, offer `Save draft and leave`.
- If offline, only `Stay on page` / `Leave without saving`.

### 7. Media Workflow

Existing upload code handles upload/finalize/cleanup, but does not yet cover:

- drag/drop zone
- reorder
- alt text
- primary image selection beyond cover/additional split
- retry
- keyboard reorder

Plan should introduce media item metadata locally:

```ts
type MarketplaceMediaItem = {
  id: string;
  file?: File;
  previewUrl?: string;
  url?: string;
  path?: string;
  status: "idle" | "uploading" | "uploaded" | "error";
  error?: string;
  alt: string;
  isPrimary: boolean;
};
```

For v1 compatibility, submit payload can still map:

- primary item URL -> `image`
- non-primary uploaded URLs in order -> `images`

Alt text may remain client-side only unless schema/API support is explicitly extended. If not persisted, the UI must document it as a known backend gap in verification.

## Risks And Pitfalls

- **Payload drift:** Rewriting the editor to structured JSON directly risks breaking `normalizeMarketplaceCreate/Update`. Preserve legacy payload fields first.
- **New item autosave:** Creating drafts too early can leave abandoned draft items. Plans need cleanup or clear draft semantics.
- **Upload and autosave race:** Autosave must not submit half-uploaded media. Use upload status gates.
- **Stale responses:** Without request sequence guards, slow PATCH responses can overwrite current UI state.
- **Permission mismatch:** Existing `PATCH` and `DELETE` routes should be verified for `requireRole`, not just `requireUser`.
- **Grid selection:** If grid has independent state, bulk actions will act on stale selections. Keep `selectedIds` in `ItemsPage`.
- **Full repo lint debt:** Full `npm run lint` currently fails for unrelated repo-wide issues. Phase plans should include targeted lint and still attempt full gates, documenting external blockers.

## Validation Architecture

Verification must sample both stateful list behavior and editor data-loss prevention.

### Static Checks

- Targeted lint on Phase 13 files.
- `npm run check-types`.
- `npm run build`.
- Grep checks:
  - `relique.admin.marketplace.itemsView` exists in `useMarketplaceItemsView`.
  - `MarketplaceItemsGrid` and `MarketplaceItemsGridCard` exist.
  - `MarketplaceEditorActionBar`, `MarketplacePublishConfirmDialog`, `useMarketplaceAutosave`, `useUnsavedChangesGuard`, and `MarketplaceTypedDeleteDialog` exist.
  - `requestSeqRef` or equivalent stale guard exists in autosave hook.
  - `beforeunload` exists in unsaved guard.

### Manual UAT

- Table/Grid switching preserves filters, pagination, selection, and row actions.
- Mobile no-preference default is Grid.
- Grid card checkbox/menu do not trigger row edit.
- New editor can save draft, autosave, publish after confirmation, and warn before leaving dirty state.
- Edit editor loads existing item, updates, previews when slug/id exists, and handles validation summary focus.
- Media drag/drop, progress, reorder, primary image, retry, remove, and upload failure states work.
- Typed delete requires exact item title or `DELETE` for bulk.
- Offline state disables upload/publish and shows retry/queued copy.
- Viewer role cannot mutate items.

### Evidence Files

Execution should produce:

- `13-SUMMARY.md` or per-plan summaries
- `13-VERIFICATION.md`
- If manual checks remain, `13-HUMAN-UAT.md`

## Recommended Plan Waves

1. List view preference/toggle/count summary.
2. Grid cards and shared selection/actions.
3. List polish: typed delete, offline, permission.
4. Editor shell, autosave, unsaved guard.
5. Editor sections and validation summary.
6. Media workflow.
7. Publish/action bar integration.
8. Verification gate.

## RESEARCH COMPLETE

