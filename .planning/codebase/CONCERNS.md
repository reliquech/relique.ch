# Codebase Concerns

**Analysis Date:** 2026-06-14

## Tech Debt

**Phase 4 migration incomplete (localStorage vs Supabase split):**
- Issue: Web app still routes verify and consign through localStorage adapters while marketplace uses Supabase API routes. Deprecated wrapper services remain the primary import path.
- Files: `apps/web/src/lib/services/impl/index.ts`, `apps/web/src/lib/services/impl/verify.local.ts`, `apps/web/src/lib/services/impl/consign.local.ts`, `apps/web/src/lib/services/verifyService.ts`, `apps/web/src/lib/services/consignService.ts`, `apps/web/src/lib/services/marketplaceService.ts`, `packages/shared/src/domain/storage/verify.ts`, `packages/shared/src/domain/storage/json.ts`
- Impact: User-facing verify/consign data never reaches admin `consigned_items` table; admin submissions view shows inconsistent data sources; production behavior differs by feature.
- Fix approach: Implement Supabase-backed adapters in `apps/web/src/lib/services/impl/`, wire consign submit to `apps/admin/src/app/api/consigned/route.ts` (or a public web API), migrate verify to real backend, then remove deprecated wrappers and localStorage persistence.

**Duplicate deprecated schemas (not consolidated to `@relique/shared`):**
- Issue: `@deprecated` schema copies still imported across web and admin instead of `@relique/shared/domain`.
- Files: `apps/web/src/lib/schemas/marketplace.ts`, `apps/web/src/lib/schemas/verify.ts`, `apps/web/src/lib/schemas/consign.ts`, `apps/web/src/lib/schemas/content.ts`, `apps/admin/src/lib/schemas/marketplace.ts`, `apps/admin/src/lib/schemas/verify.ts`, `apps/admin/src/lib/schemas/consign.ts`, `apps/web/src/lib/services/contracts.ts`, `apps/web/src/lib/services/adminService.ts`
- Impact: Schema drift risk; duplicate validation rules; migration to shared package stalled.
- Fix approach: Replace imports with `@relique/shared/domain` types/schemas; delete deprecated schema files after codemod.

**Parallel legacy service layer in admin:**
- Issue: Admin retains `apps/admin/src/lib/legacy/` with localStorage impls mirroring web, while CRM/marketplace use Supabase API services.
- Files: `apps/admin/src/lib/legacy/verifyService.ts`, `apps/admin/src/lib/legacy/consignService.ts`, `apps/admin/src/lib/legacy/marketplaceService.ts`, `apps/admin/src/lib/legacy/activityService.ts`, `apps/admin/src/lib/legacy/impl/*.local.ts`, `apps/admin/src/features/submissions/pages/SubmissionsPage.tsx`
- Impact: Submissions page merges browser-local verify history with Supabase consigned items; confusing data model for operators.
- Fix approach: Remove legacy verify/consign local services from admin; read verify history from backend once implemented; use `consignedService` only.

**Triplicated shadcn UI components:**
- Issue: shadcn primitives copied into each app instead of consuming `@relique/ui` exclusively.
- Files: `apps/web/src/components/ui/**` (20 files), `apps/admin/src/components/ui/**` (10 files), `packages/ui/src/shadcn/ui/**`
- Impact: Style/behavior drift; harder shadcn upgrades; violates project shadcn-guard wrapper pattern.
- Fix approach: Migrate app imports to `@relique/ui` wrappers; keep app-level composition in `components/app/**` or `components/shared/**`.

**Standalone legacy marketplace prototype:**
- Issue: `relique-marketplace/` is a separate Vite app with mock jersey data, not included in `pnpm-workspace.yaml`.
- Files: `relique-marketplace/App.tsx`, `relique-marketplace/constants.ts`, `relique-marketplace/package.json`
- Impact: Dead code confusion; duplicate marketplace UX; separate dependency tree (React 19.2.4, Vite 6).
- Fix approach: Archive or delete if superseded by `apps/web`; if kept, document purpose and add to workspace or move to `docs/prototypes/`.

