# Supabase Migrations Guide

## Canonical location

**`supabase/migrations/`** at repo root is the single source of truth (001–035).

## Apply migrations

### Option A: Supabase Dashboard (hosted projects)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project → **SQL Editor**
2. Apply only migrations **not yet applied** on that project, in numeric order.
3. For a **fresh** project: run all files `001` → `035` sequentially.

### Option B: Supabase CLI

```bash
# From repo root
supabase link --project-ref <your-project-ref>
supabase db push
```

Requires [Supabase CLI](https://supabase.com/docs/guides/cli) and `supabase/config.toml`.

## Brownfield rule (D-03)

On databases that already have migrations applied:

- **Never rename, reorder, or delete** migration files that appear in `supabase_migrations.schema_migrations`.
- **Additive only** — new work goes in the next numbered file (currently `035`).
- Do **not** squash applied history into `000_baseline.sql` until Phase 8 publishes a baseline (see manifest).

Moving or editing files locally does **not** re-run DDL on an already-provisioned remote DB.

## Strategies

| Environment | Approach |
|-------------|----------|
| **Existing brownfield DB** | Apply only unapplied files in order via `db push` or SQL Editor |
| **Fresh local/staging** | Apply full chain `001` → `035` in order |

## Verification

```bash
ls supabase/migrations/*.sql | wc -l
# Expected: 35
```

```bash
npm run check-types && npm run build
```

## Related docs

- [`MIGRATION_MANIFEST.md`](./MIGRATION_MANIFEST.md) — per-file purpose and overlap notes
- [`STORAGE_GUIDE.md`](./STORAGE_GUIDE.md) — bucket setup
