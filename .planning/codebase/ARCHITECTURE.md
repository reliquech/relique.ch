# Architecture

**Analysis Date:** 2026-06-14

## Pattern Overview

**Overall:** Turborepo monorepo with two Next.js 16 App Router applications (`web`, `admin`) sharing domain packages, backed by Supabase (PostgreSQL + Auth + Storage).

**Key Characteristics:**
- **Monorepo workspace:** `pnpm` workspaces + Turborepo orchestrate builds across `apps/*` and `packages/*` (`pnpm-workspace.yaml`, `turbo.json`)
- **Feature-sliced admin, route-centric web:** Admin uses vertical feature modules under `apps/admin/src/features/`; web uses App Router pages with co-located route components and a flat shared component library
- **Contract-based domain layer:** Shared Zod schemas, types, and service contracts live in `@relique/shared`; apps implement adapters (localStorage fixtures vs Supabase API routes)
- **BFF-style API routes:** Both apps expose Next.js Route Handlers under `src/app/api/` that talk to Supabase via service-role client; admin additionally enforces auth/roles per route
- **Hybrid data sources:** Marketplace reads from Supabase in production paths; verify/consign/content still use localStorage/fixture adapters on web; admin retains legacy localStorage services alongside Supabase-backed CRM

## Layers

**Presentation (Pages & Components):**
- Purpose: Render UI, orchestrate user flows, minimal business logic
- Location: `apps/web/src/app/`, `apps/web/src/components/`, `apps/admin/src/app/`, `apps/admin/src/features/*/pages/`, `apps/admin/src/features/*/components/`
- Contains: Next.js pages/layouts, client components, page-specific wrappers
- Depends on: Feature services, shared UI (`@relique/ui`), React contexts, hooks
- Used by: Browser requests via Next.js routing

**Feature Module (Admin only):**
- Purpose: Encapsulate a business domain (CRM, marketplace, submissions, etc.)
- Location: `apps/admin/src/features/{domain}/`
- Contains: `pages/`, `components/`, `services/`, `hooks/`, `types.ts`, `index.ts` barrel exports
- Depends on: Admin API client services, `@/lib/types`, shared schemas
- Used by: Thin route files in `apps/admin/src/app/admin/**/page.tsx` that re-export feature pages

**Application Services (Client-side):**
- Purpose: Abstract data access for UI; fetch from API routes or local adapters
- Location:
  - Web: `apps/web/src/lib/services/` (facades) + `apps/web/src/lib/services/api/` + `apps/web/src/lib/services/impl/`
  - Admin: `apps/admin/src/features/*/services/` (API fetch classes) + `apps/admin/src/lib/legacy/` (localStorage adapters)
- Contains: Service interfaces, HTTP clients calling `/api/*`, localStorage implementations
- Depends on: `@relique/shared/domain` contracts/schemas, app-specific types
- Used by: Pages, hooks, command palette actions

**API / Route Handlers (Server):**
- Purpose: Server-side endpoints; auth, validation, Supabase queries, audit logging
- Location: `apps/admin/src/app/api/` (~58 routes), `apps/web/src/app/api/` (marketplace, article-meta)
- Contains: `route.ts` handlers (GET/POST/PATCH/DELETE), Zod query/body parsing
- Depends on: `@/lib/supabase/server`, `requireUser`, `requireRole`, Zod schemas
- Used by: Client services via `fetch('/api/...')`

**Domain (Shared Package):**
- Purpose: Cross-app types, validation, service contracts, localStorage helpers, fixtures
- Location: `packages/shared/src/domain/`
- Contains:
  - `schemas/` — Zod validation (marketplace, verify, consign, content)
  - `types/` — TypeScript domain types
  - `contracts/` — Service interfaces + `Result<T,E>` discriminated union
  - `storage/` — localStorage key helpers and CRUD for client-side persistence
  - `fixtures/` — JSON seed data and presets
- Depends on: Zod only
- Used by: Both apps via `@relique/shared` and `@relique/shared/domain`

**UI Package:**
- Purpose: Shared design system — shadcn primitives, form fields, tables, layout modules
- Location: `packages/ui/src/`
- Contains: `shadcn/ui/`, `buttons/`, `form/`, `table/`, `modules/`, `states/`, `primitives/`
- Depends on: Radix UI, Tailwind utilities, react-hook-form
- Used by: Both apps; each app also maintains local `components/ui/` copies via shadcn CLI