**Supabase type safety suppressed:**
- Issue: ~50 `@ts-expect-error` comments on service-role Supabase mutations instead of typed client/generics.
- Files: `apps/admin/src/app/api/consigned/[id]/route.ts`, `apps/admin/src/app/api/deals/[id]/route.ts`, `apps/admin/src/app/api/leads/[id]/route.ts`, `apps/admin/src/app/api/marketplace/route.ts`, `apps/admin/src/app/api/marketplace/agent-create/route.ts`, and 20+ other API routes under `apps/admin/src/app/api/`
- Impact: Runtime insert/update errors not caught at compile time; refactors silently break API routes.
- Fix approach: Regenerate `apps/admin/src/lib/supabase/types.ts` from schema; use typed `.insert()`/`.update()` payloads; remove `@ts-expect-error` as types align.

**Oversized component/route files (>300 lines):**
- Issue: Multiple files exceed the project's 300-line component limit.
- Files: `apps/admin/src/features/marketplace/components/MarketplaceForm.tsx` (768 lines), `apps/admin/src/features/marketplace/pages/AgentCreateImagePage.tsx` (750 lines), `apps/admin/src/app/api/marketplace/agent-create/route.ts` (523 lines), `apps/admin/src/features/crm/pages/LeadsPage.tsx` (495 lines), `apps/admin/src/features/tasks/pages/TasksPage.tsx` (489 lines), `apps/admin/src/app/api/alert-rules/run/route.ts` (368 lines), `packages/ui/src/form/upload-manager/upload-manager.tsx` (368 lines)
- Impact: Hard to review, test, and modify; higher bug density.
- Fix approach: Extract form sections, hooks, and sub-components; split API route into `marketplaceUtils.ts`-style helpers (partially done in `apps/admin/src/app/api/marketplace/marketplaceUtils.ts`).

**Loose typing in shared admin table:**
- Issue: `DataTable` uses `any` for rows and render callbacks.
- Files: `apps/admin/src/components/shared/DataTable.tsx`
- Impact: Type errors in CRM/submissions tables surface at runtime only.
- Fix approach: Generic `DataTable<T>` with typed column definitions; migrate callers in `apps/admin/src/features/`.

**Root vs app script mismatch:**
- Issue: Root `package.json` runs `pnpm typecheck` via `tsc --build`, while apps expose `check-types` (`next typegen && tsc --noEmit`). Turbo defines both `check-types` and `typecheck` tasks.
- Files: `package.json`, `turbo.json`, `apps/web/package.json`, `apps/admin/package.json`
- Impact: CI/local checks may skip Next.js typegen or run inconsistent pipelines.
- Fix approach: Align on one script name across root, turbo, and apps.

## Known Bugs

**Contact form does not submit:**
- Symptoms: Form shows success alert after timeout; no data persisted or emailed.
- Files: `apps/web/src/app/contact/components/ContactForm.tsx`
- Trigger: Submit any contact form on web app.
- Workaround: None; feature is non-functional.

**QR verify uses random mock codes:**
- Symptoms: Upload/camera QR scan generates fake `RLQ-QUAL-XXX` codes instead of parsing input.
- Files: `apps/web/src/components/inputs/QRScanInput.tsx`
- Trigger: Use QR upload or camera scan on verify flow.
- Workaround: Manual product ID entry.

**Watchlist mock notifications:**
- Symptoms: Adding to watchlist schedules fake price-change notifications in localStorage.
- Files: `apps/web/src/components/interactive/WatchlistButton.tsx`
- Trigger: Toggle watchlist on marketplace item.
- Workaround: None intended for production.

**Admin marketplace edit action is a no-op:**
- Symptoms: Edit button logs to console; no navigation or modal.
- Files: `apps/admin/src/features/marketplace/pages/ItemsPage.tsx` (line 122: `onEdit={(id) => console.log('Edit', id)}`)
- Trigger: Click edit on marketplace items table.
- Workaround: Navigate manually to edit route.

