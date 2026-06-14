# Migration Manifest

Incremental chain for Relique.co unified platform. **Do not reorder** files already applied in production.

## Per-file inventory (001–035)

| # | File | Purpose |
|---|------|---------|
| 001 | `001_create_profiles.sql` | `profiles` table, `handle_updated_at`, `handle_new_user` |
| 002 | `002_create_marketplace_items.sql` | `marketplace_items`, lifecycle timestamps trigger |
| 003 | `003_create_consigned_items.sql` | `consigned_items` consign queue |
| 004 | `004_create_audit_logs.sql` | `audit_logs` table |
| 005 | `005_create_rls_policies.sql` | RLS policies (initial) |
| 006 | `006_create_indexes.sql` | Performance indexes |
| 007 | `007_create_triggers.sql` | Audit triggers, `log_audit_event` |
| 008 | `008_storage_marketplace.sql` | Storage bucket `marketplace-images` |
| 009 | `009_fix_rls_performance.sql` | RLS performance patch *(overlaps 005)* |
| 010 | `010_create_crm_core.sql` | CRM core (`leads`, `deals`, `customers`, `messages`, …) |
| 011 | `011_storage_crm.sql` | Storage bucket `crm-attachments` |
| 012 | `012_seed_pipeline_stages.sql` | Pipeline stage seed data |
| 013 | `013_create_notifications_alert_rules.sql` | Notifications + alert rules |
| 014 | `014_create_crm_reporting_functions.sql` | CRM dashboard RPCs *(extended by 020, 025)* |
| 015 | `015_add_profiles_role.sql` | Profiles `role` column, `handle_new_user` update |
| 016 | `016_create_crm_views_filters.sql` | CRM saved views + filters |
| 017 | `017_create_email_logs.sql` | `email_logs` table |
| 018 | `018_create_tasks.sql` | Tasks table |
| 019 | `019_create_crm_custom_fields.sql` | CRM custom fields |
| 020 | `020_extend_crm_reporting_functions.sql` | Extend reporting RPCs |
| 021 | `021_extend_alert_rules_conditions.sql` | Alert rules conditions |
| 022 | `022_create_notification_preferences.sql` | Notification preferences |
| 023 | `023_attachments_title_note.sql` | Attachment title/note metadata |
| 024 | `024_custom_fields_group_visibility.sql` | Custom field groups + visibility |
| 025 | `025_dashboard_reports_and_rpc.sql` | Dashboard reports + stage velocity RPCs |
| 026 | `026_alert_rules_priority_active_hours_actions.sql` | Alert rule priority, hours, actions |
| 027 | `027_add_owner_id_deals_customers.sql` | `owner_id` on deals/customers |
| 028 | `028_crm_saved_views_is_default_shared.sql` | Saved views default/shared flags |
| 029 | `029_create_error_logs.sql` | Client/server error logs |
| 030 | `030_admin_create_account_function.sql` | Admin profile upsert, trigger refresh |
| 031 | `031_add_marketplace_metadata.sql` | `marketplace_items.metadata` JSONB |
| 032 | `032_add_product_id_marketplace_items.sql` | `product_id` + verify indexes |
| 033 | `033_storage_consign_submissions.sql` | Storage bucket `consign-submissions` |
| 034 | `034_email_logs_nullable_user_id.sql` | `email_logs.user_id` nullable |
| 035 | `035_optimize_public_browse_indexes.sql` | Public browse + CRM queue composite indexes |

## Overlap notes (Phase 7)

- **RLS:** `005` + `009` — `009` patches performance; keep both on applied DBs; do not squash
- **RPC:** `014` → `020` → `025` — additive `create or replace function`; safe chain
- **Storage:** `008` (marketplace), `011` (CRM), `033` (consign public uploads)

## Storage buckets

| Bucket | Migration | Public | Purpose |
|--------|-----------|--------|---------|
| marketplace-images | 008 | yes | Marketplace item images |
| crm-attachments | 011 | no | CRM file attachments |
| consign-submissions | 033 | no | Public consign photo uploads |

## RPC functions

| Function | Introduced/extended | Purpose |
|----------|---------------------|---------|
| handle_updated_at | 001, 030 | `updated_at` trigger helper |
| handle_new_user | 001, 015, 030 | Auth signup profile hook |
| log_audit_event | 007 | Audit log trigger |
| set_marketplace_state_timestamps | 002 | Lifecycle timestamp trigger |
| crm_dashboard_summary | 014 | Dashboard KPIs |
| crm_activity_series | 014 | Activity chart data |
| crm_funnel_summary | 020 | Funnel metrics |
| crm_lead_source_performance | 020 | Lead source report |
| crm_deal_aging | 020 | Deal aging report |
| crm_stage_velocity | 025 | Stage velocity |
| crm_funnel_by_source | 025 | Funnel by source |
| admin_upsert_profile | 030 | Admin profile upsert |

## Fresh install baseline (D-04)

Squashing 001–035 into a single `000_baseline.sql` is **deferred to Phase 8**. New projects apply the full incremental chain `001` → `035` until baseline is published. Do **not** create `000_baseline.sql` in Phase 7.
