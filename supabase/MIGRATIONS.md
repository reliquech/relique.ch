# Supabase Migrations Guide

## Canonical location

**`supabase/migrations/`** at repo root — dual-path strategy (Phase 8).

| Path | Purpose |
|------|---------|
| `000_baseline.sql` | **Fresh installs** — single squashed schema (post-prune state) |
| `036_prune_dead_schema.sql` | **Brownfield** — drop `email_logs` + `admin_upsert_profile` |
| `legacy/001` → `legacy/035` | **Brownfield** — original incremental chain (archived, not deleted) |

## Dual-path strategies

| Scenario | Files to apply |
|----------|----------------|
| **Fresh project** | `000_baseline.sql` only |
| **Existing brownfield (partial chain)** | `legacy/001` → remaining `legacy/NNN` in order, then `036` |
| **Already on 001–035** | `036_prune_dead_schema.sql` only |

**Never** apply `000_baseline.sql` on a database that already has migrations 001+ applied.

## Apply migrations

### Fresh install — SQL Editor

1. Supabase Dashboard → **SQL Editor**
2. Paste and run `supabase/migrations/000_baseline.sql`

### Brownfield — SQL Editor

1. Apply any pending files from `supabase/migrations/legacy/` in numeric order
2. Apply `036_prune_dead_schema.sql`

### Supabase CLI

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Note:** CLI `db push` applies only files in `migrations/` root (`000_baseline`, `036`). Brownfield DBs with existing history must apply `legacy/` chain manually or via migration history table — see [`legacy/README.md`](./migrations/legacy/README.md).

## Brownfield rule (D-03)

On databases that already have migrations applied:

- **Never rename, reorder, or delete** migration files that appear in `supabase_migrations.schema_migrations`.
- **Additive only** — prune via `036`, not by editing `legacy/` files.

## Operator scripts

```bash
# Regenerate usage inventory
node scripts/audit-supabase-usage.mjs

# Regenerate baseline (after legacy chain changes — rare)
node scripts/squash-baseline.mjs

# Regenerate TypeScript types (requires linked Supabase project + 036 applied)
npm run gen:types

# Post-prune smoke checks (dev server on :1300)
npm run smoke:supabase
```

## Verification

```bash
npm run check-types && npm run build
npm run smoke:supabase
```

## Rollback (036)

036 drops are **irreversible** without backup restore. To rollback code-only: revert app deploy; schema restore requires point-in-time recovery or re-create dropped objects manually (not recommended — `email_logs` intentionally removed).

## Related docs

- [`MIGRATION_MANIFEST.md`](./MIGRATION_MANIFEST.md) — per-file purpose and overlap notes
- [`SUPABASE_USAGE.md`](./SUPABASE_USAGE.md) — table/RPC KEEP/PRUNE inventory
- [`RLS_AUDIT.md`](./RLS_AUDIT.md) — RLS matrix (SEC-04)
- [`INDEX_AUDIT.md`](./INDEX_AUDIT.md) — hot-path index coverage
- [`STORAGE_GUIDE.md`](./STORAGE_GUIDE.md) — bucket setup
