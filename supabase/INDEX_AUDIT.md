# Index Audit — Hot Paths

**Phase:** 8  
**Generated:** 2026-06-14  
**Related:** [`MIGRATION_MANIFEST.md`](./MIGRATION_MANIFEST.md), [`RLS_AUDIT.md`](./RLS_AUDIT.md), migration `035_optimize_public_browse_indexes.sql`

## 035 confirmation

These composite indexes exist after migration 035:

| Index | Table | Definition source |
|-------|-------|-------------------|
| `marketplace_items_public_browse_idx` | `marketplace_items` | 035 — partial on `published` + `public` |
| `leads_source_status_idx` | `leads` | 035 — `(source, status, created_at desc)` |
| `consigned_items_queue_idx` | `consigned_items` | 035 — partial queue statuses |

## Hot path analysis

### 1. Public marketplace browse

- **Query source:** `src/app/api/marketplace/route.ts:92-97` (`publicGet`)
- **WHERE/ORDER BY:** `state_lifecycle = 'published'`, `state_visibility = 'public'`, optional `listing_category`, sort `price_amount`
- **Matching index:** `marketplace_items_public_browse_idx` (035)
- **Also:** `marketplace_items_price_amount_idx`, `marketplace_items_category_idx` (002)
- **Verdict:** **COVERED**

### 2. Verify lookup (`product_id` / COA)

- **Query source:** `src/lib/verify/lookupCode.ts:29-36`
- **WHERE:** `product_id` eq or `auth.coa_refs` contains
- **Matching index:** `marketplace_items_product_id_idx` (032), `marketplace_items_auth_coa_refs_idx` GIN (032)
- **Verdict:** **COVERED**

### 3. CRM leads queue

- **Query source:** `src/app/api/leads/route.ts` — filter `status`, `source`, order `created_at`
- **WHERE/ORDER BY:** `source`, `status`, `created_at desc`
- **Matching index:** `leads_source_status_idx` (035); also `leads_status_idx`, `leads_created_at_idx` (010)
- **Verdict:** **COVERED**

### 4. Consign queue

- **Query source:** `src/app/api/consigned/route.ts` — filter `status`, order `created_at`
- **WHERE/ORDER BY:** `status IN (submitted, in_review)`, `created_at desc`
- **Matching index:** `consigned_items_queue_idx` (035); `consigned_items_status_created_idx` (006)
- **Verdict:** **COVERED**

### 5. Dashboard RPCs

- **Query source:** `src/app/api/dashboard/route.ts` — 7 RPCs
- **Note:** RPC-internal SQL on `leads`, `deals`, `messages`, `audit_logs`; uses underlying table indexes from 010/004
- **Verdict:** **COVERED** (RPC bodies in 025; no app-side index gap)

### 6. `audit_logs` (high write)

- **Query source:** Many mutate routes insert; `src/app/api/audit-logs/route.ts`, `src/app/api/activity/route.ts`
- **Indexes:** `audit_logs_created_at_idx`, `audit_logs_entity_type_idx`, `audit_logs_entity_id_idx`, `audit_logs_actor_id_idx` (004)
- **Verdict:** **COVERED** for read patterns; **DEFER** retention/partitioning (v1 — document only)

### 7. Alert rules run

- **Query source:** `src/app/api/alert-rules/run/route.ts:203` — `alert_rules` where `enabled`; entity counts on leads/deals/messages
- **Indexes:** `alert_rules_enabled_idx`, `alert_rules_entity_idx` (013, 021); entity table indexes from 010
- **Verdict:** **COVERED**

## Gaps & deferrals

| Path | Verdict | Recommendation |
|------|---------|----------------|
| Full-text marketplace search | **DEFER** | GIN index commented out in 006 — not used in v1 API |
| `audit_logs` retention | **DEFER** | High write volume; archive/partition job future work |
| `crm_custom_field_values` join at scale | **DEFER** | `crm_custom_field_values_entity_idx` (019) exists; monitor |

## Cross-links

- RLS public browse alignment: [`RLS_AUDIT.md`](./RLS_AUDIT.md) SEC-04 section
- Migration chain: [`MIGRATION_MANIFEST.md`](./MIGRATION_MANIFEST.md) — 035 optimization section
