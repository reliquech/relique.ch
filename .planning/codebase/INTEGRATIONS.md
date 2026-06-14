# External Integrations

**Analysis Date:** 2026-06-14

## APIs & External Services

**Database & Backend (Supabase):**
- Supabase — Primary backend for admin CRM and web marketplace data
  - SDK/Client: `@supabase/supabase-js`, `@supabase/ssr`
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client/session), `SUPABASE_SERVICE_ROLE_KEY` (server-only, bypasses RLS)
  - Implementation: `apps/admin/src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`; `apps/web/src/lib/supabase/server.ts`
  - Types: `apps/admin/src/lib/supabase/types.ts`, `apps/web/src/lib/supabase/types.ts`
  - Migrations: `apps/admin/supabase/migrations/` (31 SQL files, profiles through error_logs)

**Email (Resend):**
- Resend — Transactional email from admin CRM
  - SDK/Client: Direct REST via `fetch("https://api.resend.com/emails")` (no npm SDK)
  - Auth: `RESEND_API_KEY`
  - From address: `RESEND_FROM_EMAIL` (default `support@relique.co`)
  - Routes: `apps/admin/src/app/api/email/send/route.ts`, `apps/admin/src/app/api/alert-rules/run/route.ts`
  - Logging: Inserts to `email_logs` table on send

**AI — OpenAI (Admin):**
- OpenAI Images API — AI-generated marketplace product images
  - Endpoint: `https://api.openai.com/v1/images`
  - Auth: `OPENAI_API_KEY`
  - Route: `apps/admin/src/app/api/marketplace/agent-create/route.ts`

**AI — Google Gemini (Standalone prototype):**
- Google Gemini — Used only in `relique-marketplace/` (Vite app, outside pnpm workspace)
  - Auth: `GEMINI_API_KEY` (injected via `relique-marketplace/vite.config.ts` `define`)
  - Not integrated into main monorepo apps

**Fonts (Google):**
- Google Fonts via `next/font/google` — Work Sans loaded in `apps/web/src/app/layout.tsx`, `apps/admin/src/app/layout.tsx`
- Local font: Zapf Renaissance in `apps/web/src/fonts/` for brand wordmark

**Performance (Vercel):**
- Vercel Speed Insights — Client-side performance metrics
  - Package: `@vercel/speed-insights`
  - Usage: `apps/web/src/app/layout.tsx`

**External URL Fetching (Web):**
- Article/link metadata scraping — Fetches third-party article URLs for OG preview data
  - Route: `apps/web/src/app/api/article-meta/route.ts`
  - Uses bot User-Agent headers (Googlebot, Twitterbot, Facebook, Slackbot) to fetch external HTML
  - No API key required; outbound HTTP only

**Placeholder / Remote Images:**
- picsum.photos, images.unsplash.com — Allowed in Next.js `images.remotePatterns` (`apps/web/next.config.js`, `apps/admin/next.config.js`)
- Supabase Storage public URLs — Dynamic hostname from `NEXT_PUBLIC_SUPABASE_URL` in web config

## Data Storage

**Databases:**
- PostgreSQL via Supabase (hosted)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + keys above
  - Client: `@supabase/supabase-js` with typed `Database` interface
  - Key tables (from migrations): `profiles`, `marketplace_items`, `leads`, `customers`, `deals`, `pipeline_stages`, `messages`, `attachments`, `audit_logs`, `email_logs`, `notifications`, `alert_rules`, `tasks`, `error_logs`, `crm_*` views/filters/fields
  - RLS policies defined in `apps/admin/supabase/migrations/005_create_rls_policies.sql`, `009_fix_rls_performance.sql`

**File Storage:**
- Supabase Storage (cloud)
  - Buckets: `marketplace-images` (public, 5MB, images only — `008_storage_marketplace.sql`), `crm-attachments` (`011_storage_crm.sql`)
  - Upload routes: `apps/admin/src/app/api/marketplace/upload/route.ts`, `upload-url/route.ts`, `finalize/route.ts`, `cleanup/route.ts`
  - Attachment upload: `apps/admin/src/app/api/attachments/upload-url/route.ts`
  - Guide: `apps/admin/supabase/STORAGE_GUIDE.md`
- Browser localStorage — Client-side persistence for web app features not yet on Supabase
  - Helpers: `packages/shared/src/domain/storage/` (marketplace favorites, verify history, consign drafts)
  - Usage: `apps/web/src/lib/services/impl/*.local.ts`, favorites/compare/watchlist in web components

**Caching:**
- None — No Redis, Upstash, or in-memory cache layer detected
- Next.js built-in caching for static/ISR pages where applicable

