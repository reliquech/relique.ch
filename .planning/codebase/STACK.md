# Technology Stack

**Analysis Date:** 2026-06-14

## Languages

**Primary:**
- TypeScript 5.9.2 — All application code under `src/` (App Router pages, admin features, API routes, domain layer, UI library)
- TSX/JSX — React components across `src/app/`, `src/components/`, `src/admin/`, `src/lib/ui/`

**Secondary:**
- SQL — Supabase/PostgreSQL migrations in `supabase/migrations/*.sql` (35 files)
- JavaScript — Config files: `next.config.js`, `eslint.config.js`, `postcss.config.js`, `eslint-config/*.js`
- JSON — Domain fixtures in `src/lib/domain/fixtures/`, mock data in `src/mocks/`

## Runtime

**Environment:**
- Node.js >=20 (declared in root `package.json` `engines`)
- Browser — Client components, React contexts, selective localStorage persistence
- Next.js Edge Runtime — `src/app/opengraph-image.tsx` (`export const runtime = 'edge'`)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)
- Root scripts run directly against the flat app (no Turborepo, no `pnpm-workspace.yaml`)

## Frameworks

**Core:**
- Next.js ^16.1.0 — Unified full-stack app (public site + `/admin` portal + `/api/*` BFF), App Router, dev port 1300
- React ^19.2.0 — UI rendering
- React DOM ^19.2.0 — Client hydration

**Testing:**
- Not detected — No Jest, Vitest, Playwright, or Cypress config or committed test files

**Build/Dev:**
- TypeScript 5.9.2 — Strict mode via `typescript-config/base.json` (`strict: true`, `noUncheckedIndexedAccess: true`)
- ESLint 9 (flat config) — Root `eslint.config.js` extends `eslint-config/next.js`
- Prettier ^3.7.4 — Root `format` script; no committed `.prettierrc`
- PostCSS + Autoprefixer — `postcss.config.js`
- Tailwind CSS ^3.4.17 — `tailwind.config.ts` with `tailwindcss-animate`
- shadcn/ui pattern — Radix UI primitives + Tailwind; config in `components.json`

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` ^2.90.1 — Database, auth, storage (clients in `src/lib/supabase/`)
- `@supabase/ssr` ^0.8.0 — Cookie-based Supabase sessions (`server.ts`, `middleware.ts`, `client.ts`)
- `zod` ^4.3.2 — Validation in API routes, forms, and `src/lib/domain/schemas/`
- `react-hook-form` ^7.69.0 + `@hookform/resolvers` ^5.2.2 — Form state management
- `next` ^16.1.0 — Framework, Route Handlers, OG image generation (`next/og`)

**UI & Interaction:**
- `@radix-ui/react-*` — Accordion, dialog, dropdown, select, tabs, etc. (shadcn primitives in `src/components/ui/`)
- `class-variance-authority`, `clsx`, `tailwind-merge` — Variants and class merging (`src/lib/utils.ts`)
- `lucide-react` ^0.468.0 — Icons
- `framer-motion` ^12.25.0 / `motion` ^12.27.1 — Animations (`src/lib/motion-variants.ts`)
- `next-themes` ^0.4.6 — Theme switching
- `sonner` ^2.0.7 — Toast notifications
- `@tanstack/react-table` ^8.21.3 — Admin data tables
- `recharts` ^3.6.0 — Admin dashboard charts
- `@dnd-kit/core` ^6.3.1 + `@dnd-kit/utilities` ^3.2.2 — Drag-and-drop (marketplace carousel)
- `cmdk` ^1.1.1 — Command palette (`src/components/command/CommandPalette.tsx`)

**Infrastructure & Observability:**
- `@vercel/speed-insights` ^1.3.1 — Performance monitoring in `src/app/(site)/layout.tsx`
- `sharp` ^0.34.5 — Next.js image optimization (devDependency)
- `@resvg/resvg-js` ^2.6.2 — SVG rasterization (devDependency; no current imports in `src/`)

**Inlined Workspace Packages (formerly monorepo):**
- Domain layer — `src/lib/domain/` (schemas, types, contracts, storage helpers, fixtures)
- UI library — `src/lib/ui/` (buttons, form fields, shadcn copies, modules, states, primitives)
- Shared configs — `eslint-config/`, `typescript-config/` at repo root

## Configuration

**Environment:**
- `.env.example` — Template for required/optional vars (copy to `.env.local`)
- `.env.local` — Local secrets (not committed)
- Key configs required for production:
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (email flows)
  - `OPENAI_API_KEY` (optional — admin AI image generation)
  - `OPERATOR_EMAIL` or `RESEND_OPERATOR_TO` (optional — operator notifications)
  - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (optional — SEO)

**Build:**
- `next.config.js` — Image remote patterns (Supabase storage, picsum, unsplash)
- `tsconfig.json` — Extends `typescript-config/nextjs.json`; path alias `@/*` → `./src/*`
- `tailwind.config.ts` — Content paths for `src/app`, `src/components`, `src/admin`, `src/lib/ui`
- `components.json` — shadcn aliases (`@/components`, `@/lib/utils`, `@/components/ui`)
- `eslint.config.js` — Re-exports `eslint-config/next.js`
- `postcss.config.js` — Tailwind + Autoprefixer

**Database:**
- Migrations: `supabase/migrations/` (manual apply or Supabase CLI)
- Docs: `supabase/MIGRATIONS.md`, `supabase/STORAGE_GUIDE.md`, `supabase/MIGRATION_MANIFEST.md`
- Generated types: `src/lib/supabase/types.ts`

## Platform Requirements

**Development:**
- Node.js 20+
- npm
- Supabase project credentials for marketplace, CRM, auth, and storage features
- Resend API key for email features
- OpenAI API key for admin marketplace AI image generation (`src/app/api/marketplace/agent-create/route.ts`)

**Production:**
- Deployment target: Vercel (Next.js; no committed `vercel.json` detected)
- Default public URL: `https://relique.ch` (fallback in `src/lib/metadata.ts`, `src/app/layout.tsx`)
- Dev server: `npm run dev` → port 1300
- Health check: `GET /api/health` (`src/app/api/health/route.ts`)

**Quality gate scripts (root `package.json`):**
```bash
npm run lint          # eslint --max-warnings 0
npm run check-types   # next typegen && tsc --noEmit
npm run build         # next build
npm run format        # prettier --write
```

---

*Stack analysis: 2026-06-14*
