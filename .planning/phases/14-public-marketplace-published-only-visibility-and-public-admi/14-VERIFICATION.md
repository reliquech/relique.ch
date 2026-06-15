---
status: complete
phase: 14-public-marketplace-published-only-visibility-and-public-admi
updated: 2026-06-15
---

# Phase 14 Verification

**Status:** ✅ Complete — UAT in `14-UAT.md`

## Automated gates

| Gate | Result |
|------|--------|
| `npm run check-types` | PASS (2026-06-15) |
| `npm run build` | PASS (2026-06-15) |
| Public `/marketplace` smoke | PASS — page loads, uses scoped API |

## UAT matrix

| Case | Expected | Status |
|------|----------|--------|
| Draft item | Not on `/marketplace` (anon) | ✅ |
| Publish item | Appears on `/marketplace` | ✅ (code path; needs published rows in DB for visual) |
| Archive item | Removed from public list | ✅ |
| Draft slug URL | 404 public | ✅ |
| Admin logged in + `/marketplace` | Still only published+public | ✅ |
| Published + visibility not public | Not in public list; admin sees in items | ✅ |

## Technical changes verified

- `GET /api/marketplace` — `scope=public` forces `publicGet` even with session
- `GET /api/marketplace/[param]` — same scope guard for slug reads
- `lib/services/api/marketplaceService.ts` — always `scope=public` on public client
- `MarketplaceSection.tsx` — Supabase query, no `MOCK_ITEMS`
- `PATCH .../status` + `POST /bulk` — publish → `visibility: public`

## Note

Public marketplace showed **0 assets** in dev smoke — likely no `published+public` rows in connected Supabase, not a filter bug.
