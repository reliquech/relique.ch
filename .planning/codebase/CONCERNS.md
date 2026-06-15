# Codebase Concerns

**Analysis Date:** 2026-06-14

## Tech Debt

**Dual schema/type paths (`@/lib/schemas` vs `@/lib/domain`):**
- Issue: Deprecated re-exports in `src/lib/schemas/*.ts` still imported across marketplace UI, admin submissions, and service contracts while `@/lib/domain` is the canonical source.
- Files: `src/lib/schemas/marketplace.ts`, `src/lib/schemas/consign.ts`, `src/lib/schemas/verify.ts`, `src/lib/schemas/content.ts`; consumers include `src/lib/services/contracts.ts`, `src/lib/services/marketplaceService.ts`, `src/components/app/MarketplaceDetailView.tsx`, `src/admin/submissions/components/SubmissionsTable.tsx`
- Impact: Schema drift risk; migrations may update domain schemas while deprecated copies stay stale.
- Fix approach: Migrate all imports to `@/lib/domain`, delete `src/lib/schemas/` after grep confirms zero callers.

**Legacy service layer still wired to admin dashboard:**
- Issue: `src/lib/legacy/*` (localStorage/fixture adapters) remains the data source for dashboard widgets despite Supabase-backed APIs elsewhere.
- Files: `src/lib/legacy/verifyService.ts`, `src/lib/legacy/consignService.ts`, `src/lib/legacy/marketplaceService.ts`, `src/lib/legacy/activityService.ts`; consumers in `src/admin/dashboard/components/DashboardContent.tsx`, `QuickStats.tsx`, `RecentActivity.tsx`, `ContinueActions.tsx`
- Impact: Admin dashboard shows empty or browser-local stats instead of production CRM/marketplace data; misleading empty states (“Connect data source when ready”).
- Fix approach: Replace legacy imports with Supabase API client services (`src/admin/*/services/`) or shared fetch helpers; remove `src/lib/legacy/` when unused.

**Duplicate localStorage service implementations:**
- Issue: Parallel copies of fixture/local adapters exist in `src/lib/services/impl/` and `src/lib/legacy/impl/`; `src/lib/services/impl/index.ts` still exports `marketplaceServiceLocal` even though public marketplace pages use `src/lib/services/marketplaceService.ts` (Supabase API).
- Files: `src/lib/services/impl/marketplace.local.ts`, `src/lib/legacy/impl/marketplace.local.ts`, `src/lib/services/impl/content.local.ts`
- Impact: Confusion about which adapter is active; dead code paths; risk of accidentally wiring fixtures back into production UI.
- Fix approach: Keep one impl directory; delete legacy mirror; align `impl/index.ts` exports with actual runtime wiring.

**Content/posts/events still fixture-backed:**
- Issue: Public events and blog content read from JSON fixtures via `contentServiceLocal`, not Supabase.
- Files: `src/lib/services/impl/content.local.ts`, `src/lib/services/contentService.ts`, `src/lib/domain/fixtures/`, consumer `src/app/(home)/components/UpcomingEvents.tsx`
- Impact: CMS/content changes require code deploys; admin content tooling cannot reflect on public site.
- Fix approach: Add Supabase tables + API routes (or reuse admin content APIs) and swap `contentService` impl to API adapter.

**Unused `adminService` with localStorage CRUD:**
- Issue: `src/lib/services/adminService.ts` implements marketplace/content CRUD via `src/lib/storage.ts` mutations but has zero importers.
- Files: `src/lib/services/adminService.ts`, `src/lib/storage.ts`
- Impact: ~290 lines of dead, misleading code suggesting admin CRUD is localStorage-backed.
- Fix approach: Delete or rewrite to call `/api/marketplace` and future content APIs; remove storage mutations if unused elsewhere.

**Duplicate shadcn component trees:**
- Issue: Two parallel shadcn copies — `src/components/ui/**` (21 files, primary import path) and `src/lib/ui/shadcn/ui/**` (11 files, sparse usage).
- Files: `src/components/ui/button.tsx`, `src/lib/ui/shadcn/ui/button.tsx`; mixed imports e.g. `src/components/results/VerifyResultEnhanced.tsx` uses `@/lib/ui/shadcn/ui/*` while most app code uses `@/components/ui/*`
- Impact: Style/behavior drift on shadcn updates; violates single design-system source; shadcn-guard rule assumes one tree.
- Fix approach: Consolidate on `src/components/ui/**` with wrapper pattern; migrate `@/lib/ui/shadcn` consumers; delete duplicate tree.

