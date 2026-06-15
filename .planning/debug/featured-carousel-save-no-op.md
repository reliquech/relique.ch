---
status: resolved
issue: featured-carousel-save-no-op
reported: 2026-06-15
resolved: 2026-06-15
---

# Debug: Carousel Manager save shows success but items stay 0/8

## Symptoms

- User adds item via + in Selection Explorer, clicks Save Changes
- Toast: "Featured items saved successfully"
- Carousel Preview and Live Order remain empty (0/8)
- Item still appears in explorer with + button

## Root cause

`normalizeMarketplaceUpdate()` in `marketplaceUtils.ts` called `MarketplaceUpdateSchema.safeParse(body)` **before** the legacy path.

PATCH body from Featured page:
```json
{ "is_featured": true, "featured_order": 1 }
```

Zod strips unknown keys (`is_featured`, `featured_order`) and `safeParse` **still succeeds** with an empty object. The structured branch runs, `updates.state` is undefined, so `state.featured` is never updated — only `updated_at` changes.

API returns 200 → toast success → refetch shows `is_featured: false`.

## Fix

1. Use `MarketplaceUpdateSchema.strict().safeParse(body)` so legacy bodies fall through to `LegacyMarketplaceItemSchema` path.
2. Parse JSONB row fields with `parseRowJson()` before merging.
3. Harden `mergeFeatured()` for missing existing + explicit `null` order on unfeature.

## Files changed

- `src/app/api/marketplace/marketplaceUtils.ts`
- `src/features/marketplace/services/marketplaceService.ts` (fallback read `featured_is` column)

## Verify

1. `/admin/featured` → add item → Save Changes
2. Live Order shows 1/8; preview strip shows card
3. Reload page — featured state persists
