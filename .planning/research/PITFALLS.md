# Domain Pitfalls

**Domain:** Relique.co — memorabilia authentication & marketplace (brownfield Next.js merge + Supabase migration + payments)
**Researched:** 2026-06-14
**Overall confidence:** HIGH (codebase audit + official Supabase/Stripe/Next.js docs verified)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, security breaches, or legal exposure.

### Pitfall 1: Big-Bang App Merge Without Route/Auth Isolation Plan

**What goes wrong:** Admin features copied into `apps/web` share the public root layout, middleware matcher, and env config. `/admin/*` pages leak into sitemap, public nav, or wrong layout; login redirect loops; API routes from both apps collide on the same path (`/api/marketplace`, `/api/auth/register`).

**Why it happens:** Teams treat merge as "move folders" instead of designing route groups `(public)` vs `(admin)` with separate layouts, middleware scopes, and API namespaces. Relique already has overlapping API surface in both apps.

**Consequences:** Broken auth sessions (cookie domain/path mismatch), duplicate route handlers, admin UI rendered with public chrome, production deploy that works on one port but fails unified.

**Prevention:**
- Use App Router route groups: `app/(public)/...` and `app/(admin)/admin/...` with distinct `layout.tsx` files.
- Merge middleware from `apps/admin/src/middleware.ts` into web with explicit matchers: protect `/admin/*` only; document that `/api/*` relies on per-route `requireUser`.
- Inventory all API routes from both apps before merge; resolve path conflicts in a spreadsheet, not at runtime.
- Single `next.config.js` for the unified app — do not use Multi-Zones rewrites (Relique goal is one app, one deploy).

**Detection (warning signs):**
- Admin pages show public header/footer.
- `404` on admin assets after merge (`_next/static` path conflicts).
- Two handlers registered for same API path; unpredictable behavior by build order.
- Middleware runs on API routes unintentionally, breaking webhooks or public marketplace GET.

**Phase:** **Phase 1 — App Merge**

---

### Pitfall 2: Migrating localStorage Flows Without Data Contract or Idempotency

**What goes wrong:** Verify/consign submissions switch from browser localStorage to Supabase, but existing users lose history; duplicate rows on retry; admin `SubmissionsPage` still merges legacy local data with `consigned_items`; web never calls the admin consign API that already exists.

**Why it happens:** localStorage adapters (`verify.local.ts`, `consign.local.ts`) silently succeed with fake data. Teams wire new API calls without defining: (a) public vs authenticated submitter identity, (b) dedupe keys, (c) migration path for in-flight drafts.

**Consequences:** Operators see empty or duplicate submissions; consign pipeline still broken end-to-end; customer trust loss when "submitted" forms never reach CRM.

**Prevention:**
- Define Supabase tables/columns for verify results and consign submissions before deleting local adapters.
- Implement web-facing API routes that write to the same tables admin reads (`consigned_items` per CONCERNS.md).
- Use idempotency key (client-generated UUID in draft → server upsert on submit).
- One-time cutover: stop writing localStorage on deploy; optionally read legacy localStorage once to offer "import draft" UX, then remove.
- Delete admin `lib/legacy/` localStorage services in the same phase — do not leave dual reads.

**Detection (warning signs):**
- Admin submissions page imports from both `legacy/` and Supabase services.
- Web consign success toast but no row in Supabase.
- Different record counts between browser and admin dashboard.

**Phase:** **Phase 2 — Data Layer Migration (Verify, Consign, Contact)**

---

### Pitfall 3: Service Role as Default Database Client

**What goes wrong:** Both apps use `createServiceRoleClient()` for public marketplace reads and most admin mutations (~57 routes). Authorization depends entirely on hand-written `requireUser`/`requireRole` checks. One missed route = full data exposure. Web public GET bypasses RLS even with `.eq("published")` filters.

**Why it happens:** Service role "just works" during development; RLS policies exist in migrations but are never exercised because server code bypasses them.

**Consequences:** CRM/customer PII leak via single missing auth guard; register endpoint already creates users with no auth (`POST /api/auth/register`); compliance failure for memorabilia transactions.

**Prevention:**
- Audit matrix: every API route → auth method → Supabase client type (anon/authenticated/service).
- Public marketplace reads: anon key + RLS policies for `published`/`public` rows only.
- Service role: narrow to admin-only writes, background jobs, and auth provisioning behind `requireRole('admin')`.
- Add `import 'server-only'` to service-role module; grep CI for `SUPABASE_SERVICE_ROLE` in client bundles.
- Remove or gate unauthenticated register route before any production traffic.

