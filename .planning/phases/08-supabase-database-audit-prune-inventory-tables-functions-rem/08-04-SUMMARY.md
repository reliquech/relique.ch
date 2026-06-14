---
phase: 08-supabase-database-audit-prune-inventory-tables-functions-rem
plan: 04
subsystem: database
tags: [supabase, baseline, squash]
requires:
  - phase: 08-02
    provides: 036 prune target state
  - phase: 08-03
    provides: RLS_AUDIT.md
provides:
  - supabase/migrations/000_baseline.sql
  - supabase/migrations/legacy/
affects: [08-05]
tech-stack:
  added: [scripts/squash-baseline.mjs]
  patterns: [dual-path migrations fresh vs brownfield]
key-files:
  created: [supabase/migrations/000_baseline.sql, supabase/migrations/legacy/README.md, scripts/squash-baseline.mjs]
  modified: [supabase/MIGRATIONS.md, supabase/MIGRATION_MANIFEST.md]
key-decisions:
  - "000_baseline fresh-only; never on brownfield DBs (D-08-04)"
requirements-completed: [DB-03, DB-08]
duration: 20min
completed: 2026-06-14
---

# Phase 8 Plan 04: Baseline Squash Summary

**000_baseline.sql (1390 lines) for fresh installs; 001-035 archived to legacy/.**

## Task Commits

1. **Tasks 1-2** — `32a2957` feat(08-05) (baseline + legacy move bundled with 08-05 types work)

## Accomplishments

- `000_baseline.sql` — squashed 001-035 minus email_logs and admin_upsert_profile
- 35 files in `migrations/legacy/`
- Active folder: `000_baseline.sql` + `036_prune_dead_schema.sql`
- `MIGRATIONS.md` dual-path documentation

## Deviations

**[Rule 2]** Added `scripts/squash-baseline.mjs` to regenerate baseline from legacy chain — not in plan but required for maintainability.

## Self-Check: PASSED

- `000_baseline.sql` exists (>200 lines, no email_logs table DDL)
- 35 legacy SQL files
- `MIGRATIONS.md` contains `000_baseline`