**Monolithic admin/UI files (>300 lines):**
- Issue: Several files exceed the project’s 300-line component limit and mix form state, uploads, validation, and layout.
- Files: `src/admin/marketplace/components/MarketplaceForm.tsx` (~707 lines), `src/admin/marketplace/pages/AgentCreateImagePage.tsx` (~700), `src/admin/crm/pages/LeadsPage.tsx` (~469), `src/admin/crm/pages/CustomersPage.tsx` (~460), `src/admin/tasks/pages/TasksPage.tsx` (~458), `src/lib/storage.ts` (~337)
- Impact: Hard to review, test, or modify safely; high merge-conflict surface.
- Fix approach: Extract hooks (`useMarketplaceForm`, `useLeadsTable`), subcomponents, and service calls into feature-scoped modules under `src/admin/*/components/` and `hooks/`.

**Incomplete admin feature stubs (console.log placeholders):**
- Issue: Submissions and marketplace item management expose UI actions that only log to console.
- Files: `src/admin/submissions/pages/SubmissionsPage.tsx` (view/duplicate/delete/export TODOs at lines 35–48, 108–110), `src/admin/marketplace/pages/ItemsPage.tsx` (`onEdit` → `console.log('Edit', id)` at line 122)
- Impact: Operators cannot view submission detail, export data, or edit listings from the items table.
- Fix approach: Wire to existing `/api/consigned` and `/api/marketplace/[param]` routes; add detail drawer and navigation to edit flow.

**Verify history no-op in Supabase adapter:**
- Issue: `verifyServiceSupabase` returns empty history and no-ops save/clear despite domain storage helpers existing for local history.
- Files: `src/lib/services/impl/verify.supabase.ts` (lines 43–53), `src/lib/domain/storage/verify.ts`
- Impact: Verify history UI (if enabled) never persists server-side; cross-device history impossible.
- Fix approach: Persist verify runs to Supabase (table or user-scoped storage) or document intentional client-only history and remove dead API surface.

**Mock QR/camera verify flow in production UI:**
- Issue: QR upload and camera scan generate random mock product IDs instead of decoding real QR payloads.
- Files: `src/components/inputs/QRScanInput.tsx` (mock code generation ~lines 58–88)
- Impact: Misleading UX; users believe scanning works but get random valid-format codes.
- Fix approach: Integrate real QR decoder library or hide mock paths behind dev flag until implemented.

**Mock watchlist price notifications:**
- Issue: `WatchlistButton` schedules fake “price changed” notifications in localStorage for demo.
- Files: `src/components/interactive/WatchlistButton.tsx` (~lines 79, 131–156)
- Impact: False alerts; conflates demo behavior with production notification system backed by `/api/notifications`.
- Fix approach: Remove mock scheduler or gate behind `NODE_ENV === 'development'`; connect to real price-change events when available.

**Package manager drift:**
- Issue: Repo uses npm (`package-lock.json` present, modified in git status); no `pnpm-lock.yaml`; project docs/CLAUDE.md still reference pnpm workspace/Turborepo layout from prior monorepo structure.
- Files: `package-lock.json`, root `package.json` (flat single-app scripts, no turbo)
- Impact: Onboarding confusion; lockfile churn; docs describe architecture that no longer matches repo layout.
- Fix approach: Pick one package manager, document in README, align CLAUDE.md/STACK.md with flat root app; remove stale monorepo references.

**ESLint boundary rules defined but not applied:**
- Issue: `eslint-config/boundaries.js` defines localStorage and cross-app import restrictions, but root `eslint.config.js` only extends `eslint-config/next.js` — boundaries config is never imported.
- Files: `eslint-config/boundaries.js`, `eslint.config.js`
- Impact: Direct `localStorage` usage in UI (`WatchlistButton`, `CompareDrawer`, `CurrencyContext`, admin pages) is not lint-blocked despite documented convention.
- Fix approach: Import `boundariesConfig` into `eslint.config.js` or merge rules into `next.js` preset.

