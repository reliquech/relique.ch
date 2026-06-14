# Coding Conventions

**Analysis Date:** 2026-06-14

## Naming Patterns

**Files:**
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

**Functions:**
- camelCase for all functions — `validateEmail`, `getVerifyHistory`, `mapRowToListing`
- Result helpers: `ok`, `err`, `isOk`, `isErr`, `unwrap`, `unwrapOr` in `packages/shared/src/domain/contracts/result.ts`
- Error factories: `{type}Error` — `validationError`, `notFoundError` in `packages/shared/src/domain/contracts/errors.ts`
- React components: PascalCase named exports — `export function EmptyState(...)`

**Variables:**
- camelCase — `debouncedValue`, `searchParams`, `isSubmitting`
- Constants: UPPER_SNAKE_CASE for config maps — `DEFAULT_VERIFY_MAPPING`, `STORAGE_KEYS`, `FORM_STEPS`
- Database/API snake_case preserved at boundary — `entity_type`, `owner_id`, `state_lifecycle`

**Types:**
- PascalCase interfaces and types — `EmptyStateProps`, `ConsignFormData`, `ServiceError`, `Result<T, E>`
- Zod-inferred types: `type X = z.infer<typeof XSchema>` — `VerifyResult`, `ConsignFormData`
- Service interfaces prefixed with `I` — `IVerifyService` in `packages/shared/src/domain/contracts/verify.contract.ts`
- Props interfaces: `{ComponentName}Props` — `VerificationStatusBadgeProps`

## Code Style

**Formatting:**
- Prettier 3.x via root script: `pnpm format` runs `prettier --write "**/*.{ts,tsx,md}"` (`package.json`)
- No committed `.prettierrc` — Prettier defaults apply
- ESLint integrates Prettier via `eslint-config-prettier` in `packages/eslint-config/base.js` (no format conflicts)

**Linting:**
- ESLint 9 flat config (`eslint.config.js` per package/app)
- Shared base: `packages/eslint-config/base.js` — `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-turbo`, `eslint-plugin-only-warn` (warnings not errors)
- Next.js apps (`apps/web`, `apps/admin`): extend `packages/eslint-config/next.js` — React, React Hooks, `@next/eslint-plugin-next` core-web-vitals
- React libraries (`packages/ui`): `packages/eslint-config/react-internal.js`
- Boundary rules: `packages/eslint-config/boundaries.js` — blocks cross-app imports, deep package imports (`@relique/shared/src/*`), direct `*.local.ts` impl imports from UI, direct `localStorage` access
- Run: `pnpm lint` (turbo, all packages); apps use `eslint --max-warnings 0`
- TypeScript: `strict: true`, `noUncheckedIndexedAccess: true` in `packages/typescript-config/base.json`

## Import Organization

