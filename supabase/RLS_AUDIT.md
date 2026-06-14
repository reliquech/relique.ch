# RLS Audit Matrix

**Phase:** 8 — Supabase database audit  
**Generated:** 2026-06-14  
**Related:** [`SUPABASE_USAGE.md`](./SUPABASE_USAGE.md), [`MIGRATION_MANIFEST.md`](./MIGRATION_MANIFEST.md)

## Summary (KEEP tables)

| Table | RLS enabled | anon SELECT | anon INSERT/UPDATE/DELETE | authenticated policies | service_role pattern | SEC-04 notes |
|-------|-------------|-------------|---------------------------|------------------------|----------------------|--------------|
| `profiles` | yes | no | no | SELECT/UPDATE own row (`id = auth.uid()`) | bypass via API | — |
| `marketplace_items` | yes | SELECT published+unlisted public **or** own drafts | no | same SELECT policy | bypass via API | **SEC-04:** public API filters `published` + `public`; RLS also allows `unlisted` for anon — app layer is stricter |
| `consigned_items` | yes | no | no | none | **admin-only** service_role | no anon access |
| `audit_logs` | yes | no | no | none | **admin-only** service_role | no anon access |
| `customers` | yes | no | no | none | **admin-only** service_role | — |
| `leads` | yes | no | no | none | **admin-only** service_role | public contact/consign use service_role in route handlers |
| `deals` | yes | no | no | none | **admin-only** service_role | — |
| `messages` | yes | no | no | none | **admin-only** service_role | — |
| `attachments` | yes | no | no | none | **admin-only** service_role | — |
| `pipeline_stages` | yes | no | no | none | **admin-only** service_role | — |
| `notifications` | yes | no | no | per-user CRUD own rows | service_role for alert run | — |
| `alert_rules` | yes | no | no | per-user CRUD own rows | service_role for run/preview | — |
| `crm_saved_views` | yes | no | no | per-user CRUD own rows | service_role in CRM API | — |
| `crm_saved_filters` | yes | no | no | per-user CRUD own rows | service_role in CRM API | — |
| `crm_recent_searches` | yes | no | no | per-user CRUD own rows | service_role in CRM API | — |
| `crm_custom_fields` | yes | no | no | none | **admin-only** service_role | — |
| `crm_custom_field_values` | yes | no | no | none | **admin-only** service_role | — |
| `tasks` | yes | no | no | per-user CRUD own rows | service_role in tasks API | — |
| `notification_preferences` | yes | no | no | per-user CRUD own rows | service_role | — |
| `dashboard_reports` | yes | no | no | per-user manage own rows | service_role | — |
| `error_logs` | yes | no | no | **none** (no policies) | **service_role only** via `/api/error-log` | — |
| `email_logs` | — | — | — | — | — | **REMOVED** by migration 036 |

## Per-table policy detail

### `profiles` (001, 009 effective)

- `Users can view own profile` — SELECT where `(select auth.uid()) = id` (009 replaces 001)
- `Users can update own profile` — UPDATE where `(select auth.uid()) = id`

### `marketplace_items` (002, 009 effective)

- `Select published or own drafts` — SELECT where:
  - `(state_lifecycle = 'published' AND state_visibility IN ('public', 'unlisted'))`
  - OR `created_by = auth.uid()`
- **SEC-04 alignment:** `src/app/api/marketplace/route.ts` `publicGet()` uses `createAnonClient()` and filters `.eq("state_lifecycle", "published").eq("state_visibility", "public")` — stricter than RLS minimum (excludes `unlisted` from public browse).
- Verify lookup: `src/lib/verify/lookupCode.ts` uses anon client with product_id / COA filters.

### CRM core (`customers`, `leads`, `deals`, `messages`, `attachments`, `pipeline_stages`) — 010

- RLS **enabled**, **no policies** → deny all for anon/authenticated direct access.
- All CRM routes use `createServiceRoleClient()` + `requireUser` / `requireRole`.

### `consigned_items` (003), `audit_logs` (004)

- RLS enabled, no public policies — service_role only.

### `notifications`, `alert_rules` (013)

- Per-user SELECT/INSERT/UPDATE/DELETE where `user_id = auth.uid()`.
- Admin run routes bypass via service_role.

### CRM views/filters/searches (016)

- Per-user policies on `user_id = auth.uid()` for views, filters, recent searches.

### `tasks` (018), `notification_preferences` (022), `dashboard_reports` (025)

- Per-user own-row policies.

### `crm_custom_fields`, `crm_custom_field_values` (019)

- RLS enabled, no user policies — service_role API only.

### `error_logs` (029)

- RLS enabled, **intentionally no policies** — only service_role inserts via server routes.

### Storage buckets (008, 011, 033)

| Bucket | anon | authenticated | Notes |
|--------|------|---------------|-------|
| `marketplace-images` | SELECT (public read) | INSERT/UPDATE/DELETE | Public CDN URLs |
| `crm-attachments` | no | full CRUD | Admin CRM uploads |
| `consign-submissions` | upload via service_role in `/api/public/consign` | — | Public consign uses service role, not anon storage |

## Client usage map

| Access pattern | Client | Routes |
|----------------|--------|--------|
| Public browse | `createAnonClient()` | `/api/marketplace` (GET public), verify via `lookupCode` |
| Public submit | `createServiceRoleClient()` | `/api/public/contact`, `/api/public/consign` |
| Admin mutate | `createServiceRoleClient()` + `requireUser`/`requireRole` | `/api/leads`, `/api/deals`, `/api/consigned`, CRM, marketplace admin |
| Dashboard RPCs | `createServiceRoleClient()` + `requireUser` | `/api/dashboard` |
| Health probe | `createServiceRoleClient()` | `/api/health` |

## Overlap: 005 + 009

- `005_create_rls_policies.sql` is mostly documentation; substantive policies live in table migrations.
- `009_fix_rls_performance.sql` **replaces** profiles and marketplace_items SELECT policies with initplan-safe versions.
- **Effective state:** policies as defined in 009 for profiles + marketplace_items; all other tables unchanged.

## Findings & recommendations

1. **SEC-04 PASS (app layer):** Public marketplace route enforces `published` + `public` despite RLS allowing `unlisted` — defense in depth.
2. **CRM tables:** No anon policies — correct for admin CRM; public flows intentionally use service_role in controlled API routes (Phase 3 pattern).
3. **`email_logs`:** Removed in 036 — no RLS maintenance needed.
4. **Future (out of scope):** Merge 005+009 into baseline only (not on live DB); consider narrowing marketplace RLS to `public` only if direct anon queries outside app are a concern.

**Requirement reference:** SEC-04 — public marketplace browse scoped to published public listings.
