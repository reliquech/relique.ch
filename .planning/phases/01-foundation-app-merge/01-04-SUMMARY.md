---
phase: 01-foundation-app-merge
plan: 04
subsystem: ui
tags: [nextjs, admin, crm, portal, sidebar, command-palette]

requires:
  - phase: 01-foundation-app-merge plan 03
    provides: Admin API routes at /api/*, actionRegistry, lib/types/admin.ts
provides:
  - 8 admin modules at apps/web/src/admin/
  - Admin shell at components/admin/ (AdminPortalLayout, PortalSidebar)
  - 21 portal routes at app/admin/(portal)/
  - CommandPalette wired in root layout
affects: [01-foundation-app-merge plan 05 turbo/scripts cleanup]

tech-stack:
  added: []
  patterns:
    - "Thin route re-exports: app/admin/(portal)/** → @/admin/{domain}/pages/*"
    - "Admin shell isolated via (portal) route group; login outside at /admin/login"
    - "AdminLoadingState wrapper avoids conflict with public LoadingState"

key-files:
  created:
    - apps/web/src/admin/crm/index.ts
    - apps/web/src/components/admin/AdminPortalLayout.tsx
    - apps/web/src/components/admin/PortalSidebar.tsx
    - apps/web/src/app/admin/(portal)/layout.tsx
    - apps/web/src/app/admin/(portal)/deals/page.tsx
    - apps/web/src/components/command/CommandPalette.tsx
  modified:
    - apps/web/src/app/layout.tsx

key-decisions:
  - "AdminLoadingState.tsx instead of overwriting public LoadingState"
  - "Admin types imported from @/lib/types/admin not @/lib/types"
  - "PortalSidebar wrapped in Suspense for Next.js 16 useSearchParams prerender"
  - "Profile, Settings, NewMarketplace pages moved to src/admin/ for D-04 consistency"

patterns-established:
  - "All admin domain code under src/admin/ with @/admin/ imports (D-01)"
  - "Logout and auth redirects use /admin/login (D-07)"

requirements-completed: [FND-01, FND-02]

duration: 45min
completed: 2026-06-14
---

# Phase 1 Plan 4: Admin UI Migration Summary

**8 admin modules, portal shell with sidebar, and 21 thin routes on unified app — CRM UI wired to /api/***

## Performance

- **Duration:** ~45 min
- **Tasks:** 3 (checkpoint auto-documented)
- **Files modified:** ~165

## Accomplishments

- Copied 8 feature trees (~102 files) from `apps/admin/src/features/` → `apps/web/src/admin/`
- Bulk-rewrote `@/features/` → `@/admin/` and `@/lib/types` → `@/lib/types/admin`
- Added admin shared components, hooks, legacy services, and storage helpers
- Created `AdminPortalLayout` + `PortalSidebar` at `components/admin/`
- Wired 21 portal pages under `app/admin/(portal)/` with thin re-exports
- Added `CommandPalette` to root layout; login remains outside portal group

## Task Commits

1. **Task 1: Copy admin modules to src/admin with import rewrites** - `133917e` (feat)
2. **Task 2: Create admin shell and portal route re-exports** - `de909cb` (feat)

## Manual Verification (Human UAT — pending operator sign-off)

Run `pnpm dev:web` (port 1300). Requires `apps/web/.env.local` with Supabase keys (same as Plan 02/03).

1. Visit http://localhost:1300/admin logged out → redirects to `/admin/login?redirect=/admin`
2. Login at `/admin/login` → lands on `/admin` dashboard (not redirect param destination)
3. Confirm: sidebar visible, NO public site Header/Footer
4. Navigate to `/admin/leads`, `/admin/deals`, `/admin/items` — pages load data (no 401 toast errors)
5. Visit http://localhost:1300/marketplace — public Header/Footer still present
6. Optional: screenshot `/admin` dashboard for visual record

**Checkpoint status:** ⚡ Auto-documented — build passes; human UAT steps above for operator approval.

## Files Created/Modified

- `apps/web/src/admin/**` — 8 domain modules (crm, marketplace, submissions, dashboard, tasks, notifications, automations, users)
- `apps/web/src/components/admin/` — AdminPortalLayout, PortalSidebar
- `apps/web/src/app/admin/(portal)/**` — 21 page re-exports + portal layout
- `apps/web/src/components/shared/` — DataTable, CrmViewBar, FormDialog, AdminLoadingState, etc.
- `apps/web/src/hooks/` — useDebounce, useMediaQuery, useTableViews, useStorageSync, useSearchHistory
- `apps/web/src/lib/legacy/` — verify/consign/marketplace legacy services for dashboard/submissions
- `apps/web/src/lib/utils/admin.tsx` — route/tab maps for sidebar
- `apps/web/src/app/layout.tsx` — CommandPalette

## Decisions Made

- Kept public `LoadingState`; admin copy renamed `AdminLoadingState` to avoid prop API conflict
- Moved inline profile/settings/new-marketplace pages into `src/admin/` for consistent thin routes
- Wrapped `PortalSidebar` in `Suspense` to satisfy Next.js 16 static generation with `useSearchParams`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AdminLoadingState naming after LoadingState conflict**
- **Found during:** Task 1 (typecheck)
- **Issue:** Web and admin both have `LoadingState` with different prop APIs
- **Fix:** Copied admin version as `AdminLoadingState.tsx`; updated admin module imports
- **Files modified:** `components/shared/AdminLoadingState.tsx`, admin module pages
- **Verification:** `pnpm --filter web check-types` passes
- **Committed in:** `133917e`

**2. [Rule 3 - Blocking] Missing legacy services and hooks on web app**
- **Found during:** Task 1 (typecheck)
- **Issue:** Dashboard/submissions import `@/lib/legacy/*` and `@/hooks/*` not present on web
- **Fix:** Copied from admin app; merged admin storage keys into `lib/storage.ts`
- **Files modified:** `lib/legacy/**`, `hooks/**`, `lib/storage.ts`
- **Verification:** `pnpm --filter web check-types` passes
- **Committed in:** `133917e`

**3. [Rule 1 - Bug] CrmViewBar still referenced @/features/**
- **Found during:** Task 1 (typecheck)
- **Issue:** Shared component copied without import rewrite
- **Fix:** Updated to `@/admin/crm/` and `@/admin/users/`
- **Committed in:** `133917e`

**4. [Rule 3 - Blocking] useSearchParams Suspense boundary for portal layout**
- **Found during:** Task 2 (`pnpm --filter web build`)
- **Issue:** Next.js 16 prerender fails on admin routes using PortalSidebar
- **Fix:** Wrapped `PortalSidebar` in `Suspense`; added `export const dynamic = "force-dynamic"` on portal layout
- **Verification:** `pnpm --filter web build` passes (77 routes)
- **Committed in:** `de909cb`

**5. [Rule 2 - Missing Critical] Admin background asset**
- **Found during:** Task 2 (layout references `/admin background.jpeg`)
- **Issue:** Background image existed in `apps/admin/public/` but not copied to web
- **Fix:** Copied to `apps/web/public/admin background.jpeg`
- **Committed in:** (this session fix commit)

---

**Total deviations:** 5 auto-fixed (3 blocking, 1 bug, 1 missing critical)
**Impact on plan:** Required for typecheck/build correctness. No scope creep.

## Known Gaps

- Dashboard QuickStats/ContinueActions still use legacy localStorage services for verify/consign counts (API-backed CRM pages unaffected)
- Human UAT not yet operator-approved (checkpoint documented above)

## Issues Encountered

- Intermittent `.next` lock/manifest errors during parallel builds — resolved by clean `.next` rebuild

## User Setup Required

Same as Plan 02 — `apps/web/.env.local` needs Supabase URL, anon key, and service role key.

## Next Phase Readiness

- Admin CRM UI operational on unified app at `/admin/*`
- Wave 5 can update root scripts/turbo and remove `dev:admin`
- Operator should run human UAT checklist above before production deploy

## Self-Check: PASSED

- FOUND: apps/web/src/admin/crm/index.ts
- FOUND: apps/web/src/components/admin/AdminPortalLayout.tsx
- FOUND: apps/web/src/app/admin/(portal)/layout.tsx
- FOUND: apps/web/src/app/admin/(portal)/deals/page.tsx
- FOUND: apps/web/src/components/command/CommandPalette.tsx
- FOUND commit: 133917e
- FOUND commit: de909cb
- Admin module files: 105
- Portal page count: 21
- No @/features/ in src/admin: verified

---
*Phase: 01-foundation-app-merge*
*Completed: 2026-06-14*
