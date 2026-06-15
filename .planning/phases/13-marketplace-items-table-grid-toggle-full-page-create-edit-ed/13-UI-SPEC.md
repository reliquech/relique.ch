---
phase: 13
slug: marketplace-items-table-grid-toggle-full-page-create-edit-ed
status: approved
shadcn_initialized: true
preset: relique-dark-admin-crm
created: 2026-06-15
impeccable_register: product
extends:
  - .planning/phases/12-marketplace-items-admin-page-toolbar-filters-table-bulk-acti/12-UI-SPEC.md
---

# Phase 13 - UI Design Contract

> Marketplace Items list view toggle, grid cards, full-page create/edit editor, media workflow, autosave, and production UX polish. Product register: design serves fast ops work, preserves trust, and keeps the admin dark CRM identity.

**Scope:** `/admin/items`, `/admin/marketplace/new`, `/admin/marketplace/edit/[id]` only. Extend Phase 12 list foundations; do not redesign unrelated admin pages.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui existing primitives via wrappers only |
| Preset | Relique dark admin CRM |
| Component library | Radix/shadcn wrappers under `components/admin/marketplace/` |
| Icon library | `lucide-react` named imports only |
| Font | Work Sans only for admin; no Zapf Renaissance in list/editor |
| Register | Product UI, restrained accent, task-first density |
| Table/Grid | Custom wrappers; no new table library |
| Drag/drop | Use existing `@dnd-kit/core` / `@dnd-kit/utilities` only if needed for reorder |

### Identity Rules

- Preserve `bg-surface`, `text-white`, `border-border`, `bg-primary`, `text-gray-300`, `text-gray-400`.
- Depth comes from tonal surfaces, borders, and sticky layering. Avoid decorative shadows.
- `bg-primary` is reserved for primary trust actions: Add Item, Save Draft, Publish, Update.
- Admin labels, buttons, and table/grid controls use Work Sans. No display font, no public-site uppercase CTA grammar except tiny status pills already shipped.
- Do not edit `components/ui/**`.

---

## Component Boundaries

### List Extensions

| Component | Path | Responsibility |
|-----------|------|----------------|
| `MarketplaceItemsViewToggle` | `src/components/admin/marketplace/items/MarketplaceItemsViewToggle.tsx` | Segmented Table/Grid control |
| `MarketplaceItemsGrid` | `src/components/admin/marketplace/items/MarketplaceItemsGrid.tsx` | Responsive card grid with selection and row actions |
| `MarketplaceItemsGridCard` | `src/components/admin/marketplace/items/MarketplaceItemsGridCard.tsx` | Single item card |
| `MarketplaceItemsCountSummary` | `src/components/admin/marketplace/items/MarketplaceItemsCountSummary.tsx` | `{filtered} of {total}` and active filter summary |
| `MarketplaceTypedDeleteDialog` | `src/components/admin/marketplace/items/MarketplaceTypedDeleteDialog.tsx` | Type item title/name to confirm permanent delete |
| `useMarketplaceItemsView` | `src/features/marketplace/hooks/useMarketplaceItemsView.ts` | localStorage view preference with SSR/mobile fallback |
| extend `MarketplaceItemsToolbar` | existing | Add toggle placement and count summary slot |
| extend `ItemsPage` | existing | Shared selection across table/grid and state preservation |

### Editor Refactor

| Component | Path | Responsibility |
|-----------|------|----------------|
| `MarketplaceEditorPage` | `src/components/admin/marketplace/editor/MarketplaceEditorPage.tsx` | Full-page editor shell and orchestration |
| `MarketplaceEditorSectionNav` | `src/components/admin/marketplace/editor/MarketplaceEditorSectionNav.tsx` | Desktop section list + validation markers |
| `MarketplaceEditorActionBar` | `src/components/admin/marketplace/editor/MarketplaceEditorActionBar.tsx` | Sticky Save Draft, Preview, Publish/Update, autosave state |
| `MarketplaceEditorErrorSummary` | `src/components/admin/marketplace/editor/MarketplaceEditorErrorSummary.tsx` | Linked validation summary at top |
| `MarketplacePublishConfirmDialog` | `src/components/admin/marketplace/editor/MarketplacePublishConfirmDialog.tsx` | Publish/update confirmation with warnings |
| `useMarketplaceAutosave` | `src/features/marketplace/hooks/useMarketplaceAutosave.ts` | Debounced autosave, stale guard, retry |
| `useUnsavedChangesGuard` | `src/features/marketplace/hooks/useUnsavedChangesGuard.ts` | reload/tab-close guard and internal navigation guard |
| `useOnlineStatus` | `src/features/marketplace/hooks/useOnlineStatus.ts` | offline/online state for list and editor |

