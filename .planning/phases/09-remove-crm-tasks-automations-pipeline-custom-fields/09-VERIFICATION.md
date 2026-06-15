# Phase 9 Verification

**Phase:** Remove CRM Tasks, Automations, Pipeline Stages, Custom Fields  
**Verified:** 2026-06-14

## Automated gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run phase9:grep-gate` | **PASS** | 0 forbidden refs in `src/` |
| `npm run check-types` | **PASS** | `tsc --noEmit` clean |
| `npm run build` | **PASS** | Next.js production build OK |
| `npm run phase9:gate` | **PASS** | Composite gate (grep + typecheck + build) |

## Plans executed

| Plan | Status | Summary |
|------|--------|---------|
| 09-01 | ✅ | `scripts/phase9-grep-gate.mjs`, `09-INVENTORY.md`, package scripts |
| 09-02 | ✅ | Removed Tasks + Automations routes, API, nav, dashboard widget, AlertScheduler |
| 09-03 | ✅ | Removed Pipeline + Custom Fields; Deals list-only; simplified CRM forms/pages |
| 09-04 | ✅ | `037_prune_crm_optional_modules.sql`, baseline patch, types prune, SUPABASE_USAGE |

## Requirements (PRUNE-09)

| ID | Status | Evidence |
|----|--------|----------|
| PRUNE-09-01 | ✅ | Inventory + grep gate baseline |
| PRUNE-09-02 | ✅ | Tasks module removed |
| PRUNE-09-03 | ✅ | Automations (alert-rules) removed |
| PRUNE-09-04 | ✅ | Pipeline stages + kanban removed |
| PRUNE-09-05 | ✅ | Custom fields removed from UI/API |
| PRUNE-09-06 | ✅ | Migration 037 + baseline aligned |
| PRUNE-09-07 | ✅ | `phase9:gate` green |

## Manual verification (recommended)

- [ ] Apply `supabase/migrations/037_prune_crm_optional_modules.sql` on brownfield Supabase (**BLOCKING for prod DB**)
- [ ] Admin sidebar: no Tasks, Automations, Pipeline Stages, Custom Fields
- [ ] `/admin/deals` — list view only; create/edit deal works
- [ ] `/admin/leads`, `/admin/customers` — forms without custom fields; activity notes only
- [ ] Dashboard loads; `crm_stage_velocity` returns status buckets (may be empty)

## Migration 037 — human action required

Brownfield databases must run migration 037 via Supabase SQL Editor or `supabase db push`.  
Fresh installs use pruned `000_baseline.sql` (no dropped objects).