**Submissions page action stubs:**
- Symptoms: View, duplicate, delete, and export handlers only `console.log`.
- Files: `apps/admin/src/features/submissions/pages/SubmissionsPage.tsx`
- Trigger: Use row actions or export on submissions page.
- Workaround: Manage consigned items via dedicated CRM/submissions API routes.

**Deprecated activity log returns empty:**
- Symptoms: `activityService.getLog()` always returns `[]` with console warning.
- Files: `apps/admin/src/lib/legacy/activityService.ts`
- Trigger: Any caller of sync `getLog()`.
- Workaround: Use async `activityServiceImpl.list()` from `apps/admin/src/lib/legacy/impl/activity.local.ts`.

## Security Considerations

**Unauthenticated user registration endpoint:**
- Risk: `POST /api/auth/register` creates Supabase auth users via service role with no authentication, rate limiting, or admin gate.
- Files: `apps/admin/src/app/api/auth/register/route.ts`
- Current mitigation: None on the route itself; relies on network obscurity.
- Recommendations: Remove public route or protect with admin-only auth (`requireUser` + `requireRole`), invite tokens, or move to Supabase dashboard/CLI-only provisioning.

**Service role used broadly in API routes:**
- Risk: Admin API routes bypass RLS via `createServiceRoleClient()`; authorization depends entirely on route-level `requireUser`/`requireRole` checks.
- Files: `apps/admin/src/lib/supabase/server.ts`, all routes under `apps/admin/src/app/api/`
- Current mitigation: Most routes (55/57) call `requireUser`; mutating CRM routes often add `requireRole`.
- Recommendations: Audit each route for role checks on GET/DELETE; prefer user-scoped Supabase client where RLS can enforce access; add integration tests for forbidden access.

**Web marketplace API uses service role for public reads:**
- Risk: `apps/web` public GET `/api/marketplace` uses service role, bypassing RLS even though query filters to published/public items.
- Files: `apps/web/src/lib/supabase/server.ts`, `apps/web/src/app/api/marketplace/route.ts`, `apps/web/src/app/api/marketplace/[slug]/route.ts`
- Current mitigation: Explicit `.eq("state_lifecycle", "published").eq("state_visibility", "public")` filters.
- Recommendations: Use anon key + RLS policies for read-only public data; reserve service role for writes.

**Middleware excludes API routes:**
- Risk: Admin session refresh middleware does not run on `/api/*` paths.
- Files: `apps/admin/src/middleware.ts`, `apps/admin/src/lib/supabase/middleware.ts`
- Current mitigation: Each API route performs its own auth check.
- Recommendations: Document as intentional; ensure no API route omits auth (currently only `auth/register` and `health`).

**No CI/CD pipeline detected:**
- Risk: No automated lint, typecheck, or security scans on push/PR.
- Files: No `.github/workflows/` directory
- Current mitigation: Manual `pnpm check` at root.
- Recommendations: Add GitHub Actions running `pnpm lint`, `pnpm typecheck`, and `pnpm build` for `web` and `admin`.

## Performance Bottlenecks

**Large unpaginated admin list fetches:**
- Problem: Marketplace admin pages request up to 1000 items per load; submissions loads 500 consigned items.
- Files: `apps/admin/src/features/marketplace/pages/ItemsPage.tsx`, `apps/admin/src/features/marketplace/pages/FeaturedPage.tsx`, `apps/admin/src/features/submissions/pages/SubmissionsPage.tsx`
- Cause: Client-side search/filter over full dataset instead of server pagination.
- Improvement path: Use API pagination with debounced server-side search; default `pageSize` ≤ 50.

**Default web marketplace page size:**
- Problem: Public API defaults `pageSize` to 100.
- Files: `apps/web/src/app/api/marketplace/route.ts`
- Cause: High default for grid pages that may only need 12–24 items.
- Improvement path: Lower default; add cursor-based pagination for large catalogs.