### Editor Sections

| Section | Path | Contents |
|---------|------|----------|
| Basic Information | `editor/sections/BasicInformationSection.tsx` | title, category, short/full description, athlete/signed_by |
| Media | `editor/sections/MediaSection.tsx` | drag/drop, upload queue, reorder, primary, alt text, retry/remove |
| Pricing | `editor/sections/PricingSection.tsx` | price, currency, commission |
| Ownership | `editor/sections/OwnershipSection.tsx` | seller, seller rating, seller verified, provenance |
| Publishing | `editor/sections/PublishingSection.tsx` | status, featured, featured order, authentication fields |
| SEO | `editor/sections/SeoSection.tsx` | slug preview, public preview URL, meta/title guidance if supported |

Keep each file under 300 lines. Push shared field chrome into `editor/EditorField.tsx` or similar if needed.

---

## Page Anatomy

### Items List

```text
Page title row: Marketplace Items + Add Item
Toolbar row: search | status tabs | Table/Grid toggle | Filters | Sort | Clear all
Count row: Showing 25 of 143 items - 3 filters active
Filter chips
Bulk bar when selection > 0
View body:
  Table view: existing Phase 12 table
  Grid view: responsive item cards
Pagination
```

### Create/Edit Editor

```text
Header: New Item / Edit Item + breadcrumb + autosave status
Error summary when validation fails
Two-column desktop shell:
  Left sticky section nav
  Main editor sections:
    Basic Information
    Media
    Pricing
    Ownership
    Publishing
    SEO
Sticky bottom action bar:
  Back to Items | Save Draft | Preview | Publish / Update
```

Mobile editor uses a single column and collapsible sections. The sticky action bar remains bottom-fixed but compresses to two primary actions plus overflow menu if needed.

---

## Spacing Scale

Use existing Tailwind and 4px grid. No new tokens.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | icon gaps, checkbox-to-label gap |
| sm | 8px | card metadata rows, chip gaps |
| md | 16px | form field gaps, grid card padding |
| lg | 24px | section padding, toolbar row gaps |
| xl | 32px | desktop editor column gap, major page rhythm |
| 2xl | 48px | editor section separation |

### Fixed Dimensions

| Element | Dimension |
|---------|-----------|
| View toggle button | `h-9`, min width 84px |
| Grid card image | `aspect-[4/3]`, fixed within card |
| Grid card min width | 240px |
| Editor section nav | 220-260px desktop |
| Sticky action bar | min height 72px desktop, 88px mobile |
| Upload tile | 120px min height, `aspect-square` for thumbnails |
| Icon buttons | `h-8 w-8` minimum |

Avoid layout shift: table/grid bodies occupy stable containers; loading skeletons match final dimensions.

---

## Typography

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Page title | 30px | 700 | 1.2 | existing admin title |
| Section title | 18px | 700 | 1.3 | editor sections |
| Subsection label | 14px | 600 | 1.3 | field groups |
| Body/cell | 14px | 500 | 1.4 | table, cards, form body |
| Helper text | 12px | 500 | 1.35 | validation/help |
| Status/meta | 12px | 600 | 1.25 | card metadata, autosave |
| Price | 14px | 700 | 1.2 | monospace price display |

Rules:

- No fluid type in admin surfaces.
- No display font in buttons, labels, fields, cards, or editor.
- Use `text-wrap: balance` only for editor section headings if they wrap.
- Truncate grid titles at two lines and table titles at one line with `title` tooltip.

---

## Color

Dark admin CRM, restrained accent.

