# Phase 12 Research

## Decision: extend admin GET in-place

`adminGet` in `src/app/api/marketplace/route.ts` already paginates via `page`/`pageSize` and filters `state_lifecycle`, `listing_category`, `featured_is`. Generated columns `listing_title`, `price_amount`, `updated_at` support server-side search/sort without migration.

## Query mapping

| UI param | DB / query |
|----------|------------|
| `q` | `or(listing_title.ilike, slug.ilike, id.eq if uuid)` |
| `status` (comma) | `.in('state_lifecycle', [...])` |
| `featured` | existing `featured_is` |
| `athlete` | `signing->signers->>0 ilike` |
| `price_min` / `price_max` | `price_amount gte/lte` |
| `sort` | `updated_at`, `listing_title`, `price_amount` |
| `counts` | parallel head-only count queries per lifecycle |

## Bulk operations

New `POST /api/marketplace/bulk` with `{ ids, action: publish|archive|restore|delete }`. Reuse status PATCH logic per id; return `{ updated, failed: [{ id, error }] }`.

## Duplicate

New `POST /api/marketplace/[param]/duplicate` — clone row with new slug suffix `-copy-{timestamp}`, lifecycle `draft`.

## UI patterns

- URL state: `useSearchParams` + `router.replace` (no CrmViewBar — marketplace-specific params).
- Selection/bulk: mirror `LeadsPage` + `useLeadsColumns` checkbox pattern.
- Filters desktop: `Collapsible` inline panel (no `popover` in project); mobile: `Sheet`.
- Table: custom `MarketplaceItemsTable` (checkbox, sticky header, sort) — do not fork `DataTable` internals.

## Risks

- Athlete filter on JSON signer index 0 only — acceptable v1; document in VERIFICATION.
- Cover image `media.hero_id` may be storage path not URL — keep placeholder icon when not HTTP URL.
