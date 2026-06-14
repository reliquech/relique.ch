---
phase: 01-foundation-app-merge
plan: 01
subsystem: ui
tags: [nextjs, route-groups, tailwind, layout-split, app-merge]

requires: []
provides:
  - Public shell isolated in app/(site)/layout.tsx
  - Minimal root layout (fonts, metadata, Toaster only)
  - All 9 public route segments under (site)/ with unchanged URLs
  - Admin CSS tokens (surface, bg-0, success, warning, sidebar) in unified globals/tailwind
affects: [01-foundation-app-merge wave 2 auth, wave 4 admin UI]

tech-stack:
  added: []
  patterns:
    - "Route group (site) for public chrome isolation from future /admin routes"
    - "CSS variable aliases mapping admin tokens to existing RELIQUE brand tokens"

key-files:
  created:
    - apps/web/src/app/(site)/layout.tsx
  modified:
    - apps/web/src/app/layout.tsx
    - apps/web/src/app/(site)/page.tsx
    - apps/web/src/app/(site)/about/page.tsx
    - apps/web/src/app/globals.css
    - apps/web/tailwind.config.ts

key-decisions:
  - "Admin tokens aliased to existing --relique-* variables to avoid public site visual drift"
  - "(home)/ folder kept at app root; (site)/page.tsx re-exports HomeContent via relative import"

patterns-established:
  - "Public routes live under app/(site)/ — route group adds no URL segment"
  - "Root layout owns html/body/fonts/metadata/Toaster; site layout owns Header/Footer/providers"

requirements-completed: [FND-02]

duration: 15min
completed: 2026-06-14
---

# Phase 1 Plan 1: Public Shell Route Group Summary

**Public shell extracted to `(site)` route group with slim root layout; admin theme tokens merged into unified globals.css and tailwind.config.ts**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2
- **Files modified:** 24 (22 route moves + 2 config/CSS)

## Accomplishments

- Created `app/(site)/layout.tsx` with Header, Footer, CurrencyProvider, CompareProvider, CompareDrawer, SpeedInsights
- Slimmed root `app/layout.tsx` to fonts, metadata, globals.css, Toaster only — no public chrome
- Moved all 9 public route segments under `(site)/` via `git mv` — URLs unchanged (`/`, `/marketplace`, `/verify`, etc.)
- Merged admin CSS variables (`--bg-0`, `--surface`, sidebar tokens) and Tailwind colors (`surface`, `bg-0`, `success`, `warning`)
- `pnpm --filter web build` passes with all 17 routes resolving correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Create (site) layout and relocate public routes** - `b73aedf` (feat)
2. **Task 2: Merge admin CSS tokens into web globals and tailwind** - `49e7413` (feat)

## Files Created/Modified

- `apps/web/src/app/(site)/layout.tsx` - Public shell layout (Header, Footer, providers)
- `apps/web/src/app/layout.tsx` - Minimal root layout
- `apps/web/src/app/(site)/**` - All public routes relocated (about, authenticate, consign, contact, marketplace, terms-policies, verify)
- `apps/web/src/app/globals.css` - Admin theme CSS variable aliases added to `:root`
- `apps/web/tailwind.config.ts` - Admin color tokens (surface, bg-0, success, warning)

## Decisions Made

- Admin tokens aliased to existing `--relique-bg-0` / `--relique-bg-1` hex values — prevents public site visual changes while enabling admin UI classes like `bg-surface`, `bg-bg-0`
- `(home)/` co-located components kept at app root per D-05; only `page.tsx` import path updated

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed broken relative imports in about/page.tsx after route move**
- **Found during:** Task 1 (Create (site) layout and relocate public routes)
- **Issue:** `about/page.tsx` imported from `../(home)/` which broke after move to `(site)/about/`
- **Fix:** Updated imports to `../../(home)/components/...`
- **Files modified:** `apps/web/src/app/(site)/about/page.tsx`
- **Verification:** `pnpm --filter web build` passes
- **Committed in:** `b73aedf` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required for build correctness after git mv. No scope creep.

## Issues Encountered

- `pnpm --filter web check-types` fails with pre-existing errors (packages/shared and packages/ui dist not built, deprecated schema re-exports). Not caused by this plan — `next build` typecheck passes during build step.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Foundation layout split complete — Wave 2 can add auth/middleware without public chrome leaking to `/admin`
- Admin CSS tokens ready for Wave 4 admin UI migration
- `(site)/layout.tsx` pattern established for all future public routes

## Self-Check: PASSED

- FOUND: apps/web/src/app/(site)/layout.tsx
- FOUND: apps/web/src/app/(site)/marketplace/page.tsx
- FOUND: .planning/phases/01-foundation-app-merge/01-01-SUMMARY.md
- FOUND commit: b73aedf
- FOUND commit: 49e7413

---
*Phase: 01-foundation-app-merge*
*Completed: 2026-06-14*