**Infrastructure (Supabase):**
- Purpose: Database, auth, file storage, RLS policies
- Location: `apps/admin/supabase/migrations/` (31 SQL migrations), client setup in `apps/*/src/lib/supabase/`
- Contains: Tables (profiles, marketplace_items, consigned_items, CRM entities, audit_logs, etc.), storage buckets, RPC functions
- Depends on: Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Used by: Admin API routes (primary), web marketplace API routes, admin middleware auth

## Data Flow

**Public Marketplace Browse (Web):**

1. User visits `apps/web/src/app/marketplace/page.tsx` → renders `MarketplaceGrid`
2. Grid calls `marketplaceService.list()` from `apps/web/src/lib/services/marketplaceService.ts`
3. Facade delegates to `marketplaceAPIService` in `apps/web/src/lib/services/api/marketplaceService.ts`
4. HTTP GET → `apps/web/src/app/api/marketplace/route.ts`
5. Route handler uses `createServiceRoleClient()` → queries `marketplace_items` where `state_lifecycle=published` and `state_visibility=public`
6. Rows mapped via `mapRowToListing` → JSON response → UI renders cards

**Admin CRM Deal Management:**

1. Route `apps/admin/src/app/admin/deals/page.tsx` re-exports `DealsPage` from `apps/admin/src/features/crm/pages/DealsPage.tsx`
2. Page uses `dealsService` from `apps/admin/src/features/crm/services/dealsService.ts`
3. Service fetches `GET /api/deals` with query params
4. `apps/admin/src/app/api/deals/route.ts` calls `requireUser()` → `createServiceRoleClient()` → Supabase query on `deals` table
5. Mutations write to Supabase and optionally `audit_logs` (see `apps/admin/src/app/api/customers/[id]/route.ts` pattern)
6. UI updates via client-side state refresh after fetch

**Verify Flow (Web — Local Adapter):**

1. User submits code on `apps/web/src/app/verify/page.tsx`
2. Page calls `verifyService.run()` from `apps/web/src/lib/services/verifyService.ts`
3. Service resolves to local adapter `apps/web/src/lib/services/impl/verify.local.ts`
4. Adapter validates input with `VerifyRunInputSchema`, applies mapping rules from localStorage or defaults, returns `VerifyResult`
5. History persisted via `@relique/shared/domain` storage helpers (`getVerifyHistory`, `addVerifyHistoryEntry`)

**Admin Authentication:**

1. Request hits `apps/admin/src/middleware.ts` → delegates to `updateSession()` in `apps/admin/src/lib/supabase/middleware.ts`
2. Middleware refreshes Supabase session cookies via `@supabase/ssr` `createServerClient`
3. Unauthenticated requests to `/admin/*` redirect to `/login` with `redirect` query param
4. API routes independently call `requireUser()` and optionally `requireRole()` from `apps/admin/src/lib/supabase/requireRole.ts` (checks `profiles.role`)

**State Management:**
- **Server state:** Fetched on demand via client services + `fetch`; no React Query/SWR detected — components manage loading/error state locally
- **Client persistence:** React Context for currency (`apps/web/src/contexts/CurrencyContext.tsx`) and compare drawer; localStorage via `@relique/shared/domain/storage` for favorites, verify history, consign drafts
- **Admin profile:** `useProfile` hook in `apps/admin/src/features/users/hooks/useProfile.ts` reads Supabase auth + profiles table

## Key Abstractions

**Service Contracts (`Result<T, E>`):**
- Purpose: Typed success/error returns without exceptions in domain layer
- Examples: `packages/shared/src/domain/contracts/result.ts`, `packages/shared/src/domain/contracts/marketplace.contract.ts`, `packages/shared/src/domain/contracts/verify.contract.ts`
- Pattern: Discriminated union `{ ok: true, data } | { ok: false, error }` with helpers `ok()`, `err()`, `isOk()`, `unwrapOr()`

**App-level Service Facades:**
- Purpose: Stable import surface for pages regardless of backend (API vs local)
- Examples: `apps/web/src/lib/services/marketplaceService.ts`, `apps/web/src/lib/services/contracts.ts`
- Pattern: Interface (`IMarketplaceService`) implemented by API facade or local adapter; web marketplace uses Supabase API, verify/consign use local impl

