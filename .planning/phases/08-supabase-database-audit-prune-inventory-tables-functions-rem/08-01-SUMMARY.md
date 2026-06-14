---
phase: 08-supabase-database-audit-prune-inventory-tables-functions-rem
plan: 01
subsystem: database
tags: [supabase, audit, inventory]
requires: []
provides:
  - scripts/audit-supabase-usage.mjs
  - supabase/SUPABASE_USAGE.md
affects: [08-02, 08-03, 08-04]
tech-stack:
  added: []
  patterns: [automated grep audit, locked KEEP/PRUNE verdicts]
key-files:
  created: [scripts/audit-supabase-usage.mjs, supabase/SUPABASE_USAGE.md]
  modified: [supabase/MIGRATION_MANIFEST.md]
key-decisions:
  - "email_logs PRUNE locked (D-08-01)"
  - "admin_upsert_profile PRUNE locked (D-08-02)"
requirements-completed: [DB-01]
duration: 15min
completed: 2026-06-14
---

# Phase 8 Plan 01: Usage Inventory Summary

**Automated Supabase usage inventory with KEEP/PRUNE evidence from src/ and migrations.**

## Task Commits

1. **Tasks 1-2** — `703790a` feat(08-01): Supabase usage inventory audit

## Accomplishments

- `scripts/audit-supabase-usage.mjs` scans `.from()`, `.rpc()`, storage buckets
- `SUPABASE_USAGE.md` — 22 tables, 12 functions, 3 buckets with verdicts
- Prune queue documented for migration 036

## Deviations

None — plan executed as written.

## Self-Check: PASSED

- `scripts/audit-supabase-usage.mjs` exists
- `supabase/SUPABASE_USAGE.md` exists
- Commit `703790a` found
