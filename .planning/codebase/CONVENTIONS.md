# Coding Conventions

**Analysis Date:** 2026-06-14

## Naming Patterns

**Files:**
- React components: PascalCase — `EmptyState.tsx`, `ConsignForm.tsx`, `VerificationStatusBadge.tsx` in `src/components/`, `src/admin/*/components/`
- Admin feature pages: PascalCase with `Page` suffix — `LeadsPage.tsx`, `DealsPage.tsx` in `src/admin/{feature}/pages/`
- Hooks: camelCase with `use` prefix — `useDebounce.ts`, `useMediaQuery.ts`, `useProfile.ts`
- Services (client): camelCase with `Service` suffix — `dealsService.ts`, `leadsService.ts` in `src/admin/{feature}/services/` and `src/lib/services/`
- Service implementations: `{domain}.{adapter}.ts` — `verify.supabase.ts`, `marketplace.local.ts`, `consign.supabase.ts` in `src/lib/services/impl/`
- Contracts: `{domain}.contract.ts` — `verify.contract.ts`, `marketplace.contract.ts` in `src/lib/domain/contracts/`
- Domain Zod schemas: `{domain}.ts` exporting `{Name}Schema` — `VerifyResultSchema` in `src/lib/domain/schemas/verify.ts`
- App-level form schemas: `{domain}Schema` — `consignSchema` in `src/lib/validations/consignSchema.ts`; CRM schemas in `src/admin/crm/schemas.ts`
- Static content/data: `*.data.ts` — `contact.data.ts`, `team.data.ts` in `src/data/`
- API routes: Next.js App Router — `route.ts` under `src/app/api/{resource}/`
- Feature barrel exports: `index.ts` — `src/admin/crm/index.ts`, `src/lib/domain/index.ts`
- Utilities: camelCase — `utils.ts`, `theme-utils.ts`, `marketplaceUtils.ts`
- Supabase row mappers: colocated with API — `mapRowToListing` in `src/app/api/marketplace/utils.ts`

**Functions:**
- camelCase for all functions — `validateEmail`, `getVerifyHistory`, `mapRowToListing`, `requireUser`
- Result helpers: `ok`, `err`, `isOk`, `isErr`, `unwrap`, `unwrapOr` in `src/lib/domain/contracts/result.ts`
- Error factories: `{type}Error` — `validationError`, `notFoundError`, `unknownError` in `src/lib/domain/contracts/errors.ts`
- Auth guards: `requireUser`, `requireRole` in `src/lib/supabase/requireUser.ts`, `requireRole.ts`

**Variables:**
- camelCase — `debouncedValue`, `searchParams`, `isSubmitting`, `formData`
- Boolean state: `is`/`has` prefix — `isSubmitting`, `matches`

**Types:**
- PascalCase interfaces and types — `EmptyStateProps`, `ConsignFormData`, `ServiceError`, `Result<T, E>`
- Zod-inferred types: `type X = z.infer<typeof XSchema>` — `ConsignFormData`, `VerifyResult`
- Service interfaces prefixed with `I` — `IVerifyService` in `src/lib/domain/contracts/verify.contract.ts`
- Props interfaces: `{ComponentName}Props` — `VerificationStatusBadgeProps`, `FormProgressProps` (inline `interface`, not exported unless reused)
- Admin DB/API types: snake_case fields preserved at boundary — `entity_type`, `owner_id`, `state_lifecycle`, `pipeline_stage_id` in `src/lib/types/admin.ts` and API payloads
- Enums: PascalCase name, UPPER_SNAKE or lowercase string values — `SubmissionStatus`, `MarketplaceStatus` in `src/lib/types/admin.ts`

**Constants:**
- UPPER_SNAKE_CASE for config maps — `FORM_STEPS` in `src/components/forms/ConsignForm.tsx`, `STORAGE_LIMITS` in domain storage
- Module-level color/config maps: PascalCase or UPPER — `STATUS_COLORS` in `src/components/app/VerificationStatusBadge.tsx`

## Code Style

**Formatting:**
- Prettier 3.7.4 via root script: `pnpm format` runs `prettier --write "**/*.{ts,tsx,md,json}"` (`package.json`)
- No committed `.prettierrc` — Prettier defaults apply
- ESLint integrates Prettier via `eslint-config-prettier` in `eslint-config/base.js` (no format conflicts)

**Linting:**
- ESLint 9 flat config — root `eslint.config.js` extends `eslint-config/next.js`
- Shared base: `eslint-config/base.js` — `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-turbo` (`turbo/no-undeclared-env-vars`: warn), `eslint-plugin-only-warn` (warnings not errors at base level)
- Next.js rules: `eslint-config/next.js` — React, React Hooks, `@next/eslint-plugin-next` core-web-vitals; `react/react-in-jsx-scope`: off
- Run: `pnpm lint` → `eslint --max-warnings 0` (warnings treated as failures at CI gate)
- Boundary rules defined but **not currently wired** into root ESLint: `eslint-config/boundaries.js` (restricts cross-app imports, deep package paths, direct `*.local.ts` imports, direct `localStorage` access)