**Monolithic client bundles from large pages:**
- Problem: CRM and marketplace admin pages import full table/form logic in single client components (400–500 lines).
- Files: `apps/admin/src/features/crm/pages/LeadsPage.tsx`, `apps/admin/src/features/crm/pages/CustomersPage.tsx`, `apps/admin/src/features/crm/pages/DealsPage.tsx`
- Cause: No code-splitting of modals, filters, or table configs.
- Improvement path: Dynamic import modals; extract column configs and filter hooks.

## Fragile Areas

**Agent-create marketplace route (AI + filesystem + DB):**
- Files: `apps/admin/src/app/api/marketplace/agent-create/route.ts`, `apps/admin/src/features/marketplace/pages/AgentCreateImagePage.tsx`, `docs/prompt for images generated/`
- Why fragile: Combines OpenAI image API, local prompt file reads, Supabase storage upload, and complex Zod payload with `.passthrough()`; 523 lines in one route.
- Safe modification: Extract prompt loading, image generation, and DB persistence into separate modules; add integration tests with mocked OpenAI.
- Test coverage: None.

**Alert rules runner:**
- Files: `apps/admin/src/app/api/alert-rules/run/route.ts`, `apps/admin/src/features/automations/services/alertRulesService.ts`
- Why fragile: Dynamic condition building against Supabase with `any[]` conditions; creates notifications, tasks, and sends email in one request.
- Safe modification: Unit-test condition builders; run via secured cron secret rather than user-triggered POST only.
- Test coverage: None.

**Verify result generation (prefix-based mock):**
- Files: `apps/web/src/lib/services/impl/verify.local.ts`, `packages/shared/src/domain/contracts/verify.contract.ts`
- Why fragile: Authentication outcome determined by product ID prefix (`RLQ-QUAL`, `RLQ-INCON`, `RLQ-DISQ`) with optional localStorage mapping override; not cryptographically tied to real assets.
- Safe modification: Treat as demo-only until backend verify API exists; document clearly in UI.
- Test coverage: None.

**Shared localStorage utilities:**
- Files: `packages/shared/src/domain/storage/utils.ts`, `packages/shared/src/domain/storage/json.ts`, `apps/admin/src/lib/storage.ts`
- Why fragile: SSR/hydration edge cases (`typeof window === "undefined"` guards scattered); corrupt JSON falls back silently with `console.warn`.
- Safe modification: Centralize storage access behind a single SSR-safe adapter; add schema validation on read.
- Test coverage: None.

## Scaling Limits

**Browser localStorage for verify/consign history:**
- Current capacity: Capped in shared storage helpers (verify history cap in `packages/shared/src/domain/storage/verify.ts`); drafts/submissions unbounded per browser.
- Limit: Data not shared across devices; cleared on browser reset; unsuitable for multi-user ops.
- Scaling path: Persist to Supabase `consigned_items` and a verify results table.

**Single-region Supabase dependency:**
- Current capacity: All admin CRM, marketplace, auth, and storage via Supabase project in `apps/admin/supabase/migrations/` (31 migrations).
- Limit: No read replicas or multi-region config in repo; service role becomes bottleneck for API-heavy admin usage.
- Scaling path: RLS-first reads with anon/authenticated clients; connection pooling; edge caching for public marketplace reads.

**OpenAI image generation in request path:**
- Current capacity: Synchronous image generation inside HTTP request in agent-create route.
- Limit: Timeouts and cost spikes under concurrent admin users.
- Scaling path: Background job queue; webhook/polling for completion.

## Dependencies at Risk

**Next.js 16 / React 19 stack:**
- Risk: Bleeding-edge versions (`next@16.1.0`, `react@19.2.0`) with limited ecosystem maturity.
- Impact: Subtle framework bugs; third-party library incompatibility.
- Migration plan: Pin versions; track Next.js release notes; test upgrades in isolation.

