# Project Research Summary

**Project:** Relique.co — Unified Platform  
**Domain:** Sports memorabilia authentication & operator-owned marketplace (public site + internal CRM)  
**Researched:** 2026-06-14  
**Confidence:** HIGH

## Executive Summary

Relique.co is a brownfield Next.js monorepo transitioning from a split public/admin architecture with mock public flows to a production-ready unified platform. The product is an **operator-owned** memorabilia marketplace — Relique authenticates inventory, lists it, and sells directly — not a multi-vendor P2P marketplace like eBay or Fanatics Collect. Experts build this class of product as a single deploy with a public catalog + trust/verify layer, intake forms (consign, contact), Stripe-hosted checkout, and an internal CRM for operators managing the full consign → list → sell pipeline.

Research recommends **keeping the existing core stack** (Next.js 16, React 19, Supabase, pnpm/Turborepo, `@relique/shared`, `@relique/ui`) and executing **foundation-first**: merge `apps/admin` into `apps/web` via App Router layout isolation (`(site)` for public shell, `admin/` URL segment for CRM), complete Supabase as single source of truth for verify/consign/contact, harden security (RLS, service-role audit, register lockdown), then add Stripe Checkout v1 (Relique as merchant of record, Connect deferred). Do not change framework, add ORM, migrate Tailwind 4, or introduce test/CI infra in v1.

Key risks are merge-induced auth/layout collisions, shipping mock verify as real authentication (legal/reputational liability in memorabilia), service-role sprawl bypassing RLS, and starting payments before order/state machines exist. Mitigation: incremental merge in dependency order (layout → auth → API → admin UI → public data layer), defense-in-depth auth (middleware UX + handler-level `requireUser`/`requireRole`), real verify backend with evidence linkage, route audit matrix before production, and Stripe Checkout (not Connect) only after Supabase order tables and webhooks are in place.

## Key Findings

### Recommended Stack

Keep Next.js 16.1 + React 19 + TypeScript 5.9 + pnpm/Turborepo. Bump Node to `>=20.18` (required by `@supabase/supabase-js` ≥2.79). Merge survivor app is `apps/web`; admin routes stay at `/admin/*`, public routes under `(site)/` route group. Single Vercel deploy, one API namespace, port admin middleware and Supabase SSR clients.

**Core technologies:**
- **Next.js 16 App Router** — unified public + admin via route groups and nested layouts — proven in both apps, documented pattern for layout isolation
- **Supabase PostgreSQL + Auth** — single data plane for CRM, marketplace, verify, consign, contact — 31 existing SQL migrations; bump `@supabase/supabase-js@^2.108.1`, `@supabase/ssr@^0.12.0`
- **Stripe Checkout + webhooks** — buyer payments v1 with Relique as MoR — PCI scope low, no custom card form; defer Stripe Connect until automated seller payouts required
- **Resend SDK** — transactional email for contact/consign/purchase confirmations — upgrade from raw fetch; reuse admin pattern
- **@relique/shared + @relique/ui** — domain schemas and shadcn wrappers — consolidate imports to `./domain`; no duplicate `components/ui`

**Explicitly excluded v1:** Prisma/Drizzle, Clerk/Auth0, Tailwind 4, Vitest/Playwright/CI, Redis, Stripe Connect (default), PayPal, `relique-marketplace/` Vite prototype.

### Expected Features

**Must have (table stakes):**
- Real verify lookup — cert/product ID → database-backed authentication outcome (replaces prefix mock)
- Real consign submit — form + photos → `consigned_items` + confirmation email
- Working contact form — inquiry → CRM lead/message + operator notification via Resend
- Stripe buy-now checkout — pay → sold state → buyer receipt email
- Admin submission queue — view/status transitions on consign intake
- Fix trust-breaking mocks — QR scan parsing, contact fake success, watchlist fake notifications

**Should have (competitive/differentiators):**
- End-to-end consign → CRM → listing pipeline — operator workflow moat
- In-house Relique authentication brand — branded cert numbers linked to inventory
- Admin listing edit (fix no-op stub) — operator listing maintenance
- Consign → lead auto-creation — avoid re-typing intake data
- Audit logging on publish/approve/payment mutations
- AI-assisted listing image generation — already shipped; stabilize

**Defer (v2+):**
- Stripe Connect / automated seller payouts — manual payout OK for consignment ops v1
- Live auctions, multi-vendor seller portal, blockchain/NFT provenance
- Public user accounts, watchlist price alerts, public UX redesign
- Full test framework + CI, i18n, native mobile apps

