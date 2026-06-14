---
phase: 01-foundation-app-merge
plan: 02
subsystem: auth
tags: [supabase, middleware, nextjs, ssr, admin-login]

requires:
  - phase: 01-foundation-app-merge plan 01
    provides: "(site) route group isolating public shell from /admin routes"
provides:
  - Full Supabase auth layer in apps/web (client, server, middleware, requireUser, requireRole)
  - Middleware session refresh + /admin/* auth guard with /admin/login redirect
  - Admin login page at /admin/login with D-08 post-login redirect to /admin
  - Admin-only deps (cmdk, recharts, dnd-kit) in web package
affects: [01-foundation-app-merge wave 3 API routes, wave 4 admin UI]

tech-stack:
  added: [cmdk, recharts, @dnd-kit/core, @dnd-kit/utilities]
  patterns:
    - "Merged server.ts exports both createClient (SSR cookies) and createServiceRoleClient"
    - "Middleware updateSession guards /admin/* excluding /admin/login per D-09"
    - "Thin route re-export at app/admin/login/page.tsx → src/admin/users/pages/LoginPage"

key-files:
  created:
    - apps/web/src/lib/supabase/client.ts
    - apps/web/src/lib/supabase/middleware.ts
    - apps/web/src/lib/supabase/requireUser.ts
    - apps/web/src/lib/supabase/requireRole.ts
    - apps/web/src/middleware.ts
    - apps/web/src/app/admin/login/page.tsx
    - apps/web/src/admin/users/pages/LoginPage.tsx
  modified:
    - apps/web/src/lib/supabase/server.ts
    - apps/web/src/lib/supabase/types.ts
    - apps/web/package.json

key-decisions:
  - "Post-login always navigates to /admin — redirect query param preserved for middleware only, not post-login (D-08)"
  - "Login page force-dynamic + lazy createClient() in handler to avoid build-time env requirement"
  - "Admin Database types (superset) replace web marketplace-only types.ts"

patterns-established:
  - "Admin domain pages live under src/admin/{domain}/pages/ with thin app/admin/** re-exports"
  - "Supabase browser client created lazily in event handlers, not at module render time"

requirements-completed: [FND-03]

duration: 20min
completed: 2026-06-14
---

# Phase 1 Plan 2: Supabase Auth Layer Summary

**Full Supabase SSR auth layer ported to web with middleware guarding /admin/* → /admin/login and post-login locked to /admin dashboard**

## Performance

- **Duration:** ~20 min
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Ported complete Supabase auth stack from `apps/admin` to `apps/web/src/lib/supabase/`
- Merged `server.ts`: retains `createServiceRoleClient()` and adds cookie-based `createClient()` for SSR
- Middleware refreshes sessions on all matched routes; unauthenticated `/admin/*` redirects to `/admin/login?redirect={path}` (D-09)
- Login page at `/admin/login` outside public shell; successful sign-in always `router.push("/admin")` (D-08)
- Installed admin-only dependencies: cmdk, recharts, @dnd-kit/core, @dnd-kit/utilities
- `pnpm --filter web build` passes with new `/admin/login` dynamic route and middleware proxy

## Task Commits

Each task was committed atomically:

1. **Task 1: Port Supabase auth layer to web** - `799b194` (feat)
2. **Task 2: Add middleware, login page, and admin deps** - `5e267ca` (feat)

## Files Created/Modified

- `apps/web/src/lib/supabase/client.ts` - Browser Supabase client factory
- `apps/web/src/lib/supabase/server.ts` - SSR cookie client + service role client
- `apps/web/src/lib/supabase/middleware.ts` - Session refresh and /admin auth guard
- `apps/web/src/lib/supabase/requireUser.ts` - API route auth helper
- `apps/web/src/lib/supabase/requireRole.ts` - Role-based authorization helper
- `apps/web/src/lib/supabase/types.ts` - Full admin Database types (superset)
- `apps/web/src/middleware.ts` - Next.js middleware entry calling updateSession
- `apps/web/src/admin/users/pages/LoginPage.tsx` - Admin login UI with D-08 redirect
- `apps/web/src/app/admin/login/page.tsx` - Thin route re-export (force-dynamic)
- `apps/web/package.json` - Added cmdk, recharts, dnd-kit deps

## Decisions Made

- Post-login navigation ignores `redirect` query param per D-08; param only used by middleware for pre-login redirect chain
- Lazy `createClient()` in login handler + `dynamic = 'force-dynamic'` prevents build failure when env vars absent at build time
- Signup tab UI retained but register API not wired in this phase (SEC-01 deferred)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed login page build failure during static prerender**
- **Found during:** Task 2 (Add middleware, login page, and admin deps)
- **Issue:** `createClient()` called at component render threw during `/admin/login` prerender when `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set at build time
- **Fix:** Moved `createClient()` into `handleLogin` handler; added `export const dynamic = "force-dynamic"` on route page
- **Files modified:** `apps/web/src/admin/users/pages/LoginPage.tsx`, `apps/web/src/app/admin/login/page.tsx`
- **Verification:** `pnpm --filter web build` passes
- **Committed in:** `5e267ca` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required for build correctness. No scope creep.

## Issues Encountered

- `pnpm --filter web check-types` fails with pre-existing errors (packages/shared and packages/ui dist not built). Not caused by this plan — `next build` typecheck passes during build step (same as Plan 01).

## User Setup Required

`.env.local` for `apps/web` must include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required for middleware session refresh)
- `SUPABASE_SERVICE_ROLE_KEY` (for API routes using service role client)

Do not commit secrets. Copy values from existing admin `.env.local` or Supabase dashboard.

## Next Phase Readiness

- Auth foundation ready for Wave 3 API route migration with `requireUser`/`requireRole`
- Middleware protects `/admin/*`; portal layout and admin pages can be added in Wave 4
- Signup/register flow deferred to Phase 3 SEC-01

## Self-Check: PASSED

- FOUND: apps/web/src/lib/supabase/client.ts
- FOUND: apps/web/src/lib/supabase/requireUser.ts
- FOUND: apps/web/src/middleware.ts
- FOUND: apps/web/src/app/admin/login/page.tsx
- FOUND: apps/web/src/admin/users/pages/LoginPage.tsx
- FOUND: .planning/phases/01-foundation-app-merge/01-02-SUMMARY.md
- FOUND commit: 799b194
- FOUND commit: 5e267ca

---
*Phase: 01-foundation-app-merge*
*Completed: 2026-06-14*
