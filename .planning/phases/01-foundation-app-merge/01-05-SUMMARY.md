---
phase: 01-foundation-app-merge
plan: 05
subsystem: infra
tags: [supabase, migrations, turbo, tsconfig, monorepo]

requires:
  - phase: 01-foundation-app-merge plan 04
    provides: Unified admin UI at /admin on apps/web
provides:
  - 31 SQL migrations at apps/web/supabase/migrations/
  - MIGRATIONS.md manual apply guide
  - Single dev entry (pnpm dev → web only)
  - tsconfig excludes apps/admin reference
affects: [phase-5 CONS-02 apps/admin removal]

tech-stack:
  added: []
  patterns:
    - "apps/web/supabase/migrations/ is canonical schema source (FND-05)"
    - "Root dev script filters --filter=web only (FND-06)"
    - "apps/admin/supabase/migrations/ deprecated but retained until Phase 5 (D-11)"

key-files:
  created:
    - apps/web/supabase/migrations/001_create_profiles.sql
    - apps/web/supabase/migrations/031_add_marketplace_metadata.sql
    - apps/web/supabase/MIGRATIONS.md
    - apps/web/supabase/STORAGE_GUIDE.md
  modified:
    - package.json
    - tsconfig.json

key-decisions:
  - "Copy migrations (not git mv) — admin path kept per D-11 until Phase 5"
  - "Root start also filters web-only for production parity with dev"
  - "pnpm-workspace.yaml unchanged — apps/admin dir remains in workspace"

patterns-established:
  - "New migrations go only under apps/web/supabase/migrations/"
  - "Manual SQL apply documented — no Supabase CLI in repo"

requirements-completed: [FND-05, FND-06]

duration: 25min
completed: 2026-06-14
---

# Phase 1 Plan 5: Config Consolidation Summary

**31 Supabase migrations consolidated to apps/web, single `pnpm dev` entry on port 1300, tsconfig drops apps/admin reference**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3 (Task 3 verification-only, no code commit)
- **Files created:** 33 (31 SQL + 2 docs)

## Accomplishments

- Copied all 31 SQL migrations from `apps/admin/supabase/migrations/` → `apps/web/supabase/migrations/`
- Copied `STORAGE_GUIDE.md` to `apps/web/supabase/`
- Created `MIGRATIONS.md` with Dashboard/CLI apply instructions and deprecated admin path note
- Updated root `dev`/`start` scripts to `--filter=web`; removed `dev:admin`, `start:admin`, `dev:all`, `start:all`
- Removed `apps/admin` from root `tsconfig.json` project references

## Task Commits

1. **Task 1: Consolidate Supabase migrations folder** - `d6975e8` (feat)
2. **Task 2: Update root scripts and tsconfig** - `0db13ac` (feat)
3. **Task 3: Phase gate verification** - no commit (verification-only)

## Phase Gate Results (Task 3)

| Check | Result |
|-------|--------|
| `ls apps/web/supabase/migrations/*.sql \| wc -l` | **31** ✓ |
| `grep dev:admin package.json` | **no match** ✓ |
| `pnpm dev` | **web only on port 1300** ✓ (turbo scope: web) |
| `pnpm --filter web check-types` | **pass** ✓ |
| `pnpm --filter web build` | **pass** ✓ (77 routes) |
| `pnpm check` (root) | **FAIL** — pre-existing monorepo issues (see Issues) |

## Manual Verification (Human UAT — pending operator sign-off)

Requires `apps/web/.env.local` with Supabase keys.

1. Run `pnpm dev` → confirm only http://localhost:1300 (not 3600)
2. Visit `/admin` logged out → `/admin/login?redirect=/admin`
3. Login → CRM sidebar, no public Header/Footer
4. Visit `/admin/leads` → data loads via `/api/*`
5. Visit `/marketplace` → public site Header/Footer present
6. Apply any unapplied migrations via Supabase Dashboard (see `MIGRATIONS.md`)

**Checkpoint status:** Automation partial — web build/typecheck green; root `pnpm check` blocked by pre-existing infra; human UAT pending.

## Files Created/Modified

- `apps/web/supabase/migrations/*.sql` — 31 schema migrations (001–031)
- `apps/web/supabase/MIGRATIONS.md` — canonical location, apply order, deprecated admin path
- `apps/web/supabase/STORAGE_GUIDE.md` — storage bucket setup (copied from admin)
- `package.json` — unified dev/start scripts
- `tsconfig.json` — removed apps/admin reference

## Decisions Made

- Left `apps/admin/supabase/migrations/` in place (D-11) — documented as deprecated in MIGRATIONS.md
- Also filtered root `start` to web-only (consistent with single-app deploy model)
- Did not modify `pnpm-workspace.yaml` or delete `apps/admin/` (Phase 5 scope)

## Deviations from Plan

None - plan executed exactly as written for Tasks 1–2. Task 3 automation documented pre-existing `pnpm check` failures without attempting monorepo-wide fixes (out of scope per deviation Rule scope boundary).

## Issues Encountered

**Root `pnpm check` fails (pre-existing, not caused by Plan 05):**

1. `@relique/shared#lint` — `eslint: command not found` (shared package lacks `eslint` devDependency)
2. Root `pnpm typecheck` (`tsc --build`) — `TS6379: Composite projects may not disable incremental compilation` in shared tsconfig (base.json has `incremental: false`)

**Workaround used for gate:** `pnpm --filter web check-types && pnpm --filter web build` — both pass (same as Plans 03–04).

**Web lint:** 226 warnings when run standalone — pre-existing from admin module migration; not introduced by Plan 05.

## User Setup Required

- Apply migrations manually if setting up new Supabase project — see `apps/web/supabase/MIGRATIONS.md`
- Existing hosted projects: no re-apply needed (folder move only)

## Next Phase Readiness

- FND-05 and FND-06 satisfied for unified app config
- Phase 5 (CONS-02) can remove `apps/admin/` directory and workspace entry
- Operator should approve human UAT checklist before production deploy
- Monorepo root `pnpm check` needs separate infra fix (shared eslint + tsconfig composite)

## Self-Check: PASSED

- FOUND: apps/web/supabase/migrations/001_create_profiles.sql
- FOUND: apps/web/supabase/migrations/031_add_marketplace_metadata.sql
- FOUND: apps/web/supabase/MIGRATIONS.md
- FOUND: apps/web/supabase/STORAGE_GUIDE.md
- FOUND commit: d6975e8
- FOUND commit: 0db13ac
- Migration count: 31
- dev:admin removed: verified
- apps/admin not in tsconfig.json: verified

---
*Phase: 01-foundation-app-merge*
*Completed: 2026-06-14*