**Manual Supabase types with pervasive `as never` casts:**
- Issue: Hand-maintained `src/lib/supabase/types.ts` (~602 lines) forces `as never` on many inserts/updates across API routes.
- Files: `src/lib/supabase/types.ts`; examples in `src/app/api/public/contact/route.ts`, `src/app/api/alert-rules/run/route.ts`, `src/app/api/tasks/route.ts`
- Impact: Type safety bypassed at DB boundary; schema migrations can break runtime without compile errors.
- Fix approach: Regenerate types via Supabase CLI (`supabase gen types`) in CI or pre-commit; remove `as never` as types align.

## Known Bugs

**Admin dashboard empty-state logic uses legacy local data:**
- Symptoms: Dashboard shows “No data yet / Connect data source when ready” even when Supabase has leads, deals, or marketplace items.
- Files: `src/admin/dashboard/components/DashboardContent.tsx`
- Trigger: Open `/admin` after production data exists in Supabase but browser localStorage is empty.
- Workaround: None for operators; data exists but UI does not reflect it.

**Submissions “verifications” tab always empty:**
- Symptoms: Tab filter expects `type === "verify"` rows but `loadSubmissions` only maps consigned items from API.
- Files: `src/admin/submissions/pages/SubmissionsPage.tsx` (lines 60–70 vs 94–96)
- Trigger: Navigate to Submissions → Verifications tab.
- Workaround: Use consignments tab only; verify submissions not surfaced.

**Marketplace list errors silently become empty grids:**
- Symptoms: API failures show empty marketplace with no error state on public pages.
- Files: `src/lib/services/marketplaceService.ts` (catch blocks return empty arrays/null)
- Trigger: Supabase outage, misconfigured env, or API 500.
- Workaround: Check server logs; users see blank catalog with no explanation.

## Security Considerations

**Unauthenticated open proxy risk on article metadata scraper:**
- Risk: `GET /api/article-meta?url=...` fetches arbitrary user-supplied URLs server-side with no auth, no SSRF allowlist (private IPs, metadata endpoints, cloud metadata URLs).
- Files: `src/app/api/article-meta/route.ts`
- Current mitigation: Basic `new URL()` validation only; 24h cache headers.
- Recommendations: Require auth or signed tokens; allowlist external domains; block RFC1918/link-local/metadata IP ranges; add rate limiting.

**Public contact/consign endpoints without rate limiting:**
- Risk: `POST /api/public/contact` and `POST /api/public/consign` accept submissions with honeypot field only — no CAPTCHA, IP throttle, or Resend send limits enforced in route.
- Files: `src/app/api/public/contact/route.ts`, `src/app/api/public/consign/route.ts`
- Current mitigation: Honeypot `website` field rejection; Zod validation; file type/size limits on consign photos.
- Recommendations: Add rate limiting (e.g. Vercel WAF, Upstash); CAPTCHA on public forms; monitor lead/consign insert volume.

**Service-role client on nearly all API routes:**
- Risk: API routes use `createServiceRoleClient()` which bypasses RLS; authorization depends entirely on consistent `requireUser`/`requireRole` calls in each handler.
- Files: `src/lib/supabase/server.ts`, ~55 handlers under `src/app/api/**`
- Current mitigation: Most admin routes call `requireUser` + `requireRole`; middleware guards `/admin/*` pages.
- Recommendations: Audit routes missing auth (see below); prefer user-scoped Supabase client where RLS can enforce row access; add automated route auth tests.

**API routes excluded from middleware session refresh:**
- Risk: `src/middleware.ts` matcher and `updateSession` skip auth refresh semantics for `/api/*`; API auth is per-route only.
- Files: `src/middleware.ts`, `src/lib/supabase/middleware.ts` (lines 11–13)
- Current mitigation: Route-level `requireUser`.
- Recommendations: Document required auth pattern for new routes; lint or codegen check that mutating routes import `requireUser`.

