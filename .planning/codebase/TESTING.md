# Testing Patterns

**Analysis Date:** 2026-06-14

## Test Framework

**Runner:**
- Not detected — no Jest, Vitest, Playwright, or Cypress configuration in the repository
- No test runner scripts in root `package.json` (`dev`, `build`, `lint`, `check-types`, `format` only)
- `@playwright/test` appears as an optional peer dependency of Next.js in `package-lock.json` but is not installed or configured

**Assertion Library:**
- Not applicable — no test files exist

**Run Commands:**
```bash
pnpm lint          # ESLint with --max-warnings 0
pnpm check-types   # next typegen && tsc --noEmit
pnpm build         # next build (production compile gate)
pnpm format        # Prettier write (not a test)
```

There is no `pnpm test`, `pnpm test:watch`, or coverage command.

## Test File Organization

**Location:**
- Not detected — zero files matching `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- No `__tests__/` directories under `src/` or elsewhere
- No co-located test files alongside components or services

**Naming:**
- No established convention — recommend co-located `{ComponentName}.test.tsx` or `{serviceName}.test.ts` when tests are added

**Structure:**
```
# Current state: no test directories

# Recommended when adding tests:
src/
├── components/shared/EmptyState.tsx
├── components/shared/EmptyState.test.tsx   # co-located unit test
├── lib/domain/contracts/result.ts
├── lib/domain/contracts/result.test.ts     # pure logic unit test
└── app/api/deals/route.ts
    └── (integration tests in __tests__/ or separate e2e/ folder)
```

## Test Structure

**Suite Organization:**
- Not applicable — no existing test suites

**Recommended patterns for this codebase:**

Pure domain logic (highest ROI, no mocks needed):
```typescript
// src/lib/domain/contracts/result.test.ts (recommended)
import { describe, it, expect } from "vitest";
import { ok, err, isOk, unwrapOr } from "./result";

describe("unwrapOr", () => {
  it("returns data when ok", () => {
    expect(unwrapOr(ok(42), 0)).toBe(42);
  });

  it("returns default when err", () => {
    expect(unwrapOr(err({ type: "UnknownError", code: "UNKNOWN_ERROR", message: "x", retryable: false }), 0)).toBe(0);
  });
});
```

API route handler (requires Supabase mock):
```typescript
// Pattern to follow when adding route tests
import { describe, it, expect, vi } from "vitest";

describe("GET /api/deals", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mock("@/lib/supabase/requireUser", () => ({
      requireUser: vi.fn().mockResolvedValue({
        user: null,
        response: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
      }),
    }));
    // import handler after mock, invoke with NextRequest stub
  });
});
```

**Patterns:**
- Setup: mock `@/lib/supabase/server`, `requireUser`, `requireRole` at module boundary for API tests
- Teardown: reset mocks between tests (`vi.clearAllMocks()`)
- Assertion: prefer testing `Result.ok` branches and HTTP status codes over snapshotting full JSON payloads

## Mocking

**Framework:**
- Not detected — recommend Vitest (`vi.mock`, `vi.fn`) for unit/integration tests aligned with Vite/ESM and TypeScript 5.9

**Patterns:**
```typescript
// Supabase client mock (most common need for API route tests)
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    })),
  })),
  createClient: vi.fn(),
}));

