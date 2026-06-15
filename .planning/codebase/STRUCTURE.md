# Codebase Structure

**Analysis Date:** 2026-06-14

## Directory Layout

```
relique.co/
├── src/                        # All application source
│   ├── app/                    # Next.js App Router (routes, layouts, API)
│   │   ├── (home)/             # Homepage content (re-exported at /)
│   │   ├── (site)/             # Public site route group
│   │   ├── admin/              # Admin routes (/admin/*)
│   │   └── api/                # BFF Route Handlers (~61 endpoints)
│   ├── admin/                  # Feature-sliced admin modules
│   │   ├── crm/                # Leads, deals, customers, messages, pipeline
│   │   ├── dashboard/          # Dashboard + reports
│   │   ├── marketplace/        # Admin marketplace management
│   │   ├── submissions/        # Consign/authenticate submissions
│   │   ├── tasks/              # Task management
│   │   ├── users/              # Profile, settings
│   │   ├── notifications/      # Notification center
│   │   └── automations/        # Alert rules scheduler
│   ├── components/             # Shared UI (public + admin)
│   │   ├── ui/                 # shadcn primitives (DO NOT edit — wrap instead)
│   │   ├── app/                # App-level wrappers/compositions
│   │   ├── shared/             # Reusable composed components
│   │   ├── admin/              # Admin shell (sidebar, layout)
│   │   ├── shell/              # Header, Footer
│   │   ├── forms/              # Public forms (ConsignForm, etc.)
│   │   └── ...                 # cards, filters, display, etc.
│   ├── contexts/               # React context providers
│   ├── data/                   # Static content (*.data.ts)
│   ├── features/               # Small cross-cutting feature utils (minimal)
│   ├── fonts/                  # Local font files
│   ├── hooks/                  # Top-level React hooks
│   ├── lib/                    # Business logic, domain, infra, UI kit
│   │   ├── domain/             # Schemas, contracts, storage, fixtures
│   │   ├── services/           # Public web service facades + impl/
│   │   ├── supabase/           # Auth clients, middleware helpers
│   │   ├── ui/                 # Design system (formerly @relique/ui)
│   │   ├── legacy/             # Deprecated localStorage services
│   │   ├── actions/            # Command palette action registry
│   │   ├── email/              # Transactional email helpers
│   │   ├── observability/      # Error logging
│   │   └── validations/        # App-level Zod form schemas
│   └── mocks/                  # JSON fixtures for dev
├── supabase/                   # Database migrations + storage docs
│   └── migrations/             # 35 SQL migration files
├── public/                     # Static assets
├── docs/                       # Design system documentation
├── eslint-config/              # Shared ESLint presets
├── typescript-config/          # Shared TS configs
├── components.json             # shadcn CLI config
├── next.config.js              # Next.js config (image domains)
├── tailwind.config.ts          # Tailwind theme
├── tsconfig.json               # TS config (@/* → src/*)
└── package.json                # Single-app dependencies (Next 16, React 19)
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js routing layer — thin pages that delegate to feature modules or colocated components
- Contains: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `opengraph-image.tsx`, `route.ts` API handlers
- Key files: `src/app/layout.tsx` (root), `src/app/(site)/layout.tsx` (public shell), `src/app/admin/(portal)/layout.tsx` (admin shell), `src/middleware.ts` (re-exported from root as `src/middleware.ts`)

**`src/admin/{feature}/`:**
- Purpose: Vertical admin feature slices with full ownership of pages, components, services
- Contains: `pages/`, `components/`, `services/`, `hooks/`, `types.ts`, `schemas.ts`, `index.ts`
- Key files: `src/admin/crm/index.ts`, `src/admin/marketplace/index.ts`, `src/admin/dashboard/index.ts`

**`src/components/`:**
- Purpose: Shared presentation components for public site and cross-cutting admin UI
- Contains: Category folders (`cards/`, `forms/`, `filters/`, `shell/`, etc.)
- Key files: `src/components/shell/Header.tsx`, `src/components/forms/ConsignForm.tsx`, `src/components/admin/AdminPortalLayout.tsx`

**`src/lib/domain/`:**
- Purpose: Domain-driven shared layer — schemas, types, contracts, localStorage storage, fixtures
- Contains: `schemas/`, `types/`, `contracts/`, `storage/`, `fixtures/`
- Key files: `src/lib/domain/index.ts`, `src/lib/domain/contracts/result.ts`, `src/lib/domain/contracts/verify.contract.ts`

**`src/lib/services/`:**
- Purpose: Public-site service layer with contract interfaces and adapter implementations
- Contains: `contracts.ts`, `marketplaceService.ts` (facade), `api/` (HTTP clients), `impl/` (adapters)
- Key files: `src/lib/services/impl/index.ts`, `src/lib/services/impl/verify.supabase.ts`, `src/lib/services/impl/consign.supabase.ts`

**`src/lib/ui/`:**
- Purpose: Internal design system — buttons, form fields, tables, shadcn copies
- Contains: `buttons/`, `form/`, `table/`, `modules/`, `states/`, `primitives/`, `shadcn/ui/`
- Key files: `src/lib/ui/button.tsx`, `src/lib/ui/shadcn/ui/*`

**`src/lib/supabase/`:**
- Purpose: Supabase client factories and auth guards
- Contains: `server.ts`, `client.ts`, `middleware.ts`, `requireUser.ts`, `requireRole.ts`, `types.ts`
- Key files: `src/lib/supabase/server.ts` (`createClient`, `createServiceRoleClient`, `createAnonClient`)

**`supabase/migrations/`:**
- Purpose: PostgreSQL schema, RLS, storage buckets, RPC functions
- Contains: Numbered `.sql` files (`001_create_profiles.sql` through `035_optimize_public_browse_indexes.sql`)
- Key files: `supabase/MIGRATIONS.md`, `supabase/STORAGE_GUIDE.md`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout (fonts, metadata, toaster, command palette)
- `src/app/(site)/page.tsx`: Homepage (re-exports `(home)/HomeContent`)
- `src/middleware.ts`: Auth session refresh + admin route guard
- `src/app/admin/login/page.tsx`: Admin login page

**Configuration:**
- `package.json`: Dependencies, scripts (`dev` port 1300, `build`, `lint`, `check-types`)
- `tsconfig.json`: `@/*` → `./src/*` path alias
- `next.config.js`: Image remote patterns (Supabase storage, Unsplash)
- `tailwind.config.ts`: Theme tokens, animations
- `eslint.config.js`: ESLint 9 flat config
- `components.json`: shadcn CLI aliases (`@/components/ui`, `@/lib/utils`, `@/hooks`)
- `.env.example`: Environment variable template (do not commit `.env.local`)

**Core Logic:**
- `src/lib/domain/`: Shared schemas, contracts, storage
- `src/lib/services/`: Public web service facades
- `src/admin/*/services/`: Admin HTTP client services
- `src/app/api/`: All server-side business logic and Supabase access

**Static Content:**
- `src/data/*.data.ts`: Team, contact, partners, testimonials
- `src/lib/domain/fixtures/`: JSON presets for dev/content

**Deprecated (do not extend):**
- `src/lib/legacy/`: Old localStorage service implementations
- `src/lib/schemas/`: Re-exports marked `@deprecated` — use `@/lib/domain` instead
- `src/lib/services/verifyService.ts`, `consignService.ts`, `contentService.ts`: Legacy wrappers

**Testing:**
- Not detected — no `*.test.ts`, `*.spec.ts`, Vitest, Jest, or Playwright config

## Naming Conventions

**Files:**
- React components: PascalCase — `LeadsPage.tsx`, `ConsignForm.tsx`, `MarketplaceCard.tsx`
- Hooks: camelCase with `use` prefix — `useProfile.ts`, `useSearchHistory.ts`
- Services: camelCase with `Service` suffix — `leadsService.ts`, `marketplaceService.ts`
- Service implementations: `{domain}.local.ts` or `{domain}.supabase.ts` — `verify.supabase.ts`, `content.local.ts`
- Contracts: `{domain}.contract.ts` — `verify.contract.ts` in `src/lib/domain/contracts/`
- Zod schemas: `{Name}Schema` export, file by domain — `VerifyResultSchema` in `src/lib/domain/schemas/`
- App-level form schemas: `{domain}Schema` — `consignSchema` in `src/lib/validations/`
- Static content: `*.data.ts` — `team.data.ts`, `contact.data.ts` in `src/data/`
- API routes: Next.js convention — `route.ts` under `src/app/api/{resource}/`
- Feature barrel exports: `index.ts` — `src/admin/crm/index.ts`
- Utilities: camelCase — `utils.ts`, `marketplaceUtils.ts` in `src/lib/utils/`

**Directories:**
- Route groups: parentheses — `(site)`, `(home)`, `(portal)`
- Admin features: lowercase domain — `crm/`, `marketplace/`, `submissions/`
- Component categories: lowercase plural — `components/cards/`, `components/forms/`
- API namespaces: lowercase plural — `api/leads/`, `api/marketplace/`; public endpoints under `api/public/`

**Types & Exports:**
- PascalCase interfaces — `LeadsPageProps`, `MarketplaceListing`
- Zod-inferred types: `type X = z.infer<typeof XSchema>`
- Service interfaces prefixed with `I` — `IMarketplaceService`, `IVerifyService`
- Admin pages: `export default function LeadsPage` re-exported from route `page.tsx`
- Named exports preferred for components, hooks, utilities

## Where to Add New Code

**New Public Page:**
- Route: `src/app/(site)/{route}/page.tsx` (thin re-export or inline server component)
- Page-specific components: `src/app/(site)/{route}/components/` (colocated) or `src/components/` (shared)
- Layout inherited from `src/app/(site)/layout.tsx`

**New Admin Feature Page:**
- Feature page: `src/admin/{domain}/pages/{Name}Page.tsx`
- Route re-export: `src/app/admin/(portal)/{route}/page.tsx` → `export { default } from "@/admin/{domain}/pages/{Name}Page"`
- Components: `src/admin/{domain}/components/`
- Service: `src/admin/{domain}/services/{name}Service.ts` (fetch to `/api/...`)
- Barrel: add exports to `src/admin/{domain}/index.ts`

**New API Endpoint:**
- Route handler: `src/app/api/{resource}/route.ts` or `src/app/api/{resource}/[id]/route.ts`
- Public unauthenticated: place under `src/app/api/public/{resource}/route.ts`
- Use `requireUser()` + `requireRole()` for admin mutations; `createServiceRoleClient()` for DB access
- Inline Zod schema at top of file; map DB rows in colocated `utils.ts`

**New Domain Type/Schema:**
- Schema: `src/lib/domain/schemas/{domain}.ts`
- Contract: `src/lib/domain/contracts/{domain}.contract.ts`
- Re-export from `src/lib/domain/index.ts`

**New Public Service Adapter:**
- Contract: extend interface in `src/lib/domain/contracts/` or `src/lib/services/contracts.ts`
- Implementation: `src/lib/services/impl/{domain}.supabase.ts` or `{domain}.local.ts`
- Register in `src/lib/services/impl/index.ts`
- Facade (optional): `src/lib/services/{domain}Service.ts`

**New UI Component (shadcn rule):**
- Never edit `src/components/ui/**` directly
- Wrapper: `src/components/app/{Component}.tsx` or `src/components/shared/{Component}.tsx`
- Import base from `@/components/ui/...`
- Admin-specific shared UI: `src/components/admin/` or `src/lib/ui/`

**New Shared Hook:**
- Top-level hooks: `src/hooks/use{Name}.ts` (matches `components.json` alias)
- Admin feature hooks: `src/admin/{domain}/hooks/use{Name}.ts`
- Public lib hooks: `src/lib/hooks/use{Name}.ts`

**New Database Table/Policy:**
- Migration: `supabase/migrations/{NNN}_{description}.sql` (next sequential number)
- Update `src/lib/supabase/types.ts` (Database type) if needed
- Document in `supabase/MIGRATIONS.md`

**New Static Content:**
- Data file: `src/data/{topic}.data.ts`
- Fixture: `src/lib/domain/fixtures/{name}.json`

**Utilities:**
- General: `src/lib/utils.ts` or `src/lib/utils/{topic}.ts`
- Admin-specific: `src/lib/utils/admin.ts`
- Feature-specific: `src/admin/{domain}/utils/`

## Special Directories

**`src/components/ui/`:**
- Purpose: shadcn/ui primitives installed via CLI
- Generated: Via `npx shadcn@latest add`
- Committed: Yes — but protected by shadcn-guard rule (wrap, don't edit)

**`src/lib/ui/shadcn/ui/`:**
- Purpose: Copy of shadcn primitives inside design system package (inlined from `@relique/ui`)
- Committed: Yes

**`src/lib/legacy/`:**
- Purpose: Deprecated localStorage-based services during Supabase migration
- Committed: Yes — marked `@deprecated`, do not extend

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Via `npm install`
- Committed: No

**`.next/`:**
- Purpose: Next.js build output
- Generated: Via `npm run build`
- Committed: No

**`.planning/`:**
- Purpose: GSD planning artifacts and codebase intelligence
- Committed: Typically yes for project docs

**`eslint-config/` and `typescript-config/`:**
- Purpose: Shared config presets (remnant from former monorepo; still extended by root `tsconfig.json` and `eslint.config.js`)
- Committed: Yes

---

*Structure analysis: 2026-06-14*