| Role | Value / Token | Usage |
|------|---------------|-------|
| Canvas | inherited admin canvas | page background |
| Surface | `bg-surface` / `#121212` | list cards, editor sections |
| Raised surface | `bg-white/5` | secondary controls, upload tiles |
| Border | `border-border` / `#333333` | containers, cards, inputs |
| Primary text | `text-white` | headings, primary field labels |
| Secondary text | `text-gray-300` | descriptions, cell secondary |
| Muted text | `text-gray-400` | helper text, inactive controls |
| Primary | `bg-primary text-white` | Add Item, Save Draft, Publish/Update |
| Selected | `bg-primary/10 ring-1 ring-primary/30` | selected rows/cards |
| Focus | `ring-2 ring-primary ring-offset-2 ring-offset-surface` | keyboard focus |
| Success | `text-success`, `bg-success/10` | saved, uploaded, published |
| Warning | `text-warning`, `bg-warning/10` | publish warnings, autosave retry |
| Destructive | `text-destructive`, `bg-destructive/10` | delete, upload failures |

Accent reserved for:

- Active Table/Grid toggle
- Primary save/publish actions
- Selected row/card state
- Focus rings
- Featured star
- Autosave success indicator

Banned:

- Gradient text
- Glassmorphism
- Colored side-stripe borders
- Purple SaaS gradients
- Heavy shadows on cards/modals
- Uppercase tracked labels as decorative section scaffolding

---

## List View Contract

### Table/Grid Toggle

- Location: toolbar row after status tabs on desktop; after search on mobile.
- Control: segmented buttons with icons (`Table2`, `Grid3X3`) and text labels.
- Values: `table`, `grid`.
- localStorage key: `relique.admin.marketplace.itemsView`.
- SSR fallback: render table-safe neutral state until mounted, then resolve preference.
- Default:
  - Desktop/tablet: saved preference or `table`.
  - Mobile `<768px`: saved preference or `grid`.
- Switching views must preserve URL filters, pagination, sort, selected IDs, and focused page state.
- Use 150-200ms opacity/transform transition; reduced motion uses instant swap.

### Grid Cards

Each card shows:

- Selection checkbox top-left; stops propagation.
- Image or placeholder icon; primary image aspect stable.
- Title (two-line clamp), athlete, price, status pill.
- Featured star if `is_featured`.
- Updated date.
- Overflow menu with same row actions as table.
- Click card body -> edit page.

Card states:

| State | Visual |
|-------|--------|
| Default | `bg-surface border border-border` |
| Hover | `bg-white/5` |
| Selected | `bg-primary/10 ring-1 ring-primary/30` |
| Focus | visible `ring-2 ring-primary` |
| Disabled/loading | skeleton blocks matching image/title/meta |

Grid layout:

- `<640px`: 1 column
- `640-1023px`: 2 columns
- `1024-1279px`: 3 columns
- `1280px+`: 4 columns, allow 5 only if container width supports 240px min
- Use `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` with max-width constraints if simpler.

### Counts

Show count line near toolbar:

- `Showing {visible} of {filtered} filtered items`
- If no filters: `Showing {visible} of {total} items`
- If API only has current `total`, use `total` as filtered count and lifecycle `counts.all` as total count.
- Keep text low-emphasis: `text-sm text-gray-400`.

---

## Editor Contract

### Full-Page Shell

- New page title: `Create marketplace item`
- Edit page title: `Edit marketplace item`
- Breadcrumbs remain in admin header.
- Editor body max width: `max-w-7xl`.
- Desktop: left section nav + main content grid.
- Section containers: `bg-surface border border-border rounded-lg p-5 md:p-6`.
- No nested cards inside section cards. Field groups are unframed or use subtle `border border-border` only when grouping repeated media items.

### Section Navigation

Desktop sticky nav:

- Shows six sections.
- Active section highlighted with `text-white bg-white/5`.
- Sections with errors show destructive dot and count.
- Sections with unsaved changes show muted dot.
- Click scrolls to section and moves focus to section heading.

Mobile:

- Sections collapse with shadcn `Collapsible` or `Accordion`.
- Open first section by default for new item.
- If validation fails, open sections containing errors.

### Field Chrome

Each field:

- Label above input, `text-sm font-semibold text-white`.
- Optional helper below, `text-xs text-gray-400`.
- Error below, `text-xs text-destructive`, plus `aria-describedby`.
- Required marker is text `Required`, not only a red star.
- Inputs keep admin shape: border, dark surface, 40px min height, focus ring.

### Error Summary

Appears after failed submit or publish attempt:

- Heading: `Review required fields`
- Body: `Fix the highlighted fields before publishing this item.`
- Links to first error in each section.
- Focus moves to summary after validation failure.

### Autosave

States:

| State | Copy | Visual |
|-------|------|--------|
| idle clean | `All changes saved` | success text |
| dirty | `Unsaved changes` | muted/warning dot |
| saving | `Saving...` | subtle spinner or pulsing dot |
| saved | `Saved just now` | success |
| failed | `Autosave failed` + Retry | destructive/warning |
| offline | `Offline - changes saved locally until reconnect` | warning |

Rules:

- Debounce 800-1200ms after inactivity.
- Use monotonic request id/version; ignore stale responses.
- Do not autosave while uploads are in progress unless media state is stable.
- New items: create draft first, then subsequent autosaves patch the assigned id.
- Edit items: patch existing id.
- Failed autosave never clears dirty state.
- Manual Save Draft flushes pending autosave first.

### Unsaved Changes Guard

- Browser reload/tab close: `beforeunload` only when dirty and not successfully saved.
- Internal navigation: show confirm dialog with:
  - `Leave without saving`
  - `Stay on page`
  - `Save draft and leave` when online
- Do not block navigation if only clean autosave state remains.

### Sticky Action Bar

Desktop:

- Left: back/cancel affordance.
- Middle: autosave status.
- Right: Save Draft, Preview, Publish/Update.

Mobile:

- Bottom sticky, two rows if needed.
- Primary action full-width or at least 44px height.

Action rules:

- Save Draft enabled when dirty, failed autosave, or new item.
- Preview disabled until item has slug/id; tooltip/copy: `Save a draft before previewing.`
- Publish disabled while uploading, saving, or offline.
- Update replaces Publish for existing published items.

### Publish Confirmation

Dialog title:

- New/draft: `Publish this marketplace item?`
- Existing published: `Update published item?`

Body:

- `This item will be visible on the public marketplace. Review warnings before continuing.`

Warnings list:

- Missing authentication certificate
- Missing provenance
- No primary image
- Price is zero
- Seller not verified
- Unsaved changes pending

Actions:

- `Cancel`
- `Save as draft`
- `Publish item` / `Update item`

Publishing must never silently proceed with unresolved upload errors.

---

## Media Workflow

### Upload Zone

- Drag/drop zone at top of Media section.
- Copy: `Drop images here or choose files`
- Helper: `JPG, PNG, or WebP. Up to 8MB each.`
- Keyboard accessible file picker button.
- While dragging: `border-primary bg-primary/10`.
- Offline: disabled zone with `Uploads unavailable while offline`.

### Media Items

Each item shows:

- Thumbnail
- Upload progress or status
- Alt text input
- Primary image radio/button
- Reorder handle
- Retry on failed uploads
- Remove button

Rules:

- Primary image is required for publish.
- Reorder affects `images` order and does not reset alt text.
- Removing the primary image promotes the first remaining image only after confirmation, or asks user to choose a new primary.
- Retry keeps the same local preview when possible.
- Upload failure uses inline row error plus toast; not toast-only.

### Drag/Reorder

- Use `@dnd-kit` if implementing drag reorder.
- Keyboard reorder alternative required: Move up / Move down buttons in overflow or visible controls.
- Reduced motion disables animated reorder transforms.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| List view toggle | Table / Grid |
| Count no filters | Showing {visible} of {total} items |
| Count filtered | Showing {visible} of {filtered} filtered items |
| Grid empty | No marketplace items yet |
| Grid no results | No items match your filters |
| Permission denied | You do not have permission to edit marketplace items |
| Offline list | You are offline. Showing the last loaded items if available. |
| Editor new title | Create marketplace item |
| Editor edit title | Edit marketplace item |
| Save draft | Save draft |
| Publish | Publish item |
| Update | Update item |
| Preview disabled | Save a draft before previewing. |
| Error summary heading | Review required fields |
| Error summary body | Fix the highlighted fields before publishing this item. |
| Autosave saving | Saving... |
| Autosave saved | Saved just now |
| Autosave failed | Autosave failed |
| Offline editor | Offline - changes saved locally until reconnect |
| Publish confirm title | Publish this marketplace item? |
| Delete confirm title | Permanently delete this item? |
| Delete confirm body | Type "{item title}" to confirm. This cannot be undone. |
| Delete confirm action | Delete permanently |

