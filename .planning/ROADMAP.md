# Roadmap: Relique.co Unified Platform

## Overview

Brownfield monorepo chuyển từ hai app Next.js tách rời + mock public flows sang một platform production-ready: gộp admin vào `apps/web` tại `/admin`, hoàn thiện Supabase làm single source of truth, harden bảo mật, dọn legacy stack, rồi redesign admin UX. Thứ tự thực thi foundation-first — merge và data layer trước, consolidation và polish sau.

**Scope change (2026-06-14):** Marketplace payments (Stripe Checkout) **bỏ khỏi v1** — browse-only catalog; thanh toán defer v2.

## Phases

**Phase Numbering:**
- Integer phases (1–7): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & App Merge** — Gộp `apps/admin` vào `apps/web`, route group `/admin`, unified API và migrations (completed 2026-06-14)
- [ ] **Phase 2: Supabase Data Layer & Public Flows** — Verify, consign, contact thật; CRM persist (no email); xóa localStorage adapters (code complete — UAT pending)
- [ ] **Phase 3: Security Hardening** — Vá register endpoint, audit API routes, enforce RLS và role checks (code complete — UAT pending)
- [ ] **Phase 4: Stack Consolidation** — Schema dedup, type safety (post-restructure)
- [ ] **Phase 5: Admin UX Redesign** — CRM/dashboard/marketplace UI overhaul + admin ops fixes
- [x] **Phase 6: Flat Root App & npm Simplify** — Flatten `apps/web` → root `src/`, bỏ Turbo/pnpm workspace, npm đơn giản (completed 2026-06-14)
- [ ] **Phase 7: Supabase Migrations Optimize** — Tối ưu `supabase/migrations`: manifest, 035 indexes, docs (planned — apply 035 pending)
- [ ] **Phase 8: Supabase Database Audit & Prune** — Inventory tables/functions, gỡ schema không dùng, baseline squash, RLS/index audit
- [x] **Phase 9: Remove CRM Tasks, Automations, Pipeline Stages, Custom Fields** — Xóa toàn bộ UI, API, nav và dead schema cho 4 module CRM không dùng
- [x] **Phase 10: Restructure src/admin** — Tách `src/admin/**` thành modules nhỏ, colocate với `app/` và `components/` (bỏ layer monolithic)
- [x] **Phase 11: JavaScript bundle performance** — Baseline audit, tree-shakeable imports, dynamic loading, validate bundle sizes (no UI/feature changes)
- [x] **Phase 12: Marketplace Items admin page** — Toolbar, filters, table, bulk actions, URL sync (`/admin/items` only) (completed 2026-06-15)
- [x] **Phase 13: Marketplace Items table-grid toggle, full-page editor, UX polish** — View toggle, create/edit workflow, counts, states, a11y (completed 2026-06-15; human UAT pending; P2 media bind follow-up)
- [x] **Phase 14: Public marketplace published-only** — Tách public/admin API, homepage real data, publish+visibility (completed 2026-06-15)
- [ ] **Phase 15: Marketplace items instant view toggle & list cache** — Table/grid switch không refetch; stale-while-revalidate cache cho `/admin/items`
- [ ] **Phase 16: Marketplace editor image upload UX** — Bỏ clip-path skew, cover 16:9, grid vuông, lightbox, drag reorder

## Phase Details

### Phase 1: Foundation & App Merge
**Goal**: Operators và public users dùng một Next.js app, một deploy — admin tại `/admin` với auth shell riêng
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06
**Success Criteria** (what must be TRUE):
  1. Operator mở `/admin` và thấy CRM sidebar layout — không có public site header/footer
  2. Visitor chưa đăng nhập truy cập `/admin/*` bị redirect tới `/admin/login`
  3. `pnpm dev` tại repo root khởi động một app duy nhất — public marketplace và admin CRM đều hoạt động
  4. Admin CRM pages (leads, marketplace, deals) load data qua `/api/*` trên unified app
  5. Supabase migrations folder và turbo/root scripts trỏ về unified app — không còn `dev:admin`
