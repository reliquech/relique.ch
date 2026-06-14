# Technology Stack

**Project:** Relique.co — Unified Platform (merge + Supabase + payments)  
**Researched:** 2026-06-14  
**Scope:** Delta stack for milestone — không re-research toàn bộ brownfield; tập trung merge `apps/admin` → `apps/web`, hoàn thiện Supabase, thêm marketplace payments.

---

## Executive Recommendation

**Giữ core hiện tại** (Next.js 16 + React 19 + Supabase + pnpm/Turborepo + `@relique/shared` + `@relique/ui`) và **chỉ bổ sung/nâng cấp có chủ đích** cho merge, data layer, và payments. Không đổi framework, không thêm ORM, không migrate Tailwind 4 trong milestone này.

**Nguyên tắc:** Một app (`apps/web`), một deploy Vercel, Supabase là single source of truth, Stripe Checkout cho buyer payments v1 (Relique là merchant of record), Stripe Connect defer sang phase sau khi cần automated seller payouts.

---

## Recommended Stack

### Core Framework (Keep — Minor Upgrades)

| Technology | Target Version | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| **Next.js** | `16.1.0` (pin) | Unified App Router app | Đã dùng ở cả hai app; App Router + Route Groups là pattern chuẩn để gộp admin/public mà không đổi URL `/admin/*`. Turbopack default trong Next 16 phù hợp monorepo lớn. | **HIGH** — đã trong repo + [Next.js Route Groups docs](https://nextjs.org/docs/app/building-your-application/routing/route-groups) |
| **React** | `^19.2.0` | UI runtime | Đồng bộ với Next 16; không downgrade. | **HIGH** |
| **TypeScript** | `5.9.2` (pin) | Type safety | Project references đã cấu hình; giữ pin để tránh drift giữa apps/packages. | **HIGH** |
| **Node.js** | `>=20.18` (engines) | Runtime | `@supabase/supabase-js` ≥2.79 **đã drop Node 18** (EOL Apr 2025). Root `engines` hiện `>=18` — **phải nâng lên 20 LTS** trước khi bump Supabase. | **HIGH** — [supabase-js deprecation notice](https://github.com/supabase/supabase-js) |
| **pnpm** | `10.28.1` (pin) | Package manager | Đã enforced qua `packageManager`; workspace hoạt động ổn. | **HIGH** |
| **Turborepo** | `^2.7.5` | Monorepo orchestration | Sau merge chỉ còn `web` + packages; giảm filter scripts, giữ `turbo.json` inputs `.env*`. | **HIGH** |

### Unified App Architecture (Merge Target)

| Decision | Recommendation | Why | Confidence |
|----------|----------------|-----|------------|
| **Survivor app** | `apps/web` absorbs `apps/admin` | Public site đã là primary deploy (`relique.ch`); admin hiện dùng prefix `/admin/*` — mapping 1:1, ít đổi URL. | **HIGH** |
| **Route structure** | `apps/web/src/app/(site)/…` + `apps/web/src/app/admin/…` + `apps/web/src/app/login/` | Tách layout public vs admin bằng route groups; admin pages giữ path `/admin/*` như hiện tại (`apps/admin/src/app/admin/`). Login ở `/login` ngoài admin group. | **HIGH** |
| **Root layouts** | Nested layout (khuyến nghị) hoặc multiple root layouts | **Nested:** giữ `app/layout.tsx` chung (fonts, providers) + `app/admin/layout.tsx` (sidebar CRM). **Multiple root:** chỉ nếu admin cần `<html>`/theme hoàn toàn khác — chấp nhận full reload khi cross-layout navigate. Brownfield admin đã share Work Sans → **nested layout đủ**. | **HIGH** — [Next.js multiple root layouts caveat](https://nextjs.org/docs/app/building-your-application/routing/route-groups) |
| **API routes** | Gộp `apps/admin/src/app/api/**` → `apps/web/src/app/api/**` | ~60 admin routes + web marketplace routes; một namespace, một middleware matcher, một bộ env secrets. | **HIGH** |
| **Middleware** | Port `apps/admin/src/lib/supabase/middleware.ts` → unified `middleware.ts` | Pattern `@supabase/ssr` + `getUser()` + guard `/admin/*` đã proven; mở rộng matcher cho toàn app (trừ static). | **HIGH** — [Supabase SSR middleware pattern](https://github.com/supabase/server/blob/main/docs/ssr-frameworks.md) |
| **Deploy** | Một Vercel project (`apps/web/vercel.json`) | Xóa `apps/admin/vercel.json` sau cutover; gom env vars một chỗ. | **HIGH** |
| **Post-merge cleanup** | Xóa `apps/admin/`, archive `relique-marketplace/` | Theo PROJECT.md out-of-scope; giảm triplicated shadcn + duplicate Supabase clients. | **HIGH** |

**Merge dependency additions** (admin-only packages → `apps/web/package.json`):

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `@dnd-kit/core` | `^6.3.1` | Marketplace carousel DnD | **HIGH** — already in admin |
| `@dnd-kit/utilities` | `^3.2.2` | DnD helpers | **HIGH** |
| `cmdk` | `^1.0.0` | Admin command palette | **HIGH** |
| `recharts` | `^3.6.0` | Dashboard charts | **HIGH** |

### Database & Backend (Supabase Migration Completion)

| Technology | Target Version | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| **Supabase PostgreSQL** | Hosted (existing project) | Single source of truth | CRM + marketplace đã trên Supabase; verify/consign/contact chỉ cần tables + RLS mới, không đổi DB engine. | **HIGH** |
| `@supabase/supabase-js` | `^2.108.1` | DB/Auth/Storage client | Bump từ `^2.90.1`; bugfixes, Node 20 requirement, type gen improvements. | **HIGH** — [npm @supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js) |
| `@supabase/ssr` | `^0.12.0` | Cookie sessions in App Router | Bump từ `^0.8.0`; thay thế auth-helpers deprecated; middleware refresh pattern bắt buộc. | **HIGH** — [npm @supabase/ssr](https://www.npmjs.com/package/@supabase/ssr) |
| **Supabase CLI** | Latest stable (devDep at repo root) | Migrations + type generation | Di chuyển `apps/admin/supabase/migrations/` → `supabase/migrations/` (repo root hoặc `apps/web/supabase/`). Một pipeline gen types → `packages/shared` hoặc `apps/web/src/lib/supabase/types.ts`. | **MEDIUM** — pattern chuẩn, chưa verify cấu trúc team prefer |
| **SQL migrations** | Existing 31 files + new | verify, consign, contact, orders, stripe_events | Giữ SQL-first (đã có RLS policies); không thêm Prisma/Drizzle. | **HIGH** |

**Supabase client architecture (post-merge):**

| Client | Where | Key | Why |
|--------|-------|-----|-----|
| Browser client | `createBrowserClient` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Admin UI + future buyer auth |
| Server client (RLS) | `createServerClient` in RSC/route handlers | anon key + cookies | **Thay thế** service role trên public read paths |
| Service role | Isolated `createServiceRoleClient()` | `SUPABASE_SERVICE_ROLE_KEY` | Chỉ: webhooks, register (hardened), batch jobs, admin-only mutations không thể RLS |

**Auth guards (keep, extend):**

- `requireUser()` / `requireRole()` on `/api/admin/**` (rename prefix optional)
- Middleware: `getUser()` not `getSession()` for access control — **HIGH** ([Supabase Next.js SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs))
- Public verify/consign/contact: server-side insert via RLS (authenticated optional) hoặc rate-limited API route — **không** localStorage

### Payments (New — Marketplace v1)

Relique là **consignment marketplace**: buyer trả Relique, Relique trả seller sau (terms §6.2). v1 không bắt buộc split payout tại checkout.

| Technology | Target Version | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| **Stripe** (platform account) | Dashboard setup | Payment processor | Ecosystem default cho Next.js marketplaces; docs Connect/marketplace mature. PROJECT.md: "Stripe hoặc tương đương". | **HIGH** |
| `stripe` | `^22.2.1` | Server-side Stripe API | Official Node SDK; webhook signature verification, Checkout Sessions, PaymentIntents. | **HIGH** — [npm stripe](https://www.npmjs.com/package/stripe) |
| **Stripe Checkout** | Hosted UI | Buyer checkout v1 | Nhanh, PCI scope thấp, mobile-ready; phù hợp "foundation-first" — không build custom card form. | **HIGH** — [Stripe Checkout docs](https://docs.stripe.com/payments/checkout) |
| **Stripe Webhooks** | `POST /api/webhooks/stripe` | Async payment state | `checkout.session.completed`, `payment_intent.payment_failed`; raw body + `constructEvent`. | **HIGH** |
| `@stripe/stripe-js` | `^8.x` (latest) | Client redirect (optional) | Chỉ nếu dùng Embedded Checkout; v1 hosted Checkout có thể **không cần**. | **MEDIUM** |

**Payment data model (Supabase tables — new migrations):**

| Table | Purpose |
|-------|---------|
| `orders` | `id`, `buyer_email`, `listing_id`, `amount_cents`, `currency`, `status`, `stripe_checkout_session_id`, `stripe_payment_intent_id` |
| `order_events` / `stripe_events` | Raw webhook payload, `event_id` UNIQUE (dedupe) |
| Extend `marketplace_items` | `status`: available → reserved → sold |

**v1 payment flow:**

```
Buyer → POST /api/checkout → Stripe Checkout Session (line item = listing)
       → success/cancel URLs
       → webhook → update orders + marketplace_items.status
       → admin CRM sees sale → manual seller payout (existing ops)
```

**Stripe Connect — defer v2:**

| | v1 (recommended) | v2 (when needed) |
|--|------------------|------------------|
| Model | Relique MoR, standard Checkout | Connect Express, destination charges |
| Seller payout | Manual/off-platform tracked in CRM | `application_fee_amount` + `transfer_data.destination` |
| Complexity | Low | High (KYC, onboarding, reconciliation) |
| When | MVP payments, consignment ops team handles payouts | Automated seller onboarding + split payouts |

**Confidence:** v1 standard Checkout **HIGH**; Connect defer **MEDIUM** — business may require Connect sớm hơn nếu legal yêu cầu automated seller settlement.

### Email (Upgrade Path)

| Technology | Target Version | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| `resend` | `^6.12.4` | Transactional email SDK | Thay raw `fetch("https://api.resend.com/emails")` trong admin; typed `{ data, error }`, React Email support. | **HIGH** — [Resend Next.js docs](https://resend.com/docs/send-with-nextjs) |
| `@react-email/components` | `^0.0.x` (optional) | Email templates | Contact notification + order confirmation; giữ logic trong `packages/shared` hoặc `apps/web/src/emails/`. | **MEDIUM** |

### Validation, Forms, Domain (Keep)

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `zod` | `^4.3.2` | Schema validation | **HIGH** — `@relique/shared` contracts |
| `react-hook-form` | `^7.69.0` | Form state | **HIGH** |
| `@hookform/resolvers` | `^5.2.2` | Zod integration | **HIGH** |
| `@relique/shared` | workspace | Domain types, Zod, contracts | **HIGH** — consolidate imports to `./domain` |
| `@relique/ui` | workspace | shadcn wrappers only | **HIGH** — xóa duplicate `components/ui` trong apps |

### UI & Styling (Keep — No Major Upgrade)

| Technology | Version | Notes | Confidence |
|------------|---------|-------|------------|
| Tailwind CSS | `^3.4.17` | **Không** migrate Tailwind 4 trong milestone merge — risk cao, unrelated to goals | **HIGH** |
| shadcn/ui + Radix | existing | Wrapper pattern only (`components/app/**`, `@relique/ui`) | **HIGH** |
| `lucide-react` | `^0.468.0` | Icons | **HIGH** |
| `@tanstack/react-table` | `^8.21.3` | CRM tables | **HIGH** |
| `sonner` | `^2.0.7` | Toasts | **HIGH** |
| `next-themes` | `^0.4.6` | Theme (extend to admin layout if needed) | **HIGH** |
| `framer-motion` / `motion` | existing | Public animations only | **HIGH** |

### AI (Keep — Admin Only)

| Service | Auth | Route | Confidence |
|---------|------|-------|------------|
| OpenAI Images API | `OPENAI_API_KEY` | `/api/marketplace/agent-create` | **HIGH** — existing |
| Google Gemini | — | **Do not migrate** from `relique-marketplace/` prototype | **HIGH** |

### Infrastructure & Tooling

| Technology | Purpose | Why | Confidence |
|------------|---------|-----|------------|
| **Vercel** | Hosting | Đã configured; single project post-merge | **HIGH** |
| `@vercel/speed-insights` | Perf monitoring | Keep on unified app | **HIGH** |
| `sharp` | Image optimization | Next.js image pipeline | **HIGH** |
| ESLint 9 + `@repo/eslint-config` | Lint | Keep flat config | **HIGH** |
| Prettier 3.7 | Format | Keep | **HIGH** |
| **Supabase CLI** | Migrations, `gen types` | Add if missing | **MEDIUM** |

**Explicitly NOT adding v1 (per PROJECT constraints):**

| Excluded | Why |
|----------|-----|
| Vitest / Playwright / CI | User defer v2 |
| Redis / Upstash | No cache layer needed yet |
| Sentry / Datadog | Custom `error_logs` table sufficient v1 |
| tRPC | REST routes already established |
| Prisma / Drizzle | Supabase SQL migrations already invested |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not | Confidence |
|----------|-------------|-------------|---------|------------|
| **Payments** | Stripe Checkout (MoR) | PayPal Commerce | Không có integration; Stripe docs/marketplace patterns stronger | **HIGH** |
| **Payments** | Stripe Checkout v1 | Stripe Connect v1 | Connect adds KYC, seller onboarding, reconciliation — overkill khi ops team manual payout consignors | **MEDIUM** |
| **Payments** | Stripe | Lemon Squeezy / Polar | MoR for digital SaaS, không phù hợp physical memorabilia + consignment | **HIGH** |
| **Auth** | Supabase Auth | Clerk / Auth0 | Đã invested profiles/RBAC/middleware; second provider = split sessions | **HIGH** |
| **Data access** | Supabase JS + SQL | Prisma + Supabase | 31 migrations + RLS SQL; ORM adds impedance mismatch | **HIGH** |
| **Email** | Resend SDK | SendGrid / Postmark | Resend already integrated (fetch); SDK upgrade only | **HIGH** |
| **App merge** | Route groups in one app | Micro-frontends / separate deploy | PROJECT decision: single deploy | **HIGH** |
| **Public data reads** | Anon + RLS | Service role in web API | Security debt documented; service role bypasses RLS | **HIGH** |
| **CSS** | Tailwind 3.4 | Tailwind 4 | Unrelated churn during merge | **HIGH** |

---

## Merge Implementation Stack Checklist

### Phase A — App shell (before feature migration)

1. Bump `engines.node` → `>=20.18`
2. Merge `apps/admin/src/app/admin/**` → `apps/web/src/app/admin/**`
3. Merge `apps/admin/src/app/login/**` → `apps/web/src/app/login/**`
4. Merge `apps/admin/src/app/api/**` → `apps/web/src/app/api/**`
5. Port middleware + `lib/supabase/**` (dedupe with web's service-role-only client)
6. Merge env vars (Supabase, Resend, OpenAI) into single `.env.local` doc
7. Add admin deps (`recharts`, `@dnd-kit/*`, `cmdk`) to web `package.json`
8. Update `pnpm-workspace.yaml` — remove `apps/admin`
9. Single `vercel.json` build: `pnpm build --filter=web`

### Phase B — Supabase completion

1. Relocate migrations to canonical `supabase/migrations/`
2. Bump `@supabase/supabase-js@^2.108.1`, `@supabase/ssr@^0.12.0`
3. Add migrations: `verify_lookups`, `consigned_items` (extend), `contact_submissions`
4. Replace `*.local.ts` service impls with Supabase repos
5. Regenerate types; remove `@ts-expect-error` on mutations
6. RLS policies for public insert (consign, contact) + authenticated admin CRUD

### Phase C — Payments

1. `pnpm add stripe --filter=web`
2. Stripe Dashboard: Checkout, webhooks endpoint
3. Migrations: `orders`, `stripe_events`
4. Routes: `POST /api/checkout`, `POST /api/webhooks/stripe`
5. Listing detail "Buy" → Checkout Session → success page
6. Admin: order visibility in CRM/marketplace management

---

## Installation (Delta Only)

```bash
# Runtime requirement
# Use Node 20 LTS (nvm/fnm/volta)

# Unified app — Supabase bump
pnpm --filter=web add @supabase/supabase-js@^2.108.1 @supabase/ssr@^0.12.0

# Admin deps moved to web
pnpm --filter=web add @dnd-kit/core@^6.3.1 @dnd-kit/utilities@^3.2.2 cmdk@^1.0.0 recharts@^3.6.0

# Email SDK (replace fetch)
pnpm --filter=web add resend@^6.12.4

# Payments
pnpm --filter=web add stripe@^22.2.1

# Optional email templates
pnpm --filter=web add @react-email/components react-email

# Dev tooling
pnpm add -D supabase -w
```

---

## Environment Variables (Unified App)

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SITE_URL` | Public | SEO, Stripe redirect URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Client + RLS server client |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Webhooks, hardened admin ops only |
| `RESEND_API_KEY` | Secret | Email |
| `RESEND_FROM_EMAIL` | Secret | Sender |
| `OPENAI_API_KEY` | Secret | AI image gen |
| `STRIPE_SECRET_KEY` | Secret | Server Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Secret | Webhook signature |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Only if Embedded Checkout |

---

## What NOT to Use (Explicit)

| Do Not Use | Reason |
|------------|--------|
| `@supabase/auth-helpers-nextjs` | Deprecated → `@supabase/ssr` only |
| Service role on public marketplace GET | Security anti-pattern; use RLS + anon |
| localStorage for verify/consign/contact | PROJECT: production data must be Supabase |
| Separate `apps/admin` post-milestone | Violates architecture decision |
| `relique-marketplace/` Vite stack | Out of scope; archive after merge |
| Duplicate shadcn in `apps/web/components/ui` | Use `@relique/ui` + wrappers |
| PayPal as primary v1 | No codebase foundation; adds dual payment infra |
| Stripe Connect in v1 (default) | High complexity unless automated seller payout is v1 requirement |
| Tailwind 4 migration | Scope creep |
| Vitest/Playwright/CI v1 | Explicitly deferred |
| Clerk/Auth0/Firebase Auth | Conflicts with Supabase RBAC investment |
| Prisma/Drizzle | Conflicts with SQL-first Supabase migrations |
| Raw `fetch` to Resend after SDK add | Keep one pattern |

---

## Version Pinning Strategy

| Package | Strategy |
|---------|----------|
| `next`, `typescript`, `pnpm` | Exact pin in app/root (reproducible builds) |
| `@supabase/*`, `stripe`, `resend` | Caret on minor (`^`) — security patches |
| Radix/shadcn deps | Caret — patch updates safe via `@relique/ui` |
| Node | `engines: ">=20.18"` — enforce in Vercel project settings |

---

## Confidence Summary

| Area | Level | Notes |
|------|-------|-------|
| Core framework (keep Next 16/React 19) | **HIGH** | Already running in production paths |
| App merge via route groups | **HIGH** | Admin already `/admin/*`; Next.js documented pattern |
| Supabase bump + SSR middleware | **HIGH** | Official packages + existing middleware |
| Stripe Checkout v1 (not Connect) | **HIGH** for tech; **MEDIUM** for business payout model |
| Resend SDK migration | **HIGH** | Official SDK, trivial swap |
| Node 20 requirement | **HIGH** | supabase-js enforced |
| Tailwind 3 stay | **HIGH** | Risk management |
| Migration folder location | **MEDIUM** | root vs apps/web — team preference |

---

## Sources

- Existing codebase: `.planning/codebase/STACK.md`, `.planning/codebase/INTEGRATIONS.md`, `.planning/PROJECT.md`
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Supabase SSR middleware pattern](https://github.com/supabase/server/blob/main/docs/ssr-frameworks.md)
- [Supabase Auth — Next.js Server Side](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) — v0.12.0 (2026-06-09)
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) — v2.108.1
- [stripe npm](https://www.npmjs.com/package/stripe) — v22.2.1
- [Stripe Connect — marketplaces](https://docs.stripe.com/connect/saas-platforms-and-marketplaces)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout)
- [Resend — Send with Next.js](https://resend.com/docs/send-with-nextjs)
- [resend npm](https://www.npmjs.com/package/resend) — v6.12.4

---

*Stack research for unified Relique milestone — 2026-06-14*
