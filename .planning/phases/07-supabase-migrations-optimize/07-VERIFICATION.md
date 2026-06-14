# Phase 7 Verification Report

**Phase:** 07-supabase-migrations-optimize
**Status:** blocked — remote apply pending
**Score:** 7/8 (types regen deferred per D-07, not failed)

## Automated gates

| Check | Result | Notes |
|-------|--------|-------|
| `MIGRATIONS.md` updated for root | PASS | Plan 07-01 |
| `MIGRATION_MANIFEST.md` complete | PASS | 001–035 inventory, buckets, RPCs |
| `035_optimize_public_browse_indexes.sql` verified | PASS | Plan 07-02 |
| 35 migration files (Phase 7 scope) | PASS | 001–035; `036` is Phase 8 — out of scope |
| Overlap documented (005/009, RPC chain) | PASS | Manifest |
| `npm run check-types` | PASS | 2026-06-14 |
| `npm run build` | PASS | 2026-06-14 |
| Migration 035 applied remote | **BLOCKED** | See manual apply below |

## Migration 035 apply status

**Status:** NOT APPLIED (2026-06-14)

**Automated attempt:**
```text
npx supabase db push
→ Cannot find project ref. Have you run supabase link?
```

**Blockers:**
- `SUPABASE_ACCESS_TOKEN` not set in executor environment
- No `supabase/config.toml` or linked project ref
- `.env.local` not present (no credentials for link)

## Manual apply steps (required to close phase)

1. **Login & link** (one-time, from repo root):
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   ```
   Project ref: Supabase Dashboard → Project Settings → General → Reference ID

2. **Push migration 035 only** (brownfield — 001–034 should already be applied):
   ```bash
   npx supabase db push
   ```
   If CLI tries to apply only unapplied migrations, only `035` should run.

3. **Alternative — SQL Editor:**
   - Dashboard → SQL Editor
   - Paste contents of `supabase/migrations/035_optimize_public_browse_indexes.sql`
   - Run

4. **Verify indexes exist:**
   ```sql
   SELECT indexname FROM pg_indexes
   WHERE schemaname = 'public'
     AND indexname IN (
       'marketplace_items_public_browse_idx',
       'leads_source_status_idx',
       'consigned_items_queue_idx'
     );
   ```
   Expect **3 rows**.

5. **Verify migration history:**
   ```bash
   npx supabase migration list
   ```
   Expect `035_optimize_public_browse_indexes` as applied.

## Deferred (not failures)

| Item | Disposition | Target phase |
|------|-------------|--------------|
| `supabase gen types typescript` → `src/lib/supabase/types.ts` | DEFERRED per D-07 | Phase 4 |
| `000_baseline.sql` squash | DEFERRED per D-04 | Phase 8 |

## Resume signal

After manual apply succeeds, type **"applied"** to resume executor or update this file to PASS and set phase status `complete`.