**TypeScript:**
- Strict mode: `strict: true`, `noUncheckedIndexedAccess: true` in `typescript-config/base.json`
- Path alias: `@/*` → `./src/*` (`tsconfig.json`)
- Domain barrel: import from `@/lib/domain` (not deprecated `@/lib/schemas/*`)
- Run: `pnpm check-types` → `next typegen && tsc --noEmit`
- Node engine: `>=20` (`package.json`)

**React / Next.js:**
- Server Components default; add `"use client"` only when using hooks, events, or browser APIs
- Styling: Tailwind CSS + `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)
- shadcn/ui primitives in `src/components/ui/` — **do not edit directly**; wrap in `src/components/app/` or `src/components/shared/` per workspace rule
- File size target: under **300 lines** per `.tsx` file (workspace rule); many admin files exceed this — split when modifying (e.g. `MarketplaceForm.tsx` ~707 lines, `LeadsPage.tsx` ~469 lines)

## Import Organization

**Order (observed pattern):**
1. `"use client"` directive (when needed)
2. React / Next.js (`react`, `next/navigation`, `next/server`)
3. Third-party libraries (`zod`, `react-hook-form`, `lucide-react`, `sonner`)
4. shadcn/ui and shared UI (`@/components/ui/*`, `@/components/shared/*`, `@/lib/ui/*`)
5. Feature/admin modules (`@/admin/crm/*`, `@/admin/tasks/*`)
6. Domain, services, hooks, utils (`@/lib/domain`, `@/lib/services/*`, `@/hooks/*`, `@/lib/utils`)

**Path Aliases:**
- `@/*` → `./src/*` — primary alias for all app code
- `components.json` aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/hooks` (note: some hooks live in `src/lib/hooks/` instead)

**Import Rules:**
- Prefer `@/lib/domain` for schemas, types, contracts, storage — `@/lib/schemas/*` files are deprecated re-exports
- New service code: import from `src/lib/services/impl/` via barrel `src/lib/services/impl/index.ts`
- Admin features: import pages/components/services from `@/admin/{feature}/` or feature `index.ts` barrel
- Thin admin routes re-export feature pages — e.g. `src/app/admin/(portal)/leads/page.tsx` → `export { default } from "@/admin/crm/pages/LeadsPage"`
- Do not import service implementations (`*.local.ts`) directly from UI — use service registry or exported singletons
- Database snake_case preserved at API boundary; map to camelCase in UI only when needed

## Error Handling

**Domain layer (preferred for new code):**
- Location: `src/lib/domain/contracts/result.ts`, `errors.ts`
- Pattern: discriminated union `Result<T, E>` with `{ ok: true, data } | { ok: false, error }`
- Service methods return `Promise<Result<T, ServiceError>>` — e.g. `IVerifyService` in `src/lib/domain/contracts/verify.contract.ts`
- UI checks `result.ok` — no try/catch required for expected failures
- Use `unwrapOr(result, defaultValue)` for safe defaults; `unwrap()` throws (use sparingly)

**Legacy service wrappers:**
- Files marked `@deprecated`: `src/lib/services/verifyService.ts`, `consignService.ts`, `contentService.ts`
- Pattern: unwrap `Result` and `throw new Error(result.error.message)` for backward compatibility
- Failures logged with `console.error` and empty fallbacks — e.g. verify history returns `[]` on error

**Admin client services:**
- Class-based fetch wrappers — e.g. `DealsAPIService` in `src/admin/crm/services/dealsService.ts`
- Private `parseError(response, prefix)` extracts API `{ error }` JSON and throws `Error`
- 404 on `getById` returns `null` instead of throwing

**API routes:**
- Auth: `requireUser()` / `requireRole()` return `{ user, response }` or `{ role, response }`; return pre-built `NextResponse` on 401/403
- Validation: inline Zod schemas at top of route files — e.g. `DealSchema` in `src/app/api/deals/route.ts`
- Query params: parse from `request.nextUrl.searchParams` with defaults
- Supabase errors: return `NextResponse.json({ error: error.message }, { status: 500 })`
- Unexpected errors: `try/catch` with `console.error("Context:", error)` before 500 JSON response
- Public routes: validate response with Zod before returning — e.g. `src/app/api/public/verify/route.ts`

**UI error surfaces:**
- Forms: `toast.error(...)` / `toast.success(...)` via `sonner`
- Admin pages: `ErrorState`, `AdminLoadingState` components from `src/components/shared/`
- Next.js error boundaries: use `error.tsx` with `reset()` callback where present under `src/app/`
- Client error reporting: `logClientError()` in `src/lib/observability/clientErrorLog.ts` POSTs to `/api/error-log`

**Field-level validation (legacy/non-RHF forms):**
- Helpers in `src/lib/validation.ts` return `string | undefined` — `validateEmail`, `validateRequired`, `validateFileSize`

## Logging

**Framework:** `console` only — no structured logging SDK, log levels, or correlation IDs

**Patterns:**
- API routes: `console.error("Error fetching deals:", error)` before returning 500 JSON — widespread in `src/app/api/**/route.ts`
- Service/history failures: `console.error("Failed to ...", result.error)` — legacy wrappers in `src/lib/services/`
- Storage: `console.error` / `console.warn` in `src/lib/domain/storage/json.ts` on parse/save failures
- Client error reporting: `src/app/api/error-log/route.ts` receives client errors; `src/lib/observability/clientErrorLog.ts` fire-and-forget fetch
- Performance: `@vercel/speed-insights` in app layout (observability, not error tracking)

## Comments

**When to Comment:**
- Module-level JSDoc explaining purpose — contracts (`src/lib/domain/contracts/verify.contract.ts`), storage helpers, service impl index
- `@deprecated` blocks during migration — point to replacement import path (`@/lib/domain` or `impl/`)
- Inline comments for non-obvious business logic — verify code pattern matching, API auth branching
- Section comments in Zod schemas grouping form fields — `src/lib/validations/consignSchema.ts`, `src/admin/crm/schemas.ts`
- Brief component purpose comments when semantics non-obvious — e.g. `VerificationStatusBadge.tsx`

**JSDoc/TSDoc:**
- Used on contracts, error types, and exported domain functions
- ESLint config files use `@type {import("eslint").Linter.Config[]}` JSDoc
- Component props use inline `interface` without JSDoc unless non-obvious

## Function Design

**Size:**
- Target: under 300 lines per `.tsx` file (enforced by workspace rule)
- Split large pages into subcomponents/hooks when modifying — extract form sections (`src/components/form-sections/`), shared dialogs (`src/components/shared/FormDialog.tsx`)

**Parameters:**
- Destructured props objects for React components
- Optional params via `?` or default values in destructuring
- API query params parsed from URL with fallback defaults

**Return Values:**
- React components: JSX; hooks: typed state/value
- Domain services: `Promise<Result<T, ServiceError>>`
- Admin fetch services: `Promise<T>` with thrown errors on failure
- Legacy services: `Promise<T>` / throw for compatibility
- Validators: `string | undefined` for field-level errors

## Module Design

**Exports:**
- Named exports preferred for components, hooks, utilities, services — `export function EmptyState(...)`
- Admin feature pages: `export default function LeadsPage` — re-exported from thin route files
- Service singletons: `export const dealsService = new DealsAPIService()` at bottom of service file
- Domain barrel: `src/lib/domain/index.ts` re-exports schemas, types, storage, contracts, fixtures

**Barrel Files:**
- Admin features: `src/admin/{feature}/index.ts` aggregates pages, components, services, types
- Domain: `src/lib/domain/index.ts` — single import surface for shared domain code
- Service impl: `src/lib/services/impl/index.ts` — exports active adapters (`verifyService`, `marketplaceService`, etc.)
- Avoid deep barrel chains; import from feature index or domain root

**Architecture Conventions by Area:**

| Area | Location | Pattern |
|------|----------|---------|
| Public pages | `src/app/(home)/`, `src/app/(site)/` | Route-centric with colocated `components/` subfolders |
| Admin portal | `src/app/admin/(portal)/` | Thin `page.tsx` re-exports from `src/admin/{feature}/pages/` |
| Admin features | `src/admin/{crm,marketplace,tasks,...}/` | Vertical slices: `pages/`, `components/`, `services/`, `hooks/`, `schemas.ts`, `index.ts` |
| Shared UI | `src/components/{shared,app,cards,form-sections,shell}/` | Composition over shadcn primitives |
| shadcn primitives | `src/components/ui/` | Do not edit; wrap only |
| Internal UI library | `src/lib/ui/` | Form fields, tables, buttons, states — shared design modules |
| Business logic | `src/lib/services/impl/` + `src/app/api/` | Client adapters + server Supabase routes |
| Domain | `src/lib/domain/` | Zod schemas, contracts, storage helpers, fixtures — no React deps |
| Hooks | `src/hooks/` (admin/shared) and `src/lib/hooks/` (web) | **Duplication exists** — `useDebounce.ts` in both; prefer `@/hooks/` for new admin hooks |
| Static content | `src/data/*.data.ts` | Typed constants, no runtime fetch |
| Validations | `src/lib/validations/` (public forms), `src/admin/*/schemas.ts` (CRM) | Zod schemas colocated with feature |

**Forms:**
- `react-hook-form` + `zodResolver` + Zod schema — see `src/components/forms/ConsignForm.tsx`
- Multi-step forms: `FORM_STEPS` constant + `FormProgress` component
- Draft autosave: debounced `form.watch()` + service draft API

**Deprecations (do not extend):**
- `src/lib/schemas/*` → use `@/lib/domain`
- `src/lib/services/{verify,consign,content}Service.ts` → use `src/lib/services/impl/`
- `src/lib/legacy/*` → migration remnants

---

*Convention analysis: 2026-06-14*
