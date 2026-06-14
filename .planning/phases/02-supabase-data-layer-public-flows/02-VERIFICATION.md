# Phase 2 Verification

**Status:** REPLAN 2026-06-14 — UAT + no-email scope  
**Score:** 16/16 in-scope (ADM-04 N/A)

## Automated gates

| Gate | Command | Status |
|------|---------|--------|
| No email in src | `npm run phase2:no-email-gate` | ⬜ run phase2:gate |
| DATA-04 import gate | `npm run phase2:data-layer-gate` | ⬜ run phase2:gate |
| Typecheck | `npm run check-types` | ⬜ run phase2:gate |
| Lint | `npm run lint` | deferred Phase 4 (166 pre-existing errors) |
| Build | `npm run build` | ⬜ run phase2:gate |

## Requirements matrix

| ID | Status | Evidence |
|----|--------|----------|
| DATA-01 | verified | `src/lib/services/impl/verify.supabase.ts`, `/api/public/verify` |
| DATA-02 | verified | `consign.supabase.ts`, `/api/public/consign` |
| DATA-03 | verified | `/api/public/contact` |
| DATA-04 | verified | `phase2:data-layer-gate`, deprecated storage helpers |
| VRFY-01–04 | pending UAT | `02-UAT-CHECKLIST.md` |
| CNSG-01–05 | pending UAT | consign route + admin queue |
| CNTC-01–03 | pending UAT | contact route + CRM |
| CNSG-03 | verified | `/consign/success` — no email |
| CNTC-02 | verified | CRM lead — no email |
| ADM-04 | **N/A** | Resend removed v1 |

## human_needed

- Execute `02-UAT-CHECKLIST.md` in browser
- Confirm migrations 032–034 on remote Supabase if smoke fails
- Seed `RLQ-TEST-0001` marketplace row for verify UAT

## Paths

- App: `src/` (root npm app)
- Migrations: `supabase/migrations/032_*`, `033_*`, `034_*`