### Architecture Approach

Single Next.js app (`apps/web`) with `(site)/layout.tsx` for public Header/Footer shell, `admin/layout.tsx` for CRM sidebar shell, and unified `app/api/*` with auth-tier conventions. Data flows always **UI → client service/facade → Route Handler → Supabase**; never client-side service-role writes. Admin features live in `features/{domain}/` with thin route re-exports; public pages use service facades swappable from `impl/*.local.ts` to API adapters.

**Major components:**
1. **Public Pages + Service Facades** — marketplace, verify, consign, contact; stable import surface during mock→Supabase transition
2. **Admin Feature Modules** — CRM, marketplace mgmt, submissions under `features/`; communicate via authenticated `/api/*`
3. **API Route Handlers + Supabase Auth Layer** — authorization boundary with `requireUser`/`requireRole`; middleware for session refresh and `/admin` redirect UX only
4. **Domain Package (`@relique/shared`)** — Zod schemas, contracts, types as cross-surface truth
5. **Payments Layer** — `POST /api/checkout`, `POST /api/webhooks/stripe`, `orders` + `stripe_events` tables

### Critical Pitfalls

1. **Big-bang app merge** — incremental merge: layout split → auth infra → API routes → admin features → public data layer; inventory API path conflicts (`/api/marketplace`, `/api/auth/register`) before copy
2. **localStorage cutover without contracts** — define Supabase tables, idempotency keys, and delete legacy adapters in same release; web must write to tables admin reads (`consigned_items`)
3. **Service role as default client** — audit every route for client type; public reads → anon + RLS; service role only for webhooks, hardened admin ops; gate/remove open register endpoint
4. **Mock verify shipped as production auth** — memorabilia legal liability; require server-side verify table, real QR parsing, evidence linkage; never show authentication language on mock paths
5. **Payments before order state machine** — define `orders` lifecycle in Supabase first; webhooks as source of truth with idempotent handlers; v1 Stripe Checkout (not Connect) with manual seller payout

## Implications for Roadmap

Based on research, suggested phase structure aligned to PROJECT.md foundation-first order and architecture build-order dependencies:

### Phase 1: Foundation & App Merge
**Rationale:** All downstream work depends on single deploy, layout isolation, and unified auth/API namespace. API routes must exist before admin pages mount.
**Delivers:** `(site)/` layout split; middleware + login; admin API routes migrated; Node 20 engines bump; admin deps merged to web
**Addresses:** Unified platform architecture; authenticated admin routes preserved
**Avoids:** Pitfall 1 (big-bang merge), Pitfall 16 (typecheck mismatch), admin-in-public-shell anti-pattern

### Phase 2: Supabase Data Layer (Verify, Consign, Contact)
**Rationale:** Production blocker — marketplace already on Supabase; verify/consign/contact still mock/localStorage. Admin CRM exists but public intake not wired.
**Delivers:** Migrations for verify records, contact submissions; real API routes; Resend confirmations; localStorage adapters removed; fix QR scan + contact fake success
**Uses:** Supabase migrations at repo root; `@supabase/ssr` bump; Resend SDK
**Implements:** Service facade swap pattern; public write routes with validation
**Avoids:** Pitfalls 2, 4, 5, 10, 11 (localStorage, RLS, mock verify, email silo, migration drift)

### Phase 3: Security Hardening
**Rationale:** Cannot go production with service-role sprawl, open register endpoint, and untested RLS. Start audit in Phase 2; block production until closed.
**Delivers:** Route auth audit matrix; anon+RLS for public reads; register lockdown; rate limiting minimum on public POST; Security Advisor clean
**Avoids:** Pitfalls 3, 4, 9 (service role, RLS misconfig, middleware/API auth confusion)

### Phase 4: Marketplace Payments
**Rationale:** Depends on stable listing state and order tables from Phase 2; completes "trust and transact" value prop.
**Delivers:** Stripe Checkout session creation; webhook handler with dedupe; `orders`/`stripe_events` tables; sold state on listing; buyer receipt email; admin order visibility
**Uses:** `stripe@^22.2.1`; Stripe Checkout (MoR, not Connect v1)
**Avoids:** Pitfall 6 (Connect before state machine); webhook-without-DB anti-pattern

### Phase 5: Stack Consolidation
**Rationale:** Parallel-safe after Phase 2 stable; reduces merge debt before UX polish.
**Delivers:** Delete `apps/admin`; schema imports → `@relique/shared/domain`; `@relique/ui` dedup; regenerate Supabase types; archive `relique-marketplace/`; single Vercel config
**Avoids:** Pitfalls 7, 8, 14, 15, 17 (schema duplication, shadcn triplication, mock features, dual animation libs, prototype confusion)

