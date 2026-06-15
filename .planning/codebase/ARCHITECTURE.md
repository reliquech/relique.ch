# Architecture

**Analysis Date:** 2026-06-14

## Pattern Overview

**Overall:** Unified Next.js App Router application with feature-sliced admin modules, BFF-style API routes, and a contract-based domain layer.

**Key Characteristics:**
- Single deployable Next.js app at repo root — public site (`(site)` route group) and admin CRM (`/admin`) share one codebase and one `src/` tree
- Admin UI follows vertical feature slices under `src/admin/{domain}/` with thin route re-exports in `src/app/admin/(portal)/**/page.tsx`
- Data access goes through Next.js Route Handlers (`src/app/api/**`) that talk to Supabase; client services call `/api/*` via `fetch`
- Domain schemas, contracts, and storage helpers live in `src/lib/domain/` (inlined from former `@relique/shared` workspace package)
- Hybrid persistence: Supabase is production source of truth for marketplace, CRM, submissions; localStorage remains for client-only state (favorites, verify history, currency, compare drawer)

## Layers

**Presentation (Routes & Pages):**
- Purpose: Render UI, orchestrate user flows, minimal business logic
- Location: `src/app/`, `src/components/`, `src/admin/*/pages/`, `src/admin/*/components/`
- Contains: Next.js layouts/pages, client components, page-specific wrappers, route-group shells
- Depends on: Feature services, `src/lib/ui/`, React contexts (`src/contexts/`), hooks
- Used by: Browser requests via Next.js routing

**Admin Feature Modules:**
- Purpose: Encapsulate a business domain (CRM, marketplace, submissions, tasks, etc.)
- Location: `src/admin/{crm,dashboard,marketplace,submissions,tasks,users,notifications,automations}/`
- Contains: `pages/`, `components/`, `services/`, `hooks/`, `types.ts`, `schemas.ts`, `index.ts` barrel exports
- Depends on: Admin API client services (`fetch('/api/...')`), `src/lib/types/admin.ts`, domain schemas
- Used by: Thin route files in `src/app/admin/(portal)/**/page.tsx` that re-export feature pages

**Public Web Services:**
- Purpose: Abstract data access for public-site UI; hide backend choice from components
- Location: `src/lib/services/` (facades), `src/lib/services/api/` (HTTP clients), `src/lib/services/impl/` (adapters)
- Contains: `IMarketplaceService`, `IVerifyService`, etc. in `src/lib/services/contracts.ts`; Supabase/local adapters in `impl/`
- Depends on: `src/lib/domain/` contracts/schemas, `src/lib/schemas/` (deprecated re-exports)
- Used by: Public pages, forms, command palette actions

**API / BFF Layer:**
- Purpose: Server-side endpoints; auth, validation, Supabase queries, audit logging, email
- Location: `src/app/api/` (~61 route files)
- Contains: `route.ts` handlers (GET/POST/PATCH/DELETE), inline Zod schemas, row-to-domain mappers
- Depends on: `src/lib/supabase/server.ts`, `requireUser`, `requireRole`, Zod
- Used by: Client services in `src/admin/*/services/` and `src/lib/services/api/`

**Domain Layer:**
- Purpose: Cross-cutting types, validation, service contracts, localStorage helpers, fixtures
- Location: `src/lib/domain/`
- Contains: `schemas/`, `types/`, `contracts/`, `storage/`, `fixtures/`; barrel at `src/lib/domain/index.ts`
- Depends on: Zod only (no React)
- Used by: Services, API routes, forms via `@/lib/domain` import

**Design System / UI Primitives:**
- Purpose: Shared shadcn-based components, form fields, tables, layout modules
- Location: `src/lib/ui/` (buttons, form, table, modules, states, primitives, shadcn/ui)
- Contains: Reusable UI building blocks formerly in `@relique/ui`
- Depends on: Radix UI, Tailwind, react-hook-form
- Used by: Both public and admin; app-level shadcn copies in `src/components/ui/` (do not edit directly — wrap in `src/components/app/` or `src/components/shared/`)