**Detection (warning signs):**
- `createServiceRoleClient()` imported in files under `components/` or without `requireUser`.
- ~50 `@ts-expect-error` on mutations masking schema drift.
- RLS policies never tested with anon/authenticated clients.

**Phase:** **Phase 3 — Security Hardening** (start audit in Phase 2; block production until closed)

---

### Pitfall 4: RLS Misconfiguration During Schema Expansion

**What goes wrong:** New tables for verify results, contact inquiries, or payment orders created without RLS, or RLS enabled with zero policies (silent empty results), or INSERT policies missing `WITH CHECK` (users can reassign `user_id`).

**Why it happens:** Supabase SQL migrations bypass dashboard warnings; AI-generated migrations omit `ENABLE ROW LEVEL SECURITY`; teams test in SQL Editor (postgres role bypasses RLS).

**Consequences:** Public API exposes all rows; or production returns zero rows with no error; or users overwrite each other's consignments.

**Prevention:**
- For every new table: `CREATE POLICY` in same migration transaction, then `ENABLE ROW LEVEL SECURITY`.
- Use `(SELECT auth.uid())` pattern in policies; index all policy columns.
- Test policies via client SDK with anon + authenticated sessions, not SQL Editor.
- Run Supabase Security Advisor after each migration.
- Separate policies for public insert (contact form) vs admin read (CRM).

**Detection (warning signs):**
- Migration files create tables without policy blocks.
- Staging works with service role but anon client returns empty.
- Security Advisor flags "RLS Disabled in public schema".

**Phase:** **Phase 2 — Data Layer Migration** (policies); **Phase 3 — Security Hardening** (audit all 31+ existing migrations)

---

### Pitfall 5: Mock Verify Logic Shipped as Production Authentication

**What goes wrong:** Verify flow continues to use prefix-based mock outcomes (`RLQ-QUAL`, `RLQ-INCON`, `RLQ-DISQ`) or random QR codes (`QRScanInput.tsx`). UI displays "Authenticated" without cryptographic or database-backed linkage to physical items.

**Why it happens:** Mock adapter is good enough for demos; terms/policies (`terms-policies.data.ts`) already promise authentication claims; backend verify API deferred repeatedly.

**Consequences:** Legal/reputational liability in memorabilia domain where 50–90% of online autographs are disputed; platform becomes liability magnet; fraudsters exploit "Valid" display without photo linkage (industry-wide COA cert-number reuse attack).

**Prevention:**
- Treat mock verify as demo-only until backend exists; gate with env flag or remove from production build.
- Verify API must return: cert ID, outcome, timestamp, item metadata, and ideally image/hash linkage stored at authentication time.
- QR scan must parse payload, not generate random IDs.
- Never show legal authentication language on mock data paths.
- Log all verify lookups server-side for audit trail.

**Detection (warning signs):**
- `verify.local.ts` still in production import path.
- QR component generates codes instead of decoding.
- No server-side verify table or API route.

**Phase:** **Phase 2 — Data Layer Migration** (minimum viable real verify); memorabilia-specific hardening ongoing

---

### Pitfall 6: Stripe Connect Added Before Order/Consign State Machine Exists

**What goes wrong:** PaymentIntent created on listing view or cart without order record; webhooks update nothing; capture/transfer timing wrong for authentication-hold marketplace; duplicate charges on retry; platform fee logic hard-coded in route handler.

**Why it happens:** Payments treated as isolated Stripe checkout widget; memorabilia marketplaces need authorize → authenticate/consign → capture → transfer, not simple one-click buy.

**Consequences:** Money captured before item verified; chargebacks with no internal order state; reconciliation drift between Stripe and Supabase; possible money-transmitter compliance gaps.

**Prevention:**
- Define order lifecycle in Supabase first: `pending_payment` → `paid_held` → `authenticated` → `released_to_seller` / `refunded`.
- Choose one Connect model (recommend **Separate Charges and Transfers** for authentication delay per Stripe docs — Stripe has no native escrow).
- Use `capture_method: 'manual'` for hold; capture only after verify/consign milestone; respect 7-day authorization expiry.
- Webhooks as source of truth with idempotent handlers (`payment_intent.succeeded` checked against current status).
- Idempotency keys on all Stripe API calls; nightly reconciliation job.
- Seller Connect onboarding (KYC) before enabling payouts.

