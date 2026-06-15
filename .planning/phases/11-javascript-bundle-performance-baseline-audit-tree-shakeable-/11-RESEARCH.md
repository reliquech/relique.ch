# Phase 11: JavaScript Bundle Performance — Research

**Researched:** 2026-06-14  
**Domain:** Next.js 16 App Router client bundle optimization  
**Confidence:** HIGH

## Summary

Relique is a **single Next.js 16.1 app** at repo root (`src/`, `npm run build`). No Turborepo workspace for web. Quality gate is **lint + typecheck + build** — no Vitest/Playwright.

**Primary bundle leaks identified:**

| Finding | Impact | Evidence |
|---------|--------|----------|
| `CommandPalette` in root `layout.tsx` | **HIGH** — loads `cmdk`, Dialog, `actionRegistry` on **every** route (public + admin login) | `src/app/layout.tsx` lines 6, 134 |
| `framer-motion` on 40+ files | **HIGH** — ~50–80kB+ gzip across public home, cards, buttons | 43 files import `framer-motion` |
| `recharts` on admin dashboard only | **MEDIUM** — chart lib in `/admin` route chunk | `DashboardPage.tsx` direct import |
| Duplicate `motion` npm package | **LOW** — unused, `framer-motion` used everywhere | `package.json` has both; 0 `from "motion"` imports |
| Zero `next/dynamic` usage | **OPPORTUNITY** — no code-splitting pattern in repo yet | ripgrep: 0 matches |
| Dead import `TestimonialsSection` | **LOW** — tree-shaken but signals audit gap | `HomeContent.tsx` imports, never renders |
| `CompareDrawer` + `CurrencyProvider` | **OK** — scoped to `(site)/layout.tsx` only | Not in root layout |
| `SpeedInsights` | **OK** — lightweight, site layout only | `@vercel/speed-insights/next` |

**Primary recommendation:** Baseline with `@next/bundle-analyzer`, fix root-layout `CommandPalette` leak first, then `next/dynamic` for below-fold home sections and admin recharts, remove confirmed-unused `motion` dep, gate with `phase11:gate` comparing `.next` chunk sizes to baseline.

## Stack & Tooling

| Item | Value |
|------|-------|
| Framework | Next.js 16.1 App Router |
| Build | `npm run build` (Turbopack in dev; webpack/turbopack build per Next 16) |
| Analyzer | `@next/bundle-analyzer` — wrap `next.config.js`, `ANALYZE=true npm run build` |
| Client boundaries | 200+ `"use client"` files — audit scope, not bulk removal |
| Icons | `lucide-react` named imports — already tree-shakeable; low priority |

## Standard Stack

### Core

| Library | Purpose | When to Use |
|---------|---------|-------------|
| `next/dynamic` | Route/component code splitting | Below-fold sections, modals, charts, admin-only widgets |
| `@next/bundle-analyzer` | Visual + JSON bundle report | Baseline + post-optimization compare |
| `React.lazy` + `Suspense` | Alternative to dynamic | Prefer `next/dynamic` for App Router pages |

### Supporting

| Library | Purpose | When to Use |
|---------|---------|-------------|
| `scripts/phase11-bundle-report.mjs` | Parse `.next/static/chunks` sizes | Automated before/after without analyzer UI |
| `loading.tsx` / inline skeletons | Dynamic import fallbacks | Match existing `AdminLoadingState` / section min-height |

## Architecture Patterns

### Pattern 1: Admin-only widgets out of root layout

**What:** Move `CommandPalette` from `src/app/layout.tsx` → `AdminPortalLayout` (admin `(portal)` routes only).  
**When:** Any admin-only interactive shell (cmdk, action registry).  
**Example:** Public `/`, `/marketplace` must not load `cmdk` or `initializeActions`.

### Pattern 2: Server page + dynamic client sections

**What:** Keep `HomeContent.tsx` as Server Component; `dynamic()` import below-fold sections with `ssr: true`.  
**When:** Client components pull heavy deps (framer-motion) and are not LCP-critical.  
**Example:** `TeamSection`, `PressCoverageSection` — lazy after `WhySection` / `MarketplaceSection`.

### Pattern 3: Extract + dynamic heavy chart

**What:** Extract recharts JSX to `DashboardRevenueChart.tsx`; dynamic import in `DashboardPage.tsx` with skeleton.  
**When:** Single route uses heavy viz lib.  
**Example:** Admin dashboard only — does not affect public bundles.

## Anti-Patterns to Avoid

### ❌ Removing `"use client"` without server alternative

**Why bad:** Breaks hooks/events; causes build errors or hydration bugs.  
**Instead:** Split server wrapper + dynamic client child.

### ❌ `ssr: false` on SEO-critical content

**Why bad:** Home/marketing sections lose SSR HTML.  
**Instead:** Default `ssr: true` for content sections; `ssr: false` only for browser-only widgets (maps, QR scanner).

### ❌ Deleting dependencies without import proof

**Why bad:** Transitive use or dynamic import paths missed.  
**Instead:** `rg` zero matches + `npm run build` before `npm uninstall`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bundle size measurement | Custom webpack plugins | `@next/bundle-analyzer` + chunk size script | Maintained for Next |
| Lazy loading | Manual script tags | `next/dynamic` | Integrates with RSC boundaries |

## Common Pitfalls

### Pitfall 1: Optimizing lucide before layout leaks

**What goes wrong:** Small icon savings while cmdk loads on homepage.  
**Prevention:** Fix root layout scope first (Plan 11-02).

### Pitfall 2: Dynamic import breaks named exports

**What goes wrong:** `dynamic(() => import('./Foo'))` when export is named.  
**Prevention:** `.then(m => ({ default: m.Foo }))` pattern in plan tasks.

## Validation Architecture

| Req ID | Behavior | Test Type | Command |
|--------|----------|-----------|---------|
| PERF-11-01 | Baseline metrics captured | artifact | `11-BASELINE.md` exists with chunk table |
| PERF-11-02 | No behavior change | manual + build | Smoke routes + `npm run build` |
| PERF-11-03 | Bundle size reduced vs baseline | script | `npm run phase11:bundle-compare` |
| PERF-11-04 | Quality gate | composite | `npm run phase11:gate` |

## Open Questions

**All resolved for planning:**

1. **Bundle analyzer package?** → `@next/bundle-analyzer` (devDependency)  
2. **CommandPalette scope?** → Admin portal layout only  
3. **Remove `motion` package?** → Yes if zero imports after audit  
4. **Home LCP sections?** → Keep `HeroSection`, `WhySection`, `MarketplaceSection` static; lazy rest  

## Sources

### Primary (HIGH confidence)

- Codebase grep: `framer-motion`, `recharts`, `cmdk`, `next/dynamic`, `CommandPalette`  
- `package.json` dependencies  
- `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `HomeContent.tsx`

### Secondary (MEDIUM confidence)

- Next.js 16 `@next/bundle-analyzer` docs — standard wrap pattern for `next.config.js`

## RESEARCH COMPLETE
