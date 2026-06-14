# External Integrations

**Analysis Date:** 2026-06-14

## APIs & External Services

**Database, Auth & Storage:**
- Supabase — Single source of truth for profiles, marketplace, CRM, consignments, audit logs, notifications, error logs
  - SDK/Client: `@supabase/supabase-js`, `@supabase/ssr`
  - Auth env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Service role env: `SUPABASE_SERVICE_ROLE_KEY` (API routes only — bypasses RLS)
  - Clients: `src/lib/supabase/server.ts` (`createClient`, `createServiceRoleClient`, `createAnonClient`), `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`
  - Migrations: `supabase/migrations/` (35 SQL files)

  - Migrations: `supabase/migrations/` — dual-path: `000_baseline.sql` (fresh) or `legacy/001-035` + `036` (brownfield)
  - Docs: `SUPABASE_USAGE.md`, `RLS_AUDIT.md`, `INDEX_AUDIT.md`, `MIGRATIONS.md`

**Transactional Email:**
- Removed from v1 (2026-06-14) — Resend routes deleted; `email_logs` table pruned via migration 036
- OpenAI Images API — Admin marketplace agent-create flow generates listing images
  - Endpoint: `https://api.openai.com/v1/images` (called from `src/app/api/marketplace/agent-create/route.ts`)
  - Auth: `OPENAI_API_KEY` (optional; route returns 500 if missing)
  - Output uploaded to Supabase Storage bucket `marketplace-images`

**Performance Monitoring:**
- Vercel Speed Insights — Client-side performance telemetry on public site
  - SDK: `@vercel/speed-insights/next`
  - Location: `src/app/(site)/layout.tsx`

**External URL Fetching (no SDK):**
- Article metadata scraper — Fetches third-party article URLs and parses OG/Twitter meta tags
  - Route: `GET /api/article-meta?url=...` (`src/app/api/article-meta/route.ts`)
  - Uses bot User-Agent headers; caches 24h via Next.js `revalidate`

**Open Graph Images:**
- Next.js `ImageResponse` (`next/og`) — Dynamic OG images at route level
  - Example: `src/app/opengraph-image.tsx` (edge runtime)
  - Utility (placeholder URLs): `src/lib/og/generator.ts`

## Data Storage

**Databases:**
- PostgreSQL (Supabase hosted)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + keys above
  - Client: `@supabase/supabase-js` with typed `Database` from `src/lib/supabase/types.ts`
  - Key tables: `profiles`, `marketplace_items`, `consigned_items`, `leads`, `deals`, `customers`, `messages`, `tasks`, `audit_logs`, `error_logs`, `notifications`, `alert_rules`
  - RLS policies: `supabase/migrations/005_create_rls_policies.sql`, `009_fix_rls_performance.sql`
  - RPC/reporting functions: migrations `014`, `020`, `025`

**File Storage:**
- Supabase Storage (three buckets via migrations)
  - `marketplace-images` — Public; listing photos (`008_storage_marketplace.sql`); used by `src/app/api/marketplace/upload/route.ts`, `agent-create/route.ts`
  - `crm-attachments` — Private; CRM documents/images (`011_storage_crm.sql`); used by `src/admin/crm/services/storageService.ts`, `src/app/api/attachments/`
  - `consign-submissions` — Private; public consign photo uploads via service role only (`033_storage_consign_submissions.sql`); used by `src/app/api/public/consign/route.ts`
  - Guide: `supabase/STORAGE_GUIDE.md`

**Caching:**
- None (no Redis or external cache)
- Next.js fetch cache on article-meta (`revalidate: 86400`)
- HTTP cache headers on article-meta responses (`Cache-Control: public, s-maxage=86400`)

