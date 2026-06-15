# Supabase Usage Inventory

**Generated:** 2026-06-14T14:31:21.318Z  
**Script:** `node scripts/audit-supabase-usage.mjs`  
**Purpose:** Authoritative KEEP/PRUNE map for Phase 8 prune + baseline.

## Tables

| Object | Migrations | App refs | Verdict | Notes |
|--------|------------|----------|---------|-------|
| `alert_rules` | 013_create_notifications_alert_rules.sql | 0 refs | **PRUNE** | Phase 9 — automations removed |
| `attachments` | 010_create_crm_core.sql | src/app/api/activity/route.ts:42, src/app/api/attachments/route.ts:28, src/app/api/attachments/route.ts:68, src/app/api/attachments/upload-url/route.ts:44, src/app/api/attachments/[id]/route.ts:29, src/app/api/attachments/[id]/route.ts:56, src/app/api/attachments/[id]/route.ts:91, src/app/api/public/consign/route.ts:116 | **KEEP** | 8 app ref(s) |
| `audit_logs` | 004_create_audit_logs.sql | src/app/api/activity/note/route.ts:30, src/app/api/activity/route.ts:28, src/app/api/attachments/route.ts:77, src/app/api/attachments/[id]/route.ts:66, src/app/api/attachments/[id]/route.ts:99, src/app/api/audit-logs/route.ts:18, src/app/api/consigned/route.ts:103, src/app/api/consigned/[id]/convert/route.ts:124, src/app/api/consigned/[id]/route.ts:93, src/app/api/consigned/[id]/route.ts:141, src/app/api/customers/route.ts:103, src/app/api/customers/[id]/route.ts:73, src/app/api/customers/[id]/route.ts:111, src/app/api/deals/route.ts:114, src/app/api/deals/[id]/route.ts:76, src/app/api/deals/[id]/route.ts:114, src/app/api/health/route.ts:18, src/app/api/leads/route.ts:103, src/app/api/leads/[id]/route.ts:73, src/app/api/leads/[id]/route.ts:111, src/app/api/marketplace/route.ts:190, src/app/api/marketplace/[param]/route.ts:140, src/app/api/marketplace/[param]/route.ts:180, src/app/api/marketplace/[param]/status/route.ts:56, src/app/api/messages/route.ts:98, src/app/api/messages/[id]/route.ts:73, src/app/api/messages/[id]/route.ts:111, src/app/api/pipeline-stages/route.ts:67, src/app/api/pipeline-stages/[id]/route.ts:67, src/app/api/pipeline-stages/[id]/route.ts:105, src/app/api/tasks/route.ts:132, src/app/api/tasks/[id]/route.ts:68, src/app/api/tasks/[id]/route.ts:102, src/app/api/users/route.ts:80, src/app/api/users/[id]/route.ts:38 | **KEEP** | 35 app ref(s) |
| `consign-submissions` | — | src/app/api/public/consign/route.ts:105 | **KEEP** | 1 app ref(s) |
| `consigned_items` | 003_create_consigned_items.sql | src/app/api/consigned/route.ts:40, src/app/api/consigned/route.ts:90, src/app/api/consigned/[id]/convert/route.ts:22, src/app/api/consigned/[id]/convert/route.ts:116, src/app/api/consigned/[id]/route.ts:36, src/app/api/consigned/[id]/route.ts:79, src/app/api/consigned/[id]/route.ts:129, src/app/api/public/consign/route.ts:65 | **KEEP** | 8 app ref(s) |
| `crm_custom_field_values` | 019_create_crm_custom_fields.sql | 0 refs | **PRUNE** | Phase 9 — custom fields removed |
| `crm_custom_fields` | 019_create_crm_custom_fields.sql | 0 refs | **PRUNE** | Phase 9 — custom fields removed |
| `crm_recent_searches` | 016_create_crm_views_filters.sql | src/app/api/crm-searches/route.ts:20, src/app/api/crm-searches/route.ts:52, src/app/api/crm-searches/route.ts:62, src/app/api/crm-searches/route.ts:73 | **KEEP** | 4 app ref(s) |
| `crm_saved_filters` | 016_create_crm_views_filters.sql | src/app/api/crm-filters/route.ts:22, src/app/api/crm-filters/route.ts:53, src/app/api/crm-filters/[id]/route.ts:27, src/app/api/crm-filters/[id]/route.ts:56 | **KEEP** | 4 app ref(s) |
| `crm_saved_views` | 016_create_crm_views_filters.sql | src/app/api/crm-views/route.ts:22, src/app/api/crm-views/route.ts:33, src/app/api/crm-views/route.ts:65, src/app/api/crm-views/[id]/route.ts:28, src/app/api/crm-views/[id]/route.ts:32, src/app/api/crm-views/[id]/route.ts:41, src/app/api/crm-views/[id]/route.ts:70 | **KEEP** | 7 app ref(s) |
| `customers` | 010_create_crm_core.sql | src/app/api/customers/bulk-update/route.ts:30, src/app/api/customers/route.ts:35, src/app/api/customers/route.ts:94, src/app/api/customers/[id]/route.ts:31, src/app/api/customers/[id]/route.ts:63, src/app/api/customers/[id]/route.ts:103 | **KEEP** | 6 app ref(s) |
| `dashboard_reports` | 025_dashboard_reports_and_rpc.sql | src/app/api/dashboard/reports/route.ts:19, src/app/api/dashboard/reports/route.ts:40, src/app/api/dashboard/reports/route.ts:45, src/app/api/dashboard/reports/[id]/route.ts:23, src/app/api/dashboard/reports/[id]/route.ts:51, src/app/api/dashboard/reports/[id]/route.ts:56, src/app/api/dashboard/reports/[id]/route.ts:83 | **KEEP** | 7 app ref(s) |
| `deals` | 010_create_crm_core.sql | src/app/api/alert-rules/preview/route.ts:66, src/app/api/alert-rules/preview/route.ts:192, src/app/api/alert-rules/run/route.ts:71, src/app/api/deals/bulk-update/route.ts:32, src/app/api/deals/route.ts:41, src/app/api/deals/route.ts:105, src/app/api/deals/[id]/route.ts:34, src/app/api/deals/[id]/route.ts:66, src/app/api/deals/[id]/route.ts:106 | **KEEP** | 9 app ref(s) |
| `email_logs` | 017_create_email_logs.sql | 0 refs | **PRUNE** | Resend removed — locked D-08-01 |
| `error_logs` | 029_create_error_logs.sql | src/app/api/error-log/route.ts:27, src/lib/observability/serverErrorLog.ts:15 | **KEEP** | 2 app ref(s) |
| `leads` | 010_create_crm_core.sql | src/app/api/alert-rules/preview/route.ts:27, src/app/api/alert-rules/preview/route.ts:166, src/app/api/alert-rules/run/route.ts:32, src/app/api/leads/bulk-update/route.ts:31, src/app/api/leads/route.ts:35, src/app/api/leads/route.ts:94, src/app/api/leads/[id]/route.ts:31, src/app/api/leads/[id]/route.ts:63, src/app/api/leads/[id]/route.ts:103, src/app/api/public/consign/route.ts:87, src/app/api/public/contact/route.ts:24 | **KEEP** | 11 app ref(s) |
| `marketplace_items` | 002_create_marketplace_items.sql | src/app/api/consigned/[id]/convert/route.ts:100, src/app/api/marketplace/route.ts:52, src/app/api/marketplace/route.ts:93, src/app/api/marketplace/route.ts:180, src/app/api/marketplace/[param]/route.ts:36, src/app/api/marketplace/[param]/route.ts:54, src/app/api/marketplace/[param]/route.ts:109, src/app/api/marketplace/[param]/route.ts:125, src/app/api/marketplace/[param]/route.ts:173, src/app/api/marketplace/[param]/status/route.ts:26, src/app/api/marketplace/[param]/status/route.ts:45, src/lib/verify/lookupCode.ts:29, src/lib/verify/lookupCode.ts:36 | **KEEP** | 13 app ref(s) |
| `messages` | 010_create_crm_core.sql | src/app/api/activity/route.ts:50, src/app/api/activity/route.ts:57, src/app/api/alert-rules/preview/route.ts:101, src/app/api/alert-rules/preview/route.ts:217, src/app/api/alert-rules/run/route.ts:106, src/app/api/messages/route.ts:34, src/app/api/messages/route.ts:89, src/app/api/messages/[id]/route.ts:31, src/app/api/messages/[id]/route.ts:63, src/app/api/messages/[id]/route.ts:103, src/app/api/public/contact/route.ts:44 | **KEEP** | 11 app ref(s) |
| `notification_preferences` | 022_create_notification_preferences.sql | src/app/api/alert-rules/run/route.ts:168, src/app/api/alert-rules/run/route.ts:176, src/app/api/notification-preferences/route.ts:19, src/app/api/notification-preferences/route.ts:29, src/app/api/notification-preferences/route.ts:55 | **KEEP** | 5 app ref(s) |
| `notifications` | 013_create_notifications_alert_rules.sql | src/app/api/alert-rules/run/route.ts:283, src/app/api/notifications/route.ts:18, src/app/api/notifications/route.ts:55, src/app/api/notifications/[id]/route.ts:18, src/app/api/notifications/[id]/route.ts:47 | **KEEP** | 5 app ref(s) |
| `pipeline_stages` | 010_create_crm_core.sql | 0 refs | **PRUNE** | Phase 9 — pipeline kanban removed |
| `profiles` | 001_create_profiles.sql, 030_admin_create_account_function.sql | src/admin/users/hooks/useProfile.ts:34, src/admin/users/pages/ProfilePage.tsx:58, src/app/admin/(portal)/profile/page.tsx:58, src/app/api/users/route.ts:31, src/app/api/users/route.ts:77, src/app/api/users/[id]/route.ts:28, src/lib/supabase/requireRole.ts:14 | **KEEP** | 7 app ref(s) |
| `tasks` | 018_create_tasks.sql | 0 refs | **PRUNE** | Phase 9 — tasks module removed |