**Health endpoint exposes DB connectivity publicly:**
- Risk: `GET /api/health` uses service role to query `audit_logs` without authentication.
- Files: `src/app/api/health/route.ts`
- Current mitigation: Returns generic `{ ok, db }` JSON only.
- Recommendations: Protect with internal token or restrict to deployment platform probes; avoid service role on public health checks.

**Middleware silently continues when Supabase unreachable:**
- Risk: DNS/network failures during `getUser()` are swallowed; unauthenticated users may reach `/admin` HTML before layout-level auth redirect.
- Files: `src/lib/supabase/middleware.ts` (lines 56–60)
- Current mitigation: Comment notes re-check in layout/server.
- Recommendations: Fail closed on admin paths when auth provider unreachable; show maintenance page.

## Performance Bottlenecks

**Admin marketplace pages fetch 1000 items client-side:**
- Problem: Items and featured admin pages request `pageSize: 1000` in one call, then filter in browser.
- Files: `src/admin/marketplace/pages/ItemsPage.tsx`, `src/admin/marketplace/pages/FeaturedPage.tsx`
- Cause: No server-side search/pagination in admin table; large JSON payloads on every load.
- Improvement path: Server-driven pagination via `/api/marketplace` query params; virtualized tables; default pageSize 25–50.

**Article-meta scraper tries up to 5 bot User-Agent fetches sequentially:**
- Problem: Each metadata request may issue multiple outbound HTTP calls until one succeeds.
- Files: `src/app/api/article-meta/route.ts` (lines 238–246)
- Cause: Retry loop across `BOT_HEADERS_LIST` without early domain caching.
- Improvement path: Cache failures; reduce header attempts; move scraping to background job for admin-only use.

**Large static motion/animation modules:**
- Problem: `src/lib/motion-variants.ts` (~407 lines) imported broadly may inflate client bundles if not tree-shaken.
- Files: `src/lib/motion-variants.ts`
- Cause: Centralized variant definitions without lazy loading per route.
- Improvement path: Split by route/feature; audit imports with bundle analyzer.

## Fragile Areas

**Marketplace API route dual-mode (public vs admin):**
- Files: `src/app/api/marketplace/route.ts`, `src/app/api/marketplace/[param]/route.ts`, `src/app/api/marketplace/marketplaceUtils.ts` (~338 lines)
- Why fragile: Single route file branches on session/auth for public anon reads vs admin service-role writes; easy to expose draft/unpublished items if branch logic wrong.
- Safe modification: Add integration tests for public GET (only `published`/`visible`) vs admin GET; extract public/admin handlers into separate files.
- Test coverage: None (no test framework).

**Alert rules engine:**
- Files: `src/app/api/alert-rules/run/route.ts` (~326 lines), `src/app/api/alert-rules/preview/route.ts`, `src/app/api/alert-rules/route.ts`
- Why fragile: Complex condition counting, cooldown gates, dynamic Supabase queries with `any`-typed conditions; side effects (notifications, tasks, emails).
- Safe modification: Extract condition evaluators per entity; unit-test count functions; run dry_run in preview before production trigger.
- Test coverage: None.

**Agent-create OpenAI image pipeline:**
- Files: `src/app/api/marketplace/agent-create/route.ts` (~468 lines)
- Why fragile: Long route combining auth, OpenAI HTTP calls, Supabase storage uploads, and marketplace insert; single failure point for AI listing workflow.
- Safe modification: Split into service modules; timeout/retry policy; validate OPENAI_API_KEY at startup.
- Test coverage: None.

**Consign form + public upload flow:**
- Files: `src/app/(site)/consign/components/ConsignForm.tsx`, `src/app/api/public/consign/route.ts`, `src/features/marketplace/utils/uploadPaths.ts`
- Why fragile: Multi-step client form, direct storage upload, email notification; max 10 photos × 10MB.
- Safe modification: Progress/resume upload UX; server-side virus scan hook if required later.
- Test coverage: None.

## Scaling Limits

**Single Next.js app (port 1300) serves public site + full admin CRM:**
- Current capacity: One deploy unit; all ~58 API routes share serverless/concurrent limits.
- Limit: Heavy admin batch jobs (alert-rules run, bulk updates, agent-create) compete with public marketplace/verify traffic on same deployment.
- Scaling path: Split cron/worker for `alert-rules/run`; consider edge caching for public marketplace GET; Vercel function maxDuration already set on some routes (`maxDuration = 60` on consign).

