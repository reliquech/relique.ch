---
phase: 01-foundation-app-merge
verified: 2026-06-14T12:00:00Z
status: human_needed
score: 5/5
overrides_applied: 0
human_verification:
  - test: "Run pnpm dev and confirm only web app on port 1300 (not 3600)"
    expected: "Single turbo scope `web`; http://localhost:1300 serves both public and admin routes"
    why_human: "Runtime dev server behavior cannot be verified statically"
  - test: "Visit /admin while logged out"
    expected: "Redirect to /admin/login?redirect=/admin"
    why_human: "Middleware redirect requires live request with cookie state"
  - test: "Login at /admin/login with valid Supabase credentials"
    expected: "CRM sidebar layout visible; no public Header/Footer from (site) shell"
    why_human: "Visual layout separation requires authenticated browser session"
  - test: "Visit /admin/leads and /admin/deals with auth"
    expected: "Pages load data from /api/leads and /api/deals (network tab shows 200 responses)"
    why_human: "Data flow requires live Supabase backend and credentials in .env.local"
  - test: "Visit /marketplace while logged out"
    expected: "Public Header/Footer present via (site) layout"
    why_human: "Visual confirmation of route group isolation"
deferred:
  - truth: "apps/admin/ directory removed from repo"
    addressed_in: "Phase 4 (CONS-02)"
    evidence: "Phase 4 success criteria: apps/admin/ và relique-marketplace/ đã xóa khỏi repo"
  - truth: "Root pnpm check passes (lint + typecheck + build)"
    addressed_in: "Out of phase scope (pre-existing infra)"
    evidence: "01-05-SUMMARY documents TS6379 in shared tsconfig and shared#lint missing eslint; web-only check-types + build pass"
---

# Phase 1: Foundation & App Merge Verification Report

**Phase Goal:** Operators và public users dùng một Next.js app, một deploy — admin tại `/admin` với auth shell riêng  
**Verified:** 2026-06-14T12:00:00Z  
**Status:** human_needed  
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Operator mở `/admin` và thấy CRM sidebar layout — không có public site header/footer | ✓ VERIFIED | `AdminPortalLayout.tsx` renders `PortalSidebar`; admin routes under `app/admin/(portal)/` outside `(site)` group; root `layout.tsx` has no Header/Footer |
| 2 | Visitor chưa đăng nhập truy cập `/admin/*` bị redirect tới `/admin/login` | ✓ VERIFIED | `middleware.ts` → `updateSession()` lines 64–72: unauthenticated `/admin/*` (except `/admin/login`) redirects with `?redirect=` param |
| 3 | `pnpm dev` tại repo root khởi động một app duy nhất | ✓ VERIFIED | Root `package.json`: `"dev": "turbo run dev --filter=web"`; no `dev:admin`/`start:admin`; runtime smoke needs human |
| 4 | Admin CRM pages (leads, marketplace, deals) load data qua `/api/*` | ✓ VERIFIED | `dealsService.ts`, `leadsService.ts`, `marketplaceService.ts` use `/api/deals`, `/api/leads`, `/api/marketplace`; 58 route handlers under `apps/web/src/app/api/` |
| 5 | Supabase migrations folder và turbo/root scripts trỏ về unified app — không còn `dev:admin` | ✓ VERIFIED | 31 SQL files at `apps/web/supabase/migrations/`; `MIGRATIONS.md` canonical; `tsconfig.json` references only `apps/web` |

