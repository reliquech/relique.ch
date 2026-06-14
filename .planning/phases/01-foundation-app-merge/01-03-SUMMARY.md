---
phase: 01-foundation-app-merge
plan: 03
subsystem: api
tags: [nextjs, supabase, marketplace, crm, api-routes, dual-get]

requires:
  - phase: 01-foundation-app-merge plan 02
    provides: requireUser, requireRole, createClient SSR, service role client
provides:
  - ~56 admin API route handlers in apps/web/src/app/api/
  - Observability and actionRegistry libs in apps/web
  - Merged marketplace GET (public published + authenticated admin list)
  - Unified marketplace [param] detail route (slug public / UUID admin)
affects: [01-foundation-app-merge wave 4 admin UI, CRM services]

tech-stack:
  added: []
  patterns:
    - "GET /api/marketplace branches on session via createClient().auth.getUser()"
    - "Admin types at lib/types/admin.ts; web public types preserved in lib/types.ts"
    - "Marketplace [param] resolves slug (public) vs UUID (admin) in one dynamic segment"

key-files:
  created:
    - apps/web/src/app/api/deals/route.ts
    - apps/web/src/app/api/leads/route.ts
    - apps/web/src/lib/observability/serverErrorLog.ts
    - apps/web/src/lib/actions/actionRegistry.ts
    - apps/web/src/lib/types/admin.ts
    - apps/web/src/app/api/marketplace/[param]/route.ts
  modified:
    - apps/web/src/app/api/marketplace/route.ts

key-decisions:
  - "Admin CRM types copied to lib/types/admin.ts instead of overwriting web lib/types.ts"
  - "Merged [slug] and [id] into [param] — Next.js 16 rejects ambiguous dynamic siblings"
  - "verifyActions/marketplaceActions defer legacy service wiring until Wave 4 UI"

patterns-established:
  - "All admin API handlers call requireUser() at entry (health/register excepted)"
  - "Public marketplace GET never returns 401; admin branch uses requireUser defense-in-depth"

requirements-completed: [FND-04]

duration: 25min
completed: 2026-06-14
---

# Phase 1 Plan 3: Admin API Migration Summary

**~56 admin API routes ported to unified app with dual-path marketplace GET and [param] slug/UUID detail routing**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2
- **Files modified:** ~72

## Accomplishments

- Copied 56 admin `route.ts` handlers to `apps/web/src/app/api/` (excluding marketplace list merge)
- Ported observability (`clientErrorLog`, `serverErrorLog`) and full `actionRegistry` action modules
- Copied minimal feature deps: `features/crm/types`, `features/marketplace/constants`, `uploadPaths`
- Admin domain types at `lib/types/admin.ts`; preserved existing web `lib/types.ts`
- Merged marketplace list GET: anonymous → published/public + `mapRowToListing`; authenticated → admin row list
- POST `/api/marketplace` requires auth with admin create logic
- Resolved Next.js 16 build failure by unifying `[slug]` and `[id]` into `[param]`

## Task Commits

1. **Task 1: Port supporting libs and copy admin API routes** - `a938f15` (feat)
2. **Task 2: Merge marketplace dual-GET handler** - `e3e34d5` (feat)

## Manual Verification (curl)

```bash
# Anonymous marketplace list — expect 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:1300/api/marketplace

# Protected CRM endpoint — expect 401 without session cookie
curl -s -o /dev/null -w "%{http_code}" http://localhost:1300/api/deals
```

## Files Created/Modified

- `apps/web/src/app/api/**` — 56 admin routes + marketplace sub-routes
- `apps/web/src/lib/observability/` — Server/client error logging
- `apps/web/src/lib/actions/` — Command palette action registry
- `apps/web/src/lib/types/admin.ts` — Admin CRM/marketplace types
- `apps/web/src/app/api/marketplace/route.ts` — Dual GET + authenticated POST
- `apps/web/src/app/api/marketplace/[param]/route.ts` — Public slug GET + admin id GET/PATCH/DELETE

## Decisions Made

- Kept web public types separate from admin types to avoid breaking public marketplace schemas
- Combined dynamic segments under `[param]` because Next.js 16 cannot build with sibling `[slug]` and `[id]`
- Simplified actionRegistry verify/marketplace actions (empty history, no legacy import) until admin UI wave

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Avoided overwriting web lib/types.ts**
- **Found during:** Task 1 (typecheck)
- **Issue:** Copying admin `lib/types.ts` broke web `lib/types/api.ts` imports
- **Fix:** Restored web types; placed admin types at `lib/types/admin.ts`; updated `features/crm/types.ts` import
- **Files modified:** `apps/web/src/lib/types.ts`, `apps/web/src/lib/types/admin.ts`, `apps/web/src/features/crm/types.ts`
- **Verification:** `pnpm --filter web check-types` passes
- **Committed in:** `a938f15`

**2. [Rule 3 - Blocking] Resolved ambiguous marketplace dynamic routes**
- **Found during:** Task 2 (`pnpm --filter web build`)
- **Issue:** Next.js 16: `[slug]` and `[id]` siblings are ambiguous
- **Fix:** Merged into `[param]/route.ts` — UUID + session → admin by id; otherwise public by slug
- **Files modified:** Deleted `[slug]/route.ts`, renamed/merged `[id]` → `[param]`
- **Verification:** `pnpm --filter web build` passes
- **Committed in:** `e3e34d5`

**3. [Rule 2 - Missing Critical] Decoupled actionRegistry from admin legacy services**
- **Found during:** Task 1 (typecheck)
- **Issue:** `verifyActions`/`marketplaceActions` imported `@/lib/legacy/*` not present in web
- **Fix:** Removed legacy imports; verify history returns empty until Wave 4
- **Files modified:** `apps/web/src/lib/actions/verifyActions.ts`, `marketplaceActions.ts`
- **Verification:** `pnpm --filter web check-types` passes
- **Committed in:** `a938f15`

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** Required for build/type correctness. URL paths unchanged for clients (`/api/marketplace/{slug-or-id}`).

## Known Gaps (documented, not fixed)

- `/api/auth/register` remains public — SEC-01 deferred Phase 3 (per plan)
- `verifyActions` history empty until legacy/admin UI wired in Wave 4

## Issues Encountered

None beyond deviations above.

## User Setup Required

Same as Plan 02 — `apps/web/.env.local` needs Supabase URL, anon key, and service role key for API routes.

## Next Phase Readiness

- Full admin API namespace available on unified app at `/api/*`
- Wave 4 can migrate admin UI pages and wire services to existing endpoints
- Marketplace public browse preserved; admin CRUD available when authenticated

## Self-Check: PASSED

- FOUND: apps/web/src/app/api/deals/route.ts
- FOUND: apps/web/src/lib/observability/serverErrorLog.ts
- FOUND: apps/web/src/lib/actions/actionRegistry.ts
- FOUND: apps/web/src/app/api/marketplace/route.ts
- FOUND: apps/web/src/app/api/marketplace/[param]/route.ts
- FOUND commit: a938f15
- FOUND commit: e3e34d5
- Route count: 58 route.ts files (56 admin + article-meta + merged marketplace list)

---
*Phase: 01-foundation-app-merge*
*Completed: 2026-06-14*
