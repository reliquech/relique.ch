# Phase 6: Flat Root App & npm Simplify — Summary

**Completed:** 2026-06-14
**Mode:** autonomous (execute inline)

## Delivered

- Flattened `apps/web` → root `src/`, `public/`, `supabase/`
- Inlined `packages/shared` → `src/lib/domain`, `packages/ui` → `src/lib/ui`
- Single root `package.json` with **npm** scripts (`dev`, `build`, `check-types`)
- Removed `apps/`, `packages/`, `relique-marketplace/`, `turbo.json`, `pnpm-workspace.yaml`
- Codemod `@relique/shared` → `@/lib/shared` / `@/lib/domain`, `@relique/ui` → `@/lib/ui`
- Build gate: `npm run check-types` + `npm run build` PASS

## Deferred to later phases

- Phase 3: Security hardening
- Phase 4: Schema dedup, @ts-expect-error cleanup (partially touched during type fixes)
- Phase 5: Admin UX redesign