**Zod v4 (`zod@^4.3.2`):**
- Risk: Major version across all apps; API differences from Zod 3 docs/examples online.
- Impact: Copy-paste validation patterns may fail.
- Migration plan: Standardize on `@relique/shared` schemas; document Zod 4 patterns in `CONVENTIONS.md`.

**Dual animation libraries on web:**
- Risk: Both `framer-motion` and `motion` packages in `apps/web/package.json`.
- Impact: Bundle bloat; API confusion (`apps/web/src/lib/motion-variants.ts` is 449 lines).
- Migration plan: Consolidate on one library.

## Missing Critical Features

**Web consign → admin pipeline:**
- Problem: Web consign submissions stay in browser localStorage; admin `consigned_items` API exists but web never calls it.
- Blocks: End-to-end consignment workflow, operator visibility, email follow-up.

**Real product verification backend:**
- Problem: Verify flow is deterministic mock based on ID prefix.
- Blocks: Production authentication claims, certificate linkage, legal/compliance requirements stated in `apps/web/src/data/terms-policies.data.ts`.

**Contact/inquiry handling:**
- Problem: No backend for contact form; CRM messages exist in admin but no public intake.
- Blocks: Lead capture from marketing site.

**Production email for public users:**
- Problem: Resend integration exists only for admin CRM email send (`apps/admin/src/app/api/email/send/route.ts`); requires `RESEND_API_KEY`.
- Blocks: Transactional emails for consign confirmations, verify results, contact replies.

## Test Coverage Gaps

**Entire monorepo:**
- What's not tested: No `*.test.*` or `*.spec.*` files detected; no Jest/Vitest/Playwright config in repo.
- Files: All application code under `apps/web/`, `apps/admin/`, `packages/shared/`, `packages/ui/`
- Risk: Regressions in 57 admin API routes, CRM workflows, and marketplace publish flow go unnoticed.
- Priority: High

**Auth and authorization matrix:**
- What's not tested: Role-based access (`requireRole` in `apps/admin/src/lib/supabase/requireRole.ts`) across viewer/editor/admin.
- Files: `apps/admin/src/app/api/users/route.ts`, `apps/admin/src/app/api/customers/[id]/route.ts`, `apps/admin/src/app/api/marketplace/agent-create/route.ts`
- Risk: Viewers may gain write access if a route omits `requireRole`.
- Priority: High

**Supabase RLS policies:**
- What's not tested: 31 SQL migrations define RLS but no automated policy tests.
- Files: `apps/admin/supabase/migrations/005_create_rls_policies.sql`, `apps/admin/supabase/migrations/009_fix_rls_performance.sql`, `apps/admin/supabase/migrations/010_create_crm_core.sql`
- Risk: Policy gaps expose CRM or storage data.
- Priority: High

**Service contract adapters:**
- What's not tested: Result/Error pattern in `@relique/shared/domain` adapters (`ok`/`err` flows).
- Files: `apps/web/src/lib/services/impl/verify.local.ts`, `apps/web/src/lib/services/impl/consign.local.ts`, `packages/shared/src/domain/contracts/errors.ts`
- Risk: Silent failures return empty arrays/null in deprecated wrappers.
- Priority: Medium

**Marketplace publish/filter logic:**
- What's not tested: Public visibility filters and slug mapping.
- Files: `apps/web/src/app/api/marketplace/utils.ts`, `apps/admin/src/app/api/marketplace/[id]/status/route.ts`
- Risk: Draft or private items leaked if filter regresses.
- Priority: High

---

## Scope Notes (2026-06-14)

**Payments removed from v1 milestone:**
- No Stripe/checkout code exists in repo — nothing to delete
- Marketplace browse-only until v2 (PAY-01–04 deferred)
- Terms copy in `apps/web/src/data/terms-policies.data.ts` may reference fees/payments — review for accuracy when going browse-only

---

*Concerns audit: 2026-06-14*
*Updated: 2026-06-14 — payments out-of-scope v1*