**Plans**: 5 plans

Plans:
- [x] 01-01-PLAN.md — Layout split: `(site)` route group, slim root layout, merge CSS tokens
- [x] 01-02-PLAN.md — Auth infrastructure: port Supabase layer, middleware, `/admin/login`
- [x] 01-03-PLAN.md — API migration: ~57 admin routes + marketplace dual-GET merge
- [x] 01-04-PLAN.md — Admin UI: `src/admin/` modules, `components/admin/` shell, 21 portal pages
- [x] 01-05-PLAN.md — Config consolidation: migrations [BLOCKING], root scripts, phase gate

**UI hint**: yes

### Phase 2: Supabase Data Layer & Public Flows
**Goal**: Người dùng verify, consign, và contact thật — data persist Supabase, không mock/localStorage
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, VRFY-01, VRFY-02, VRFY-03, VRFY-04, CNSG-01, CNSG-02, CNSG-03, CNSG-04, CNSG-05, CNTC-01, CNTC-02, CNTC-03 *(ADM-04 out of scope — no email)*
**Success Criteria** (what must be TRUE):
  1. User nhập cert/product ID trên verify page → nhận kết quả authenticated/inconclusive/disqualified từ database
  2. User scan QR/barcode → hệ thống parse code thật từ input, không generate random mock
  3. Verify result hiển thị certificate details (signer, item type, grade, date, images) và link tới marketplace listing nếu item đang listed
  4. User submit consign form với photos → thấy on-screen confirmation; submission xuất hiện trong admin queue với status workflow
  5. User submit contact form → thấy on-screen confirmation; lead + message persist trong CRM (operator xem admin)
  6. User consign submit → on-screen `/consign/success`; consign auto-create lead trong CRM
  7. Không còn Resend/email code paths — transactional email out of v1 scope
**Plans**: 4 plans (REPLAN 2026-06-14 — UAT + cleanup; code largely implemented)

Plans:
- [ ] 02-01-PLAN.md — No-email dead code cleanup + `phase2:no-email-gate` grep gate (D-24)
- [ ] 02-02-PLAN.md — Verify/consign/contact UAT checklist + smoke script + gap fixes
- [ ] 02-03-PLAN.md — localStorage adapter removal verification + `phase2:data-layer-gate` (DATA-04)
- [ ] 02-04-PLAN.md — Composite `phase2:gate` (typecheck/lint/build) + VERIFICATION.md sign-off

**UI hint**: yes

### Phase 3: Security Hardening
**Goal**: Platform an toàn cho production traffic — không public signup, không service-role sprawl, role checks nhất quán
**Depends on**: Phase 2
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):
  1. Unauthenticated caller không thể tạo user qua register endpoint (disabled hoặc admin-only)
  2. Public marketplace browse chỉ hiển thị items published + public — draft/private không leak
  3. Admin API routes từ chối requests thiếu auth hoặc insufficient role (viewer không mutate)
  4. Public read routes dùng client phù hợp (anon + RLS) thay vì service-role không cần thiết
**Plans**: TBD

### Phase 4: Stack Consolidation
**Goal**: Codebase sạch — một app, một schema source, không legacy prototype hay duplicate UI
**Depends on**: Phase 3
**Requirements**: CONS-01, CONS-02, CONS-03, CONS-04, CONS-05, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. `apps/admin/` và `relique-marketplace/` đã xóa khỏi repo — chỉ `apps/web` deploy
  2. Không còn localStorage adapters cho production data (verify, consign, json helpers)
  3. Schema imports dùng `@relique/shared/domain` — deprecated schema files đã xóa
  4. App components import shadcn qua `@relique/ui` wrappers — giảm duplicate `components/ui/`
  5. Supabase types regenerated — `@ts-expect-error` trên API mutations giảm đáng kể
  6. Trust-breaking mocks (watchlist fake notifications, contact fake success) đã xóa hoặc disabled
