# Phase 16 Context — Marketplace editor image upload UX

## Root cause (investigated 2026-06-15)

**Primary:** `MarketplaceImageSection.tsx` applies brand **slant clip-path utilities** to upload zones and previews:

| Element | Class | Effect |
|---------|-------|--------|
| Cover preview / dropzone | `clip-path-slant-lg` | Parallelogram crop — looks "nghiêng" |
| Additional thumbnails | `clip-path-slant` | Same skew on square-ish tiles |
| Remove button | `clip-path-slant` | Button clipped with preview |

Defined in `src/app/globals.css`:

```css
.clip-path-slant {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%);
}
.clip-path-slant-lg {
  clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 100%, 24px 100%);
}
```

These are intentional for **public marketing** CTAs (homepage buttons, press cards) — not for admin form image previews.

**Secondary defects:**

- Fixed heights (`h-48`, `h-32`) without `aspect-ratio` → inconsistent boxes vs sibling cards
- `ImageTile` uses `absolute inset-0` img inside clipped container → thin/cropped corners when clip-path cuts diagonally
- No lightbox — thumbnails not clickable to inspect
- Remove button overlaps preview (top-right on skewed clip)
- No drag reorder for additional images
- No retry UI on failed upload (overlay only, no retry action)
- Grid `grid-cols-2 md:grid-cols-4` — missing tablet `3` cols per spec

## Files in scope

| File | Role |
|------|------|
| `src/components/admin/marketplace/MarketplaceImageSection.tsx` | Main UI — **remove clip-path**, new layout/lightbox |
| `src/features/marketplace/hooks/useMarketplaceFormImages.ts` | Upload state, revoke URLs, retry hook surface |
| `src/components/admin/marketplace/MarketplaceForm.tsx` | Wires image section |
| `src/components/admin/marketplace/mapMarketplaceInitialData.ts` | Hydrate existing URLs into `ImageUploadItem[]` |
| **New** `src/components/admin/marketplace/images/*` or `components/shared/ImageLightbox.tsx` | Lightbox + grid tile (wrapper pattern, no `ui/` edits) |

**Out of scope (separate component):** `MarketplaceMediaWorkflow.tsx` in editor — already uses square `aspect-[4/3]` without clip-path; align visually if both appear in product.

## Implementation checklist (from user spec)

1. Remove all `clip-path-slant*`, transform/skew from image upload components
2. Cover: 16/9, object-fit cover, lightbox, Replace/Remove
3. Additional: responsive grid 2/3/4, square 1:1 thumbs, 32px remove, progress/error/retry
4. Lightbox: contain, backdrop, Esc, arrows, index, focus trap, body scroll lock
5. Data: stable IDs, object URL lifecycle, order preserve, drag reorder, validation
6. Responsive: 320–1440px

## Preserve

- `/api/marketplace/upload` flow
- `useMarketplaceFormImages` finalize on submit
- Form field `image` / `images` contract
