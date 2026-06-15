---
phase: 12
slug: marketplace-items-admin-page-toolbar-filters-table-bulk-acti
status: approved
shadcn_initialized: true
preset: relique-dark-admin-crm
created: 2026-06-15
impeccable_register: product
---

# Phase 12 — UI Design Contract

> Marketplace Items management (`/admin/items`). Dark admin CRM register — workflow-first, trust-legible status, no marketplace clutter.

**Scope:** This page only. Preserve existing dark portal identity (`bg-surface`, `text-white`, `border-border`, `bg-primary` CTA, `getStatusPill`).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (existing — **do not edit** `components/ui/**`) |
| Preset | Relique dark admin CRM (matches Leads/Items today) |
| Component library | Radix via shadcn wrappers under `components/app/` or `components/admin/marketplace/` |
| Icon library | `lucide-react` (named imports only) |
| Font | Work Sans 500 body; 600–700 headings — **no Zapf Renaissance on this page** |
| Table | Extend `ResponsiveDataTable` / custom `MarketplaceItemsTable` — **no new table library** |

### Wrapper components to create (suggested)

| Component | Path | Wraps |
|-----------|------|-------|
| `MarketplaceItemsToolbar` | `components/admin/marketplace/items/MarketplaceItemsToolbar.tsx` | search, tabs, filter trigger, sort, clear, Add Item |
| `MarketplaceItemsFilters` | `components/admin/marketplace/items/MarketplaceItemsFilters.tsx` | popover (desktop) / sheet (mobile) |
| `MarketplaceItemsFilterChips` | `components/admin/marketplace/items/MarkplaceItemsFilterChips.tsx` | removable active filters |
| `MarketplaceItemsBulkBar` | `components/admin/marketplace/items/MarketplaceItemsBulkBar.tsx` | sticky selection toolbar |
| `MarketplaceItemsTable` | `components/admin/marketplace/items/MarketplaceItemsTable.tsx` | table + density + sort headers |
| `MarketplaceItemRowMenu` | `components/admin/marketplace/items/MarketplaceItemRowMenu.tsx` | `@/components/ui/dropdown-menu` wrapper |

---