**Infrastructure:**
- Purpose: Database, auth, file storage, RLS policies
- Location: `supabase/migrations/*.sql` (35 migrations), clients in `src/lib/supabase/`
- Contains: Tables (profiles, marketplace_items, consigned_items, CRM entities, audit_logs, etc.), storage buckets, RPC functions
- Depends on: Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Used by: API routes (primary), middleware session refresh

## Data Flow

**Public Marketplace Browse:**

1. `src/app/(site)/marketplace/page.tsx` calls `marketplaceService.list()` from `src/lib/services/marketplaceService.ts`
2. Facade delegates to `src/lib/services/api/marketplaceService.ts` → `fetch('/api/marketplace')`
3. `src/app/api/marketplace/route.ts` uses `createAnonClient()` or `createServiceRoleClient()` depending on auth context
4. Supabase query on `marketplace_items`; `mapRowToListing()` in `src/app/api/marketplace/utils.ts` transforms snake_case rows
5. JSON response returned; page renders `src/components/` marketplace cards

**Admin CRM Lead Management:**

1. `src/app/admin/(portal)/leads/page.tsx` re-exports `src/admin/crm/pages/LeadsPage.tsx`
2. Page calls `leadsService.list()` from `src/admin/crm/services/leadsService.ts`
3. Service `fetch`es `/api/leads` with query params
4. `src/app/api/leads/route.ts` calls `requireUser()` → `requireRole()` → `createServiceRoleClient()`
5. Supabase CRUD on `leads` table; paginated JSON returned
6. Page manages local loading/error state (no React Query/SWR)

**Product Verification (Public):**

1. Verify form/page calls `verifyService` from `src/lib/services/impl/verify.supabase.ts`
2. Adapter `fetch`es `/api/public/verify?code=...`
3. `src/app/api/public/verify/route.ts` queries Supabase (anon/service role)
4. Returns `Result<VerifyResult>` shape; UI checks `result.ok`

**Consign Submission (Public):**

1. `src/components/forms/ConsignForm.tsx` submits multipart form to `/api/public/consign`
2. `src/app/api/public/consign/route.ts` validates with Zod, uploads photos to Supabase Storage, inserts `consigned_items`
3. Sends transactional email via `src/lib/email/sendTransactional.ts`

**State Management:**
- Server state: fetched on demand via client services + `fetch`; components hold loading/error locally
- React Context: `src/contexts/CurrencyContext.tsx` (currency + formatPrice), `src/components/interactive/CompareDrawer.tsx` (compare list)
- Client persistence: `src/lib/domain/storage/` helpers for favorites, verify history, consign drafts (localStorage with schema validation)
- Admin profile: `src/admin/users/hooks/useProfile.ts` reads Supabase auth + `profiles` table

## Key Abstractions

**Result<T, E>:**
- Purpose: Typed success/error returns without exceptions in domain layer
- Examples: `src/lib/domain/contracts/result.ts`, `src/lib/domain/contracts/verify.contract.ts`, `src/lib/services/impl/verify.supabase.ts`
- Pattern: Discriminated union `{ ok: true, data } | { ok: false, error }` with helpers `ok()`, `err()`, `isOk()`, `unwrapOr()`

**Service Contracts:**
- Purpose: Stable interface for pages regardless of backend (API vs local vs Supabase adapter)
- Examples: `src/lib/domain/contracts/marketplace.contract.ts`, `src/lib/services/contracts.ts` (legacy web facades)
- Pattern: Interface (`IMarketplaceService`, `IVerifyService`) implemented by API facade, local adapter, or Supabase adapter

**Admin Feature Barrel:**
- Purpose: Public API per domain module
- Examples: `src/admin/crm/index.ts`, `src/admin/marketplace/index.ts`, `src/admin/dashboard/index.ts`
- Pattern: Re-export pages, components, services, types from single `index.ts`

**Command Palette Action Registry:**
- Purpose: Searchable shortcuts wired to navigation and domain actions
- Examples: `src/lib/actions/actionRegistry.ts`, `verifyActions.ts`, `marketplaceActions.ts`, `navigationActions.ts`
- Pattern: `initializeActions()` registers `Action[]` at runtime; consumed by `src/components/command/CommandPalette.tsx`

