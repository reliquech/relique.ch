# Phase 2 Verification Report

**Phase:** 02-supabase-data-layer-public-flows
**Status:** human_needed
**Score:** 5/5 (code) — blocked on DB migration apply + manual UAT

## Automated gates

| Check | Result |
|-------|--------|
| `pnpm --filter web check-types` | PASS |
| `pnpm --filter web build` | PASS |
| Public routes in build output | `/api/public/verify`, `/api/public/consign`, `/api/public/contact` |

## human_needed

1. **Apply migrations 032–034** to Supabase project (Dashboard SQL or `supabase db push`)
2. **Seed test data:** set `product_id` on at least one `marketplace_items` row for verify UAT
3. **Env:** `RESEND_API_KEY`, `OPERATOR_EMAIL` in `apps/web/.env.local`
4. **Manual UAT:**
   - `/verify?code=RLQ-...` with seeded item
   - `/consign` submit with 1+ photos
   - `/contact` submit → inline success + CRM rows

## Requirements coverage (code complete)

DATA-01–04, VRFY-01–04, CNSG-01–05, CNTC-01–03, ADM-04 — implemented pending DB + UAT sign-off.