// Fetch mock for admin client services
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ items: [], total: 0 }),
});
```

**What to Mock:**
- Supabase clients (`createClient`, `createServiceRoleClient`, `createAnonClient`) in `src/lib/supabase/server.ts`
- Auth guards (`requireUser`, `requireRole`) in API route tests
- `fetch` for admin feature services in `src/admin/*/services/*.ts`
- `localStorage` / `window` when testing `src/lib/domain/storage/*` helpers (guard `typeof window === "undefined"` already exists)
- External APIs: OpenAI calls in `src/app/api/marketplace/agent-create/route.ts`, Resend in email routes

**What NOT to Mock:**
- Pure functions: `src/lib/domain/contracts/result.ts`, `errors.ts`, Zod schemas in `src/lib/domain/schemas/`
- `cn()` and other trivial utilities in `src/lib/utils.ts`
- Zod validation logic — test with real schema `.safeParse()` inputs

## Fixtures and Factories

**Test Data:**
- Domain fixtures already exist for manual/dev use — `src/lib/domain/fixtures/` (`marketplace.json`, `posts.json`, `events.json`, presets in `fixtures/presets/`)
- Mock JSON for marketplace detail — `src/mocks/marketplace_detail.json`
- Admin types reference — `src/lib/types/admin.ts` for shape of CRM entities

**Location:**
- Reuse `src/lib/domain/fixtures/` for test seed data rather than duplicating
- Add `src/lib/domain/fixtures/__tests__/` or colocated factories only when test suite is introduced

**Recommended factory pattern:**
```typescript
// src/lib/domain/fixtures/factories/deal.ts (recommended when tests added)
import type { Deal } from "@/lib/types/admin";

export function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Test Deal",
    status: "open",
    value: 1000,
    currency: "USD",
    probability: 50,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
```

## Coverage

**Requirements:**
- None enforced — project quality gate is lint + typecheck + build only (documented in `CLAUDE.md` / GSD project constraints)
- No coverage thresholds, no CI coverage reporting

**View Coverage:**
```bash
# Not available today. When Vitest is added:
# pnpm vitest run --coverage
```

## Test Types

**Unit Tests:**
- Not used
- **Recommended scope:** `src/lib/domain/` (Result, errors, Zod schemas), `src/lib/validation.ts`, pure mappers in `src/app/api/marketplace/utils.ts`, `marketplaceUtils.ts`

**Integration Tests:**
- Not used
- **Recommended scope:** Next.js Route Handlers in `src/app/api/` with mocked Supabase — auth guards, Zod body parsing, error status codes
- ~50+ API routes under `src/app/api/` with no automated coverage

**E2E Tests:**
- Not used
- **Recommended scope (if added):** Playwright via Next.js optional peer — critical flows: admin login (`src/app/admin/login/page.tsx`), marketplace browse, public verify (`src/app/api/public/verify/route.ts`), consign submit
- Browser MCP / manual UAT referenced in GSD workflow; no committed E2E suite

## Common Patterns

**Async Testing:**
- Not applicable in codebase
- Admin services use async `fetch` — test with `await expect(fn()).rejects.toThrow(...)` or resolved JSON
- Domain services return `Result` — assert `result.ok` synchronously after `await`

**Error Testing:**
```typescript
// Recommended for Result-based services
const result = await verifyServiceSupabase.verifyByCode({ inputType: "code", code: "INVALID" });
expect(result.ok).toBe(false);
if (!result.ok) {
  expect(result.error.code).toBe("NOT_FOUND");
}

// Recommended for API routes
const response = await GET(mockRequest);
expect(response.status).toBe(401);
```

**Form Testing:**
- Not applicable
- Forms use `react-hook-form` + Zod — recommend `@testing-library/react` with `userEvent` when component tests are added
- Validation messages defined in schemas — test schema directly before mounting full form

## Manual Verification (Current Practice)

The project relies on manual and conversational verification instead of automated tests:

| Check | Command / Action |
|-------|------------------|
| Lint | `pnpm lint` |
| Types | `pnpm check-types` |
| Build | `pnpm build` |
| Local dev | `pnpm dev` (port 1300) |
| Admin flows | Navigate `/admin/*` with Supabase auth configured |
| Public flows | Marketplace, verify, consign on public routes |
| UI visual check | Browser MCP screenshot (workspace shadcn-guard rule) |
| GSD UAT | `/gsd-verify-work` conversational acceptance |

**Environment for testing:**
- `.env.test.local` listed in `.gitignore` — file may exist locally for test env vars but no test runner consumes it yet
- Supabase credentials required in `.env.local` for integration/manual testing of API routes

## Gaps and Recommendations

**Priority gaps (no coverage today):**

| Area | Files | Risk |
|------|-------|------|
| Auth guards | `src/lib/supabase/requireUser.ts`, `requireRole.ts` | 401/403 regressions |
| Public verify API | `src/app/api/public/verify/route.ts` | Core product trust flow |
| Marketplace API | `src/app/api/marketplace/route.ts`, `utils.ts` | Listing/detail data mapping |
| Domain Result layer | `src/lib/domain/contracts/result.ts`, `errors.ts` | Low effort, high confidence |
| CRM API routes | `src/app/api/deals/`, `leads/`, `customers/` | Admin data integrity |

**Suggested first test setup (not yet in repo):**
1. Add Vitest + `@vitejs/plugin-react` as devDependencies
2. Add `vitest.config.ts` with `@/` path alias matching `tsconfig.json`
3. Add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`
4. Start with pure unit tests in `src/lib/domain/` — no mocks required
5. Add API route tests with Supabase mocks second
6. Consider Playwright only after unit/integration baseline exists

---

*Testing analysis: 2026-06-14*
