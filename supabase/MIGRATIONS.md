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

## Strategies

| Environment | Approach |
|-------------|----------|
| **Existing brownfield DB** | Keep incremental chain 001–035; never rename applied files |
| **Fresh local/staging** | Apply full chain in order, or use baseline doc in `MIGRATION_MANIFEST.md` |

Moving files does **not** re-run DDL on an already-provisioned remote DB.

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
