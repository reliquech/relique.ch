# Phase 9 Research — Remove CRM Optional Modules

**Date:** 2026-06-14

## Decision summary

| Module | App removal | DB removal | Deals/CRM impact |
|--------|-------------|------------|----------------|
| Tasks | Full delete | DROP `tasks` | Remove `TasksWidget`, activity feed tasks slice |
| Automations | Full delete | DROP `alert_rules` | Remove `AlertScheduler`, all `api/alert-rules/**` |
| Pipeline Stages | Admin UI delete | DROP `pipeline_stages`, DROP `deals.pipeline_stage_id` | Remove kanban, stage filters, stage pickers; list-only deals |
| Custom Fields | Full delete | DROP `crm_custom_fields`, `crm_custom_field_values` | Strip `CustomFieldsSection` + upsert calls from CRM forms |

## Cross-dependencies (must fix)

1. **`DealsPage`** — kanban + `pipelineStagesService` + `customFieldsService` + `customFieldValuesService`
2. **`DealForm` / `DealDetail` / `LeadForm` / `CustomerForm` / `MessageDetail`** — custom fields + stages props
3. **`LeadConvertDialog`** — `pipelineStagesService.list()` for default stage → remove stage assignment
4. **`api/activity/route.ts`** — queries `tasks` table → remove tasks branch
5. **`AdminPortalLayout`** — mounts `AlertScheduler` → remove
6. **`DashboardPage`** — mounts `TasksWidget` → remove
7. **`crm_stage_velocity` RPC** — JOINs `pipeline_stages` → rewrite to group by `deals.status` or return empty

## Keep (out of scope)

- `api/notifications/**` + `NotificationCenter` — in-app notifications shell (may be empty after alert-rules gone)
- `api/activity/**` (minus tasks), attachments, CRM views/filters
- Dashboard 7 RPCs except `crm_stage_velocity` shape change

## Migration strategy (037)

```sql
-- Order matters
alter table public.deals drop column if exists pipeline_stage_id;
drop table if exists public.crm_custom_field_values;
drop table if exists public.crm_custom_fields;
drop table if exists public.tasks;
drop table if exists public.alert_rules;
drop table if exists public.pipeline_stages;
-- Replace crm_stage_velocity (status-based stub)
```

Fresh install: patch `000_baseline.sql` to omit dropped tables/column and ship updated RPC.

## Grep gate targets (post-removal must be 0 in `src/`)

- `/api/tasks`, `admin/tasks`, `TasksWidget`, `tasksService`
- `/api/alert-rules`, `admin/automations`, `AlertScheduler`, `alertRulesService`
- `/api/pipeline-stages`, `PipelineStagesPage`, `pipelineStagesService`, `DealsBoard` (if deleted)
- `/api/custom-fields`, `custom-field-values`, `CustomFieldsSection`, `customFieldsService`

## Risk

- **Deals kanban removal** — operators lose drag-drop; acceptable per user request
- **Existing DB data** in dropped tables — lost on migration (intentional prune)
