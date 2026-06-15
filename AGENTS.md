<!-- GSD:project-start source:PROJECT.md -->
## Project

**Relique.co — Unified Platform**

Relique là nền tảng xác thực và marketplace cho đồ kỷ vật thể thao (memorabilia). Người sưu tập dùng public site để browse marketplace, verify sản phẩm, và consign; đội vận hành dùng admin CRM để quản lý leads, deals, marketplace listings, và submissions. Milestone này gộp hai app Next.js thành một, hoàn thiện data layer Supabase, và đưa toàn bộ flows lên production-ready — không còn mock.

**Core Value:** Người dùng có thể **tin tưởng và giao dịch** trên Relique: verify sản phẩm thật, consign/submit thật, liên hệ được, và thanh toán marketplace hoạt động — tất cả trên một codebase, một deploy.

### Constraints

- **Architecture**: Single Next.js app (`apps/web`) với `/admin` route group — không giữ `apps/admin` riêng
- **Data**: Supabase là single source of truth — không localStorage persistence cho production data
- **Packages**: Giữ `@relique/shared` và `@relique/ui` workspace packages
- **UI**: Không sửa trực tiếp `components/ui/**` — wrapper pattern theo shadcn-guard rule
- **Quality gate**: Lint + typecheck + build only cho v1 — không Vitest/Playwright/CI
- **Auth**: Supabase cookie sessions, middleware guard `/admin/*`, `requireUser`/`requireRole` trên API routes
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.2 — All application code in `apps/web/`, `apps/admin/`, `packages/shared/`, `packages/ui/`
- TSX/JSX — React components across Next.js apps and `@relique/ui`
- SQL — Supabase/PostgreSQL migrations in `apps/admin/supabase/migrations/*.sql`
- JavaScript — Config files: `apps/web/next.config.js`, `apps/admin/next.config.js`, `packages/eslint-config/*.js`
- JSON — Fixtures and schemas in `packages/shared/src/domain/fixtures/`
## Runtime
- Node.js >=18 (declared in root `package.json` `engines`)
- Browser (client components, localStorage persistence in web app)
- pnpm 10.28.1 (declared via `packageManager` in root `package.json`)
- Lockfile: `pnpm-lock.yaml` present
## Frameworks
- Next.js 16.1.0 — `apps/web/` (public site, port 1300) and `apps/admin/` (CRM dashboard, port 3600), App Router
- React 19.2.x — UI rendering in both Next.js apps and `@relique/ui`
- Turborepo 2.7.5 — Monorepo task orchestration via `turbo.json`
- Vite 6.2.0 + `@vitejs/plugin-react` — `relique-marketplace/` prototype app (port 3000, not listed in `pnpm-workspace.yaml`)
- Not detected — No Jest, Vitest, Playwright, or Cypress config or test files in repo
- Turbo — `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm typecheck` from root `package.json`
- TypeScript project references — Root `tsconfig.json` references `packages/shared`, `packages/ui`, `apps/web`, `apps/admin`
- ESLint 9 (flat config) — Per-app configs: `apps/web/eslint.config.js`, `apps/admin/eslint.config.js`, shared presets in `packages/eslint-config/`
- Prettier 3.7.4 — Root `format` script; no committed `.prettierrc` file detected
- PostCSS + Autoprefixer — `apps/web/postcss.config.js`, `apps/admin/postcss.config.js`
- Tailwind CSS 3.4.17 — `apps/web/tailwind.config.ts`, `apps/admin/tailwind.config.ts`
- tailwindcss-animate 1.0.7 — Animation utilities for shadcn/ui
## Key Dependencies
- `@supabase/supabase-js` ^2.90.1 — Database, auth, storage client (`apps/admin/src/lib/supabase/`, `apps/web/src/lib/supabase/`)
- `@supabase/ssr` ^0.8.0 — Cookie-based Supabase sessions in admin (`apps/admin/src/lib/supabase/server.ts`, `middleware.ts`)
- `zod` ^4.3.2 — Validation in API routes, forms, and `@relique/shared` schemas
- `react-hook-form` ^7.69.0 + `@hookform/resolvers` ^5.2.2 — Form state management
- `@relique/shared` (workspace) — Domain types, Zod schemas, contracts, localStorage helpers (`packages/shared/`)
- `@relique/ui` (workspace) — Shared shadcn-based component library (`packages/ui/`)
- shadcn/ui pattern — Radix UI primitives (`@radix-ui/react-*`) + Tailwind; config in `apps/web/components.json`, `apps/admin/components.json`
- `class-variance-authority`, `clsx`, `tailwind-merge` — Component variant and class merging
- `lucide-react` ^0.468.0 — Icons
- `framer-motion` ^12.25.0 / `motion` ^12.27.1 — Animations (web app and `@relique/ui`)
- `next-themes` ^0.4.6 — Theme switching (web)
- `sonner` ^2.0.7 — Toast notifications (both apps)
- `@tanstack/react-table` ^8.21.3 — Data tables (admin CRM, `@relique/ui` table modules)
- `recharts` ^3.6.0 — Dashboard charts (admin only)
- `@dnd-kit/core` ^6.3.1 — Drag-and-drop (admin marketplace carousel)
- `cmdk` ^1.0.0 — Command palette (admin)
- `@vercel/speed-insights` ^1.3.1 — Performance monitoring in `apps/web/src/app/layout.tsx`
- `sharp` ^0.34.5 — Next.js image optimization (web devDependency)
- `@resvg/resvg-js` ^2.6.2 — SVG rasterization for OG image generation (web devDependency, referenced in `apps/web/src/lib/og/`)
## Configuration
- Per-app `.env.local` files (not committed; no `.env.example` files found in repo)
- Turbo build reads `.env*` files (`turbo.json` `build.inputs`)
- Web app env vars documented in `apps/web/README.md`: `NEXT_PUBLIC_SITE_URL`, Supabase keys
- Admin env vars documented in `apps/admin/README.md`: Supabase keys, Resend, OpenAI
- Root: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`
- Next.js: `apps/web/next.config.js`, `apps/admin/next.config.js` — both transpile `@relique/shared` and `@relique/ui`, enable `experimental.externalDir`
- TypeScript presets: `packages/typescript-config/base.json`, `nextjs.json`, `react-library.json`
- ESLint presets: `packages/eslint-config/base.js`, `next.js`, `react-internal.js`, `boundaries.js`
- Vercel deploy: `apps/web/vercel.json`, `apps/admin/vercel.json` — monorepo build commands with `--filter`
- `@/*` → `./src/*` in both apps (`apps/web/tsconfig.json`, `apps/admin/tsconfig.json`)
- `@relique/shared` exports: `.`, `./domain`, `./config` (`packages/shared/package.json`)
- `@relique/ui` granular exports: `./ui/*`, `./buttons/*`, `./form/*`, etc. (`packages/ui/package.json`)
## Platform Requirements
- Node.js 18+
- pnpm 10.x (recommended; enforced via `packageManager` field)
- Supabase project credentials for admin and web marketplace features
- Resend API key for admin email features
- OpenAI API key for admin AI image generation (`apps/admin/src/app/api/marketplace/agent-create/route.ts`)
- Deployment target: Vercel (Next.js framework, per-app `vercel.json`)
- Web: `https://relique.ch` (default in `apps/web/src/lib/metadata.ts`)
- Admin: separate Vercel project, port 3600 in production start script
- Supabase hosted PostgreSQL + Auth + Storage (migrations in `apps/admin/supabase/migrations/`)
- Database migrations must be applied manually or via Supabase CLI (`apps/admin/supabase/STORAGE_GUIDE.md`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase — `EmptyState.tsx`, `ConsignForm.tsx`, `MarketplaceCard.tsx`
- Hooks: camelCase with `use` prefix — `useDebounce.ts`, `useProfile.ts`, `useTableViews.ts`
- Services: camelCase with `Service` suffix — `activityService.ts`, `verifyService.ts`, `leadsService.ts`
- Service implementations (localStorage adapters): `{domain}.local.ts` — `verify.local.ts`, `consign.local.ts` in `apps/web/src/lib/services/impl/`
- Contracts: `{domain}.contract.ts` — `verify.contract.ts` in `packages/shared/src/domain/contracts/`
- Zod schemas: `{Name}Schema` export, file named by domain — `VerifyResultSchema` in `packages/shared/src/domain/schemas/verify.ts`
- App-level form schemas: `{domain}Schema` — `consignSchema` in `apps/web/src/lib/validations/consignSchema.ts`
- Static content/data: `*.data.ts` — `team.data.ts`, `contact.data.ts` in `apps/web/src/data/`
- API routes: Next.js App Router convention — `route.ts` under `app/api/{resource}/`
- Feature barrel exports: `index.ts` — `apps/admin/src/features/crm/index.ts`
- Utilities: camelCase — `utils.ts`, `theme-utils.ts`, `marketplaceUtils.ts`
- camelCase for all functions — `validateEmail`, `getVerifyHistory`, `mapRowToListing`
- Result helpers: `ok`, `err`, `isOk`, `isErr`, `unwrap`, `unwrapOr` in `packages/shared/src/domain/contracts/result.ts`
- Error factories: `{type}Error` — `validationError`, `notFoundError` in `packages/shared/src/domain/contracts/errors.ts`
- React components: PascalCase named exports — `export function EmptyState(...)`
- camelCase — `debouncedValue`, `searchParams`, `isSubmitting`
- Constants: UPPER_SNAKE_CASE for config maps — `DEFAULT_VERIFY_MAPPING`, `STORAGE_KEYS`, `FORM_STEPS`
- Database/API snake_case preserved at boundary — `entity_type`, `owner_id`, `state_lifecycle`
- PascalCase interfaces and types — `EmptyStateProps`, `ConsignFormData`, `ServiceError`, `Result<T, E>`
- Zod-inferred types: `type X = z.infer<typeof XSchema>` — `VerifyResult`, `ConsignFormData`
- Service interfaces prefixed with `I` — `IVerifyService` in `packages/shared/src/domain/contracts/verify.contract.ts`
- Props interfaces: `{ComponentName}Props` — `VerificationStatusBadgeProps`
## Code Style
- Prettier 3.x via root script: `pnpm format` runs `prettier --write "**/*.{ts,tsx,md}"` (`package.json`)
- No committed `.prettierrc` — Prettier defaults apply
- ESLint integrates Prettier via `eslint-config-prettier` in `packages/eslint-config/base.js` (no format conflicts)
- ESLint 9 flat config (`eslint.config.js` per package/app)
- Shared base: `packages/eslint-config/base.js` — `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-turbo`, `eslint-plugin-only-warn` (warnings not errors)
- Next.js apps (`apps/web`, `apps/admin`): extend `packages/eslint-config/next.js` — React, React Hooks, `@next/eslint-plugin-next` core-web-vitals
- React libraries (`packages/ui`): `packages/eslint-config/react-internal.js`
- Boundary rules: `packages/eslint-config/boundaries.js` — blocks cross-app imports, deep package imports (`@relique/shared/src/*`), direct `*.local.ts` impl imports from UI, direct `localStorage` access
- Run: `pnpm lint` (turbo, all packages); apps use `eslint --max-warnings 0`
- TypeScript: `strict: true`, `noUncheckedIndexedAccess: true` in `packages/typescript-config/base.json`
## Import Organization
- Apps: `@/*` → `./src/*` (configured in `apps/web/tsconfig.json`, `apps/admin/tsconfig.json`)
- Shared domain: `@relique/shared/domain` — contracts, schemas, types, storage helpers
- UI package: `@relique/ui`, `@relique/ui/buttons`, `@relique/ui/form/*` (see exports in `packages/ui/package.json`)
- ESLint config: `@repo/eslint-config/next-js`, `@repo/eslint-config/boundaries`
- TypeScript config: `@repo/typescript-config/nextjs.json`, `@repo/typescript-config/base.json`
- Import from public package exports only — never `@relique/shared/src/*` or `@relique/ui/src/*`
- Apps must not import from other apps — use `@relique/shared` instead
- UI components must not import `lib/services/impl/*.local.ts` directly — use service registry or context
- Prefer `@relique/shared/domain` for schemas/types over deprecated re-exports in `apps/*/src/lib/schemas/`
## Error Handling
- Location: `packages/shared/src/domain/contracts/errors.ts`, `result.ts`
- UI checks `result.ok` — no try/catch required for expected failures
- Files marked `@deprecated`: `apps/web/src/lib/services/verifyService.ts`, `consignService.ts`
- Pattern: unwrap `Result` and `throw new Error(result.error.message)` for backward compatibility
- New code should use `lib/services/impl/` exports directly with Result handling
- Auth helpers: `apps/admin/src/lib/supabase/requireUser.ts`, `requireRole.ts`
- Input validation: inline Zod schemas at top of route files
- Class-based or object singleton exported as `{name}Service`
- `import { toast } from "sonner"` in forms and admin pages
- Used for success/error user notifications in `apps/web/src/components/forms/ConsignForm.tsx`, admin CRM pages
- `apps/admin/src/app/error.tsx`, `apps/admin/src/app/admin/error.tsx` — client components with `reset()` callback
- `packages/shared/src/domain/storage/json.ts` — `console.error`/`console.warn` on parse failures, return defaults
- `packages/shared/src/domain/storage/verify.ts` — cap lists, guard `typeof window === "undefined"`
## Logging
- API routes: `console.error("Context:", error)` before returning 500 JSON — e.g. `apps/web/src/app/api/marketplace/route.ts`
- Service/history failures: `console.error("Failed to ...", result.error)` — legacy wrappers in `apps/web/src/lib/services/`
- Storage: `console.error`/`console.warn` in `packages/shared/src/domain/storage/json.ts`
- Client error reporting: `apps/admin/src/app/api/error-log/route.ts` receives client errors
- No log levels, no correlation IDs, no external observability SDK beyond `@vercel/speed-insights` in web app
## Comments
- Module-level JSDoc explaining purpose — contracts (`packages/shared/src/domain/contracts/verify.contract.ts`), storage helpers, service impl index
- `@deprecated` blocks during migration — point to replacement import path (shared domain or impl/)
- Inline comments for non-obvious business logic — verify code pattern matching in `verify.local.ts`
- Section comments in Zod schemas grouping form fields — `apps/web/src/lib/validations/consignSchema.ts`
- Used on contracts, error types, and exported domain functions
- Component props use inline `interface` without JSDoc unless non-obvious
- ESLint config files use `@type {import("eslint").Linter.Config[]}` JSDoc
## Function Design
- Target: under 300 lines per `.tsx` file (enforced by `.cursor/rules/shadcn-guard.mdc`)
- Many admin pages and forms exceed this (e.g. `MarketplaceForm.tsx` ~768 lines, `LeadsPage.tsx` ~495 lines) — split into subcomponents/hooks when modifying
- Destructured props objects for React components
- Optional params via `?` or default values in destructuring
- API query params parsed from `request.nextUrl.searchParams` with defaults
- React components: JSX; hooks: typed state/value
- Services: `Promise<Result<T, ServiceError>>` (domain) or `Promise<T>` / throw (legacy/admin fetch)
- Validators: `string | undefined` for field-level errors — `apps/web/src/lib/validation.ts`
- API routes: `NextResponse.json(...)` with appropriate status codes
## Module Design
- Named exports preferred for components, hooks, utilities, services
- Admin feature pages: `export default function LeadsPage` — re-exported from `features/{name}/index.ts`
- Barrel files aggregate public API — `packages/shared/src/domain/index.ts`, `apps/admin/src/features/crm/index.ts`
- Package entry points: `packages/shared/src/index.ts` → config + domain; `packages/ui/src/index.ts`
- Feature modules use `index.ts` to export pages, components, services — `apps/admin/src/features/marketplace/index.ts`
- Domain package re-exports schemas, types, storage, contracts, fixtures — `packages/shared/src/domain/index.ts`
- Avoid deep barrel chains; import from feature index or domain root
## Architecture Conventions by App
- Route-based pages in `app/` with colocated `components/` subfolders for page-specific UI
- Shared UI in `components/{category}/` — `shared/`, `cards/`, `form-sections/`, `shell/`, `app/` (wrappers)
- shadcn primitives in `components/ui/` — do not edit; wrap in `components/app/` or `components/shared/`
- Business logic: `lib/services/impl/*.local.ts` (client) + `app/api/` (server/Supabase)
- Hooks: `lib/hooks/` (web) — note `components.json` aliases `hooks` to `@/hooks` but web uses `lib/hooks/` in practice
- Static content: `data/*.data.ts`
- Feature-sliced architecture: `features/{crm,dashboard,marketplace,tasks,...}/`
- Each feature: `pages/`, `components/`, `services/`, `hooks/`, `types.ts`, `schemas.ts`, `index.ts`
- Shared admin UI: `components/shared/`, `components/shell/`, `components/ui/`
- API-heavy services call `/api/*` routes — `features/crm/services/*.ts`
- Legacy localStorage services in `lib/legacy/` (deprecated)
- Hooks at `hooks/` (top-level src, matches `components.json`)
- Domain-driven layout: `domain/{schemas,types,contracts,storage,fixtures}/`
- Zod schemas are source of truth for types (`z.infer`)
- Storage helpers encapsulate localStorage with schema validation
- No React dependencies
- Design system: `buttons/`, `primitives/`, `modules/`, `states/`, `form/`, `shadcn/ui/`
- `"use client"` on interactive components
- Exported via granular `package.json` exports map
## React / Next.js Conventions
- Next.js 16 App Router — `app/` directory, `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`
- Server Components default; add `"use client"` only when using hooks, events, or browser APIs
- Forms: `react-hook-form` + `zodResolver` + Zod schema — see `apps/web/src/components/forms/ConsignForm.tsx`
- Styling: Tailwind CSS + `cn()` from `apps/web/src/lib/utils.ts` (clsx + tailwind-merge)
- Icons: `lucide-react`
- Notifications: `sonner` Toaster in layout
- Metadata: dedicated files — `apps/web/src/lib/metadata.ts`, route-level `opengraph-image.tsx`
## Deprecation & Migration
- Legacy paths marked `@deprecated` with redirect guidance:
- Do not extend deprecated modules; migrate callers when touching related code
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- **Monorepo workspace:** `pnpm` workspaces + Turborepo orchestrate builds across `apps/*` and `packages/*` (`pnpm-workspace.yaml`, `turbo.json`)
- **Feature-sliced admin, route-centric web:** Admin uses vertical feature modules under `apps/admin/src/features/`; web uses App Router pages with co-located route components and a flat shared component library
- **Contract-based domain layer:** Shared Zod schemas, types, and service contracts live in `@relique/shared`; apps implement adapters (localStorage fixtures vs Supabase API routes)
- **BFF-style API routes:** Both apps expose Next.js Route Handlers under `src/app/api/` that talk to Supabase via service-role client; admin additionally enforces auth/roles per route
- **Hybrid data sources:** Marketplace reads from Supabase in production paths; verify/consign/content still use localStorage/fixture adapters on web; admin retains legacy localStorage services alongside Supabase-backed CRM
## Layers
- Purpose: Render UI, orchestrate user flows, minimal business logic
- Location: `apps/web/src/app/`, `apps/web/src/components/`, `apps/admin/src/app/`, `apps/admin/src/features/*/pages/`, `apps/admin/src/features/*/components/`
- Contains: Next.js pages/layouts, client components, page-specific wrappers
- Depends on: Feature services, shared UI (`@relique/ui`), React contexts, hooks
- Used by: Browser requests via Next.js routing
- Purpose: Encapsulate a business domain (CRM, marketplace, submissions, etc.)
- Location: `apps/admin/src/features/{domain}/`
- Contains: `pages/`, `components/`, `services/`, `hooks/`, `types.ts`, `index.ts` barrel exports
- Depends on: Admin API client services, `@/lib/types`, shared schemas
- Used by: Thin route files in `apps/admin/src/app/admin/**/page.tsx` that re-export feature pages
- Purpose: Abstract data access for UI; fetch from API routes or local adapters
- Location:
- Contains: Service interfaces, HTTP clients calling `/api/*`, localStorage implementations
- Depends on: `@relique/shared/domain` contracts/schemas, app-specific types
- Used by: Pages, hooks, command palette actions
- Purpose: Server-side endpoints; auth, validation, Supabase queries, audit logging
- Location: `apps/admin/src/app/api/` (~58 routes), `apps/web/src/app/api/` (marketplace, article-meta)
- Contains: `route.ts` handlers (GET/POST/PATCH/DELETE), Zod query/body parsing
- Depends on: `@/lib/supabase/server`, `requireUser`, `requireRole`, Zod schemas
- Used by: Client services via `fetch('/api/...')`
- Purpose: Cross-app types, validation, service contracts, localStorage helpers, fixtures
- Location: `packages/shared/src/domain/`
- Contains:
- Depends on: Zod only
- Used by: Both apps via `@relique/shared` and `@relique/shared/domain`
- Purpose: Shared design system — shadcn primitives, form fields, tables, layout modules
- Location: `packages/ui/src/`
- Contains: `shadcn/ui/`, `buttons/`, `form/`, `table/`, `modules/`, `states/`, `primitives/`
- Depends on: Radix UI, Tailwind utilities, react-hook-form
- Used by: Both apps; each app also maintains local `components/ui/` copies via shadcn CLI
- Purpose: Database, auth, file storage, RLS policies
- Location: `apps/admin/supabase/migrations/` (31 SQL migrations), client setup in `apps/*/src/lib/supabase/`
- Contains: Tables (profiles, marketplace_items, consigned_items, CRM entities, audit_logs, etc.), storage buckets, RPC functions
- Depends on: Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Used by: Admin API routes (primary), web marketplace API routes, admin middleware auth
## Data Flow
- **Server state:** Fetched on demand via client services + `fetch`; no React Query/SWR detected — components manage loading/error state locally
- **Client persistence:** React Context for currency (`apps/web/src/contexts/CurrencyContext.tsx`) and compare drawer; localStorage via `@relique/shared/domain/storage` for favorites, verify history, consign drafts
- **Admin profile:** `useProfile` hook in `apps/admin/src/features/users/hooks/useProfile.ts` reads Supabase auth + profiles table
## Key Abstractions
- Purpose: Typed success/error returns without exceptions in domain layer
- Examples: `packages/shared/src/domain/contracts/result.ts`, `packages/shared/src/domain/contracts/marketplace.contract.ts`, `packages/shared/src/domain/contracts/verify.contract.ts`
- Pattern: Discriminated union `{ ok: true, data } | { ok: false, error }` with helpers `ok()`, `err()`, `isOk()`, `unwrapOr()`
- Purpose: Stable import surface for pages regardless of backend (API vs local)
- Examples: `apps/web/src/lib/services/marketplaceService.ts`, `apps/web/src/lib/services/contracts.ts`
- Pattern: Interface (`IMarketplaceService`) implemented by API facade or local adapter; web marketplace uses Supabase API, verify/consign use local impl
- Purpose: Public API per domain module
- Examples: `apps/admin/src/features/marketplace/index.ts`, `apps/admin/src/features/crm/index.ts`
- Pattern: Re-export pages, components, services, types from single entry point
- Purpose: Searchable admin shortcuts wired to navigation and domain actions
- Examples: `apps/admin/src/lib/actions/actionRegistry.ts`, `verifyActions.ts`, `marketplaceActions.ts`
- Pattern: Register `Action[]` at runtime via `initializeActions()`; grouped by `navigation`, `create`, `utility`, domain-specific
- Purpose: Separate anon (middleware/browser) vs service-role (API routes) clients
- Examples: `apps/admin/src/lib/supabase/server.ts`, `apps/admin/src/lib/supabase/client.ts`, `apps/web/src/lib/supabase/server.ts`
- Pattern: Service role bypasses RLS — used exclusively in Route Handlers; never exposed to browser
- Purpose: Transform Supabase snake_case rows to app domain types
- Examples: `apps/web/src/app/api/marketplace/utils.ts` (`mapRowToListing`), admin marketplace utils
- Pattern: Mapping functions colocated with API routes
## Entry Points
- Location: `apps/web/src/app/layout.tsx`
- Triggers: HTTP on port 1300 (`pnpm dev:web`)
- Responsibilities: Global shell (Header, Footer), font loading, metadata, providers (Currency, Compare), SpeedInsights
- Location: `apps/admin/src/app/layout.tsx` + `apps/admin/src/app/admin/layout.tsx`
- Triggers: HTTP on port 3600 (`pnpm dev:admin`)
- Responsibilities: Root toaster + command palette; admin layout adds sidebar, notifications, auth-gated shell
- Location: `package.json` (root)
- Triggers: `pnpm dev`, `pnpm build`, `pnpm check`
- Responsibilities: Turborepo task orchestration across all workspace packages
- Location: `relique-marketplace/index.tsx`
- Triggers: Vite dev server (not in pnpm workspace — separate `relique-marketplace/package.json`)
- Responsibilities: Isolated marketplace UI prototype; not integrated with main apps
## Error Handling
- API routes wrap logic in try/catch, log with `console.error`, return 500 with message (`apps/web/src/app/api/marketplace/route.ts`)
- `requireUser()` / `requireRole()` return pre-built `NextResponse` objects for 401/403 (`apps/admin/src/lib/supabase/requireUser.ts`)
- Client services use `parseError()` helper to extract API error messages (`apps/admin/src/features/crm/services/dealsService.ts`)
- Web marketplace facade swallows errors and returns empty lists (`apps/web/src/lib/services/marketplaceService.ts`)
- Observability hooks: `apps/admin/src/lib/observability/clientErrorLog.ts`, `serverErrorLog.ts`, `POST /api/error-log`
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.Codex/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-Codex-profile` -- do not edit manually.
<!-- GSD:profile-end -->
