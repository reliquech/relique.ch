---
status: complete
phase: 14-public-marketplace-published-only-visibility-and-public-admi
source: [14-VERIFICATION.md, code inspection, public /marketplace smoke]
started: 2026-06-15T12:00:00Z
updated: 2026-06-15T12:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Public list only published+public
expected: `GET /api/marketplace` with `scope=public` returns only `state_lifecycle=published` and `state_visibility=public` regardless of admin session.
result: pass
note: `route.ts` L264–268 — `isPublicScope` bypasses `adminGet`. `lib/services/api/marketplaceService.ts` always sets `scope=public`.

### 2. Public detail by slug
expected: Draft/archived slugs return 404 on public scope; published public slugs resolve.
result: pass
note: `[param]/route.ts` public branch + `scope=public` on `getBySlug` fetch.

### 3. Homepage carousel real data
expected: Home `MarketplaceSection` queries Supabase published+public — no `MOCK_ITEMS`.
result: pass
note: `MarketplaceSection.tsx` server component with `createAnonClient()` + lifecycle/visibility filters.

### 4. Publish sets visibility public
expected: Status PATCH and bulk publish set `visibility: public`; archive/unpublish set private.
result: pass
note: `[param]/status/route.ts`, `bulk/route.ts` visibility side effects.

### 5. Admin session on public site
expected: Logged-in admin browsing `/marketplace` still sees only published+public catalog.
result: pass
note: Public client always passes `scope=public`. Browser smoke: `/marketplace` loads (0 items = empty DB/filter, not draft leak).

### 6. Build gate
expected: `check-types` and `build` pass after changes.
result: pass
note: Ran 2026-06-15 — both PASS.

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
