# Roadmap: Relique.co Unified Platform

## Overview

Brownfield monorepo chuyển từ hai app Next.js tách rời + mock public flows sang một platform production-ready: gộp admin vào `apps/web` tại `/admin`, hoàn thiện Supabase làm single source of truth, harden bảo mật, dọn legacy stack, rồi redesign admin UX. Thứ tự thực thi foundation-first — merge và data layer trước, consolidation và polish sau.

**Scope change (2026-06-14):** Marketplace payments (Stripe Checkout) **bỏ khỏi v1** — browse-only catalog; thanh toán defer v2.

## Phases

**Phase Numbering:**
- Integer phases (1–5): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & App Merge** — Gộp `apps/admin` vào `apps/web`, route group `/admin`, unified API và migrations (completed 2026-06-14)
- [ ] **Phase 2: Supabase Data Layer & Public Flows** — Verify, consign, contact thật; transactional emails; xóa localStorage adapters (code complete — UAT pending)
- [ ] **Phase 3: Security Hardening** — Vá register endpoint, audit API routes, enforce RLS và role checks
- [ ] **Phase 4: Stack Consolidation** — Xóa legacy apps/prototype, schema dedup, type safety
- [ ] **Phase 5: Admin UX Redesign** — CRM/dashboard/marketplace UI overhaul + admin ops fixes

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
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, VRFY-01, VRFY-02, VRFY-03, VRFY-04, CNSG-01, CNSG-02, CNSG-03, CNSG-04, CNSG-05, CNTC-01, CNTC-02, CNTC-03, ADM-04
**Success Criteria** (what must be TRUE):
  1. User nhập cert/product ID trên verify page → nhận kết quả authenticated/inconclusive/disqualified từ database
  2. User scan QR/barcode → hệ thống parse code thật từ input, không generate random mock
  3. Verify result hiển thị certificate details (signer, item type, grade, date, images) và link tới marketplace listing nếu item đang listed
  4. User submit consign form với photos → thấy on-screen confirmation; submission xuất hiện trong admin queue với status workflow
  5. User submit contact form → thấy confirmation; operator nhận email notification; data persist trong CRM
  6. User consign submit nhận confirmation email; consign auto-create lead trong CRM
  7. Transactional emails (consign, contact) hoạt động từ unified app
**Plans**: 5 plans

Plans:
- [x] 02-01-PLAN.md — Migrations (product_id, consign-submissions bucket, email_logs) + sendTransactional helper + VerifyResult schema [BLOCKING db push]
- [x] 02-02-PLAN.md — Verify flow: `/api/public/verify`, supabase adapter, result display, admin verify placeholder
- [x] 02-03-PLAN.md — Consign flow: `/api/public/consign` multipart, photo upload UI, lead + email
- [x] 02-04-PLAN.md — Contact flow: `/api/public/contact`, inline success, operator + user emails
- [x] 02-05-PLAN.md — Cleanup local adapters (DATA-04) + env docs + build gate

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
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & App Merge | 5/5 | Complete   | 2026-06-14 |
| 2. Supabase Data Layer & Public Flows | 0/TBD | Not started | - |
| 3. Security Hardening | 0/TBD | Not started | - |
| 4. Stack Consolidation | 0/TBD | Not started | - |
| 5. Admin UX Redesign | 0/TBD | Not started | - |

---
*Roadmap created: 2026-06-14*
*Last updated: 2026-06-14 — removed Phase 4 Payments (Stripe); 5 phases total*
*Granularity: standard (5 phases)*