## RPC / Functions

| Object | Migrations | App refs | Verdict | Notes |
|--------|------------|----------|---------|-------|
| `admin_upsert_profile` | 030_admin_create_account_function.sql | 0 refs | **PRUNE** | unused RPC — locked D-08-02 |
| `crm_activity_series` | 014_create_crm_reporting_functions.sql | src/app/api/dashboard/route.ts:61 | **KEEP** | dashboard RPC — locked |
| `crm_dashboard_summary` | 014_create_crm_reporting_functions.sql | src/app/api/dashboard/route.ts:60, src/app/api/dashboard/route.ts:89 | **KEEP** | dashboard RPC — locked |
| `crm_deal_aging` | 020_extend_crm_reporting_functions.sql | src/app/api/dashboard/route.ts:64 | **KEEP** | dashboard RPC — locked |
| `crm_funnel_by_source` | 025_dashboard_reports_and_rpc.sql | src/app/api/dashboard/route.ts:66 | **KEEP** | dashboard RPC — locked |
| `crm_funnel_summary` | 020_extend_crm_reporting_functions.sql | src/app/api/dashboard/route.ts:62, src/app/api/dashboard/route.ts:90 | **KEEP** | dashboard RPC — locked |
| `crm_lead_source_performance` | 020_extend_crm_reporting_functions.sql | src/app/api/dashboard/route.ts:63 | **KEEP** | dashboard RPC — locked |
| `crm_stage_velocity` | 025_dashboard_reports_and_rpc.sql | src/app/api/dashboard/route.ts:65 | **KEEP** | dashboard RPC — locked |
| `handle_new_user` | 001_create_profiles.sql, 015_add_profiles_role.sql, 030_admin_create_account_function.sql | 0 refs | **MERGE_IN_BASELINE** | trigger-only; consolidate in baseline |
| `handle_updated_at` | 001_create_profiles.sql, 030_admin_create_account_function.sql | 0 refs | **MERGE_IN_BASELINE** | trigger-only; consolidate in baseline |
| `log_audit_event` | 007_create_triggers.sql | 0 refs | **MERGE_IN_BASELINE** | trigger-only |
| `set_marketplace_state_timestamps` | 002_create_marketplace_items.sql | 0 refs | **MERGE_IN_BASELINE** | trigger-only |