**Supabase Client Split:**
- Purpose: Separate anon (middleware/browser/RLS) vs service-role (API routes) clients
- Examples: `src/lib/supabase/server.ts` (`createClient`, `createServiceRoleClient`, `createAnonClient`), `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`
- Pattern: Service role bypasses RLS — used exclusively in Route Handlers; never exposed to browser

**Row Mappers:**
- Purpose: Transform Supabase snake_case rows to app domain types
- Examples: `src/app/api/marketplace/utils.ts` (`mapRowToListing`), `src/app/api/marketplace/marketplaceUtils.ts`
- Pattern: Mapping functions colocated with API routes

## Entry Points

**Root Application Shell:**
- Location: `src/app/layout.tsx`
- Triggers: All HTTP requests
- Responsibilities: Global fonts, metadata, `CommandPalette`, `Toaster` (sonner); dark theme forced on `<html>`

**Public Site Shell:**
- Location: `src/app/(site)/layout.tsx`
- Triggers: Routes under `(site)` — marketplace, verify, consign, contact, about
- Responsibilities: `Header`, `Footer`, `CurrencyProvider`, `CompareProvider`, `SpeedInsights`

**Admin Portal Shell:**
- Location: `src/app/admin/(portal)/layout.tsx` → `src/components/admin/AdminPortalLayout.tsx`
- Triggers: `/admin/*` except `/admin/login`
- Responsibilities: Sidebar navigation, notifications, alert scheduler, profile display, auth-gated chrome

**Middleware (Auth Guard):**
- Location: `src/middleware.ts` → `src/lib/supabase/middleware.ts`
- Triggers: All non-static paths (excludes `_next/static`, images, favicon)
- Responsibilities: Refresh Supabase cookie session; redirect unauthenticated users from `/admin/*` to `/admin/login`

**API Surface:**
- Location: `src/app/api/**/route.ts`
- Triggers: Client `fetch` from browser or server
- Responsibilities: ~61 endpoints spanning CRM, marketplace, submissions, dashboard, notifications, public forms

**Homepage:**
- Location: `src/app/(site)/page.tsx` (re-exports `src/app/(home)/HomeContent`)
- Triggers: `GET /`
- Responsibilities: Marketing landing page sections

## Error Handling

**Strategy:** Try/catch in API routes with `console.error` + JSON 500; client services parse API errors or swallow and return empty defaults on public paths.

**Patterns:**
- API routes: wrap logic in try/catch, log with `console.error("Context:", error)`, return `NextResponse.json({ error }, { status })` — e.g. `src/app/api/marketplace/route.ts`, `src/app/api/leads/route.ts`
- `requireUser()` / `requireRole()` return pre-built `NextResponse` objects for 401/403 — `src/lib/supabase/requireUser.ts`, `src/lib/supabase/requireRole.ts`
- Admin client services use `parseError()` helper — `src/admin/crm/services/leadsService.ts`
- Public marketplace facade swallows errors and returns empty lists — `src/lib/services/marketplaceService.ts`
- Domain adapters return `Result` — `src/lib/services/impl/verify.supabase.ts`
- Observability: `src/lib/observability/clientErrorLog.ts`, `serverErrorLog.ts`, `POST /api/error-log`

## Cross-Cutting Concerns

**Logging:** `console.error` in API routes and service failures; client errors posted to `/api/error-log`; no external APM beyond `@vercel/speed-insights`

**Validation:** Inline Zod schemas at top of route files; form schemas in `src/lib/validations/`; domain schemas in `src/lib/domain/schemas/`

**Authentication:** Supabase cookie sessions via `@supabase/ssr`; middleware guards admin pages; `requireUser`/`requireRole` on protected API routes; roles (`admin` | `editor` | `viewer`) from `profiles.role`

**Authorization:** `requireRole({ userId, allow: ["admin", "editor"] })` on mutating admin endpoints; RLS policies in `supabase/migrations/005_create_rls_policies.sql` and subsequent migrations

**Email:** Transactional sends via `src/lib/email/sendTransactional.ts`; operator notifications on public consign/contact submissions

**File Upload:** Marketplace and consign flows use Supabase Storage with signed upload URLs — `src/app/api/marketplace/upload/`, `src/app/api/attachments/upload-url/route.ts`

---

*Architecture analysis: 2026-06-14*