**Plans**: TBD

### Phase 5: Admin UX Redesign
**Goal**: Operators làm việc hiệu quả trên admin CRM — UI mới, actions thật, audit trail
**Depends on**: Phase 4
**Requirements**: UX-01, UX-02, UX-03, UX-04, ADM-01, ADM-02, ADM-03
**Success Criteria** (what must be TRUE):
  1. Admin dashboard có layout, navigation, và visual hierarchy rõ ràng cho daily operator work
  2. Admin CRM pages (leads, deals, customers, tasks) redesigned và usable trên tablet viewport
  3. Admin marketplace management (items, submissions, featured) redesigned với improved workflows
  4. Operator click Edit trên marketplace item → mở edit flow thật (không còn console.log no-op)
  5. Operator transition consign submission status từ queue (submitted → in_review → approved/rejected)
  6. Publish/approve mutations ghi audit log entries
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & App Merge | 5/5 | Complete   | 2026-06-14 |
| 2. Supabase Data Layer & Public Flows | 0/4 | Planned — UAT + no-email cleanup | - |
| 3. Security Hardening | 1/1 | Code complete — UAT pending | 2026-06-14 |
| 4. Stack Consolidation | 0/TBD | Not started | - |
| 5. Admin UX Redesign | 0/TBD | Not started | - |
| 6. Flat Root App & npm Simplify | 1/1 | Complete | 2026-06-14 |
| 7. Supabase Migrations Optimize | 0/3 | Planned — apply 035 pending | - |
| 8. Supabase Database Audit & Prune | 0/5 | Planned | - |
| 9. Remove CRM Tasks/Automations/Pipeline/Custom Fields | 0/4 | Planned | - |

### Phase 7: Supabase Migrations Optimize
**Goal**: `supabase/migrations/` gọn, nhất quán, production-ready — fresh deploy nhanh, schema khớp types, RLS/index tối ưu
**Depends on**: Phase 6 (migrations tại root `supabase/`)
**Requirements**: MIG-01–MIG-08 (định nghĩa khi plan)
**Success Criteria** (what must be TRUE):
  1. `supabase/MIGRATIONS.md` + docs trỏ `supabase/migrations/` tại root — không còn `apps/web/` paths
  2. Migration inventory rõ ràng: baseline/squash strategy cho **new projects** (001 baseline hoặc archived `migrations/legacy/`)
  3. Không còn duplicate/overlapping DDL (RLS fix 005 vs 009, RPC extend 014 vs 020 vs 025 — merged hoặc documented)
  4. RLS policies audit — mỗi table có policy rõ; public read paths align Phase 3 SEC-04
  5. Indexes review — hot paths (marketplace_items published filter, leads, consigned_items) có index phù hợp
  6. `src/lib/supabase/types.ts` regenerated từ schema cuối — giảm `as never` casts trên API routes
  7. `supabase db push` / manual apply path documented cho 034 files; fresh env bootstrap ≤ N migration files
  8. Storage buckets + RPC functions documented trong single migration manifest
**Plans**: 3 plans

Plans:
- [x] 07-01-PLAN.md — Docs + manifest: root paths, buckets/RPC inventory, STORAGE_GUIDE fix
- [x] 07-02-PLAN.md — 035 additive indexes + brownfield chain integrity (001–035)
- [x] 07-03-PLAN.md — [BLOCKING] `supabase db push` apply 035 + phase gate (types deferred Phase 4)

### Phase 6: Flat Root App & npm Simplify
**Goal**: Một Next.js app tại repo root — `src/` + `supabase/` + `public/`, không còn `apps/` hay Turborepo; toolchain đơn giản bằng npm; dependencies lên bản mới nhất tương thích
**Depends on**: Phase 5 (reordered — executed sau Phase 2)
**Context**: ✅ `06-CONTEXT.md` gathered 2026-06-14
**Requirements**: REST-01–REST-08
**Success Criteria** (what must be TRUE):
  1. `src/**` tại repo root — `@/` alias trỏ `./src`
  2. `supabase/` + `public/` tại root
  3. Không còn `apps/`, `pnpm-workspace.yaml`, `turbo.json`
  4. `npm install` + `npm run dev` + `npm run build` pass tại root
  5. `packages/shared` + `packages/ui` inlined vào `src/lib/`
  6. Legacy dirs xóa (`apps/admin/`, `relique-marketplace/`)
