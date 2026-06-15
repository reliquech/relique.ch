---
status: awaiting_human_verify
trigger: "marketplace-fetch-cloudflare-1033: /marketplace hard refresh throws Cloudflare Tunnel error 1033 HTML from /api/marketplace"
created: 2026-06-15T00:00:00.000Z
updated: 2026-06-15T09:00:00.000Z
---

## Current Focus

hypothesis: CONFIRMED — NEXT_PUBLIC_SUPABASE_URL=http://relique-supabase.minhmice.com (Cloudflare Tunnel); when tunnel connector is down, Supabase client receives HTML 1033 page and error.message was passed through verbatim to API JSON and client throws
test: curl /api/marketplace; inspect .env; verify sanitized error JSON
expecting: Clean JSON errors when tunnel down; valid JSON when tunnel up
next_action: Human verify /marketplace hard refresh in browser

## Symptoms

expected: Marketplace grid loads items from `/api/marketplace` (JSON) and renders.
actual: Local dev `/marketplace` hard refresh logs/throws Error with full Cloudflare Tunnel error 1033 HTML in message; list() throws at `marketplaceService.ts:55`.
errors: Console stack:
- MarketplaceAPIService.list (src/lib/services/api/marketplaceService.ts:55)
- marketplaceService.list (src/lib/services/marketplaceService.ts:15)
- MarketplaceGrid useEffect loadData (src/app/(site)/marketplace/components/MarketplaceGrid.tsx:35)
Cloudflare HTML title: `Cloudflare Tunnel error | relique-supabase.minhmice.com | Cloudflare` with error code 1033.
reproduction: Start local dev (`npm run dev`), visit `/marketplace`, do hard refresh (Ctrl+Shift+R). Observe network/console.
started: Started now (unknown if ever worked); user reports it currently happens in local dev.

## Eliminated

- hypothesis: Client fetch hits Cloudflare directly (misrouted /api/marketplace)
  evidence: Network shows /api/marketplace returns 500 JSON; HTML originates from server-side Supabase client calling NEXT_PUBLIC_SUPABASE_URL
  timestamp: 2026-06-15

- hypothesis: JSON parse failure on client reads HTML body from /api/marketplace
  evidence: API returns application/json with `{ error: "<full html>" }` from error.message passthrough; client successfully parses JSON then throws long error string
  timestamp: 2026-06-15

## Evidence

- timestamp: 2026-06-15
  checked: `.env`
  found: `NEXT_PUBLIC_SUPABASE_URL=http://relique-supabase.minhmice.com` (Cloudflare Tunnel hostname, not *.supabase.co)
  implication: All server Supabase clients target tunnel; tunnel down → HTML 1033 from Cloudflare

- timestamp: 2026-06-15
  checked: `GET http://localhost:1300/api/marketplace` (before fix)
  found: HTTP 500, JSON `error` field contained full Cloudflare HTML doctype page
  implication: `publicGet` returned `error.message` from Supabase client without sanitization

- timestamp: 2026-06-15
  checked: `src/lib/services/api/marketplaceService.ts`
  found: On !ok, parses JSON error and concatenates details without length/content-type guards
  implication: HTML in API error field propagated to thrown client Error

- timestamp: 2026-06-15
  checked: `GET /api/marketplace` after sanitize fix (tunnel intermittently up)
  found: `{"items":[],"total":0,"page":1,"pageSize":2,"totalPages":0}` valid JSON
  implication: When tunnel reachable, route works; empty list may be data not config

- timestamp: 2026-06-15
  checked: `GET /api/marketplace` when tunnel returned HTML (during fix verification)
  found: Sanitized JSON `{"error":"Supabase returned an HTML error page instead of JSON..."}` (~120 chars, no doctype)
  implication: Error hardening works

## Resolution

root_cause: `.env` sets `NEXT_PUBLIC_SUPABASE_URL` to `http://relique-supabase.minhmice.com`, a Cloudflare Tunnel endpoint. When the tunnel connector is not running (CF error 1033), the Supabase JS client receives an HTML error page; `publicGet`/`adminGet` passed `error.message` verbatim into JSON responses, and the client service re-threw the full HTML string.
fix: (1) Added `sanitizeErrorMessage` + `parseFetchError` for API client; `formatSupabaseError` for API routes. (2) Updated `.env.example` with tunnel vs direct supabase.co guidance. (3) Added warning comment in `.env`. User must start cloudflared OR set direct `https://<ref>.supabase.co` URL for reliable local dev.
verification: curl `http://localhost:1300/api/marketplace?page=1&pageSize=2` returns valid JSON (200 with items array when tunnel up; 500 with short sanitized error when tunnel down). No HTML in error field.
files_changed:
  - src/lib/api/errorMessage.ts
  - src/lib/supabase/formatSupabaseError.ts
  - src/lib/services/api/marketplaceService.ts
  - src/app/api/marketplace/route.ts
  - src/app/api/health/route.ts
  - .env.example
