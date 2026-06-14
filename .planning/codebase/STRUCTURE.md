# Codebase Structure

**Analysis Date:** 2026-06-14

## Directory Layout

```
relique.co/
├── apps/
│   ├── web/                    # Public marketing + marketplace site (Next.js, port 1300)
│   └── admin/                  # Internal admin portal + CRM (Next.js, port 3600)
├── packages/
│   ├── shared/                 # Domain types, schemas, contracts, fixtures (@relique/shared)
│   ├── ui/                     # Shared design system (@relique/ui)
│   ├── eslint-config/          # Shared ESLint config (@repo/eslint-config)
│   └── typescript-config/      # Shared TS configs (@repo/typescript-config)
├── relique-marketplace/        # Standalone Vite prototype (outside pnpm workspace)
├── docs/                       # Project documentation
├── .planning/                  # GSD planning artifacts
├── .cursor/rules/              # Cursor agent rules (e.g. shadcn guard)
├── package.json                # Root scripts (turbo orchestration)
├── pnpm-workspace.yaml         # Workspace: apps/*, packages/*
├── turbo.json                  # Turborepo task pipeline
└── tsconfig.json               # Solution-style TS project references
```

## Directory Purposes

**`apps/web/`:**
- Purpose: Public-facing Relique website — home, verify, consign, marketplace, about, contact
- Contains: Next.js App Router app with route-centric structure
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/services/`, `src/components/`

**`apps/admin/`:**
- Purpose: Authenticated admin dashboard — CRM, marketplace management, submissions, automations
- Contains: Feature-sliced modules, extensive API layer, Supabase migrations
- Key files: `src/features/`, `src/app/api/`, `src/middleware.ts`, `supabase/migrations/`

**`packages/shared/`:**
- Purpose: Cross-app domain layer — single source of truth for types and validation
- Contains: Zod schemas, service contracts, localStorage utilities, JSON fixtures
- Key files: `src/domain/schemas/`, `src/domain/contracts/`, `src/domain/storage/`, `src/config/urls.ts`

**`packages/ui/`:**
- Purpose: Shared React component library built on shadcn/Radix
- Contains: shadcn/ui copies, custom buttons, forms, tables, layout modules
- Key files: `src/shadcn/ui/`, `src/buttons/`, `src/form/`, `src/modules/`, `src/index.ts`

**`packages/eslint-config/` & `packages/typescript-config/`:**
- Purpose: Monorepo-wide lint and TypeScript baseline configs
- Contains: `nextjs.json`, `base.json` extended by app tsconfigs

**`relique-marketplace/`:**
- Purpose: Isolated Vite + React prototype for marketplace UI experiments
- Contains: `index.tsx`, `components/PreviewOverlay.tsx`
- Note: Not listed in `pnpm-workspace.yaml`; run independently

**`apps/admin/supabase/`:**
- Purpose: Database schema source of truth for the project
- Contains: 31 numbered SQL migrations, `STORAGE_GUIDE.md`
- Generated: Migrations are hand-authored; applied to remote Supabase separately

## Key File Locations

**Entry Points:**
- `apps/web/src/app/layout.tsx`: Web root layout (Header, Footer, providers)
- `apps/web/src/app/page.tsx`: Home page (route group `(home)`)
- `apps/admin/src/app/layout.tsx`: Admin root layout (Toaster, CommandPalette)
- `apps/admin/src/app/admin/layout.tsx`: Authenticated admin shell (sidebar, header)
- `apps/admin/src/middleware.ts`: Session refresh + auth redirect for `/admin/*`
- `package.json`: `pnpm dev`, `pnpm dev:web`, `pnpm dev:admin`, `pnpm build`, `pnpm check`

**Configuration:**
- `pnpm-workspace.yaml`: Workspace package globs
- `turbo.json`: Build/lint/dev task dependencies and caching
- `tsconfig.json`: Project references to shared, ui, web, admin
- `apps/web/tsconfig.json`, `apps/admin/tsconfig.json`: Path alias `@/*` → `./src/*`
- `apps/web/components.json`, `apps/admin/components.json`: shadcn/ui CLI config
- `apps/web/tailwind.config.ts`, `apps/admin/tailwind.config.ts`: Tailwind theming
- `apps/web/next.config.js`, `apps/admin/next.config.js`: Next.js config

**Core Logic:**
- `packages/shared/src/domain/`: Shared domain schemas, types, contracts, storage
- `apps/web/src/lib/services/`: Web service facades and adapters
- `apps/web/src/lib/services/api/`: HTTP clients for web API routes
- `apps/web/src/lib/services/impl/`: localStorage/fixture implementations
- `apps/admin/src/features/*/services/`: Admin API client classes per domain
- `apps/admin/src/app/api/`: Admin REST-style Route Handlers (~58 endpoints)
- `apps/web/src/app/api/`: Web public API (marketplace, article-meta)
- `apps/admin/src/lib/supabase/`: Supabase client factories, auth helpers, generated types
- `apps/admin/src/lib/actions/`: Command palette action registry

**Database:**
- `apps/admin/supabase/migrations/`: SQL migrations (001–031)
- `apps/admin/src/lib/supabase/types.ts`: Generated Supabase Database types (admin)
- `apps/web/src/lib/supabase/types.ts`: Generated Supabase Database types (web)

**Testing:**
- Not detected: No `*.test.*`, `*.spec.*`, jest.config, or vitest.config found in workspace

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js App Router convention) in `app/**/`
- Layouts: `layout.tsx`, `error.tsx` in route segments
- API routes: `route.ts` in `app/api/{resource}/` or `app/api/{resource}/[id]/`
- Components: PascalCase `.tsx` — e.g. `MarketplaceGrid.tsx`, `DealsBoard.tsx`
- Services: camelCase with `Service` suffix — e.g. `dealsService.ts`, `marketplaceService.ts`
- Hooks: `use` prefix — e.g. `useProfile.ts`, `useDebounce.ts`, `useMarketplaceTempUploads.ts`
- Schemas: camelCase domain name — e.g. `marketplace.ts`, `verify.ts` in `lib/schemas/` or `domain/schemas/`
- Types: `types.ts` per feature module or `lib/types.ts` for app-wide types
- Local adapters: `*.local.ts` in `lib/services/impl/` or `lib/legacy/impl/`
- Migrations: `{NNN}_{description}.sql` — e.g. `002_create_marketplace_items.sql`

**Directories:**
- Admin features: lowercase domain name — `features/crm/`, `features/marketplace/`, `features/submissions/`
- Feature internals: `pages/`, `components/`, `services/`, `hooks/` subfolders
- Web components: grouped by UI role — `cards/`, `forms/`, `shell/`, `states/`, `filters/`, `app/`
- Route-specific components: co-located under `app/{route}/components/`
- Shared packages: `src/` with domain-driven subfolders

**Exports:**
- Admin feature barrels: `features/{domain}/index.ts` re-exports public API
- Admin pages: thin re-export — `export { default } from "@/features/crm/pages/DealsPage"`
- Package exports: `@relique/shared`, `@relique/shared/domain`, `@relique/ui`, `@relique/ui/ui/*`

## Where to Add New Code

**New Admin Feature (e.g. inventory management):**
- Feature module: `apps/admin/src/features/inventory/`
  - `pages/InventoryPage.tsx`
  - `components/` — feature-specific UI
  - `services/inventoryService.ts` — fetch wrapper for `/api/inventory`
  - `types.ts`, `index.ts`
- Route: `apps/admin/src/app/admin/inventory/page.tsx` → `export { default } from "@/features/inventory/pages/InventoryPage"`
- API: `apps/admin/src/app/api/inventory/route.ts` with `requireUser()` + Supabase queries
- Migration: `apps/admin/supabase/migrations/032_create_inventory.sql`
- Sidebar: update `apps/admin/src/components/shell/PortalSidebar.tsx` and `apps/admin/src/lib/utils/admin.tsx` tab maps

**New Web Page:**
- Route: `apps/web/src/app/{route}/page.tsx`
- Route-specific components: `apps/web/src/app/{route}/components/`
- Reusable components: `apps/web/src/components/{category}/` (pick existing category or create new)
- Do not edit `apps/web/src/components/ui/**` directly — create wrappers in `components/app/` or `components/shared/` per shadcn guard rule

**New Shared Domain Type or Schema:**
- Schema: `packages/shared/src/domain/schemas/{domain}.ts`
- Type: `packages/shared/src/domain/types/{domain}.ts`
- Contract: `packages/shared/src/domain/contracts/{domain}.contract.ts`
- Re-export: update `packages/shared/src/domain/schemas/index.ts`, `types/index.ts`, `contracts/index.ts`

**New Shared UI Component:**
- Implementation: `packages/ui/src/{category}/{ComponentName}.tsx`
- Export: add to `packages/ui/src/index.ts` or subpath export in `packages/ui/package.json`

**New API Endpoint (Admin):**
- Handler: `apps/admin/src/app/api/{resource}/route.ts`
- Auth: import `requireUser` from `@/lib/supabase/requireUser`; add `requireRole` for write operations
- Client: add methods to corresponding `apps/admin/src/features/{domain}/services/{domain}Service.ts`

**New API Endpoint (Web — public):**
- Handler: `apps/web/src/app/api/{resource}/route.ts`
- Client: `apps/web/src/lib/services/api/{resource}Service.ts`
- Facade: wire in `apps/web/src/lib/services/{resource}Service.ts`

**Utilities:**
- App-specific: `apps/{app}/src/lib/utils/` or `apps/{app}/src/lib/utils.ts`
- Cross-app: `packages/shared/src/domain/storage/` or `packages/shared/src/config/`

**LocalStorage / Client Persistence:**
- Keys and helpers: `packages/shared/src/domain/storage/{domain}.ts`
- Register key in `packages/shared/src/domain/storage/keys.ts`

## Special Directories

**`apps/web/src/components/ui/` & `apps/admin/src/components/ui/`:**
- Purpose: shadcn/ui base components installed per-app
- Generated: Via shadcn CLI (`components.json`)
- Committed: Yes — but protected from direct edits by `.cursor/rules/shadcn-guard.mdc`; customize via wrappers in `components/app/`, `components/shared/`, or `features/*/components/`

**`packages/ui/src/shadcn/ui/`:**
- Purpose: Canonical shared shadcn copies consumed via `@relique/ui`
- Generated: Via shadcn CLI into package
- Committed: Yes

**`apps/admin/src/lib/legacy/`:**
- Purpose: Pre-Supabase localStorage service implementations retained for verify/consign/activity/notifications
- Generated: No
- Committed: Yes — being phased out as Supabase paths mature

**`apps/web/src/mocks/` & `packages/shared/src/domain/fixtures/`:**
- Purpose: Static JSON fixture data for development and local adapters
- Generated: No
- Committed: Yes

**`apps/web/src/data/`:**
- Purpose: Static content data (e.g. `terms-policies.data.ts`)
- Generated: No
- Committed: Yes

**`.next/` (per app):**
- Purpose: Next.js build output
- Generated: Yes (Turborepo cache target)
- Committed: No (gitignored)

**`.planning/codebase/`:**
- Purpose: GSD codebase intelligence documents consumed by plan/execute phases
- Generated: By `/gsd-map-codebase`
- Committed: Yes

---

*Structure analysis: 2026-06-14*
