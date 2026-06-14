---
phase: 1
slug: foundation-app-merge
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — v1 quality gate is lint + typecheck + build only |
| **Config file** | none |
| **Quick run command** | `pnpm --filter web check-types` |
| **Full suite command** | `pnpm check` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web check-types`
- **After every plan wave:** Run `pnpm --filter web build`
- **Before `/gsd-verify-work`:** `pnpm check` + manual UAT checklist
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 1 | FND-02 | — | N/A | build | `pnpm --filter web build` | ✅ | ⬜ pending |
| 01-02 | 02 | 2 | FND-03 | T-1-01 | Middleware + handler auth | manual | curl /admin without cookie → redirect | ❌ | ⬜ pending |
| 01-03 | 03 | 3 | FND-04 | T-1-02 | Admin API 401 without session | manual | curl /api/deals → 401 | ❌ | ⬜ pending |
| 01-04 | 04 | 4 | FND-01,FND-02 | — | Admin sidebar, no public chrome | manual | UAT checklist | ❌ | ⬜ pending |
| 01-05 | 05 | 5 | FND-05,FND-06 | — | Migrations path + scripts | file/script | `test -d apps/web/supabase/migrations` | ❌ W5 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] No test framework — aligned with PROJECT.md v1 scope (lint/typecheck/build only)
- [ ] Manual UAT checklist embedded in PLAN.md verification steps
- [ ] Marketplace dual-GET curl test cases in plan

*Existing infrastructure: build + typecheck scripts cover automated gate.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin layout without public header/footer | FND-02 | Visual shell check | Open `/admin` logged in — sidebar visible, no site Header/Footer |
| Unauth redirect to /admin/login | FND-03 | Browser redirect | Visit `/admin/deals` logged out → `/admin/login?redirect=...` |
| Post-login lands on /admin | FND-03 | Browser flow | Login at `/admin/login` → lands `/admin` (not redirect param) |
| CRM pages load data | FND-04 | Integration | Leads/deals/marketplace pages fetch `/api/*` successfully |
| Single dev server | FND-06 | Runtime | `pnpm dev` starts one app on port 1300 |

---

## Validation Sign-Off

- [x] All tasks have automated or manual verify defined
- [x] Sampling continuity: build/typecheck between waves
- [x] Wave 0: no framework install required
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
