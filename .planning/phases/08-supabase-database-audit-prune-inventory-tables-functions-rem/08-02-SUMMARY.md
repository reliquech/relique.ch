---
phase: 08-supabase-database-audit-prune-inventory-tables-functions-rem
plan: 02
subsystem: database
tags: [supabase, migration, prune]
requires:
  - phase: 08-01
    provides: SUPABASE_USAGE.md prune queue
provides:
  - supabase/migrations/036_prune_dead_schema.sql
affects: [08-04, 08-05]
tech-stack:
  added: []
  patterns: [additive prune migration IF EXISTS]
key-files:
  created: [supabase/migrations/036_prune_dead_schema.sql]
  modified: [supabase/MIGRATION_MANIFEST.md]
key-decisions:
  - "Do not drop handle_updated_at / handle_new_user"
requirements-completed: []
duration: 10min
completed: 2026-06-14
---

# Phase 8 Plan 02: Prune Migration 036 Summary

**Additive migration 036 drops email_logs and admin_upsert_profile; remote apply blocked.**

## Task Commits

1. **Tasks 1-2** — `e653173` feat(08-02): migration 036 prune dead schema

## Accomplishments

- `036_prune_dead_schema.sql` with IF EXISTS drops
- Manifest updated with prune section and apply order

## Auth Gates / Blockers

**[BLOCKING] Remote apply — NOT completed**

```text
$ npx supabase db push
Cannot find project ref. Have you run supabase link?
```

**Manual close:**
1. `npx supabase login`
2. `npx supabase link --project-ref <ref>`
3. `supabase db push` OR paste 036 SQL in Dashboard SQL Editor

## Deviations

None on DDL — remote apply deferred per auth gate.

## Self-Check: PASSED (code) / GAP (remote)

- `036_prune_dead_schema.sql` exists
- Commit `e653173` found
- Remote 036 apply: **pending**
