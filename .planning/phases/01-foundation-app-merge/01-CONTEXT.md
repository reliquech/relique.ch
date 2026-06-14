# Phase 1: Foundation & App Merge - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Gộp `apps/admin` vào `apps/web` thành **một Next.js app, một deploy**. Deliverables:

- Admin CRM tại URL prefix `/admin/*` với shell riêng (sidebar, không public header/footer)
- Tất cả admin API routes (`~58`) chạy trên unified app tại `/api/*`
- Supabase migrations folder consolidate vào unified app
- Root scripts/turbo cập nhật — không còn `dev:admin`
- `pnpm dev` khởi động một app — public marketplace và admin CRM đều hoạt động

**Không trong phase này:** verify/consign/contact backend thật (Phase 2), security hardening (Phase 3), xóa `apps/admin/` directory (Phase 5), admin UX redesign (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Admin Code Placement
- **D-01:** Admin business modules đặt tại `apps/web/src/admin/` — **không** dùng `src/features/` như research mặc định
- **D-02:** Cấu trúc bên trong `src/admin/` — **Claude's discretion**: mirror pattern hiện tại `apps/admin/src/features/` (domain folders: `crm/`, `marketplace/`, `submissions/`, etc. với `pages/`, `components/`, `services/`, `hooks/`, barrel `index.ts`)
- **D-03:** Admin shell UI (PortalSidebar, admin header, layout chrome) đặt tại `apps/web/src/components/admin/`
- **D-04:** Thin route files tại `apps/web/src/app/admin/**/page.tsx` re-export từ `src/admin/{domain}/pages/`

### Public Code (Minimal Touch)
- **D-05:** Phase 1 chỉ **minimal** thay đổi public code — wrap existing routes vào `(site)` route group; **không** relocate shared components hay redesign public UI
- **D-06:** Public shell (Header, Footer, Currency, Compare) chuyển từ root `app/layout.tsx` → `app/(site)/layout.tsx` — admin routes không inherit public chrome

### Auth Entry & Redirects
- **D-07:** Login page tại **`/admin/login`** — nested trong admin URL segment, không dùng `/login` root
- **D-08:** Sau login thành công → **luôn redirect `/admin`** (dashboard) — không dùng `redirect` query param post-login
- **D-09:** Unauthenticated access `/admin/*` (trừ `/admin/login`) → redirect **`/admin/login?redirect={original_path}`**
- **D-10:** Middleware scope — **Claude's discretion**: recommended pattern là session cookie refresh trên mọi route, auth guard chỉ `/admin/*` (exclude `/admin/login`); API routes enforce auth independently via `requireUser`/`requireRole`

### Merge Execution (Pre-decided from PROJECT.md)
- **D-11:** `apps/web` là app survivor — `apps/admin` giữ song song cho đến Phase 1 hoàn tất (xóa ở Phase 5)
- **D-12:** Incremental merge order: layout split `(site)` → auth/middleware → API routes → admin UI pages → verify end-to-end

### Claude's Discretion
- Internal structure của `src/admin/` subfolders (mirror features pattern)
- Middleware implementation details (session refresh scope, matcher config)
- Exact turbo/tsconfig path alias updates
- Conflict resolution khi merge duplicate dependencies giữa web và admin `package.json`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Merge Strategy
- `.planning/research/ARCHITECTURE.md` — Target directory layout, layout nesting model, build order, boundary rules
- `.planning/research/PITFALLS.md` — Big-bang merge risks, middleware/auth pitfalls (§ Phase 1 mapping)
- `.planning/research/SUMMARY.md` — Executive summary và 6-phase build order
- `.planning/codebase/ARCHITECTURE.md` — Current brownfield layers, data flow, entry points
- `.planning/codebase/STRUCTURE.md` — Current directory layout, key file locations

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, FND-01–FND-06
- `.planning/REQUIREMENTS.md` — FND-01 through FND-06 acceptance criteria
- `.planning/PROJECT.md` — Core value, constraints, key decisions

### Existing Implementation (Source)
- `apps/admin/src/app/admin/layout.tsx` — Current admin shell to migrate
- `apps/admin/src/middleware.ts` — Current auth redirect pattern
- `apps/admin/src/lib/supabase/` — Supabase client factories, requireUser, requireRole
- `apps/admin/src/app/api/` — ~58 API routes to migrate
- `apps/admin/supabase/migrations/` — 31 SQL migrations to relocate
- `apps/web/src/app/layout.tsx` — Current root layout (public shell to extract)

### Conventions
- `.cursor/rules/shadcn-guard.mdc` — Do not edit `components/ui/**`; use wrappers in `components/app/` or `components/shared/`
- `.planning/codebase/CONVENTIONS.md` — Naming, Result pattern, feature module patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/admin/src/features/*/` — Entire admin feature modules copy/migrate to `src/admin/`
- `apps/admin/src/components/shared/` — DataTable, CrmViewBar, PortalSidebar patterns
- `apps/admin/src/lib/actions/actionRegistry.ts` — Command palette action registry
- `apps/admin/src/lib/supabase/*` — Auth layer (client, server, middleware, requireUser, requireRole)
- `apps/web/src/app/api/marketplace/` — Existing public API pattern to follow for migrated routes
- `@relique/shared`, `@relique/ui` — Unchanged workspace packages

### Established Patterns
- Thin route re-export: `apps/admin/src/app/admin/deals/page.tsx` → `features/crm/pages/DealsPage`
- Feature barrel exports: `features/{domain}/index.ts`
- API auth: `requireUser()` + optional `requireRole({ allow: ['admin', 'editor'] })`
- Service-role client only in Route Handlers, never browser

### Integration Points
- Root `app/layout.tsx` → split: minimal root + `(site)/layout.tsx` + `admin/layout.tsx`
- `middleware.ts` at `apps/web/src/middleware.ts` — merge from admin middleware
- `package.json` (root) — remove `dev:admin`, update turbo pipeline
- `tsconfig.json` — remove `apps/admin` reference after merge
- `apps/admin/supabase/migrations/` → `apps/web/supabase/migrations/`

</code_context>

<specifics>
## Specific Ideas

- User explicitly prefers `src/admin/` over research-recommended `src/features/` — naming signals admin domain separation from public code
- Admin shell components in `components/admin/` — clear visual/structural boundary
- Login nested at `/admin/login` rather than root `/login` — admin is self-contained URL namespace
- Public site untouched beyond `(site)` wrapper — aligns with "admin-only UX redesign v1" from PROJECT.md

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-foundation-app-merge*
*Context gathered: 2026-06-14*