**Score:** 5/5 roadmap truths verified in code

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Physical removal of `apps/admin/` directory | Phase 4 (CONS-02) | ROADMAP Phase 4 SC: `apps/admin/` đã xóa khỏi repo |
| 2 | Root `pnpm check` monorepo gate | Pre-existing infra (out of Phase 1 scope) | `pnpm --filter web check-types` + `build` pass; root `tsc --build` fails TS6379 in shared tsconfig |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `apps/web/src/app/(site)/layout.tsx` | Public shell with Header/Footer | ✓ VERIFIED | Imports and renders Header, Footer, Currency, Compare |
| `apps/web/src/middleware.ts` | Session refresh + admin guard | ✓ VERIFIED | Delegates to `updateSession`; matcher excludes static assets |
| `apps/web/src/app/admin/(portal)/layout.tsx` | Admin portal wrapper | ✓ VERIFIED | Re-exports `AdminPortalLayout` |
| `apps/web/src/admin/` | Admin business modules | ✓ VERIFIED | 105 files across crm, marketplace, dashboard, tasks, etc. |
| `apps/web/supabase/migrations/` | 31 consolidated SQL migrations | ✓ VERIFIED | 001–031 present; `MIGRATIONS.md` documents apply order |
| `package.json` | Unified dev, no dev:admin | ✓ VERIFIED | `dev`/`start` use `--filter=web`; grep confirms no `dev:admin` |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `middleware.ts` | `lib/supabase/middleware.ts` | `updateSession` import | ✓ WIRED | gsd-tools verified |
| `admin/login/page.tsx` | `LoginPage` | re-export | ✓ WIRED | `export { default } from "@/admin/users/pages/LoginPage"` |
| `LoginPage.tsx` | `/admin` | `router.push` after signIn | ✓ WIRED | Line 49: D-08 always navigates to `/admin` |
| `AdminPortalLayout.tsx` | `PortalSidebar` | render | ✓ WIRED | gsd-tools verified |
| `(portal)/deals/page.tsx` | `DealsPage` | re-export | ✓ WIRED | `export { default } from "@/admin/crm/pages/DealsPage"` |
| `dealsService.ts` | `/api/deals` | fetch | ✓ WIRED | `baseUrl = "/api/deals"` with fetch calls |
| `api/deals/route.ts` | `requireUser` | handler entry | ✓ WIRED | GET/POST call `requireUser()` first |
| `api/marketplace/route.ts` | public/admin GET branches | session check | ✓ WIRED | `getSessionUser()` → `adminGet` or `publicGet` with published filter |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `DealsPage` (via dealsService) | deals list | `fetch("/api/deals")` → Supabase query | Yes (requires auth + DB) | ✓ FLOWING |
| `ItemsPage` (via marketplaceService) | items list | `fetch("/api/marketplace")` → Supabase | Yes (requires auth + DB) | ✓ FLOWING |
| `LeadsPage` (via leadsService) | leads list | `fetch("/api/leads")` → Supabase | Yes (requires auth + DB) | ✓ FLOWING |
| Public marketplace page | listings | `GET /api/marketplace` anonymous | Yes (`publicGet` filters published+public) | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 31 migration files exist | `ls apps/web/supabase/migrations/*.sql \| wc -l` | 31 | ✓ PASS |
| No dev:admin in root scripts | `grep dev:admin package.json` | no match | ✓ PASS |
| Web typecheck | `pnpm --filter web check-types` | exit 0 | ✓ PASS |
| Web production build | `pnpm --filter web build` | exit 0, 77+ routes | ✓ PASS |
| Root monorepo typecheck | `pnpm typecheck` | TS6379 in shared tsconfig | ✗ FAIL (pre-existing) |
| Middleware redirect | curl without session | ? SKIP | Requires running server |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| FND-01 | 01-04, 01-05 | Admin merged into apps/web | ✓ SATISFIED | Full admin UI + API in `apps/web/`; `apps/admin/` retained as reference per D-11 until Phase 4 |
| FND-02 | 01-01, 01-04 | Admin routes at `/admin` with separate layout | ✓ SATISFIED | 22 admin pages; `(portal)/layout.tsx` + `AdminPortalLayout` |
| FND-03 | 01-02 | Middleware protects `/admin/*` | ✓ SATISFIED | `middleware.ts` + redirect to `/admin/login` |
| FND-04 | 01-03 | All admin API routes migrated | ✓ SATISFIED | 58 route.ts files; deals/leads/marketplace wired with `requireUser` |
| FND-05 | 01-05 | Migrations consolidated | ✓ SATISFIED | 31 files + `MIGRATIONS.md` |
| FND-06 | 01-05 | Root scripts updated, no dev:admin | ✓ SATISFIED | `package.json` unified; `tsconfig.json` drops apps/admin reference |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `apps/web/src/admin/marketplace/pages/ItemsPage.tsx` | — | `console.log('Edit', id)` no-op | ℹ️ Info | Known Phase 5 scope (ADM-01); not Phase 1 blocker |
| Root `pnpm check` | — | Monorepo lint/typecheck infra broken | ⚠️ Warning | Pre-existing; web-only gates pass |

### Human Verification Required

### 1. Single dev server

**Test:** Run `pnpm dev` from repo root  
**Expected:** Only `web` turbo scope; app on port 1300  
**Why human:** Cannot verify port binding without running dev server

### 2. Admin auth redirect

**Test:** Visit `/admin` logged out  
**Expected:** Redirect to `/admin/login?redirect=/admin`  
**Why human:** Cookie/session state required

### 3. Admin layout isolation

**Test:** Login and visit `/admin`  
**Expected:** CRM sidebar; no public Header/Footer  
**Why human:** Visual confirmation

### 4. CRM API data loading

**Test:** Visit `/admin/leads`, `/admin/deals`, `/admin/items` authenticated  
**Expected:** Network requests to `/api/*` return data  
**Why human:** Requires Supabase credentials in `.env.local`

### 5. Public layout intact

**Test:** Visit `/marketplace` logged out  
**Expected:** Public Header/Footer visible  
**Why human:** Visual confirmation of `(site)` route group

### Gaps Summary

No code gaps block Phase 1 foundation merge goal. All roadmap success criteria have supporting implementation in the unified `apps/web` app. Human operator UAT (documented in 01-05-SUMMARY) is pending before production deploy sign-off. Root `pnpm check` fails due to pre-existing monorepo infra (shared tsconfig composite + shared eslint), not Phase 1 deliverables — web-only `check-types` and `build` pass.

---

_Verified: 2026-06-14T12:00:00Z_  
_Verifier: Claude (gsd-verifier)_