**Plans**: 1 plan (autonomous execute)
**Status**: ✅ Complete 2026-06-14

### Phase 8: Supabase Database Audit & Prune
**Goal**: Supabase schema gọn theo usage thực tế — biết rõ giữ/gỡ gì, functions cần thiết, baseline cho fresh install, RLS/index khớp app
**Depends on**: Phase 7
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-07, DB-08
**Context**: ✅ `08-CONTEXT.md` — inventory tables/RPC/buckets + checklist audit
**Success Criteria** (what must be TRUE):
  1. `SUPABASE_USAGE.md` — mọi table/function/bucket có verdict KEEP/PRUNE/WIRE với evidence từ `src/`
  2. Dead schema pruned qua migration mới (036+): drop `email_logs`, drop `admin_upsert_profile`
  3. `000_baseline.sql` cho fresh install — không cần apply 35 files incremental
  4. RLS audit matrix — policies align SEC-04 public read paths
  5. `src/lib/supabase/types.ts` regenerated sau prune — build pass
  6. Dashboard 7 RPCs + public verify/consign/contact smoke pass sau optimize
**Plans**: 5 plans (4 waves)

Plans:
- [x] 08-01-PLAN.md — Usage inventory: audit script + SUPABASE_USAGE.md (DB-01)
- [x] 08-02-PLAN.md — Prune migration 036 + [BLOCKING] supabase db push (DB-02)
- [x] 08-03-PLAN.md — RLS audit matrix + index audit docs (DB-04, DB-05)
- [x] 08-04-PLAN.md — 000_baseline.sql fresh install + legacy archive (DB-03, DB-08)
- [x] 08-05-PLAN.md — Types regen, smoke script, docs, human verify (DB-06, DB-07, DB-08)

### Phase 9: Remove CRM Tasks, Automations, Pipeline Stages, Custom Fields

**Goal:** Admin CRM gọn — không còn Tasks, Automations, Pipeline Stages, Custom Fields; code, routes, API và (nếu an toàn) DB schema liên quan được gỡ sạch
**Depends on:** Phase 8 (inventory discipline; app-layer removal có thể bắt đầu sớm)
**Requirements:** PRUNE-09-01..07 (see REQUIREMENTS.md)
**Context:** ✅ `09-CONTEXT.md` — inventory 4 modules + tables/API paths
**Research:** ✅ `09-RESEARCH.md`
**Success Criteria** (what must be TRUE):
  1. Sidebar CRM chỉ còn Customers, Leads, Deals (+ Messages/Submissions như hiện tại)
  2. `/admin/tasks`, `/admin/automations`, `/admin/pipeline-stages`, `/admin/custom-fields` không còn hoạt động
  3. API routes tasks, alert-rules, pipeline-stages, custom-fields đã xóa — không còn caller trong `src/`
  4. Deals/Leads/Customers flows vẫn tạo/sửa được sau khi gỡ pipeline/custom-field UI
  5. `npm run phase9:gate` pass (grep + typecheck + build)
**Plans:** 4 plans (3 waves)

Plans:
- [x] 09-01-PLAN.md — Inventory + `phase9:grep-gate` baseline (PRUNE-09-01)
- [x] 09-02-PLAN.md — Remove Tasks + Automations UI/API/nav (PRUNE-09-02, 03)
- [x] 09-03-PLAN.md — Remove Pipeline + Custom Fields; simplify Deals/CRM forms (PRUNE-09-04, 05)
- [x] 09-04-PLAN.md — Migration 037 + baseline patch + types + `phase9:gate` (PRUNE-09-06, 07)