## Authentication & Identity

**Auth Provider:**
- Supabase Auth — Email/password authentication for admin app
  - Login: `apps/admin/src/app/login/page.tsx` uses `supabase.auth.signInWithPassword`
  - Registration: `apps/admin/src/app/api/auth/register/route.ts` uses `supabase.auth.admin.createUser` (service role)
  - Session middleware: `apps/admin/src/middleware.ts` → `apps/admin/src/lib/supabase/middleware.ts` refreshes cookies on each request
  - Auth guards: `apps/admin/src/lib/supabase/requireUser.ts`, `requireRole.ts`

**Role-Based Access Control:**
- Custom RBAC via `profiles.role` column — Values: `admin`, `editor`, `viewer`
  - Migration: `apps/admin/supabase/migrations/015_add_profiles_role.sql`
  - Enforcement: `requireRole()` in API routes; viewer read-only, editor CRUD, admin full access including users/pipeline

**Web App Auth:**
- Mock/localStorage auth still present for legacy portal flows — `apps/web/src/lib/auth.ts`, `apps/web/src/lib/storage.ts`
- Web marketplace reads Supabase via service role in API routes only; no end-user Supabase auth on web

## Monitoring & Observability

**Error Tracking:**
- Custom error logging to Supabase `error_logs` table — No Sentry, Datadog, or similar
  - Client POST: `apps/admin/src/app/api/error-log/route.ts`
  - Migration: `apps/admin/supabase/migrations/029_create_error_logs.sql`

**Logs:**
- `console.error` / `console.log` in API route catch blocks
- Audit trail: All admin mutations logged to `audit_logs` table via API routes
- Email delivery logged to `email_logs` table

**Performance:**
- Vercel Speed Insights on web app only

## CI/CD & Deployment

**Hosting:**
- Vercel — Both apps deployed as separate Vercel projects
  - Web: `apps/web/vercel.json` — `pnpm build --filter=web`
  - Admin: `apps/admin/vercel.json` — `pnpm build --filter=admin`
  - Install: `pnpm install` from monorepo root

**CI Pipeline:**
- Not detected — No `.github/workflows/`, GitLab CI, or other CI config in repo
- Local quality gate: `pnpm check` runs lint + typecheck + build (root `package.json`)

## Environment Configuration

**Required env vars (admin — `apps/admin/`):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public, client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (secret, server-only)
- `RESEND_API_KEY` — Resend email API key (secret)
- `RESEND_FROM_EMAIL` — Sender address (optional, defaults to `support@relique.co`)
- `OPENAI_API_KEY` — OpenAI image generation (secret, required for agent-create feature)

**Required env vars (web — `apps/web/`):**
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL (SEO, sitemap, OG; defaults to `https://relique.ch`)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (for marketplace API + image hostnames)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role for `/api/marketplace` routes (secret)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Google Search Console verification (optional)

**Standalone prototype (`relique-marketplace/`):**
- `GEMINI_API_KEY` — Google Gemini API key

**Secrets location:**
- Local: `.env.local` per app (gitignored, not committed)
- Production: Vercel Environment Variables (per deploy checklist in `apps/admin/README.md`)

## Webhooks & Callbacks

**Incoming:**
- None — No Stripe webhooks, Supabase webhooks, or third-party callback endpoints detected
- Alert rules executed via manual/authenticated POST to `/api/alert-rules/run` (not scheduled cron)

**Outgoing:**
- Resend email API — `POST https://api.resend.com/emails`
- OpenAI Images API — `POST https://api.openai.com/v1/images`
- External article URLs — Fetched by `apps/web/src/app/api/article-meta/route.ts` for link preview metadata
- Supabase REST/Storage — All database and file operations via Supabase client SDK

## Integration Architecture Notes

**Hybrid data model (web app):**
- Marketplace listings: Supabase PostgreSQL via Next.js API routes (`apps/web/src/app/api/marketplace/`, `apps/web/src/lib/services/api/marketplaceService.ts`)
- Verify, consign, content, favorites: localStorage + JSON fixtures via `@relique/shared/domain` (`apps/web/src/lib/services/impl/`)

**Admin as backend-for-frontend:**
- Admin app exposes ~60 REST API routes under `apps/admin/src/app/api/` for CRM, marketplace management, email, alerts, and file uploads
- Web app consumes its own Supabase-backed marketplace API; admin CRM APIs are consumed by admin frontend only

**Monorepo packages not in workspace:**
- `relique-marketplace/` — Standalone Vite + Gemini prototype; uses npm, not pnpm workspace; not included in root `pnpm build`

---

*Integration audit: 2026-06-14*