**Detection (warning signs):**
- PaymentIntent ID stored nowhere in database.
- No webhook route or webhook secrets in env.
- Client-side redirect treated as payment confirmation.

**Phase:** **Phase 4 — Payments** (depends on Phase 2 order/consign model)

---

### Pitfall 7: Schema Duplication Survives Merge

**What goes wrong:** Deprecated schemas in `apps/web/src/lib/schemas/` and `apps/admin/src/lib/schemas/` diverge from `@relique/shared/domain` during merge. Zod v4 validation rules differ per app; API payloads validate differently on web vs admin.

**Why it happens:** Merge imports "whatever works" from each app; codemod to shared package deferred; `@deprecated` tags ignored.

**Consequences:** Silent validation failures; admin accepts payloads web rejects; Supabase inserts fail at runtime despite compile success (`@ts-expect-error` hides mismatch).

**Prevention:**
- Block merge PR until all schema imports resolve to `@relique/shared/domain`.
- Delete deprecated schema files in same PR that switches imports.
- Regenerate Supabase types from schema; remove `@ts-expect-error` incrementally per route group.
- Single source of truth for verify/consign/marketplace Zod schemas before new API routes.

**Detection (warning signs):**
- Grep finds `@deprecated` schema imports after consolidation phase.
- Same field different `.optional()` vs `.nullable()` across apps.
- Mutation routes still suppress TypeScript errors.

**Phase:** **Phase 5 — Stack Consolidation** (start import audit in Phase 1–2)

---

## Moderate Pitfalls

### Pitfall 8: Triplicated shadcn Components Amplified by Merge

**What goes wrong:** Merging admin into web creates a third UI layer or picks one app's `components/ui/**` copy, breaking shadcn-guard rule and `@relique/ui` package intent. Button/input styles drift between public and admin.

**Why it happens:** Fastest merge path is "keep both ui folders"; shadcn CLI copies differ between apps (20 vs 10 files).

**Prevention:** Migrate to `@relique/ui` wrappers before or during merge; app-level customization only in `components/app/**` or `components/shared/**`; never edit `packages/ui/src/shadcn/ui/**` directly without wrapper.

**Detection:** Duplicate component names in `apps/web`, `apps/admin`, and `packages/ui`; different Tailwind classes for same primitive.

**Phase:** **Phase 5 — Stack Consolidation** (wrapper migration can start Phase 1)

---

### Pitfall 9: Middleware/API Auth Split Confusion

**What goes wrong:** Unified app inherits admin pattern where middleware excludes `/api/*`. Developers assume middleware protects API routes; new public-facing POST routes (contact, consign) ship without auth or rate limits.

**Why it happens:** Documented as intentional for admin, but web public APIs need different threat model (spam, abuse).

**Prevention:** Document API auth tiers: (1) public rate-limited, (2) authenticated user, (3) admin role. Middleware optional for API; every route explicit. Add rate limiting on public POST (contact, consign) even if deferred to v2 — minimum: honeypot + server validation.

**Detection:** New API routes without auth section in code review checklist; contact form fake success pattern repeats.

**Phase:** **Phase 3 — Security Hardening**

---

### Pitfall 10: Contact/Email Flow Siloed in Admin App

**What goes wrong:** Resend integration exists only in admin (`/api/email/send`); public contact form merged but still fakes success; no `email_logs` entry for public inquiries; CRM leads not created from contact submissions.

**Why it happens:** Email route not moved during merge; `RESEND_API_KEY` only configured for admin deploy target.

**Prevention:** Public contact POST → validate → insert inquiry row → Resend notification → CRM lead (optional auto-create). Reuse Resend pattern from admin; share env vars in unified deploy.

**Detection:** Contact form timeout success with no network POST; no contact/inquiries table.

**Phase:** **Phase 2 — Data Layer Migration**

---

### Pitfall 11: Supabase Migration History Drift

**What goes wrong:** Schema changes applied via Dashboard SQL Editor on remote; `supabase db push` fails; staging and production migration versions diverge. Relique has 31 migrations in `apps/admin/supabase/migrations/` — location may confuse after app merge.

**Why it happens:** Quick fixes in production dashboard; migrations folder stays under old admin app path.

**Prevention:** All schema changes via migration files only; single `supabase/` directory at monorepo root or unified app path; never edit remote directly; use `supabase migration repair` only with verified schema state.

**Detection:** `db push` sync errors; teammates missing columns; migration timestamps out of order.

**Phase:** **Phase 2 — Data Layer Migration** (relocate migrations during Phase 1 if needed)