Tone: precise and operational. No hype copy, no marketing claims inside admin workflow.

---

## State And Interaction Rules

### Selection

- `selectedIds` is shared between table and grid.
- Selection survives table/grid switching.
- Selection clears on filter/search/sort/page changes with toast from Phase 12.
- Bulk bar remains view-agnostic.

### Delete

- Single-item delete uses typed confirmation with exact item title.
- Bulk delete uses typed confirmation only when one item selected; for multiple, require typing `DELETE`.
- Undo only appears for reversible archive/restore, not hard delete.

### Offline/Error/Permission

- Offline banner appears above toolbar/editor sections.
- Permission denied state replaces mutating controls for viewers:
  - List visible
  - Add Item hidden/disabled
  - Bulk actions hidden
  - Row destructive/lifecycle actions hidden
  - Editor readonly or blocked with clear copy
- API error state includes Retry and preserves current URL state.

---

## Responsive

| Breakpoint | List | Editor |
|------------|------|--------|
| `<640px` | Grid default; toolbar stacks; filters use sheet; cards 1 column | Single column; collapsible sections; bottom action bar |
| `640-1023px` | Grid 2 columns; table available with horizontal scroll | Single column or narrow nav hidden |
| `1024-1279px` | Table or grid 3 columns | Two-column shell with section nav |
| `1280px+` | Grid 4-5 columns | Full editor shell with sticky nav and action bar |

Do not scale font size with viewport width. Use layout changes, not fluid type, for responsiveness.

---

## Accessibility

- WCAG 2.1 AA.
- All controls minimum 24x24px, primary mobile actions at least 44px height.
- Segmented toggle uses `role="tablist"` or radio group semantics with clear `aria-pressed`/selected state.
- Grid is a list of cards; cards have accessible names from item title.
- Card checkbox labels include item title.
- Menus and dialogs use Radix/shadcn focus management.
- Restore focus to triggering control after dialogs close.
- Upload dropzone has button fallback and keyboard access.
- Upload progress has text status, not only a bar.
- Autosave status uses `aria-live="polite"`.
- Error summary receives focus on failed submit.
- Section nav marks current section with `aria-current="true"`.
- Publish/delete dialogs describe consequences and warnings.

---

## Motion

- Product motion only: view switch, bulk/action bar entrance, upload progress, collapsible sections.
- Durations 150-220ms, ease-out.
- No page-load choreography.
- `prefers-reduced-motion: reduce` disables view transition transforms and reorder animation; state changes remain instant or crossfade.
- Never hide content by default waiting for animation.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | button, dropdown-menu, dialog, sheet, collapsible/accordion, checkbox, select, tooltip, skeleton, progress if present | Wrappers only; do not edit `components/ui/**` |
| existing dependencies | `@dnd-kit/core`, `@dnd-kit/utilities` | Use only if already installed; no new DnD library |
| none third-party | new table library, new form library, new upload library | Not allowed |

---

## Implementation Guardrails For Planner

- Plan list work before editor work only where shared state/components are needed.
- Preserve Phase 12 API contract. Add optional fields only; do not break existing list consumers.
- Keep `MarketplaceFormData` payload compatibility unless an API extension is explicitly planned.
- Prefer refactoring existing form sections into the six-section IA over rewriting submit mapping from scratch.
- Add wrappers for typed delete, publish confirm, autosave status, and media queue.
- Include focused verification tasks: table/grid switch state, mobile default, autosave stale guard, unsaved guard, media reorder/primary/alt, typed delete, permission/offline states.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS - state, dialog, autosave, delete, empty, offline, and permission copy specified.
- [x] Dimension 2 Visuals: PASS - list/grid/editor anatomy, responsive structure, and component boundaries defined.
- [x] Dimension 3 Color: PASS - restrained dark admin palette, semantic states, and accent reservations documented.
- [x] Dimension 4 Typography: PASS - fixed Work Sans admin scale; display/public typography banned from editor/list UI.
- [x] Dimension 5 Spacing: PASS - 4px grid, stable dimensions, and responsive layout constraints specified.
- [x] Dimension 6 Registry Safety: PASS - shadcn wrapper-only pattern, no new table/form/upload libraries.

**Approval:** approved 2026-06-15

## UI-SPEC COMPLETE

