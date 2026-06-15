# Phase 9 Inventory — Pre-removal baseline

**Captured:** 2026-06-14 via `npm run phase9:grep-baseline`

## Grep baseline (files containing pattern)

| Pattern | Count |
|---------|-------|
| `/api/tasks` | 1 |
| `admin/tasks` | 8 |
| `TasksWidget` | 3 |
| `tasksService` | 7 |
| `/api/alert-rules` | 1 |
| `admin/automations` | 5 |
| `AlertScheduler` | 3 |
| `alertRulesService` | 4 |
| `/api/pipeline-stages` | 1 |
| `PipelineStagesPage` | 3 |
| `pipelineStagesService` | 5 |
| `DealsBoard` | 3 |
| `/api/custom-fields` | 1 |
| `custom-field-values` | 1 |
| `CustomFieldsSection` | 7 |
| `customFieldsService` | 9 |
| `customFieldValuesService` | 7 |

**Target post-removal:** all counts = 0

## Tasks — DELETE

- `src/admin/tasks/**` (6 files)
- `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`
- `src/app/admin/(portal)/tasks/page.tsx`
- `src/admin/dashboard/pages/DashboardPage.tsx` — TasksWidget
- `src/app/api/activity/route.ts` — tasks query branch

## Automations — DELETE

- `src/admin/automations/**` (6 files)
- `src/app/api/alert-rules/**` (4 routes)
- `src/app/admin/(portal)/automations/page.tsx`
- `src/components/admin/AdminPortalLayout.tsx` — AlertScheduler

## Pipeline Stages — DELETE

- `src/app/admin/(portal)/pipeline-stages/page.tsx`
- `src/app/api/pipeline-stages/**`
- `src/admin/crm/pages/PipelineStagesPage.tsx`
- `src/admin/crm/components/PipelineStagesList.tsx`, `PipelineStageForm.tsx`
- `src/admin/crm/services/pipelineStagesService.ts`
- `src/admin/crm/components/DealsBoard.tsx`
- Cross-refs: `DealsPage`, `DealForm`, `DealDetail`, `LeadConvertDialog`, `crm/index.ts`

## Custom Fields — DELETE

- `src/app/admin/(portal)/custom-fields/page.tsx`
- `src/app/api/custom-fields/**`, `src/app/api/custom-field-values/route.ts`
- `src/admin/crm/pages/CustomFieldsPage.tsx`
- `src/admin/crm/components/CustomFieldForm.tsx`, `CustomFieldsSection.tsx`
- `src/admin/crm/services/customFieldsService.ts`, `customFieldValuesService.ts`
- Cross-refs: `DealsPage`, `LeadsPage`, `CustomersPage`, forms, `schemas.ts`

## Nav — EDIT

- `src/components/admin/PortalSidebar.tsx`
- `src/lib/utils/admin.tsx`

## Database — DROP (migration 037)

- `tasks`, `alert_rules`, `pipeline_stages`, `crm_custom_fields`, `crm_custom_field_values`
- `deals.pipeline_stage_id`
- Replace `crm_stage_velocity` RPC
