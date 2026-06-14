# Testing Patterns

**Analysis Date:** 2026-06-14

## Test Framework

**Runner:**
- Not detected — no Vitest, Jest, Mocha, or other test runner in any `package.json`
- No `vitest.config.*`, `jest.config.*`, or `playwright.config.*` files in the repository

**Assertion Library:**
- Not applicable — no tests exist

**Run Commands:**
```bash
pnpm check          # lint + typecheck + build (root package.json) — closest to CI validation
pnpm lint           # ESLint across monorepo via turbo
pnpm typecheck      # tsc --build (root tsconfig project references)
pnpm build          # turbo run build (all apps/packages)
```

Per-app validation (no tests):
```bash
pnpm --filter web check-types     # next typegen && tsc --noEmit
pnpm --filter admin check-types   # next typegen && tsc --noEmit
pnpm --filter web lint            # eslint --max-warnings 0
pnpm --filter admin lint          # eslint --max-warnings 0
```

## Test File Organization

**Location:**
- Not applicable — zero `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` files found
- No `__tests__/` directories
- No `tests/` or `e2e/` directories in the active monorepo workspace (`apps/*`, `packages/*`)

**Naming:**
- No established convention — no test files to infer from

**Structure:**
```
# Current state (no test directories)
relique.co/
├── apps/web/src/          # application code only
├── apps/admin/src/        # application code only
├── packages/shared/src/   # domain code only
└── packages/ui/src/       # component library only
```

**Note:** `relique-marketplace/` exists at repo root but is outside `pnpm-workspace.yaml` (`packages: apps/*, packages/*`) and contains no tests.

## Test Structure

**Suite Organization:**
- Not applicable — no test suites exist

**Patterns:**
- No setup/teardown patterns established
- No assertion patterns established

## Mocking

**Framework:** Not detected

**Patterns:**
- No mocking utilities or patterns in codebase
- Development mocking is done via:
  - LocalStorage adapters: `apps/web/src/lib/services/impl/*.local.ts`
  - Fixture data: `packages/shared/src/domain/fixtures/index.ts`
  - Deterministic verify mapping: `DEFAULT_VERIFY_MAPPING` in `apps/web/src/lib/services/impl/verify.local.ts`

**What to Mock (recommended when adding tests):**
- Supabase client — used in `apps/web/src/lib/supabase/server.ts`, `apps/admin/src/lib/supabase/server.ts`, all `app/api/*` routes
- `fetch` — admin client services in `apps/admin/src/features/*/services/*.ts` call internal `/api/*` endpoints
- `localStorage` — domain storage in `packages/shared/src/domain/storage/` (already guards `typeof window`)
- Next.js modules — `next/navigation`, `next/server` for route/hook tests

**What NOT to Mock:**
- Pure utilities — `packages/shared/src/domain/contracts/result.ts` helpers, `apps/web/src/lib/utils.ts` `cn()`
- Zod schemas — test validation directly against `packages/shared/src/domain/schemas/*`

## Fixtures and Factories

**Test Data:**
- Domain fixtures exist for development, not testing:
```typescript
// packages/shared/src/domain/fixtures/index.ts
// Exported via packages/shared/src/domain/index.ts
```
- Static content fixtures: `apps/web/src/data/*.data.ts` — `team.data.ts`, `contact.data.ts`, `press.data.ts`
- Verify mapping defaults: inline in `apps/web/src/lib/services/impl/verify.local.ts`

**Location:**
- Shared domain fixtures: `packages/shared/src/domain/fixtures/`
- App static data: `apps/web/src/data/`
- No dedicated `__fixtures__` or `test-utils` directories

## Coverage

**Requirements:** None enforced — no coverage tooling configured

**View Coverage:**
```bash
# Not available — no test runner configured
```

**Current validation substitutes:**
- TypeScript strict mode + project references (`tsconfig.json` root references all packages)
- ESLint with `--max-warnings 0` on apps
- Turbo `check` script: lint → typecheck → build
- No pre-commit hooks (no husky, lint-staged, or commitlint detected)

## Test Types

**Unit Tests:**
- Not used
- High-value candidates when introducing tests:
  - `packages/shared/src/domain/contracts/result.ts` — ok/err/unwrap helpers
  - `packages/shared/src/domain/schemas/*.ts` — Zod validation edge cases
  - `packages/shared/src/domain/storage/*.ts` — cap/prune logic
  - `apps/web/src/lib/validation.ts` — field validators
  - `apps/web/src/app/api/marketplace/utils.ts` — `mapRowToListing` transforms

**Integration Tests:**
- Not used
- High-value candidates:
  - Admin API routes — `apps/admin/src/app/api/leads/route.ts`, `deals/route.ts` (auth + Zod + Supabase)
  - Web marketplace API — `apps/web/src/app/api/marketplace/route.ts`

**E2E Tests:**
- Not used — no Playwright, Cypress, or similar in dependencies
- `@playwright/test` not in any workspace package
- Manual verification implied by dev scripts: `pnpm dev:web` (port 1300), `pnpm dev:admin` (port 3600)

## Common Patterns

**Async Testing:**
- Not established in codebase
- Recommended when adding Vitest:
```typescript
import { describe, it, expect } from "vitest";

describe("verifyByCode", () => {
  it("returns validation error for empty code", async () => {
    const result = await verifyServiceLocal.verifyByCode({ inputType: "code", code: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });
});
```

**Error Testing:**
- Domain layer uses Result pattern — assert `result.ok === false` and check `result.error.code`
- API routes return `{ error: string }` JSON — assert status + body shape
- Legacy services throw — use `expect(() => ...).toThrow()` only for deprecated wrappers

## Recommended Setup (not yet implemented)

When adding tests to this monorepo, align with existing tooling:

| Concern | Recommendation |
|---------|----------------|
| Runner | Vitest (ESM-native, matches `"type": "module"`) |
| React component tests | `@testing-library/react` + jsdom |
| API route tests | Vitest with mocked `@/lib/supabase/server` |
| E2E | Playwright (separate config per app or root) |
| Config location | `vitest.config.ts` per package or shared root config |
| Turbo task | Add `"test": { "dependsOn": ["^test"] }` to `turbo.json` |
| CI | Extend `pnpm check` or add `pnpm test` |

**Suggested first test locations:**
1. `packages/shared` — pure domain logic, no React/Next deps, fastest to test
2. `apps/web/src/lib/validation.ts` — isolated pure functions
3. `apps/admin/src/app/api/` — route handlers with mocked Supabase

## Existing Quality Gates (non-test)

These are the current automated checks that substitute for test coverage:

| Gate | Command | Scope |
|------|---------|-------|
| Lint | `pnpm lint` | All packages via turbo |
| Types | `pnpm typecheck` | Project references build |
| Build | `pnpm build` | Next.js apps + packages compile |
| Full check | `pnpm check` | lint + typecheck + build |

**Turbo tasks** (`turbo.json`): `build`, `lint`, `check-types`, `typecheck`, `dev`, `start` — no `test` task.

---

*Testing analysis: 2026-06-14*