### Phase 10: Restructure src/admin — colocate with app and components

**Goal:** Xóa layer `src/admin/` monolithic; admin code nằm trong `app/admin/` (thin routes), `components/admin/{domain}/` (UI), `features/{domain}/` (services/hooks/schemas)
**Depends on:** Phase 9
**Requirements:** RESTR-10-01..05
**Success Criteria** (what must be TRUE):
  1. `src/admin/` không tồn tại
  2. `rg '@/admin/' src/` → 0 matches
  3. `npm run phase10:gate` pass
  4. Admin routes `/admin`, `/admin/leads`, `/admin/items` render (manual smoke)
  5. Không có `.tsx` admin mới >300 lines sau split
**Plans:** 7 plans (4 waves)

Plans:
- [x] 10-01-PLAN.md — Inventory + phase10:grep-gate + useDebounce (RESTR-10-01, 05)
- [x] 10-02-PLAN.md — users + notifications + shell (RESTR-10-02)
- [x] 10-03-PLAN.md — dashboard (RESTR-10-02)
- [x] 10-04-PLAN.md — submissions (RESTR-10-02)
- [x] 10-05-PLAN.md — marketplace + form merge + split (RESTR-10-02, 05)
- [x] 10-06-PLAN.md — crm + CrmViewBar + page splits (RESTR-10-02, 05)
- [x] 10-07-PLAN.md — delete src/admin + phase10:gate + VERIFICATION (RESTR-10-01, 03, 04)

**UI hint:** no (structural refactor only)

### Phase 11: JavaScript bundle performance — baseline audit, tree-shakeable imports, dynamic loading, validate bundle sizes

**Goal:** Giảm JS client bundle và tải thư viện nặng theo nhu cầu — **không** đổi UI, feature, API hay business logic
**Depends on:** Phase 10
**Requirements:** PERF-11-01..04
**Success Criteria** (what must be TRUE):
  1. `11-BASELINE.md` ghi metrics trước tối ưu
  2. `CommandPalette`/`cmdk` không còn trong root layout — chỉ admin portal
  3. Home below-fold + admin recharts dùng `next/dynamic`
  4. `npm run phase11:gate` pass (bundle compare + typecheck + build)
  5. `11-VERIFICATION.md` có before/after KB và smoke checklist
**Plans:** 6 plans (5 waves)

Plans:
- [x] 11-01-PLAN.md — Baseline + bundle analyzer + 11-AUDIT.md (PERF-11-01)
- [x] 11-02-PLAN.md — Move CommandPalette to admin portal layout (PERF-11-02, 03)
- [x] 11-03-PLAN.md — Dynamic recharts on dashboard (PERF-11-02, 03)
- [x] 11-04-PLAN.md — Dynamic below-fold home sections (PERF-11-02, 03)
- [x] 11-05-PLAN.md — Remove unused `motion` package (PERF-11-02, 03)
- [x] 11-06-PLAN.md — phase11:gate + 11-VERIFICATION.md (PERF-11-01..04)

**UI hint:** no (performance only — no visual changes)

### Phase 12: Marketplace Items admin page — toolbar, filters, table, bulk actions, URL sync

**Goal:** Nâng cấp `/admin/items` thành trang quản lý marketplace production-grade: toolbar, filters URL-synced, sortable table, bulk actions, server pagination — giữ dark identity và business logic
**Depends on:** Phase 11
**Success Criteria** (what must be TRUE):
  1. Toolbar: debounced search, status tabs with counts, filters popover/drawer, sort, clear-all, Add Item CTA
  2. Filters sync to URL query params; removable chips
  3. Table: full column set, sortable headers, density toggle, sticky header, row→edit, a11y
  4. Bulk publish/archive/restore/delete with confirmations and safe selection semantics
  5. Server-side pagination (10/25/50/100), loading/empty/error states, no stale requests
  6. Row overflow menu: edit, preview, duplicate, lifecycle actions, delete
  7. lint + typecheck + build pass; responsive + keyboard accessible
