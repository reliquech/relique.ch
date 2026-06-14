# Technology Stack

**Analysis Date:** 2026-06-14

## Languages

**Primary:**
- TypeScript 5.9.2 — All application code in `apps/web/`, `apps/admin/`, `packages/shared/`, `packages/ui/`
- TSX/JSX — React components across Next.js apps and `@relique/ui`

**Secondary:**
- SQL — Supabase/PostgreSQL migrations in `apps/admin/supabase/migrations/*.sql`
- JavaScript — Config files: `apps/web/next.config.js`, `apps/admin/next.config.js`, `packages/eslint-config/*.js`
- JSON — Fixtures and schemas in `packages/shared/src/domain/fixtures/`

## Runtime

**Environment:**
- Node.js >=18 (declared in root `package.json` `engines`)
- Browser (client components, localStorage persistence in web app)

**Package Manager:**
- pnpm 10.28.1 (declared via `packageManager` in root `package.json`)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Next.js 16.1.0 — `apps/web/` (public site, port 1300) and `apps/admin/` (CRM dashboard, port 3600), App Router
- React 19.2.x — UI rendering in both Next.js apps and `@relique/ui`
- Turborepo 2.7.5 — Monorepo task orchestration via `turbo.json`

**Standalone (outside pnpm workspace):**
- Vite 6.2.0 + `@vitejs/plugin-react` — `relique-marketplace/` prototype app (port 3000, not listed in `pnpm-workspace.yaml`)

**Testing:**
- Not detected — No Jest, Vitest, Playwright, or Cypress config or test files in repo

**Build/Dev:**
- Turbo — `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm typecheck` from root `package.json`
- TypeScript project references — Root `tsconfig.json` references `packages/shared`, `packages/ui`, `apps/web`, `apps/admin`
- ESLint 9 (flat config) — Per-app configs: `apps/web/eslint.config.js`, `apps/admin/eslint.config.js`, shared presets in `packages/eslint-config/`
- Prettier 3.7.4 — Root `format` script; no committed `.prettierrc` file detected
- PostCSS + Autoprefixer — `apps/web/postcss.config.js`, `apps/admin/postcss.config.js`
- Tailwind CSS 3.4.17 — `apps/web/tailwind.config.ts`, `apps/admin/tailwind.config.ts`
- tailwindcss-animate 1.0.7 — Animation utilities for shadcn/ui

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` ^2.90.1 — Database, auth, storage client (`apps/admin/src/lib/supabase/`, `apps/web/src/lib/supabase/`)
- `@supabase/ssr` ^0.8.0 — Cookie-based Supabase sessions in admin (`apps/admin/src/lib/supabase/server.ts`, `middleware.ts`)
- `zod` ^4.3.2 — Validation in API routes, forms, and `@relique/shared` schemas
- `react-hook-form` ^7.69.0 + `@hookform/resolvers` ^5.2.2 — Form state management
- `@relique/shared` (workspace) — Domain types, Zod schemas, contracts, localStorage helpers (`packages/shared/`)
- `@relique/ui` (workspace) — Shared shadcn-based component library (`packages/ui/`)

**UI & Styling:**
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

**Infrastructure / Platform:**
- `@vercel/speed-insights` ^1.3.1 — Performance monitoring in `apps/web/src/app/layout.tsx`
- `sharp` ^0.34.5 — Next.js image optimization (web devDependency)
- `@resvg/resvg-js` ^2.6.2 — SVG rasterization for OG image generation (web devDependency, referenced in `apps/web/src/lib/og/`)

## Configuration

**Environment:**
- Per-app `.env.local` files (not committed; no `.env.example` files found in repo)
- Turbo build reads `.env*` files (`turbo.json` `build.inputs`)
- Web app env vars documented in `apps/web/README.md`: `NEXT_PUBLIC_SITE_URL`, Supabase keys
- Admin env vars documented in `apps/admin/README.md`: Supabase keys, Resend, OpenAI

**Build:**
- Root: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`
- Next.js: `apps/web/next.config.js`, `apps/admin/next.config.js` — both transpile `@relique/shared` and `@relique/ui`, enable `experimental.externalDir`
- TypeScript presets: `packages/typescript-config/base.json`, `nextjs.json`, `react-library.json`
- ESLint presets: `packages/eslint-config/base.js`, `next.js`, `react-internal.js`, `boundaries.js`
- Vercel deploy: `apps/web/vercel.json`, `apps/admin/vercel.json` — monorepo build commands with `--filter`

**Path Aliases:**
- `@/*` → `./src/*` in both apps (`apps/web/tsconfig.json`, `apps/admin/tsconfig.json`)
- `@relique/shared` exports: `.`, `./domain`, `./config` (`packages/shared/package.json`)
- `@relique/ui` granular exports: `./ui/*`, `./buttons/*`, `./form/*`, etc. (`packages/ui/package.json`)

## Platform Requirements

**Development:**
- Node.js 18+
- pnpm 10.x (recommended; enforced via `packageManager` field)
- Supabase project credentials for admin and web marketplace features
- Resend API key for admin email features
- OpenAI API key for admin AI image generation (`apps/admin/src/app/api/marketplace/agent-create/route.ts`)

**Production:**
- Deployment target: Vercel (Next.js framework, per-app `vercel.json`)
- Web: `https://relique.ch` (default in `apps/web/src/lib/metadata.ts`)
- Admin: separate Vercel project, port 3600 in production start script
- Supabase hosted PostgreSQL + Auth + Storage (migrations in `apps/admin/supabase/migrations/`)
- Database migrations must be applied manually or via Supabase CLI (`apps/admin/supabase/STORAGE_GUIDE.md`)

---

*Stack analysis: 2026-06-14*