---

### Pitfall 12: Oversized Files Grow During Merge

**What goes wrong:** `MarketplaceForm.tsx` (768 lines), `AgentCreateImagePage.tsx` (750 lines), API routes 500+ lines absorb more logic during merge instead of splitting.

**Why it happens:** Merge conflict resolution dumps code into existing large files; no 300-line enforcement in v1 CI.

**Prevention:** Extract hooks/subcomponents as merge prerequisite for touched files; split agent-create route before adding features; treat file size as merge gate for modified files.

**Detection:** Files exceed 300 lines after merge commits; new logic only in page components.

**Phase:** **Phase 5 — Stack Consolidation** / **Phase 6 — Admin UX Redesign**

---

### Pitfall 13: No Automated Verification (v1 Constraint) Masks Regressions

**What goes wrong:** User explicitly defers Vitest/Playwright/CI for v1, but merge + migration + payments without any manual test script causes auth matrix regressions and marketplace publish filter bugs to ship unnoticed.

**Why it happens:** Quality gate = lint + typecheck + build only; 57 admin API routes untested.

**Prevention:** Minimum viable manual runbook: auth role matrix checklist, marketplace visibility leak check, consign E2E script, webhook replay test. Document in VERIFICATION.md per phase. Plan v2 test framework before payments go live.

**Detection:** No test files in repo; role bypass discovered in production; draft items visible on public API.

**Phase:** **All phases** — mitigated by manual runbooks until v2; **Phase 4 — Payments** highest risk without webhook tests

---

### Pitfall 14: Watchlist/Favorites Mock Features Left Active

**What goes wrong:** `WatchlistButton.tsx` schedules fake price notifications in localStorage; favorites/compare use client storage while marketplace is Supabase-backed — inconsistent UX and false engagement signals.

**Why it happens:** Low priority vs consign/verify; mocks not gated off.

**Prevention:** Either wire to Supabase (authenticated users) or disable/hide until real backend exists; do not schedule fake notifications in production.

**Detection:** localStorage keys for watchlist; console logs for mock notification timers.

**Phase:** **Phase 2 — Data Layer Migration** (defer feature) or **Phase 5 — Stack Consolidation** (remove mocks)

---

## Minor Pitfalls

### Pitfall 15: Dual Animation Libraries on Web

**What goes wrong:** Both `framer-motion` and `motion` in `apps/web/package.json`; bundle bloat after merge.

**Prevention:** Consolidate to one library during stack consolidation.

**Phase:** **Phase 5 — Stack Consolidation**

---

### Pitfall 16: Typecheck Script Mismatch

**What goes wrong:** Root `pnpm typecheck` vs app `check-types` (`next typegen && tsc`) run different pipelines; merge hides Next.js typegen failures.

**Prevention:** Align turbo tasks and root scripts before merge PR.

**Phase:** **Phase 1 — App Merge**

---

### Pitfall 17: Legacy `relique-marketplace/` Vite Prototype Confusion

**What goes wrong:** Developers copy patterns from orphaned Vite app (Gemini integration, mock jerseys) into unified Next app.

**Prevention:** Archive/delete prototype in stack consolidation; document as non-canonical.

**Phase:** **Phase 5 — Stack Consolidation**

---

### Pitfall 18: Unpaginated Admin Lists at Scale

**What goes wrong:** Marketplace admin fetches 1000 items; submissions 500 — merge increases traffic to single deploy.

**Prevention:** Server pagination before UX redesign; default pageSize ≤ 50.

**Phase:** **Phase 6 — Admin UX Redesign** (performance fix can start Phase 3)

---

### Pitfall 19: Bleeding-Edge Next.js 16 / React 19 Ecosystem Gaps

**What goes wrong:** Third-party libs (Stripe elements, Supabase SSR) subtle incompatibilities after merge.

**Prevention:** Pin versions; upgrade isolation branch; watch Next.js 16 route group sorting fixes.

**Phase:** **Phase 1 — App Merge**

---

## Domain-Specific Pitfalls (Memorabilia Marketplace)

### Pitfall 20: Certification Lookup Without Immutable Evidence

**What goes wrong:** Verify returns "Valid" for cert ID string match only — no photo, no item hash, no witness metadata. Fraudsters reuse real cert numbers on fake items (documented industry pattern affecting Beckett, PSA, etc.).

**Prevention:** Store authentication evidence at verify time (images, examiner, method); display cert-linked imagery when available; document limitations in UI; never equate database lookup with physical authentication without evidence chain.