### Phase 6: Admin UX Redesign
**Rationale:** Requires stable `/admin` shell and real data — redesign on mock data is highest rewrite risk per PROJECT.md and pitfalls research.
**Delivers:** CRM/dashboard/marketplace management UI overhaul; wire submission queue stubs; admin listing edit; pagination for large lists
**Addresses:** Admin-only UX redesign requirement; submission queue actions; listing edit no-op fix
**Avoids:** Pitfalls 12, 18, 21 (oversized files, unpaginated lists, submission stubs)

### Phase Ordering Rationale

- **Merge before features:** Admin UI fetches `/api/*` on mount; layout split before admin routes prevents public chrome on CRM
- **Data before payments:** Order/consign state machine must exist before Stripe webhooks update anything meaningful
- **Security before production traffic:** Service-role audit and register lockdown are gates, not polish
- **Consolidation before UX redesign:** Schema and UI dedup prevents redesign on divergent types/components
- **Admin UX last:** Operators need real backends first; beautiful UI on `console.log` stubs wastes effort

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Verify backend):** Memorabilia-specific evidence chain, cert-to-listing linkage, legal disclaimer copy — domain nuance beyond generic CRUD
- **Phase 4 (Payments):** Business decision on MoR vs early Connect if legal requires automated seller settlement; manual capture timing if auth-hold model needed
- **Phase 3 (Security):** Per-route audit of ~60 API routes; RLS policy design for public insert vs admin read on new tables

Phases with standard patterns (skip research-phase):
- **Phase 1 (App merge):** Next.js route groups + Supabase SSR middleware — well-documented, proven in existing admin app
- **Phase 4 (Stripe Checkout v1):** Standard Checkout + webhooks pattern — HIGH confidence from official docs
- **Phase 5 (Stack consolidation):** Monorepo cleanup, schema import migration — mechanical with clear grep targets

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Brownfield codebase verified; official Next.js, Supabase, Stripe docs; delta-only recommendations |
| Features | **HIGH** | Table stakes verified against PSA/Beckett/Fanatics patterns + codebase audit; gap matrix clear |
| Architecture | **HIGH** | Existing admin patterns mapped; build order dependencies explicit; API conflict resolution defined |
| Pitfalls | **HIGH** | Codebase audit + official Supabase RLS/Stripe Connect docs; phase-specific warnings documented |

**Overall confidence:** **HIGH**

### Gaps to Address

- **Migration folder location:** Root `supabase/` vs `apps/web/supabase/` — decide during Phase 1 planning; MEDIUM confidence either works
- **Stripe Connect timing:** v1 MoR + manual payout assumed; validate with business/legal if automated seller settlement is v1 requirement
- **Verify evidence depth:** Minimum viable verify (DB lookup + outcome) vs full evidence chain (images, examiner metadata) — scope during Phase 2 planning
- **Favorites/compare localStorage:** Decide per-feature: disable mocks, keep client-only v1, or defer to v2 accounts
- **Manual verification runbook:** No automated tests v1 — each phase needs VERIFICATION.md checklist (auth matrix, marketplace leak check, webhook replay)

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md`, `.planning/codebase/*` — brownfield status, validated vs mock features, security findings
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — layout isolation for merge
- [Supabase SSR Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — cookie sessions, middleware pattern
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) — policy requirements for new tables
- [Stripe Checkout](https://docs.stripe.com/payments/checkout) — v1 payment flow
- `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` — detailed research inputs

### Secondary (MEDIUM confidence)
- [PSA Cert Verification](https://www.psacard.com/cert), [Beckett BAS Verify](https://www.beckett-authentication.com/verify-certificate) — verify UX table stakes
- [Fanatics/Heritage/Sotheby's consignment flows](https://www.fanaticscollect.com/consign) — intake patterns
- [Stripe Connect marketplace docs](https://docs.stripe.com/connect/saas-platforms-and-marketplaces) — v2 defer rationale
- [CVE-2025-29927 middleware bypass analysis](https://faultlinesec.com/blog/nextjs-middleware-auth) — handler-level auth requirement

### Tertiary (LOW confidence)
- [Sportafi Verified Marketplace](https://www.sportafi.com/verified-marketplace/) — Web3 features confirmed as anti-features for Relique v1

---
*Research completed: 2026-06-14*  
*Ready for roadmap: yes*