**Client Persistence (non-production data):**
- Browser localStorage — Currency preference (`src/contexts/CurrencyContext.tsx`), domain storage helpers (`src/lib/domain/storage/`), legacy helpers (`src/lib/storage.ts`), automation last-run timestamp (`src/admin/automations/components/AlertScheduler.tsx`)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth — Cookie-based sessions via `@supabase/ssr`
  - Middleware session refresh: `src/middleware.ts` → `src/lib/supabase/middleware.ts`
  - Admin route guard: unauthenticated users redirected from `/admin/*` to `/admin/login` (except login page)
  - API auth helpers: `src/lib/supabase/requireUser.ts`, `src/lib/supabase/requireRole.ts` (roles: `admin`, `editor`, `viewer` from `profiles.role`)
  - Public self-registration disabled: `POST /api/auth/register` returns 403 (`src/app/api/auth/register/route.ts`)
  - User provisioning: admin-only via `POST /api/users` (invite/create flow)

## Monitoring & Observability

**Error Tracking:**
- Custom error logging to Supabase `error_logs` table — no Sentry/Datadog SDK
  - Client: `src/lib/observability/clientErrorLog.ts` → `POST /api/error-log`
  - Server helper: `src/lib/observability/serverErrorLog.ts`
  - Route: `src/app/api/error-log/route.ts` (requires authenticated user)

**Logs:**
- `console.error` in API route catch blocks (standard pattern across `src/app/api/**/route.ts`)
- No structured log levels, correlation IDs, or external log aggregation

**Performance:**
- `@vercel/speed-insights` on public site layout only

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Speed Insights, Next.js 16, default `relique.ch` URL; no committed `vercel.json`)

**CI Pipeline:**
- Not detected — No `.github/workflows/` or other CI config in repo

## Environment Configuration

**Required env vars (production):**
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (browser + RLS-enforced routes)
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only; API routes and storage uploads
- `RESEND_API_KEY` — Email delivery
- `RESEND_FROM_EMAIL` — Sender address (has default)

**Optional env vars:**
- `OPENAI_API_KEY` — AI image generation for marketplace agent-create
- `OPERATOR_EMAIL` / `RESEND_OPERATOR_TO` — Operator notification recipient for contact/consign flows
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Google Search Console meta tag

**Secrets location:**
- Local: `.env.local` (gitignored)
- Template: `.env.example` (committed — variable names only; fill real values locally)
- Production: Vercel/hosting environment variables (not in repo)

## Webhooks & Callbacks

**Incoming:**
- None detected — No Stripe, Resend inbound, or Supabase webhook handlers in `src/app/api/`

**Outgoing:**
- `https://api.resend.com/emails` — Transactional email send
- `https://api.openai.com/v1/images` — AI image generation
- Arbitrary article URLs — Metadata fetch in `/api/article-meta`
- Supabase REST/Storage — All database and file operations via Supabase client SDK

**Scheduled / Background Jobs:**
- Alert rules — Client-side scheduler polls every 5 minutes when admin portal is open (`src/admin/automations/components/AlertScheduler.tsx` → `POST /api/alert-rules/run`)
- No server cron, Vercel Cron, or queue workers detected

## Public API Surface (BFF)

**Unauthenticated public endpoints:**
- `GET /api/public/verify?code=` — Product verification lookup (`src/app/api/public/verify/route.ts`)
- `POST /api/public/consign` — Consign submission with photo upload (`src/app/api/public/consign/route.ts`, `maxDuration: 60`)
- `POST /api/public/contact` — Contact form → lead + email (`src/app/api/public/contact/route.ts`)
- `GET /api/marketplace` — Public marketplace browse (Supabase via anon/service clients)
- `GET /api/article-meta?url=` — External URL metadata
- `GET /api/health` — Supabase connectivity check

**Authenticated admin endpoints (~50 routes):**
- CRM: leads, deals, customers, messages, tasks, pipeline stages, custom fields, attachments
- Marketplace: CRUD, upload, agent-create, status
- Dashboard, audit logs, notifications, alert rules, users, email send
- All under `src/app/api/` with `requireUser` / `requireRole` guards

## Payment & Commerce

**Not integrated:**
- No Stripe, PayPal, or payment processor SDKs
- Marketplace is listing/browse focused; no checkout webhook or payment env vars

---

*Integration audit: 2026-06-14*
