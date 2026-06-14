# Legacy incremental migrations (001–035)

**Brownfield projects only** — apply these files in numeric order on databases that were provisioned before Phase 8 baseline.

## Contents

Files `001_create_profiles.sql` through `035_optimize_public_browse_indexes.sql` are the original incremental chain. They remain here for:

- Production databases with `supabase_migrations.schema_migrations` entries for 001+
- Auditing migration history and overlap (005+009 RLS, 014→020→025 RPC chain)

## Do not use on fresh installs

**Fresh Supabase projects** should apply only:

```
supabase/migrations/000_baseline.sql
```

The baseline represents the squashed final state **excluding** `email_logs` and `admin_upsert_profile` (post-036 prune target state).

## Brownfield apply order

| Scenario | Files |
|----------|-------|
| DB has 001–034 applied | `legacy/035` (if pending), then `../036_prune_dead_schema.sql` |
| DB has full 001–035 | `../036_prune_dead_schema.sql` only |
| DB has partial chain | Apply remaining `legacy/NNN` in order, then `036` |

## Warning

**Never apply both paths on the same database.** Running `000_baseline.sql` on a DB that already has 001+ applied will fail with duplicate object errors.

## Supabase CLI note

`supabase db push` from the active `migrations/` folder applies `000_baseline.sql` and `036` only — **not** this legacy folder. Brownfield operators must apply legacy files via SQL Editor or restore migration history before `db push`.
