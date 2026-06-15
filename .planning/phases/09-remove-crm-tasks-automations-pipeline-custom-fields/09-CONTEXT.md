# Phase 9 Context — Remove Tasks, Automations, Pipeline Stages, Custom Fields

**Created:** 2026-06-14  
**Status:** Planned — 4 plans in `.planning/phases/09-remove-crm-tasks-automations-pipeline-custom-fields/`

## User intent

Xóa **toàn bộ function** của 4 mục sidebar CRM (ảnh user gửi):

1. **Tasks**
2. **Automations**
3. **Pipeline Stages**
4. **Custom Fields**

Giữ lại CRM core: Customers, Leads, Deals, Messages, Dashboard.

## Scope — REMOVE (app layer)

### Admin routes (`src/app/admin/(portal)/`)

| Route | File |
|-------|------|
| `/admin/tasks` | `tasks/page.tsx` |
| `/admin/automations` | `automations/page.tsx` |
| `/admin/pipeline-stages` | `pipeline-stages/page.tsx` |
| `/admin/custom-fields` | `custom-fields/page.tsx` |

### Admin feature modules

| Module | Path |
|--------|------|
| Tasks | `src/admin/tasks/**` |
| Automations | `src/admin/automations/**` |
| Pipeline Stages UI | `src/admin/crm/pages/PipelineStagesPage.tsx`, `components/PipelineStagesList.tsx`, `services/pipelineStagesService.ts` |
| Custom Fields UI | `src/admin/crm/pages/CustomFieldsPage.tsx`, `components/CustomFieldsSection.tsx`, `services/customFieldsService.ts` |

### API routes

| Domain | Routes |
|--------|--------|
| Tasks | `api/tasks/route.ts`, `api/tasks/[id]/route.ts` |
| Automations (alert rules) | `api/alert-rules/**` (route, [id], run, preview) |
| Pipeline Stages | `api/pipeline-stages/route.ts`, `api/pipeline-stages/[id]/route.ts` |
| Custom Fields | `api/custom-fields/**`, `api/custom-field-values/route.ts` |

### Navigation & wiring

- `src/components/admin/PortalSidebar.tsx` — 4 menu items CRM
- `src/lib/utils/admin.tsx` — `tabToRouteMap` / `routeToTabMap` entries
- `src/components/admin/AdminPortalLayout.tsx` — titles if any
- `src/admin/dashboard/pages/DashboardPage.tsx` — `TasksWidget` if embedded
- Cross-feature refs: `DealForm`, `LeadForm`, `CustomerForm`, `DealDetail`, `MessageDetail` — remove custom-fields sections / pipeline stage pickers if dedicated to removed features

### Action registry / command palette (if present)

- Grep `tasks`, `automations`, `pipeline`, `custom-fields`, `alert-rules` in `src/lib/actions/**`

## Scope — DATABASE (decide in plan)

Tables likely tied to removed features (audit before DROP):

| Table | Feature |
|-------|---------|
| `tasks` | Tasks |
| `alert_rules` | Automations |
| `pipeline_stages` | Pipeline Stages |
| `crm_custom_fields` | Custom Fields |
| `crm_custom_field_values` | Custom Fields values |
| `crm_custom_field_groups` | Custom Fields (if exists) |

**Deals** may reference `pipeline_stages` — plan must define migration strategy (default stage column, nullable FK, or seed minimal stages inline).

## Out of scope (keep)

- Customers, Leads, Deals, Messages, Dashboard CRM RPCs
- `api/activity/**`, `api/notifications/**` (unless only used by automations — verify)
- Marketplace, verify, consign, submissions

## Success criteria (draft)

1. Sidebar không còn 4 mục; routes trả 404 hoặc redirect hợp lý
2. Không còn import/dead code từ 4 modules
3. `npm run check-types` + `npm run build` pass
4. Deals/Leads/Customers forms vẫn submit được sau khi gỡ custom fields / pipeline UI
5. (Optional) Migration prune dead tables — chỉ sau inventory + decision trong plan

## Depends on

Phase 8 (schema inventory discipline) — có thể chạy song song nếu chỉ xóa app layer trước.
