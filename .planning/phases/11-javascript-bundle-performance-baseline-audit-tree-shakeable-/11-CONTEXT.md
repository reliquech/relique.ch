# Phase 11 Context

**Source:** `/gsd-add-phase` user specification (2026-06-14)

## Role

Act as senior web-performance engineer. Optimize JavaScript loading **without** changing UI, features, API behavior, or business logic.

## Constraints (hard)

- No UI/feature/API/business-logic changes
- Do not delete uncertain dependencies
- Small, reversible, production-safe patches
- Inspect existing code before editing

## Stack (detect at plan time)

- Next.js 16 App Router (single app at repo root `src/`)
- npm (post Phase 6 flatten — no Turbo monorepo for web)
- TypeScript, Tailwind, shadcn/ui wrapper pattern
- Quality gate: lint + typecheck + build (no Vitest/Playwright in v1)

## Workstreams

### 1. Baseline

- Run production build
- Record bundle sizes, route chunks, build warnings
- Use framework bundle analyzer when available (`@next/bundle-analyzer` or equivalent)

### 2. Audit

Find and document:

- Unused dependencies, duplicate packages, heavy libraries
- Barrel imports, oversized client components
- Unnecessary `"use client"`, global imports
- Blocking third-party scripts, code loaded before needed
- Server-only vs client-only boundary violations
- Candidates for route splitting, `dynamic()`, lazy loading

### 3. Implement

- Remove **only confirmed-unused** code/deps
- Replace broad imports with tree-shakeable direct imports
- Move server-safe logic out of client bundles
- `dynamic()` for heavy below-fold, modals, editors, charts, maps, optional tools
- Third-party libs on trigger only
- Preserve SSR where useful; `ssr: false` only for browser-only code
- Lightweight loading fallbacks where required
- No premature/cosmetic refactors

### 4. Validate

- typecheck, lint, production build
- No broken routes, hydration errors, console errors, functional regressions
- Before/after bundle size comparison

### 5. Deliverables

- Findings ranked by impact
- Files changed + reason
- Before/after metrics
- Remaining risks + recommended next optimizations

## Depends on

Phase 10 (admin restructure complete — stable import paths for audit)

## Likely high-impact areas (hypothesis — verify in research)

- `framer-motion` / `motion` usage on public pages
- Admin CRM pages (`"use client"` + table/chart bundles)
- `recharts` on dashboard (admin-only — dynamic import candidate)
- `@relique/ui` / barrel imports if still referenced
- `lucide-react` icon import patterns
- Root layout providers and third-party scripts (`@vercel/speed-insights`)