**localStorage-backed user preferences (favorites, compare, currency, CRM column views):**
- Current capacity: Per-browser, not synced across devices; storage quotas (~5MB).
- Limit: Favorites/watchlist lost on clear-site-data; admin column prefs in `src/lib/storage.ts` not shared across team members.
- Scaling path: Move user prefs to Supabase `profiles` or dedicated prefs table.

**No CI pipeline:**
- Current capacity: Manual `pnpm lint` / `npm run lint` and `check-types` locally per developer.
- Limit: Regressions merge without automated gate; no test runner in `package.json`.
- Scaling path: Add GitHub Actions for lint, typecheck, build on PR.

## Dependencies at Risk

**Flat npm lockfile after monorepo flatten:**
- Risk: Phase 6 restructure (` .planning/phases/06-flat-root-npm-restructure/`) moved to single package; stale docs reference `@relique/shared`, `@relique/ui`, Turborepo.
- Impact: External contributors follow wrong install/build commands; domain code now lives inline under `src/lib/domain/` but boundaries rules still mention workspace packages.
- Migration plan: Update all planning docs; remove dead workspace references from `eslint-config/boundaries.js`.

**Heavy reliance on service-role Supabase key:**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` required for almost all API routes; key rotation requires coordinated redeploy.
- Impact: Leaked key grants full DB access regardless of RLS.
- Migration plan: Narrow service-role usage to admin-only routes; use anon + RLS for public reads where possible.

## Missing Critical Features

**Marketplace checkout / payments:**
- Problem: No Stripe or payment integration detected; purchase panels are display-only.
- Blocks: End-to-end marketplace transactions promised in project vision.

**Real QR verification scanning:**
- Problem: Mock random code generation stands in for camera/QR decode.
- Blocks: Physical product verification UX.

**Production CMS for posts/events:**
- Problem: Content served from fixtures, not editable database content.
- Blocks: Marketing team self-service updates without deploy.

**Automated test suite:**
- Problem: Zero `*.test.ts` / `*.spec.ts` files; no Vitest/Jest/Playwright config.
- Blocks: Safe refactors of API auth, marketplace visibility, and alert rules.

## Test Coverage Gaps

**API route authorization matrix:**
- What's not tested: Which routes require auth/roles vs public access (`/api/article-meta`, `/api/health`, `/api/public/*`, marketplace GET branches).
- Files: All of `src/app/api/**`
- Risk: New route ships without `requireUser`; data exposure.
- Priority: High

**Marketplace public visibility filtering:**
- What's not tested: Unpublished/draft items never returned on public anon reads.
- Files: `src/app/api/marketplace/route.ts`, `src/app/api/marketplace/utils.ts`
- Risk: Draft listings leak to public site.
- Priority: High

**Public form abuse resistance:**
- What's not tested: Contact/consign spam handling, honeypot bypass attempts, oversized uploads.
- Files: `src/app/api/public/contact/route.ts`, `src/app/api/public/consign/route.ts`
- Risk: DB spam, storage cost, email quota exhaustion.
- Priority: Medium

**CRM bulk operations:**
- What's not tested: Bulk update routes for leads, deals, customers.
- Files: `src/app/api/leads/bulk-update/route.ts`, `src/app/api/deals/bulk-update/route.ts`, `src/app/api/customers/bulk-update/route.ts`
- Risk: Partial updates, incorrect patch shapes corrupt CRM data.
- Priority: Medium

**Alert rules condition evaluation:**
- What's not tested: Stale lead/deal/message counting, cooldown gates, dry_run vs live side effects.
- Files: `src/app/api/alert-rules/run/route.ts`
- Risk: Notification storms or missed alerts in production.
- Priority: Medium

**Verify result mapping from marketplace rows:**
- What's not tested: Product ID lookup, mapping edge cases, not-found handling.
- Files: `src/app/api/public/verify/route.ts`, `src/lib/verify/mapMarketplaceToResult.ts`
- Risk: Incorrect verification status shown to collectors.
- Priority: High

---

*Concerns audit: 2026-06-14*
