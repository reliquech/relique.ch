# Phase 3: Security Hardening - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning
**Mode:** auto-discuss (recommended defaults)

<domain>
## Phase Boundary

Harden platform cho production traffic trên unified app hiện tại (`apps/web`). Deliverables:

- Không còn public user registration qua API
- Public read/write routes dùng Supabase client phù hợp (ưu tiên anon + RLS; service-role chỉ khi bắt buộc)
- Admin API routes enforce `requireUser` + `requireRole` nhất quán trên mutations
- Marketplace public browse chỉ trả về `published` + `public` items — không leak draft/private

**Không trong phase này:** monorepo restructure (Phase 6), schema consolidation (Phase 4), admin UX redesign (Phase 5), full rate-limiting/WAF infra (defer v2).

</domain>

<decisions>
## Implementation Decisions

### Register Endpoint (SEC-01)
- **D-01:** **`POST /api/auth/register` bị disable cho anonymous callers** — trả `403` với message rõ ràng; không public signup
- **D-02:** User creation chỉ qua **admin flow hiện có** (`/admin/users`, admin API) — không thêm self-service signup v1
- **D-03:** Không xóa route file ngay — **guard + disable** để tránh break unknown clients; document trong code comment

### Public API Client Strategy (SEC-02)
- **D-04:** **Read-only public routes** (marketplace browse, verify lookup) — migrate sang **server anon client** + RLS khi schema cho phép; giảm service-role trên GET
- **D-05:** **Write public routes** (`/api/public/consign`, `/api/public/contact`) — **giữ service-role server-side** Phase 3 (anon không có INSERT policy phù hợp); bắt buộc Zod validation + basic abuse protection (payload size, honeypot hoặc rate limit nhẹ)
- **D-06:** `/api/public/verify` — **read-only** → ưu tiên anon client; fallback service-role chỉ nếu RLS block legitimate public read
- **D-07:** Audit toàn bộ `apps/web/src/app/api/**` — inventory list routes dùng service-role; document lý do từng route

### Admin API Auth Consistency (SEC-03)
- **D-08:** **Mọi mutation route** (POST/PATCH/DELETE) bắt buộc `requireUser` + `requireRole` với role matrix: `admin` full, `editor` mutate CRM/marketplace, `viewer` **read-only**
- **D-09:** Routes thiếu guard → **thêm guard** theo pattern `apps/web/src/app/api/leads/route.ts`
- **D-10:** Viewer role attempting mutate → `403` (không silent no-op)
- **D-11:** Health/debug routes (`/api/health`) — public OK; error-log và internal routes — admin-only

### Marketplace Visibility (SEC-04)
- **D-12:** Public marketplace queries **luôn filter** `state.lifecycle = 'published'` AND `state.visibility = 'public'` — server-side, không rely UI-only
- **D-13:** Slug/detail API — **404** cho unpublished/private (không leak metadata)
- **D-14:** Verify marketplace link (VRFY-04) — chỉ link khi item pass filter D-12 (align Phase 2 D-05)

### Public Route Abuse (lightweight v1)
- **D-15:** Public write routes — **max body size** + **field validation** + optional **honeypot field** trên contact/consign
- **D-16:** Full rate limiting / CAPTCHA — **defer v2**; Phase 3 chỉ lightweight guards

### Claude's Discretion
- Exact RLS policies cần thêm/sửa cho anon verify read
- Rate limit implementation (middleware vs per-route) nếu thêm lightweight limit
- Whether to return `410 Gone` vs `403` on register endpoint
- Audit script format (markdown table vs JSON inventory)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, SEC-01–SEC-04
- `.planning/REQUIREMENTS.md` — SEC-01 through SEC-04 acceptance criteria
- `.planning/PROJECT.md` — Auth constraints, no public signup, Supabase cookie sessions
- `.planning/phases/02-supabase-data-layer-public-flows/02-CONTEXT.md` — Public API routes D-09, D-15–D-16 lightweight protection

### Security Concerns
- `.planning/codebase/CONCERNS.md` — Unauthenticated register, service-role sprawl
- `.planning/codebase/ARCHITECTURE.md` — API layer, auth flow

### Implementation Targets
- `apps/web/src/app/api/auth/register/route.ts` — public signup vulnerability
- `apps/web/src/app/api/public/verify/route.ts` — public read route
- `apps/web/src/app/api/public/consign/route.ts` — public write route
- `apps/web/src/app/api/public/contact/route.ts` — public write route
- `apps/web/src/lib/supabase/server.ts` — client factories
- `apps/web/src/lib/supabase/requireUser.ts` — auth guard pattern
- `apps/web/src/lib/supabase/requireRole.ts` — role guard pattern
- `apps/web/src/middleware.ts` — session refresh scope

### Conventions
- `.cursor/rules/shadcn-guard.mdc` — UI wrapper rule (unchanged this phase)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `requireUser`, `requireRole` — established on most admin CRM routes; use as template for audit fixes
- `createServiceRoleClient`, `createServerClient` — dual client pattern in `lib/supabase/server.ts`
- Phase 2 public routes already use Zod validation — extend with size/abuse guards

### Established Patterns
- Admin mutations: `requireUser` → `requireRole({ allow: ["admin", "editor"] })` → service-role Supabase
- Public flows: unauthenticated POST with service-role (Phase 2) — tighten validation, not remove writes

### Integration Points
- All `apps/web/src/app/api/**` routes — audit surface
- Marketplace service/query layer — published filter enforcement
- Middleware — session only; API auth independent per route

</code_context>

<specifics>
## Specific Ideas

- [auto] Register endpoint: disable anonymous access (403) — aligns with operator-only platform, no public signup
- [auto] Service-role: keep for public writes Phase 3; migrate reads to anon where RLS allows
- [auto] Viewer read-only: enforce on all PATCH/POST/DELETE admin routes

</specifics>

<deferred>
## Deferred Ideas

- CAPTCHA / Turnstile on public forms — v2
- Full API rate limiting middleware — v2
- WAF / edge security rules — deploy-time, out of scope
- Monorepo flatten — Phase 6

</deferred>

---

*Phase: 03-security-hardening*
*Context gathered: 2026-06-14*