## Storage Buckets

| Object | Migrations | App refs | Verdict | Notes |
|--------|------------|----------|---------|-------|
| `consign-submissions` | 033_storage_consign_submissions.sql | 0 refs | **KEEP** | locked — public consign upload |
| `crm-attachments` | 011_storage_crm.sql, 011_storage_crm.sql | 0 refs | **KEEP** | locked — CRM attachments |
| `marketplace-images` | 008_storage_marketplace.sql, 008_storage_marketplace.sql | 0 refs | **KEEP** | locked — marketplace upload |

## Schema objects not queried by app

Objects below exist only in migrations (policies, indexes, triggers) or as trigger-only functions — **infra only**, no direct `.from()` / `.rpc()` in `src/`.

| Object | Type | Note |
|--------|------|------|
| RLS policies | policy | Defined across 005, 009, per-table migrations — see RLS_AUDIT.md (08-03) |
| Indexes | index | 006, 032, 035 and per-table indexes — see INDEX_AUDIT.md (08-03) |
| Triggers | trigger | 007 + per-table — invoke MERGE_IN_BASELINE functions |
| `handle_updated_at` | function | Trigger-only — MERGE_IN_BASELINE |
| `handle_new_user` | function | Trigger-only — MERGE_IN_BASELINE |
| `log_audit_event` | function | Trigger-only |
| `set_marketplace_state_timestamps` | function | Trigger-only |