## Page Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ Page title row: "Marketplace Items" + primary "Add Item"    │
├─────────────────────────────────────────────────────────────┤
│ Toolbar: [Search…………] [All|Draft|Pub|Arch] [Filters▾] [Sort▾] [Clear] │
├─────────────────────────────────────────────────────────────┤
│ Filter chips: [Status: draft ×] [Featured: Yes ×] …         │
├─────────────────────────────────────────────────────────────┤
│ ┌─ sticky bulk bar (when selection > 0) ─────────────────┐ │
│ │ 3 selected · Publish · Archive · Restore · Delete      │ │
│ └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Table card: bg-surface border-border rounded-xl             │
│ │ ☐ │ thumb │ Title │ Athlete │ Status │ ★ │ Price │ Updated │ ⋮ │ │
├─────────────────────────────────────────────────────────────┤
│ Pagination: [← Prev] Page 2 of 12 [Next →]  Rows: [25▾]   │
└─────────────────────────────────────────────────────────────┘
```

**Z-index scale (page-local):**

| Layer | z-index | Element |
|-------|---------|---------|
| sticky table header | `z-10` | thead |
| bulk toolbar | `z-20` | fixed/sticky below toolbar |
| filter popover | `z-50` | Radix popover |
| mobile filter sheet | `z-50` | Radix sheet |
| row menu | `z-50` | dropdown |
| confirm dialog | `z-50` | existing `DeleteConfirmModal` / dialog wrapper |

---

## Spacing Scale

Use existing Tailwind + 4px grid. **No new tokens.**

| Token | Value | Usage on this page |
|-------|-------|-------------------|
| xs | 4px | icon–label gap in pills |
| sm | 8px | chip gap, toolbar icon padding |
| md | 16px | toolbar padding, cell padding (comfortable) |
| lg | 24px | page vertical rhythm (`space-y-6`) |
| xl | 32px | table card padding |

**Density:**

| Mode | Row min-height | Cell py | Thumbnail |
|------|----------------|---------|-----------|
| Comfortable | 56px | `py-3` | 40×40px |
| Compact | 44px | `py-2` | 32×32px |

Persist density in URL: `?density=comfortable|compact` (default `comfortable`).

---

## Typography

| Role | Size | Weight | Line height | Class pattern |
|------|------|--------|-------------|---------------|
| Page title | 30px | 700 | 1.2 | `text-3xl font-bold tracking-tight text-white` (keep current) |
| Table header | 12px | 600 | 1.25 | `text-xs font-semibold uppercase tracking-wide text-gray-400` |
| Cell primary | 14px | 600 | 1.4 | `text-sm font-semibold text-white` (title) |
| Cell secondary | 14px | 500 | 1.4 | `text-sm text-gray-300` |
| Meta / tab count | 12px | 500 | 1.3 | `text-xs text-gray-500` |
| Price | 14px | 700 | 1.2 | `text-sm font-mono font-bold text-gray-300` (keep current) |

**Rules:** No uppercase tracked eyebrows on section headers. Status pills keep existing `getStatusPill` typography (10px uppercase — domain-specific, already shipped).

---

## Color

Dark admin CRM — **Restrained** accent (product register).

| Role | Token / hex | Usage |
|------|-------------|-------|
| Page canvas | inherits portal gradient | no new bg |
| Table surface | `bg-surface` (#121212) | table card |
| Border | `border-border` (#333 area) | table, inputs, chips |
| Primary text | `text-white` | titles, toolbar |
| Secondary text | `text-gray-300` / `text-gray-400` | athlete, headers, placeholders |
| Primary CTA | `bg-primary` + `text-white` | **Add Item only** in toolbar |
| Secondary actions | `bg-white/5 border border-border` | filter, sort, bulk secondary |
| Accent highlight | `text-accent` / `fill-accent` | featured star (filled) |
| Success | `text-success` / `border-success/30` | published pill |
| Warning | `text-warning` | — |
| Destructive | `text-destructive` / `bg-destructive/10` | delete, archive pill, bulk delete |
| Selected row | `bg-primary/10` + `ring-1 ring-primary/30` | multi-select |
| Row hover | `bg-white/5` | default hover |
| Focus ring | `ring-2 ring-primary ring-offset-2 ring-offset-surface` | keyboard focus |

**Accent reserved for:** Add Item CTA, primary sort/filter focus rings, selected row highlight, featured star — **not** decorative borders or full-row color washes.

**Banned on this page:** gradient text, glassmorphism, `border-left` accent stripes, purple SaaS gradients, card grids for list data.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Page title | Marketplace Items |
| Primary CTA | Add Item |
| Search placeholder | Search by title, athlete, or ID |
| Status tabs | All · Draft · Published · Archived (show count in parentheses, e.g. `Draft (12)`) |
| Filters button | Filters |
| Sort button | Sort |
| Clear filters | Clear all |
| Empty (no items ever) | **No marketplace items yet** — Create your first listing to appear on the public marketplace. **CTA:** Add Item |
| Empty (filtered) | **No items match your filters** — Try adjusting search or filters, or **Clear all** to reset. |
| Error | **Couldn't load items** — Check your connection and try again. **Action:** Retry |
| Loading | (skeleton only — no spinner in table body) |
| Bulk bar | `{n} selected` |
| Bulk Publish | Publish |
| Bulk Archive | Archive |
| Bulk Restore | Restore to draft |
| Bulk Delete | Delete |
| Delete confirm title | Delete {n} item(s)? |
| Delete confirm body | This cannot be undone. Items will be removed from the marketplace. |
| Archive confirm | Archive {n} item(s)? — They will be hidden from the public marketplace. |
| Partial failure toast | Updated {ok} of {total} items. {failed} failed — show item titles or IDs in description. |
| Undo toast (delete) | Item deleted — **Undo** (if soft-delete or restore API supports) |

Row menu labels: Edit · Preview · Duplicate · Publish · Unpublish · Archive · Restore · Delete

---

## Interaction Specifications

### 1. Toolbar

- **Search:** 300ms debounce (`useDebounce`); icon left; min width 256px desktop, full width mobile stack.
- **Status tabs:** underline or pill segment control; active tab `text-white border-b-2 border-primary`; inactive `text-gray-400 hover:text-white`. Counts from API `counts` object.
- **Filters:** `Popover` ≥768px; `Sheet` side=right &lt;768px. Trigger shows badge dot when filters active.
- **Sort:** dropdown: Updated (newest/oldest), Title (A–Z/Z–A), Price (high/low). Show chevron direction on active column header **and** in sort dropdown label.
- **Clear all:** text button `text-gray-400 hover:text-white`; resets URL params except `page` → 1.

### 2. Filter chips

- Below toolbar when any filter active (excluding tab-only status if tab encodes same param).
- Chip: `bg-white/5 border border-border rounded-full px-3 py-1 text-xs text-gray-300`; × button min 24×24 hit area.
- Removing chip updates URL + refetches.

### 3. URL query contract

| Param | Values | Default |
|-------|--------|---------|
| `q` | string | — |
| `status` | `draft,published,archived` (comma multi) OR tab maps to single | all |
| `featured` | `true` \| `false` | all |
| `athlete` | string slug or name | — |
| `price_min` | number | — |
| `price_max` | number | — |
| `sort` | `updated_at` \| `title` \| `price_usd` | `updated_at` |
| `order` | `asc` \| `desc` | `desc` |
| `page` | number | 1 |
| `pageSize` | 10 \| 25 \| 50 \| 100 | 25 |
| `density` | comfortable \| compact | comfortable |

Use `useSearchParams` + `router.replace` (shallow) — mirror `CrmViewBar` pattern.

### 4. Table

| Column | Width | Sortable | Notes |
|--------|-------|----------|-------|
| Checkbox | 40px | — | `stopPropagation` |
| Thumbnail | 48px | — | `cover_image_url` or placeholder icon; `object-cover rounded` |
| Title | flex | yes | truncate + `title` tooltip; row click → edit |
| Athlete | 140px | yes | truncate |
| Status | 120px | — | `getStatusPill` |
| Featured | 64px | — | Star icon; `stopPropagation` if toggling later |
| Price | 100px | yes | USD monospace |
| Updated | 120px | yes | `toLocaleDateString`; `suppressHydrationWarning` on time if needed |
| Actions | 48px | — | `⋯` menu; `stopPropagation` |

- **Sticky header:** `thead sticky top-0 bg-surface z-10 shadow-[0_1px_0_0_var(--border)]`
- **Row click:** `cursor-pointer` → `/admin/marketplace/edit/[id]`
- **Keyboard:** row `tabIndex={0}`; Enter opens edit; Space toggles checkbox when focused on row checkbox column only.

### 5. Bulk toolbar

- Appears when `selectedIds.length > 0`; `sticky top-0` below page header or above table.
- Background: `bg-surface border border-border rounded-lg px-4 py-2 shadow-lg`
- **Action rules:**
  - Publish: enabled if all selected are `draft`
  - Archive: enabled if all selected are `published`
  - Restore: enabled if all selected are `archived` → sets `draft`
  - Delete: enabled if role allows; always confirm
  - Mixed statuses: disable lifecycle buttons; show tooltip "Select items with the same status"
- On filter/search change: **clear selection** + toast info "Selection cleared because filters changed" (explicit, not silent).

### 6. Row overflow menu

- Wrapper around `@/components/ui/dropdown-menu` — do not edit ui file.
- Trigger: `Button variant="ghost" size="icon"` min 24×24 (`h-8 w-8`).
- Preview: open `/marketplace/[slug]` in new tab if slug exists; else disabled with tooltip "No public slug".
- Duplicate: creates draft copy via API — loading item on menu action.

### 7. Pagination

- Bottom centered; Prev/Next + "Page X of Y".
- Page size select right-aligned.
- Disabled states at bounds.

### 8. Loading / empty / error

- **Loading:** 8–10 skeleton rows matching density; pulse `bg-white/5`; no full-page spinner.
- **Error:** banner `bg-destructive/10 border border-destructive/30 text-destructive` + Retry button (secondary).
- **Reduced motion:** skeleton pulse → static `bg-white/5` blocks.

---

## Responsive

| Breakpoint | Layout |
|------------|--------|
| ≥1024px | Full toolbar inline; table all columns |
| 768–1023px | Hide Updated column; toolbar wraps second row |
| &lt;768px | Stack toolbar; filters → sheet; table → `DataTableCards` pattern from `ResponsiveDataTable` with checkbox + menu on card |

---

## Accessibility (WCAG 2.1 AA)

- All interactive targets ≥24×24px (bulk icon buttons ≥32px preferred).
- Table: `<table>` with `<th scope="col">`; sort buttons `aria-sort="ascending|descending|none"`.
- Tabs: `role="tablist"` / `role="tab"` / `aria-selected`.
- Bulk bar: `aria-live="polite"` announces selection count.
- Confirm dialogs: focus trap via existing modal; destructive uses `destructive` button variant wrapper.
- Contrast: body text `text-gray-300` on `bg-surface` — verify ≥4.5:1; bump to `text-gray-200` if audit fails.

---

## Motion

- Transitions 150–200ms `ease-out` on hover/focus only.
- Bulk bar enter: `animate-in slide-in-from-top-2 duration-200`.
- `@media (prefers-reduced-motion: reduce)`: instant state changes, no slide.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `dropdown-menu`, `popover`, `sheet`, `button`, `checkbox`, `select`, `tooltip`, `skeleton` | Wrappers only — no edits to `components/ui/**` |
| none third-party | — | — |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — all states have problem + action copy
- [x] Dimension 2 Visuals: PASS — page anatomy, components, states defined; dark identity preserved
- [x] Dimension 3 Color: PASS — restrained accent; semantic status via existing pills
- [x] Dimension 4 Typography: PASS — Work Sans scale; no display font on admin table
- [x] Dimension 5 Spacing: PASS — 4px grid; comfortable/compact density declared
- [x] Dimension 6 Registry Safety: PASS — shadcn wrapper-only pattern

**Approval:** approved 2026-06-15

## UI-SPEC COMPLETE
