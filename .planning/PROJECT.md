# Relique.co — Unified Platform

## What This Is

Relique là nền tảng xác thực và marketplace cho đồ kỷ vật thể thao (memorabilia). Người sưu tập dùng public site để browse marketplace, verify sản phẩm, và consign; đội vận hành dùng admin CRM để quản lý leads, deals, marketplace listings, và submissions. Milestone này gộp hai app Next.js thành một, hoàn thiện data layer Supabase, và đưa toàn bộ flows lên production-ready — không còn mock.

## Core Value

Người dùng có thể **tin tưởng** Relique: verify sản phẩm thật, consign/submit thật, liên hệ được, browse marketplace authenticated inventory — tất cả trên một codebase, một deploy. Thanh toán marketplace defer v2.

## Requirements

### Validated

- ✓ Public marketplace browse (Supabase-backed listings) — existing (`apps/web`)
- ✓ Admin CRM (leads, customers, deals, pipeline, tasks) — existing (`apps/admin`)
- ✓ Admin marketplace management (CRUD, AI image generation) — existing
- ✓ Supabase Auth + role-based access (admin/editor/viewer) — existing
- ✓ Shared domain layer (`@relique/shared` contracts, Zod schemas) — existing
- ✓ Shared UI package (`@relique/ui` shadcn-based) — existing
- ✓ Monorepo orchestration (pnpm + Turborepo) — existing
- ✓ Email via Resend (admin CRM) — existing
- ✓ Verify flow UI (mock/localStorage backend) — existing, needs replacement
- ✓ Consign flow UI (mock/localStorage backend) — existing, needs replacement
- ✓ Contact form UI — existing, non-functional

### Active

- [ ] Gộp `apps/admin` vào `apps/web` — admin tại route group `/admin`, một Next.js app, một deploy
- [ ] Hoàn thiện Supabase migration — verify, consign, contact lưu backend thật; xóa localStorage adapters
- [ ] Verify thật — QR/product ID lookup qua backend, không mock
- [ ] Consign thật — Form consign → Supabase `consigned_items`, admin xử lý
- [ ] Contact form — Gửi email thật qua Resend
- [ ] Bảo mật — Vá endpoint register không auth, harden API routes
- [ ] Consolidate stack — Xóa `relique-marketplace/` prototype, deprecated schemas, legacy admin localStorage services, duplicate shadcn copies
- [ ] Admin UX redesign — CRM/dashboard/marketplace management UI overhaul
- [ ] Schema consolidation — Migrate imports sang `@relique/shared/domain`, xóa deprecated schema files

### Out of Scope

- Public site UX redesign — User chọn admin-only cho v1; homepage/marketplace/verify UI giữ nguyên hoặc chỉ fix functional
- Full test framework + CI pipeline — Defer v2; v1 chỉ lint + typecheck + build
- Separate `apps/admin` app — Đang bị thay thế bởi unified app
- `relique-marketplace/` Vite prototype — Sẽ archive/xóa sau khi gộp app
- Mobile native apps — Web-only
- Multi-language/i18n — English-only cho v1
- Marketplace payments (Stripe Checkout) — User decision 2026-06-14; browse-only v1, defer v2

## Context

**Brownfield codebase** đã được map tại `.planning/codebase/` (2026-06-14).

**Hiện trạng:**
- Monorepo: `apps/web` (port 1300), `apps/admin` (port 3600), `packages/shared`, `packages/ui`
- Stack: Next.js 16, React 19, TypeScript 5.9, Supabase, Tailwind, shadcn/ui, Zod, Turborepo
- Data split: marketplace → Supabase; verify/consign → localStorage mocks; admin CRM → Supabase
- Tech debt: Phase 4 migration incomplete, duplicate schemas, triplicated shadcn, ~50 `@ts-expect-error` on Supabase mutations, oversized files (>300 lines)
- Known bugs: contact form fake success, QR verify random mock codes, watchlist fake notifications
- Security: unauthenticated register endpoint, service-role client in web public API routes

**User vision (questioning 2026-06-14):**
- Foundation-first: gộp app + migration + security trước, features/UX sau
- Route group `/admin` trong single Next.js app
- Full product — tất cả flows thật, không mock
- Admin UX redesign trong v1
- Stack consolidate — dọn legacy, không thêm test framework v1

## Constraints

- **Architecture**: Single Next.js app (`apps/web`) với `/admin` route group — không giữ `apps/admin` riêng
- **Data**: Supabase là single source of truth — không localStorage persistence cho production data
- **Packages**: Giữ `@relique/shared` và `@relique/ui` workspace packages
- **UI**: Không sửa trực tiếp `components/ui/**` — wrapper pattern theo shadcn-guard rule
- **Quality gate**: Lint + typecheck + build only cho v1 — không Vitest/Playwright/CI
- **Auth**: Supabase cookie sessions, middleware guard `/admin/*`, `requireUser`/`requireRole` trên API routes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gộp admin vào web app tại `/admin` route group | Một deploy, một codebase, giảm duplication | — Pending |
| Foundation-first execution order | Data layer và security phải ổn trước khi redesign/features | — Pending |
| Admin-only UX redesign cho v1 | Public site functional fixes only; admin là nơi operators spend time | — Pending |
| Consolidate stack (không modernize tests v1) | User ưu tiên dọn legacy hơn thêm test infra ngay | — Pending |
| Full product v1 — không mock | Verify, consign, contact production-ready; payments defer v2 | — Pending |
| Bỏ payments khỏi v1 | Browse-only marketplace; giảm scope, tránh Stripe infra sớm | — Pending |
| Minimal validation (lint/typecheck/build) | User chọn defer test framework sang v2 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-14 — payments removed from v1 scope*