**Status:** ✅ Complete 2026-06-15

Plans:
- [x] 12-01-PLAN.md — API extensions (list, bulk, duplicate)
- [x] 12-02-PLAN.md — Service + URL/query hooks
- [x] 12-03-PLAN.md — Toolbar, filters, chips
- [x] 12-04-PLAN.md — Table, row menu, pagination, skeleton
- [x] 12-05-PLAN.md — Bulk bar + ItemsPage
- [x] 12-06-PLAN.md — Verification gate

**UI hint:** yes — UI-SPEC approved (`12-UI-SPEC.md`)

### Phase 13: Marketplace Items table-grid toggle, full-page create-edit editor, and UX polish

**Goal:** Extend Marketplace Items list with Table/Grid toggle and polish; rebuild create/edit as full-page editor with media workflow, autosave, and production-grade form UX — preserve APIs, routes, dark theme
**Depends on:** Phase 12
**Requirements:** ITEMS-13-01..05 (TBD in REQUIREMENTS.md at plan time)
**Success Criteria** (what must be TRUE):
1. Table/Grid toggle persists preference; mobile defaults to Grid; selection/bulk/filters survive view switch
2. Grid cards show required fields + actions; responsive 1/2/3–5 columns
3. Editor has 6 sections, sticky action bar, autosave with stale-guard, unsaved warnings, publish confirmation
4. Media: drag/drop, progress, reorder, alt, primary image, retry/remove
5. List shows filtered/total counts; typed-delete confirm; offline/error/permission states
6. `lint` + `typecheck` + `build` pass
**UI hint:** yes — `13-UI-SPEC.md` approved
**Status:** ✅ Execution complete 2026-06-15 — human UAT pending; P2 media follow-up in `13-REVIEW.md`
**Plans:** 8 plans — all executed

Plans:
- [x] 13-01-PLAN.md — View toggle + count summary
- [x] 13-02-PLAN.md — Grid view + card interactions
- [x] 13-03-PLAN.md — Typed delete + offline states
- [x] 13-04-PLAN.md — List polish (toolbar, a11y)
- [x] 13-05-PLAN.md — Editor page shell + status rail
- [x] 13-06-PLAN.md — Media workflow UI
- [x] 13-07-PLAN.md — Publish confirm + editor flows
- [x] 13-08-PLAN.md — Verification + human UAT artifacts

### Phase 14: Public marketplace published-only visibility and public-admin API split

**Goal:** Đảm bảo mọi surface public chỉ hiện `published + public`; sửa session-admin bleed trên `/marketplace`; thay homepage mock bằng API thật; harden publish → visibility
**Depends on:** Phase 12 (có thể song song Phase 13)
**Requirements:** PUB-14-01..04 (TBD at plan time)
**Success Criteria** (what must be TRUE):
1. Anon và admin-login trên `/marketplace` đều chỉ thấy published+public
2. Homepage carousel lấy data Supabase, không `MOCK_ITEMS`
3. Publish/bulk publish set `visibility: public`
4. UAT matrix draft/publish/archive/slug pass
5. `lint` + `typecheck` + `build` pass
**UI hint:** no (API + data wiring; admin publish có thể chạm nhỏ)
**Status:** ✅ Complete 2026-06-15 (`14-UAT.md`, `14-VERIFICATION.md`)

Plans:
- [x] Implemented inline (no formal PLAN split) — scope=public, homepage, visibility on publish

### Phase 15: Marketplace items instant view toggle and list query cache (no refetch on table/grid switch, stale-while-revalidate)

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 14
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 15 to break down)

### Phase 16: Marketplace editor image upload UX — remove clip-path skew, 16:9 cover, square grid, lightbox, drag reorder

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 15
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 16 to break down)

---
*Roadmap created: 2026-06-14*
*Last updated: 2026-06-15 — Phase 14 added (published-only public marketplace)*
*Granularity: 14 phases*
