# Supabase Migrations Guide

## Canonical Location

**`apps/web/supabase/migrations/`** is the single source of truth for all database schema migrations (001–031).

> **Deprecated:** `apps/admin/supabase/migrations/` is kept temporarily (D-11) until Phase 5 CONS-02 removes the `apps/admin/` directory. Do not add new migrations there — use `apps/web/supabase/migrations/` only.

## Apply Method

The Supabase CLI is **not** bundled in this repo. Apply migrations manually using one of the options below.

### Option A: Supabase Dashboard (recommended for hosted projects)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. For each file in `apps/web/supabase/migrations/`, paste the full SQL content and click **Run**.
3. Apply files in **numeric order**: `001_create_profiles.sql` → `031_add_marketplace_metadata.sql`.

### Option B: Local Supabase CLI (if installed)

```bash
cd apps/web
supabase init   # only needed once if no config.toml exists
supabase link --project-ref <your-project-ref>
supabase db push
```

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli) installed locally and a linked project.

## Important Notes

- **Moving this folder does NOT re-run migrations** on an already-provisioned hosted project. Only apply migrations that have not yet been applied.
- **New environments** (fresh Supabase project): apply all 31 migrations in numeric order before running the app.
- **Do not run `supabase db push` in CI** — migrations are applied manually or via your own deployment pipeline.
- **Order matters** — migrations are numbered 001–031; skipping or reordering can break foreign keys, RLS policies, and RPC functions.

## Verification

```bash
ls apps/web/supabase/migrations/*.sql | wc -l
# Expected output: 31
```

Confirm first and last files exist:

```bash
test -f apps/web/supabase/migrations/001_create_profiles.sql
test -f apps/web/supabase/migrations/031_add_marketplace_metadata.sql
```

## Migration Inventory

| Range | Description |
|-------|-------------|
| 001 | Profiles table |
| 002–003 | Marketplace and consigned items |
| 004–007 | Audit logs, RLS, indexes, triggers |
| 008–011 | Storage buckets (marketplace, CRM) |
| 010–012 | CRM core tables and pipeline seed |
| 013–031 | Notifications, reporting, tasks, custom fields, error logs, marketplace metadata |

See individual `.sql` files for full DDL. Storage bucket setup is also documented in [`STORAGE_GUIDE.md`](./STORAGE_GUIDE.md).
