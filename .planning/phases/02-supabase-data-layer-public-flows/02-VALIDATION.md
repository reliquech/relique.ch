---
phase: 2
slug: supabase-data-layer-public-flows
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-14
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — v1 quality gate is lint + typecheck + build only |
| **Config file** | none |
| **Quick run command** | `pnpm --filter web check-types` |
| **Full suite command** | `pnpm --filter web build` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web check-types`
- **After every plan wave:** Run `pnpm --filter web build`
- **After Plan 01 (migrations):** Manual `supabase db push` or apply migrations to linked project
- **Before `/gsd-verify-work`:** Manual UAT + Supabase dashboard inspection
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01 | 01 | 1 | DATA-01..04 (foundation) | T-2-01 | Service role server-only | file | `test -f apps/web/supabase/migrations/032_add_product_id_marketplace_items.sql` | ❌ W1 | ⬜ pending |
| 02-01 | 01 | 1 | ADM-04 | T-2-02 | Email helper no client exposure | file | `test -f apps/web/src/lib/email/sendTransactional.ts` | ❌ W1 | ⬜ pending |
| 02-02 | 02 | 2 | VRFY-01..04, DATA-01 | T-2-03 | Parameterized lookup only | manual | `curl '/api/public/verify?code=RLQ-TEST-001'` | ❌ W2 | ⬜ pending |
| 02-03 | 03 | 2 | CNSG-01..05, DATA-02 | T-2-04 | MIME + size validation | manual | POST FormData to `/api/public/consign` | ❌ W2 | ⬜ pending |
| 02-04 | 04 | 2 | CNTC-01..03, DATA-03 | T-2-05 | Honeypot reject | manual | Contact form submit + no alert() | ❌ W2 | ⬜ pending |
| 02-05 | 05 | 3 | DATA-04 | — | No local adapters | grep | `! rg verify.local apps/web/src` | ❌ W3 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] No test framework — aligned with PROJECT.md v1 scope
- [x] Manual UAT checklist embedded in PLAN.md verification steps
- [x] Supabase migration push marked [BLOCKING] in Plan 01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Verify returns DB result | VRFY-01 | Needs seeded marketplace_items | Enter known RLQ code on /verify |
| Verify not found state | VRFY-01 | UI state | Enter `RLQ-XXXX-9999` → not found panel |
| Marketplace link on published item | VRFY-04 | Conditional UI | Verify published item → link to /marketplace/[slug] |
| Consign photo upload + success redirect | CNSG-01, CNSG-02 | Multipart + redirect | Submit consign with 1+ photos → /consign/success |
| Admin consign queue shows submission | CNSG-04 | Admin UI | Check /admin/submissions?tab=consignments |
| Lead auto-created | CNSG-05, CNTC-01 | DB | Inspect leads table source field |
| Operator + user emails | CNTC-02, CNSG-03, ADM-04 | Resend | Check inbox / Resend dashboard |
| Contact inline success | CNTC-03 | UI | No alert(); success message inline |

---

## Validation Sign-Off

- [x] All tasks have automated or manual verify defined
- [x] Sampling continuity: typecheck between tasks, build between waves
- [x] Wave 0: no framework install required
- [x] `nyquist_compliant: true` set in frontmatter