**Feature Barrel Exports (Admin):**
- Purpose: Public API per domain module
- Examples: `apps/admin/src/features/marketplace/index.ts`, `apps/admin/src/features/crm/index.ts`
- Pattern: Re-export pages, components, services, types from single entry point

**Command Palette Actions:**
- Purpose: Searchable admin shortcuts wired to navigation and domain actions
- Examples: `apps/admin/src/lib/actions/actionRegistry.ts`, `verifyActions.ts`, `marketplaceActions.ts`
- Pattern: Register `Action[]` at runtime via `initializeActions()`; grouped by `navigation`, `create`, `utility`, domain-specific

**Supabase Client Factory:**
- Purpose: Separate anon (middleware/browser) vs service-role (API routes) clients
- Examples: `apps/admin/src/lib/supabase/server.ts`, `apps/admin/src/lib/supabase/client.ts`, `apps/web/src/lib/supabase/server.ts`
- Pattern: Service role bypasses RLS — used exclusively in Route Handlers; never exposed to browser

**Row-to-Domain Mapping:**
- Purpose: Transform Supabase snake_case rows to app domain types
- Examples: `apps/web/src/app/api/marketplace/utils.ts` (`mapRowToListing`), admin marketplace utils
- Pattern: Mapping functions colocated with API routes

## Entry Points

**Web App (Public Site):**
- Location: `apps/web/src/app/layout.tsx`
- Triggers: HTTP on port 1300 (`pnpm dev:web`)
- Responsibilities: Global shell (Header, Footer), font loading, metadata, providers (Currency, Compare), SpeedInsights

**Admin App (Internal Portal):**
- Location: `apps/admin/src/app/layout.tsx` + `apps/admin/src/app/admin/layout.tsx`
- Triggers: HTTP on port 3600 (`pnpm dev:admin`)
- Responsibilities: Root toaster + command palette; admin layout adds sidebar, notifications, auth-gated shell

**Monorepo Scripts:**
- Location: `package.json` (root)
- Triggers: `pnpm dev`, `pnpm build`, `pnpm check`
- Responsibilities: Turborepo task orchestration across all workspace packages

**Standalone Prototype:**
- Location: `relique-marketplace/index.tsx`
- Triggers: Vite dev server (not in pnpm workspace — separate `relique-marketplace/package.json`)
- Responsibilities: Isolated marketplace UI prototype; not integrated with main apps

## Error Handling

**Strategy:** Layer-specific — API routes return JSON `{ error: string }` with HTTP status codes; client services throw or return empty fallbacks; domain layer uses `Result<T,E>`.

**Patterns:**
- API routes wrap logic in try/catch, log with `console.error`, return 500 with message (`apps/web/src/app/api/marketplace/route.ts`)
- `requireUser()` / `requireRole()` return pre-built `NextResponse` objects for 401/403 (`apps/admin/src/lib/supabase/requireUser.ts`)
- Client services use `parseError()` helper to extract API error messages (`apps/admin/src/features/crm/services/dealsService.ts`)
- Web marketplace facade swallows errors and returns empty lists (`apps/web/src/lib/services/marketplaceService.ts`)
- Observability hooks: `apps/admin/src/lib/observability/clientErrorLog.ts`, `serverErrorLog.ts`, `POST /api/error-log`

## Cross-Cutting Concerns

**Logging:** `console.error` in API routes and services; admin persists client/server errors to `error_logs` table via observability helpers and `/api/error-log`.

**Validation:** Zod schemas at API boundaries (query params, request bodies) and in domain adapters (verify input). Shared schemas in `packages/shared/src/domain/schemas/`, app-specific re-exports in `apps/web/src/lib/schemas/` and `apps/admin/src/lib/schemas/`.

**Authentication:** Supabase Auth with cookie-based sessions (admin only). Middleware guards `/admin/*` pages. API routes use `requireUser()` + optional `requireRole({ allow: ['admin', 'editor'] })`. Web app has no auth middleware — public read-only marketplace API uses service role.

**Authorization:** Role stored in `profiles.role` (`admin` | `editor` | `viewer`). Sensitive mutations check roles via `requireRole()` in routes like `apps/admin/src/app/api/customers/route.ts`.

**Audit Trail:** Admin mutations log to `audit_logs` table (pattern in customer/deal API routes).

---

*Architecture analysis: 2026-06-14*
