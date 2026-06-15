---
status: debug_complete
trigger: "next/image aspect-ratio warning for Supabase storage URLs on marketplace/admin"
created: 2026-06-15T09:00:00.000Z
updated: 2026-06-15T09:15:00.000Z
---

## Symptoms

expected: Marketplace/admin listing images render without browser console warnings.
actual: Console warns that Image has width or height modified but not the other for Supabase storage URL (`relique-supabase.minhmice.com/storage/...`).
errors: `Image with src "http://relique-supabase.minhmice.com/storage/..." has either width or height modified, but not the other...`
reproduction: Load `/marketplace` or `/admin/items` with listings that have Supabase storage images.
timeline: Observed after marketplace fetch tunnel fix; images load but console warns.

## Root cause

`next/image` used for remote Supabase HTTP URLs with explicit `width`/`height` props plus Tailwind sizing (`w-10 h-10`). Next.js detects CSS dimension overrides on optimized images and warns. Project convention elsewhere (`MarketplaceJerseyCard`, `MarketplaceCard`, `ItemGallery`) already uses native `<img>` for `http` URLs.

Primary offender: `MarketplaceItemsTable` `Thumbnail`. Secondary: `FeaturedItemCard`, `RelatedItems`, `CompareDrawer` using `next/image` + `fill` for remote listing heroes.

## Fix

- Added `RemoteImage` shared component: native `<img>` for `http*` URLs, `next/image` for local assets.
- Updated listing image call sites to use `RemoteImage`.

## Verification

- No `next/image` direct usage with Supabase storage URLs in listing thumbnails.
- Browser console should be clean on `/marketplace` and `/admin/items`.