**Phase:** **Phase 2+** (verify backend design); ongoing product/legal

---

### Pitfall 21: Consign Pipeline Without Operator SLA Visibility

**What goes wrong:** Public consign submits to Supabase but admin action stubs (`console.log` on SubmissionsPage) leave items unprocessed; no email confirmation to consignor.

**Prevention:** Wire admin actions before launching public consign; Resend confirmation on submit; task/notification for operators.

**Phase:** **Phase 2 — Data Layer Migration** + **Phase 6 — Admin UX Redesign**

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| **1 — App Merge** | Route/layout collision | Admin in public shell; API path duplicates | Route group inventory; single middleware design |
| **1 — App Merge** | Env/config | Missing admin env vars in unified deploy | Merge `.env.example`; verify Supabase/Resend/OpenAI keys |
| **1 — App Merge** | Auth cookies | Session break across former ports/domains | Test login → `/admin` → API flow on single origin |
| **2 — Data Migration** | localStorage cutover | Dual writes/reads; lost drafts | Idempotent submit; delete legacy adapters same release |
| **2 — Data Migration** | Verify backend | Mock shipped as real | Server-side verify table; remove prefix mock |
| **2 — Data Migration** | Contact form | Fake success retained | Real POST + Resend + DB row |
| **2 — Data Migration** | New tables | RLS missing or deny-all | Policies in same migration; SDK testing |
| **3 — Security** | Service role sprawl | One unguarded route leaks CRM | Route audit matrix; anon client for public reads |
| **3 — Security** | Register endpoint | Open user creation | Remove or admin-gate before production |
| **3 — Security** | Public POST abuse | Contact/consign spam | Rate limit + validation (minimum) |
| **4 — Payments** | Stripe timing | Capture before authentication | Manual capture; order state machine |
| **4 — Payments** | Webhooks | Client redirect as truth | Idempotent webhook handlers + DB status |
| **4 — Payments** | Connect KYC | Transfer to unverified seller | Check `charges_enabled` before payout |
| **5 — Stack Consolidation** | Schemas | Divergent Zod copies | Single `@relique/shared/domain` import path |
| **5 — Stack Consolidation** | shadcn triplication | Style/behavior drift | `@relique/ui` wrappers only |
| **5 — Stack Consolidation** | Supabase types | `@ts-expect-error` debt | Regenerate types; fix routes incrementally |
| **6 — Admin UX Redesign** | Feature creep | Redesign before data layer stable | Foundation-first order per PROJECT.md |
| **6 — Admin UX Redesign** | Submissions stubs | Beautiful UI on fake actions | Wire CRUD before visual polish |

---

## Dependency Order (Pitfall Avoidance)

```
Phase 1 App Merge
    ↓ (must not ship payments on dual-app or dual-schema paths)
Phase 2 Data Migration (verify/consign/contact real backend)
    ↓ (must not go production without)
Phase 3 Security Hardening (service role audit, RLS verification, register lockdown)
    ↓ (payments require stable order/consign state)
Phase 4 Payments (Stripe Connect + webhooks + reconciliation)
    ↓ (parallel-safe after Phase 2 stable)
Phase 5 Stack Consolidation + Phase 6 Admin UX (avoid redesign on mock data)
```

**Anti-pattern:** Starting Phase 4 Payments or Phase 6 Admin UX Redesign before Phase 2–3 complete — highest rewrite risk in this codebase.

---

## Sources

| Source | Confidence | Used for |
|--------|------------|----------|
| `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md` | HIGH | Relique-specific debt, security findings, file paths |
| `.planning/codebase/ARCHITECTURE.md`, `INTEGRATIONS.md` | HIGH | Data flow, service role patterns, integrations |
| [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) | HIGH | RLS enable/policy requirements |
| [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) | HIGH | Migration history drift |
| [Stripe Connect — Separate Charges and Transfers](https://docs.stripe.com/connect/marketplace/tasks/accept-payment/separate-charges-and-transfers) | HIGH | Marketplace payment model |
| [Next.js Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones) | HIGH | Why single-app route groups preferred over multi-zone for Relique |
| ESPN / industry reports on memorabilia fraud | MEDIUM | Verify evidence chain requirements |
| Community RLS post-mortems (DEV, designrevision.com) | MEDIUM | RLS silent failures, WITH CHECK, indexing |

---

*Pitfalls research: 2026-06-14 — focused on brownfield merge + Supabase migration + payments for Relique.co*