**Order (observed pattern):**
1. `"use client"` directive (when needed, always first line)
2. React / Next.js (`react`, `next/navigation`, `next/server`)
3. Third-party libraries (`zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `sonner`)
4. Workspace packages (`@relique/shared`, `@relique/shared/domain`, `@relique/ui`)
5. App aliases (`@/components/...`, `@/lib/...`, `@/features/...`, `@/hooks/...`)
6. Relative imports (same feature/module)

**Path Aliases:**
- Apps: `@/*` → `./src/*` (configured in `apps/web/tsconfig.json`, `apps/admin/tsconfig.json`)
- Shared domain: `@relique/shared/domain` — contracts, schemas, types, storage helpers
- UI package: `@relique/ui`, `@relique/ui/buttons`, `@relique/ui/form/*` (see exports in `packages/ui/package.json`)
- ESLint config: `@repo/eslint-config/next-js`, `@repo/eslint-config/boundaries`
- TypeScript config: `@repo/typescript-config/nextjs.json`, `@repo/typescript-config/base.json`

**Import rules (enforced/preferred):**
- Import from public package exports only — never `@relique/shared/src/*` or `@relique/ui/src/*`
- Apps must not import from other apps — use `@relique/shared` instead
- UI components must not import `lib/services/impl/*.local.ts` directly — use service registry or context
- Prefer `@relique/shared/domain` for schemas/types over deprecated re-exports in `apps/*/src/lib/schemas/`

## Error Handling

**Patterns:**

**1. Service layer — Result discriminated union (preferred for new domain code):**
```typescript
// packages/shared/src/domain/contracts/result.ts
export type Result<T, E = ServiceError> = Ok<T> | Err<E>;

// Implementation returns ok(data) or err(validationError(...))
const parsed = VerifyRunInputSchema.safeParse(input);
if (!parsed.success) {
  return err(validationError("Invalid input", parsed.error));
}
return ok(result);
```
- Location: `packages/shared/src/domain/contracts/errors.ts`, `result.ts`
- UI checks `result.ok` — no try/catch required for expected failures

**2. Legacy service wrappers — throw on error:**
- Files marked `@deprecated`: `apps/web/src/lib/services/verifyService.ts`, `consignService.ts`
- Pattern: unwrap `Result` and `throw new Error(result.error.message)` for backward compatibility
- New code should use `lib/services/impl/` exports directly with Result handling

**3. Admin API routes — auth guard + try/catch + JSON errors:**
```typescript
// apps/admin/src/app/api/leads/route.ts
const { user, response } = await requireUser();
if (!user) return response;

try {
  // ... supabase query
  if (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
} catch (error) {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```
- Auth helpers: `apps/admin/src/lib/supabase/requireUser.ts`, `requireRole.ts`
- Input validation: inline Zod schemas at top of route files

**4. Admin client services — fetch + throw:**
```typescript
// apps/admin/src/features/crm/services/activityService.ts
if (!response.ok) return parseError(response, "Failed to fetch activity");
```
- Class-based or object singleton exported as `{name}Service`

**5. UI feedback — toast (sonner):**
- `import { toast } from "sonner"` in forms and admin pages
- Used for success/error user notifications in `apps/web/src/components/forms/ConsignForm.tsx`, admin CRM pages

**6. Next.js error boundaries:**
- `apps/admin/src/app/error.tsx`, `apps/admin/src/app/admin/error.tsx` — client components with `reset()` callback

**7. Storage layer — silent fallback:**
- `packages/shared/src/domain/storage/json.ts` — `console.error`/`console.warn` on parse failures, return defaults
- `packages/shared/src/domain/storage/verify.ts` — cap lists, guard `typeof window === "undefined"`

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- API routes: `console.error("Context:", error)` before returning 500 JSON — e.g. `apps/web/src/app/api/marketplace/route.ts`
- Service/history failures: `console.error("Failed to ...", result.error)` — legacy wrappers in `apps/web/src/lib/services/`
- Storage: `console.error`/`console.warn` in `packages/shared/src/domain/storage/json.ts`
- Client error reporting: `apps/admin/src/app/api/error-log/route.ts` receives client errors
- No log levels, no correlation IDs, no external observability SDK beyond `@vercel/speed-insights` in web app

## Comments

**When to Comment:**
- Module-level JSDoc explaining purpose — contracts (`packages/shared/src/domain/contracts/verify.contract.ts`), storage helpers, service impl index
- `@deprecated` blocks during migration — point to replacement import path (shared domain or impl/)
- Inline comments for non-obvious business logic — verify code pattern matching in `verify.local.ts`
- Section comments in Zod schemas grouping form fields — `apps/web/src/lib/validations/consignSchema.ts`

**JSDoc/TSDoc:**
- Used on contracts, error types, and exported domain functions
- Component props use inline `interface` without JSDoc unless non-obvious
- ESLint config files use `@type {import("eslint").Linter.Config[]}` JSDoc

## Function Design

**Size:**
- Target: under 300 lines per `.tsx` file (enforced by `.cursor/rules/shadcn-guard.mdc`)
- Many admin pages and forms exceed this (e.g. `MarketplaceForm.tsx` ~768 lines, `LeadsPage.tsx` ~495 lines) — split into subcomponents/hooks when modifying

**Parameters:**
- Destructured props objects for React components
- Optional params via `?` or default values in destructuring
- API query params parsed from `request.nextUrl.searchParams` with defaults

**Return Values:**
- React components: JSX; hooks: typed state/value
- Services: `Promise<Result<T, ServiceError>>` (domain) or `Promise<T>` / throw (legacy/admin fetch)
- Validators: `string | undefined` for field-level errors — `apps/web/src/lib/validation.ts`
- API routes: `NextResponse.json(...)` with appropriate status codes

## Module Design

**Exports:**
- Named exports preferred for components, hooks, utilities, services
- Admin feature pages: `export default function LeadsPage` — re-exported from `features/{name}/index.ts`
- Barrel files aggregate public API — `packages/shared/src/domain/index.ts`, `apps/admin/src/features/crm/index.ts`
- Package entry points: `packages/shared/src/index.ts` → config + domain; `packages/ui/src/index.ts`

**Barrel Files:**
- Feature modules use `index.ts` to export pages, components, services — `apps/admin/src/features/marketplace/index.ts`
- Domain package re-exports schemas, types, storage, contracts, fixtures — `packages/shared/src/domain/index.ts`
- Avoid deep barrel chains; import from feature index or domain root

## Architecture Conventions by App

**apps/web (public site):**
- Route-based pages in `app/` with colocated `components/` subfolders for page-specific UI
- Shared UI in `components/{category}/` — `shared/`, `cards/`, `form-sections/`, `shell/`, `app/` (wrappers)
- shadcn primitives in `components/ui/` — do not edit; wrap in `components/app/` or `components/shared/`
- Business logic: `lib/services/impl/*.local.ts` (client) + `app/api/` (server/Supabase)
- Hooks: `lib/hooks/` (web) — note `components.json` aliases `hooks` to `@/hooks` but web uses `lib/hooks/` in practice
- Static content: `data/*.data.ts`

**apps/admin (portal):**
- Feature-sliced architecture: `features/{crm,dashboard,marketplace,tasks,...}/`
- Each feature: `pages/`, `components/`, `services/`, `hooks/`, `types.ts`, `schemas.ts`, `index.ts`
- Shared admin UI: `components/shared/`, `components/shell/`, `components/ui/`
- API-heavy services call `/api/*` routes — `features/crm/services/*.ts`
- Legacy localStorage services in `lib/legacy/` (deprecated)
- Hooks at `hooks/` (top-level src, matches `components.json`)

**packages/shared:**
- Domain-driven layout: `domain/{schemas,types,contracts,storage,fixtures}/`
- Zod schemas are source of truth for types (`z.infer`)
- Storage helpers encapsulate localStorage with schema validation
- No React dependencies

**packages/ui:**
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
  - `apps/*/src/lib/schemas/*` → `@relique/shared/domain`
  - `apps/*/src/lib/services/*Service.ts` → `lib/services/impl/`
  - `apps/admin/src/lib/legacy/*` → impl or Supabase-backed services
- Do not extend deprecated modules; migrate callers when touching related code

---

*Convention analysis: 2026-06-14*