## Overlap registry

| Area | Files | Resolution |
|------|-------|------------|
| RLS | 005 + 009 | 009 patches performance; effective policies = both applied; baseline merges per RLS_AUDIT |
| RPC chain | 014 → 020 → 025 | Final bodies from 025 (includes 014+020 extensions) |
| Profiles DDL | 001 + 015 + 030 | 030 table recreate redundant on DBs with 001–015 applied; keep trigger helpers from 030 |

## Prune queue (migration 036)

| Object | Action | SQL preview |
|--------|--------|-------------|
| `email_logs` | DROP TABLE CASCADE | `drop table if exists public.email_logs cascade;` |
| `admin_upsert_profile` | DROP FUNCTION | `drop function if exists public.admin_upsert_profile(uuid, text, text, text);` |

**Do NOT drop:** `handle_updated_at`, `handle_new_user`, 7 dashboard CRM RPCs, storage buckets.

## Evidence index

All `src/` files touching Supabase (79 files):

- `src/admin/crm/components/AttachmentsPanel.tsx`
- `src/admin/crm/components/CustomFieldsSection.tsx`
- `src/admin/crm/hooks/useAttachmentsUpload.ts`
- `src/admin/crm/pages/CustomersPage.tsx`
- `src/admin/crm/pages/DealsPage.tsx`
- `src/admin/crm/pages/LeadsPage.tsx`
- `src/admin/crm/pages/MessagesPage.tsx`
- `src/admin/crm/services/storageService.ts`
- `src/admin/marketplace/components/MarketplaceForm.tsx`
- `src/admin/tasks/pages/TasksPage.tsx`
- `src/admin/users/hooks/useProfile.ts`
- `src/admin/users/pages/ProfilePage.tsx`
- `src/app/admin/(portal)/profile/page.tsx`
- `src/app/api/activity/note/route.ts`
- `src/app/api/activity/route.ts`
- `src/app/api/alert-rules/[id]/route.ts`
- `src/app/api/alert-rules/preview/route.ts`
- `src/app/api/alert-rules/route.ts`
- `src/app/api/alert-rules/run/route.ts`
- `src/app/api/attachments/[id]/route.ts`
- `src/app/api/attachments/route.ts`
- `src/app/api/attachments/upload-url/route.ts`
- `src/app/api/audit-logs/route.ts`
- `src/app/api/consigned/[id]/convert/route.ts`
- `src/app/api/consigned/[id]/route.ts`
- `src/app/api/consigned/route.ts`
- `src/app/api/crm-filters/[id]/route.ts`
- `src/app/api/crm-filters/route.ts`
- `src/app/api/crm-searches/route.ts`
- `src/app/api/crm-views/[id]/route.ts`
- `src/app/api/crm-views/route.ts`
- `src/app/api/custom-field-values/route.ts`
- `src/app/api/custom-fields/[id]/route.ts`
- `src/app/api/custom-fields/export/route.ts`
- `src/app/api/custom-fields/import/route.ts`
- `src/app/api/custom-fields/route.ts`
- `src/app/api/customers/[id]/route.ts`
- `src/app/api/customers/bulk-update/route.ts`
- `src/app/api/customers/route.ts`
- `src/app/api/dashboard/reports/[id]/route.ts`
- `src/app/api/dashboard/reports/route.ts`
- `src/app/api/dashboard/route.ts`
- `src/app/api/deals/[id]/route.ts`
- `src/app/api/deals/bulk-update/route.ts`
- `src/app/api/deals/route.ts`
- `src/app/api/error-log/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/leads/[id]/route.ts`
- `src/app/api/leads/bulk-update/route.ts`
- `src/app/api/leads/route.ts`
- `src/app/api/marketplace/[param]/route.ts`
- `src/app/api/marketplace/[param]/status/route.ts`
- `src/app/api/marketplace/route.ts`
- `src/app/api/marketplace/upload/cleanup/route.ts`
- `src/app/api/marketplace/upload/finalize/route.ts`
- `src/app/api/marketplace/upload/route.ts`
- `src/app/api/messages/[id]/route.ts`
- `src/app/api/messages/route.ts`
- `src/app/api/notification-preferences/route.ts`
- `src/app/api/notifications/[id]/route.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/pipeline-stages/[id]/route.ts`
- `src/app/api/pipeline-stages/route.ts`
- `src/app/api/public/consign/route.ts`
- `src/app/api/public/contact/route.ts`
- `src/app/api/tasks/[id]/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/app/api/users/route.ts`
- `src/components/inputs/FileUpload.tsx`
- `src/components/shared/ConsignPhotoUpload.tsx`
- `src/lib/observability/serverErrorLog.ts`
- `src/lib/services/impl/content.local.ts`
- `src/lib/services/impl/marketplace.local.ts`
- `src/lib/supabase/requireRole.ts`
- `src/lib/ui/form/upload-manager/upload-manager.tsx`
- `src/lib/ui/states/skeletons.tsx`
- `src/lib/ui/table/data-table.tsx`
- `src/lib/verify/lookupCode.ts`

## Locked decisions

- **PRUNE** `email_logs` — Resend removed from v1 (D-08-01)
- **PRUNE** `admin_upsert_profile` — users API uses `.upsert()` directly (D-08-02)
- **KEEP** 7 dashboard RPCs — `src/app/api/dashboard/route.ts`
- **KEEP** 3 buckets — `marketplace-images`, `crm-attachments`, `consign-submissions`
