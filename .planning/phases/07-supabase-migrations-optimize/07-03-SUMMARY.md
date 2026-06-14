---
phase: 07-supabase-migrations-optimize
plan: 03
subsystem: database
tags: [supabase, db-push, migrations, indexes]

requires:
  - phase: 07-02
    provides: Verified 035 SQL file and 35-file chain
provides:
  - Build gate verification (check-types + build)
  - VERIFICATION.md with apply status and manual steps
affects: [04-stack-consolidation, 08-supabase-database-audit]

tech-stack:
  added: []
  patterns: [brownfield db push, manual SQL Editor fallback]

key-files:
  created: []
  modified:
    - .planning/phases/07-supabase-migrations-optimize/07-VERIFICATION.md

key-decisions:
  - "D-07: Types regen deferred to Phase 4 — not executed in this plan"
  - "D-04: Baseline squash deferred to Phase 8"

patterns-established: []

requirements-completed: []

duration: 10min
completed: 2026-06-14
---

# Phase 7 Plan 03: Remote Apply Summary

**Build gates pass locally; migration 035 blocked on remote apply — manual db push or SQL Editor required**

## Performance

- **Duration:** 10 min
- **Tasks:** 2 complete, 1 blocked at checkpoint
- **Files modified:** 1 (VERIFICATION.md)

## Accomplishments

- Pre-apply check: CLI available (v2.106.0) but project not linked
- `npm run check-types` — PASS
- `npm run build` — PASS (77 routes)
- `07-VERIFICATION.md` updated with blocker details, manual apply steps, D-07/D-04 deferrals

## Task Commits

1. **Task 1: Pre-apply check** — documented in this summary
2. **Task 2: [BLOCKING] db push** — **NOT COMPLETED** (auth/link blocker)
3. **Task 3: Build gate + VERIFICATION** — pending commit

## CHECKPOINT: Human action required

**Type:** human-action (blocking)

**What failed:**
```
npx supabase db push
→ Cannot find project ref. Have you run supabase link?
```

**What you need to do:**

1. `npx supabase login`
2. `npx supabase link --project-ref <ref>` (from Dashboard → Settings → General)
3. `npx supabase db push` from repo root
4. Verify 3 indexes via SQL Editor (query in `07-VERIFICATION.md`)
5. Reply **"applied"** to close phase gate

**SQL Editor fallback:** paste `supabase/migrations/035_optimize_public_browse_indexes.sql` into Dashboard → SQL Editor → Run.

## Deviations from Plan

None — blocker is expected when credentials/project link unavailable in CI-like executor environment.

## Auth Gates

| Task | Gate | Outcome |
|------|------|---------|
| Task 2 | Supabase link + access token | STOP — manual apply documented |

## Deferred Items

- Types regen (`supabase gen types`) → Phase 4 per D-07
- Baseline squash → Phase 8 per D-04
- Note: `036_prune_dead_schema.sql` exists (Phase 8) — outside Phase 7 apply scope

## Self-Check: PARTIAL

- PASS: npm run check-types
- PASS: npm run build
- FAIL: 035 remote apply (documented manual steps)
- FOUND: 07-VERIFICATION.md updated

---
*Phase: 07-supabase-migrations-optimize*
*Completed: 2026-06-14 (code/docs); remote apply pending*
