# Phase 7: Supabase Migrations Optimize - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning
**Mode:** auto-discuss (autonomous execute)

<domain>
## Phase Boundary

Tối ưu `supabase/migrations/` — docs, manifest, incremental indexes; giữ chain 001–035 cho brownfield DBs.

</domain>

<decisions>
## Implementation Decisions

### Documentation
- **D-01:** `supabase/MIGRATIONS.md` trỏ root paths — không còn `apps/web/`
- **D-02:** `supabase/MIGRATION_MANIFEST.md` — per-file inventory + overlap notes

### Schema strategy
- **D-03:** **Không squash** applied production chain — additive migration `035` only
- **D-04:** Fresh baseline `000_baseline.sql` — **deferred** (documented in manifest)

### Indexes (035)
- **D-05:** Public browse composite index on `marketplace_items`
- **D-06:** CRM queue indexes on `leads`, `consigned_items`

### Types
- **D-07:** Regen `src/lib/supabase/types.ts` — defer to Phase 4 after migration apply

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 7 success criteria
- `supabase/migrations/` — 001–035
- `supabase/MIGRATIONS.md`
- `supabase/MIGRATION_MANIFEST.md`

</canonical_refs>

<deferred>
## Deferred Ideas

- Full squash to `000_baseline.sql` — when all envs on same version
- RLS policy rewrite — Phase 3 runtime + future migration

</deferred>

---

*Phase: 07-supabase-migrations-optimize*
