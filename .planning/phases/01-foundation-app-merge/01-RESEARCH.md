# Phase 1: Foundation & App Merge - Research

**Researched:** 2026-06-14
**Domain:** Next.js 16 App Router monorepo merge — dual apps → unified `apps/web` with `/admin` URL segment
**Confidence:** HIGH

## Summary

Phase 1 gộp `apps/admin` (57 API routes, 8 feature modules, 21 admin pages, 31 SQL migrations) vào `apps/web` theo thứ tự incremental đã khóa: layout split `(site)` → auth/middleware → API → admin UI. `apps/web` hiện **không có** `middleware.ts`, `lib/supabase/client.ts`, `requireUser`, hay SSR cookie client — toàn bộ auth layer phải port từ admin. Public root layout đang wrap **mọi route** trong Header/Footer (`apps/web/src/app/layout.tsx`) — đây là blocker đầu tiên phải giải bằng `(site)/layout.tsx`.

User đã khóa đặt admin modules tại `src/admin/` (không phải `src/features/` như research ARCHITECTURE.md mặc định), shell tại `components/admin/`, login tại `/admin/login` với redirect behavior **khác** code hiện tại (post-login luôn `/admin`, bỏ qua `redirect` param). Conflict API duy nhất đáng kể: `/api/marketplace` — web GET public published-only vs admin GET/POST/PATCH auth-required; merge bằng HTTP method + session check trong một handler tree.

Sau Phase 1, `pnpm dev` chỉ khởi động unified app; `apps/admin/` directory giữ làm reference đến Phase 5 (CONS-02) nhưng bị lo khỏi turbo/tsconfig active pipeline (FND-06). Không có test framework — validation gate là `pnpm lint && pnpm typecheck && pnpm build` + manual smoke UAT.

**Primary recommendation:** Execute 4-wave incremental merge vào `apps/web` theo thứ tự layout → supabase/auth → API (resolve marketplace conflict trước) → `src/admin/` + thin routes; dùng route group `app/admin/(portal)/` cho shell sidebar, `app/admin/login/` sibling ngoài portal layout.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Admin Code Placement**
- **D-01:** Admin business modules đặt tại `apps/web/src/admin/` — **không** dùng `src/features/` như research mặc định
- **D-02:** Cấu trúc bên trong `src/admin/` — mirror pattern hiện tại `apps/admin/src/features/` (domain folders: `crm/`, `marketplace/`, `submissions/`, etc. với `pages/`, `components/`, `services/`, `hooks/`, barrel `index.ts`)
- **D-03:** Admin shell UI (PortalSidebar, admin header, layout chrome) đặt tại `apps/web/src/components/admin/`
- **D-04:** Thin route files tại `apps/web/src/app/admin/**/page.tsx` re-export từ `src/admin/{domain}/pages/`

**Public Code (Minimal Touch)**
- **D-05:** Phase 1 chỉ **minimal** thay đổi public code — wrap existing routes vào `(site)` route group; **không** relocate shared components hay redesign public UI
- **D-06:** Public shell (Header, Footer, Currency, Compare) chuyển từ root `app/layout.tsx` → `app/(site)/layout.tsx` — admin routes không inherit public chrome

**Auth Entry & Redirects**
- **D-07:** Login page tại **`/admin/login`** — nested trong admin URL segment, không dùng `/login` root
- **D-08:** Sau login thành công → **luôn redirect `/admin`** (dashboard) — không dùng `redirect` query param post-login
- **D-09:** Unauthenticated access `/admin/*` (trừ `/admin/login`) → redirect **`/admin/login?redirect={original_path}`**
- **D-10:** Middleware scope — session cookie refresh trên mọi route, auth guard chỉ `/admin/*` (exclude `/admin/login`); API routes enforce auth independently via `requireUser`/`requireRole`

**Merge Execution**
- **D-11:** `apps/web` là app survivor — `apps/admin` giữ song song cho đến Phase 1 hoàn tất (xóa ở Phase 5)
- **D-12:** Incremental merge order: layout split `(site)` → auth/middleware → API routes → admin UI pages → verify end-to-end

### Claude's Discretion

- Internal structure của `src/admin/` subfolders (mirror features pattern)
- Middleware implementation details (session refresh scope, matcher config)
- Exact turbo/tsconfig path alias updates
- Conflict resolution khi merge duplicate dependencies giữa web và admin `package.json`

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 1 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | `apps/admin` gộp vào `apps/web` — một Next.js app, một deploy | Target layout § Architecture Patterns; 4-wave build order; survivor = `apps/web` |
| FND-02 | Admin routes tại `/admin` với layout riêng (sidebar, auth shell) | `(portal)` route group pattern; `components/admin/` shell; 21 thin pages + 8 modules |
| FND-03 | Middleware bảo vệ `/admin/*` — unauthenticated → `/admin/login` | Port `updateSession()` from admin; update paths `/login` → `/admin/login`; exclude `/admin/login` |
| FND-04 | Tất cả admin API routes migrate sang unified app | 57 routes inventory; marketplace merge strategy; port `requireUser`/`requireRole` |
| FND-05 | Supabase migrations consolidate vào unified app | Move `apps/admin/supabase/migrations/` → `apps/web/supabase/migrations/` (31 files) |
| FND-06 | Root scripts/turbo cập nhật — xóa `dev:admin`, `apps/admin` references | Script diff documented; tsconfig reference removal; keep directory until Phase 5 |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.0 (repo) / 16.2.9 (npm latest) | App Router, middleware, API routes | Both apps already on 16.1.0 [VERIFIED: apps/web/package.json, npm registry] |
| React | ^19.2.0 | UI runtime | Locked across monorepo [VERIFIED: package.json] |
| @supabase/ssr | ^0.8.0 (repo) / 0.12.0 (npm latest) | Cookie session refresh in middleware | Admin proven pattern; stay on repo version for merge stability [VERIFIED: apps/admin] |
| @supabase/supabase-js | ^2.90.1 (repo) / 2.108.1 (npm latest) | DB/auth client | Shared across apps [VERIFIED: package.json] |
| zod | ^4.3.2 | API input validation | Existing boundary pattern [VERIFIED: codebase] |
| Turborepo | ^2.7.5 | Monorepo orchestration | Root pipeline [VERIFIED: turbo.json] |
| pnpm | 10.28.1 | Workspace package manager | `packageManager` field [VERIFIED: root package.json] |

### Supporting (admin-only — add to `apps/web`)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cmdk | ^1.0.0 | Command palette | Admin global shortcut [VERIFIED: apps/admin/package.json] |
| recharts | ^3.6.0 | Dashboard charts | DashboardPage [VERIFIED: apps/admin/package.json] |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop | Featured carousel [VERIFIED: apps/admin/package.json] |
| @dnd-kit/utilities | ^3.2.2 | DnD helpers | With @dnd-kit/core [VERIFIED: apps/admin/package.json] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `middleware.ts` | Next.js 16 `proxy.ts` + `getClaims()` | Supabase docs (2026) recommend proxy migration [CITED: supabase.com/docs/guides/auth/server-side/nextjs] — defer post-merge; start with proven admin `middleware.ts` |
| `src/admin/` | `src/features/` | User locked D-01 — `src/admin/` signals domain separation from public code |
| Separate admin API prefix `/api/admin/*` | Unified `/api/*` | User locked single namespace; auth distinguishes public vs admin routes |

**Installation (admin deps into web):**
```bash
pnpm --filter web add cmdk recharts @dnd-kit/core @dnd-kit/utilities
```

## Project Constraints (from .cursor/rules/)

- **NEVER** edit `components/ui/**`, `src/components/ui/**`, `lib/shadcn/**` — use wrappers in `components/app/`, `components/shared/`, or `components/admin/`
- Each `.tsx` file **under 300 lines** — split large admin pages during migration (MarketplaceForm ~768 lines, LeadsPage ~495 lines already exceed)
- Visual verification via Browser MCP screenshot before declaring UI tasks complete
- All chat responses in Vietnamese (agent-facing; does not affect code)

## Architecture Patterns

### Recommended Target Structure

```
apps/web/src/
├── app/
│   ├── layout.tsx                    # Root: html, fonts, Toaster, CommandPalette (minimal)
│   ├── globals.css                   # Merged web + admin CSS variables
│   ├── (site)/                       # Route group — NO URL segment
│   │   ├── layout.tsx                # Header, Footer, Currency, Compare
│   │   ├── page.tsx                  # /
│   │   ├── marketplace/              # /marketplace
│   │   ├── verify/                   # /verify
│   │   └── ...                       # about, contact, consign, etc.
│   ├── admin/
│   │   ├── login/page.tsx            # /admin/login — NO sidebar
│   │   └── (portal)/                 # Route group — NO URL segment
│   │       ├── layout.tsx            # Sidebar shell → components/admin/
│   │       ├── page.tsx              # /admin dashboard
│   │       ├── deals/page.tsx        # thin re-export
│   │       └── ...
│   └── api/                          # Unified namespace (~60 routes)
│       ├── marketplace/              # MERGED public + admin handlers
│       └── ...
├── admin/                            # Business modules (from apps/admin/src/features/)
│   ├── crm/                          # pages/, components/, services/, hooks/, index.ts
│   ├── marketplace/
│   ├── submissions/
│   ├── dashboard/
│   ├── tasks/
│   ├── notifications/
│   ├── automations/
│   └── users/
├── components/
│   ├── shell/                        # Public Header, Footer (unchanged location)
│   ├── admin/                        # PortalSidebar, admin chrome (D-03)
│   ├── shared/                       # Merge admin shared tables/dialogs as needed
│   └── app/                          # shadcn wrappers
├── lib/
│   ├── supabase/                     # FULL auth layer from admin
│   │   ├── client.ts
│   │   ├── server.ts                 # createClient (SSR) + createServiceRoleClient
│   │   ├── middleware.ts
│   │   ├── requireUser.ts
│   │   ├── requireRole.ts
│   │   └── types.ts                  # Consolidated Database types
│   └── actions/                      # Command palette registry from admin
└── middleware.ts
```

**Terminology:** `/admin` is a **URL segment** (`app/admin/`), not parenthesized route group. `(site)` and `(portal)` are layout-only groups [VERIFIED: .planning/research/ARCHITECTURE.md, Next.js App Router docs].

### Pattern 1: Public Shell Isolation via `(site)`

**What:** Move Header/Footer/providers from root layout to `(site)/layout.tsx`; move public route folders under `(site)/`.

**When:** First wave — before any admin routes exist in web.

**Routes to wrap** [VERIFIED: glob apps/web/src/app]:
- `page.tsx`, `about/`, `authenticate/`, `consign/`, `contact/`, `marketplace/`, `terms-policies/`, `verify/`
- Keep at app root (NOT under `(site)`): `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, `icon.tsx`, `apple-icon.tsx`, `twitter-image.tsx`, `api/`

**Existing `(home)/` components:** Home page already uses `app/(home)/` for co-located components — `(site)/page.tsx` can import from `(home)/HomeContent` without moving `(home)/` folder (minimal touch per D-05).

### Pattern 2: Admin Portal Layout Without Login Inheritance

**What:** Sidebar shell only on `(portal)` routes; `/admin/login` is sibling outside portal layout.

**Why:** `app/admin/layout.tsx` wrapping all `/admin/*` would render sidebar on login page [VERIFIED: Next.js nested layouts behavior].

**Example structure:**
```typescript
// apps/web/src/app/admin/(portal)/layout.tsx
export { default } from "@/components/admin/AdminPortalLayout";

// apps/web/src/app/admin/(portal)/deals/page.tsx
export { default } from "@/admin/crm/pages/DealsPage";

// apps/web/src/app/admin/login/page.tsx
export { default } from "@/admin/users/pages/LoginPage"; // or dedicated login component
```

### Pattern 3: Thin Route Re-Export (preserve existing)

**What:** Route files contain only barrel re-exports — zero business logic.

**Example** [VERIFIED: apps/admin/src/app/admin/deals/page.tsx pattern]:
```typescript
export { default } from "@/admin/crm/pages/DealsPage";
```

### Pattern 4: Defense-in-Depth Auth (3 layers)

**What:**
1. **Middleware** — session refresh all matched routes; redirect unauthenticated `/admin/*` (except `/admin/login`)
2. **Route handlers** — `requireUser()` + `requireRole()` on admin API mutations/lists
3. **Client pages** — `useProfile()` for display; not security boundary

**Middleware update for locked decisions** [VERIFIED: apps/admin/src/lib/supabase/middleware.ts]:
```typescript
// Changes from current admin code:
// - /login → /admin/login (redirect target)
// - Exclude /admin/login from auth guard
if (
  !user &&
  !request.nextUrl.pathname.startsWith("/admin/login") &&
  request.nextUrl.pathname.startsWith("/admin")
) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}
```

**Login post-success (D-08 — differs from current admin code):**
```typescript
// Current admin login uses redirect param — MUST CHANGE per D-08
router.push("/admin"); // always, ignore searchParams redirect
```

### Pattern 5: Unified `/api/marketplace` Merge

**Conflict** [VERIFIED: both route.ts files]:

| Source | GET behavior | Write behavior |
|--------|-------------|----------------|
| web | Public, `published`+`public` filter, `mapRowToListing` | None |
| admin | `requireUser`, all lifecycle states, raw rows | POST/PATCH with auth |

**Merge strategy:** Single `app/api/marketplace/route.ts`:
- `GET`: Try `requireUser()` — if authenticated, admin list query (status/category/featured filters); if not, public published-only path (current web logic)
- `POST`/`PATCH`/`DELETE`: Always `requireUser()` + role check
- Sub-routes (`[id]/`, `upload/`, `agent-create/`) copy from admin as-is

Admin UI services call same `/api/marketplace` — no URL changes needed.

### Pattern 6: Import Path Migration Map

When copying `apps/admin/src/features/*` → `apps/web/src/admin/*`:

| Old import | New import |
|-----------|-----------|
| `@/features/crm/...` | `@/admin/crm/...` |
| `@/features/marketplace/...` | `@/admin/marketplace/...` |
| `@/components/shell/PortalSidebar` | `@/components/admin/PortalSidebar` |
| `@/lib/supabase/...` | unchanged path (same `@/` root) |

~65+ files in admin use `@/features/` [VERIFIED: grep count] — bulk find-replace during copy.

### Anti-Patterns to Avoid

- **Single root layout with public Header on admin** — current web state; fix via `(site)` first
- **Middleware as sole auth gate** — API routes must keep `requireUser()` [CITED: CVE-2025-29927 class bypasses]
- **Big-bang copy** — 57 API routes + 8 modules in one PR; follow D-12 wave order
- **Duplicating Supabase client factories** — one `lib/supabase/` in web; web's service-role-only `server.ts` must gain SSR `createClient()` from admin
- **`app/admin/layout.tsx` with sidebar wrapping login** — use `(portal)` group
- **Editing `components/ui/**`** — wrap in `components/admin/` or `components/app/`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie session refresh | Custom JWT parsing | `@supabase/ssr` `createServerClient` in middleware | Cookie sync bugs, random logouts [CITED: Supabase SSR docs] |
| Auth guard responses | Ad-hoc 401 JSON | `requireUser()` / `requireRole()` helpers | Consistent shape; already in 54/57 admin routes [VERIFIED: grep] |
| Route layout isolation | Conditional render in one layout | Next.js route groups `(site)`, `(portal)` | Clean separation; no pathname hacks |
| Monorepo script orchestration | Custom shell scripts | Turborepo `--filter=web` | Existing pipeline [VERIFIED: turbo.json] |
| Database types | Manual interfaces | Generated `lib/supabase/types.ts` | Already generated in both apps — consolidate to one |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Supabase remote DB — schema keyed by migration history, not app path | **No data migration** — moving `supabase/migrations/` folder does not re-run applied migrations [VERIFIED: 31 SQL files in apps/admin/supabase/migrations] |
| Live service config | Two Vercel projects: `apps/web/vercel.json` (filter=web), `apps/admin/vercel.json` (filter=admin) | Phase 1: unified deploy uses web project only; admin Vercel project deprecated manually post-merge — **not code change** |
| OS-registered state | None — no pm2/systemd/task scheduler references found | None |
| Secrets/env vars | `apps/web/.env.local` (Supabase service role + site URL); `apps/admin/.env.local` adds `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Resend, OpenAI | **Merge env into web `.env.local`**: add anon key (middleware/auth), `RESEND_API_KEY`, `OPENAI_API_KEY` from admin README [VERIFIED: apps/admin/README.md]; variable **names unchanged** — code reads same keys |
| Build artifacts | `.next/` per app; turbo cache | Rebuild web after merge; admin `.next` stale but harmless until Phase 5 deletion |

**Cookie/session note:** Unified app on same domain preserves existing Supabase auth cookies — no session migration needed. If admin was on separate subdomain/port in dev (3600 vs 1300), operators re-login once after merge [ASSUMED — standard cookie behavior].

## Common Pitfalls

### Pitfall 1: Big-Bang Merge (PITFALLS.md §1)

**What goes wrong:** Build breaks for days; API path collisions; admin under public Header.

**How to avoid:** D-12 four-wave order; `pnpm build` gate after each wave.

**Warning signs:** Admin pages show marketing nav; duplicate route.ts compiles.

### Pitfall 2: Login Inherits Portal Sidebar

**What goes wrong:** Login page renders inside admin shell.

**Why:** Flat `app/admin/layout.tsx` applies to all children.

**How to avoid:** `(portal)` route group for shell; login at `app/admin/login/` sibling.

### Pitfall 3: `/api/marketplace` Behavior Regression

**What goes wrong:** Public marketplace returns empty (admin auth applied to all GETs) or admin sees only published items.

**How to avoid:** Dual-path GET — auth check branches query; test both curl anonymous and authenticated.

### Pitfall 4: Redirect Behavior Mismatch (D-08)

**What goes wrong:** Operators expect post-login redirect to deep link; user locked always `/admin`.

**How to avoid:** Implement D-08 exactly; `redirect` param stored for analytics/future only or display notice — not navigation.

### Pitfall 5: Missing Supabase SSR Client in Web

**What goes wrong:** `requireUser()` fails — web `server.ts` only has `createServiceRoleClient()` [VERIFIED: apps/web/src/lib/supabase/server.ts].

**How to avoid:** Port full admin `lib/supabase/*` before API migration wave.

### Pitfall 6: globals.css / Tailwind Token Drift

**What goes wrong:** Admin UI unstyled — admin uses tokens (`bg-bg-0`, `surface`, `border-border`) defined in admin `globals.css`.

**How to avoid:** Merge admin CSS variables into web `globals.css`; extend `tailwind.config.ts` with admin theme extensions.

### Pitfall 7: Static Asset Missing

**What goes wrong:** Admin background references `url('/admin background.jpeg')` [VERIFIED: admin layout.tsx] but file not found in repo glob — broken background.

**How to avoid:** Locate/copy asset to `apps/web/public/` during UI wave; rename to URL-safe path (`/admin-background.jpeg`).

## Code Examples

### Middleware (adapted from admin for D-07/D-09)

```typescript
// Source: apps/admin/src/lib/supabase/middleware.ts + D-07/D-09
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // ... env validation + createServerClient (unchanged from admin) ...

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const { pathname } = request.nextUrl;

  if (
    !user &&
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

### Slim Root Layout

```typescript
// Source: pattern from apps/admin/src/app/layout.tsx + apps/web/src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${workSans.variable} ${zapfRenaissance.variable} font-work-sans antialiased`}>
        {children}
        <Toaster />
        <CommandPalette />
      </body>
    </html>
  );
}
```

### Public Site Layout

```typescript
// Source: extracted from apps/web/src/app/layout.tsx lines 121-136
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompareProvider>
      <CurrencyProvider>
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={null}><Header /></Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CompareDrawer />
        <SpeedInsights />
      </CurrencyProvider>
    </CompareProvider>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` + `getClaims()` | Supabase docs 2026 [CITED: supabase.com/docs/guides/auth/server-side/nextjs] | Defer to post-Phase 1 hardening |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase key rename 2026 | Keep existing env names for merge; rename later |
| Dual Next.js apps | Single app `/admin` segment | Phase 1 (this milestone) | One Vercel deploy, one middleware |
| Admin login at `/login` | `/admin/login` | D-07 (user locked) | Update middleware + logout handlers |

## Incremental Build Order (Planner Task Waves)

```
Wave 1 — Layout split (FND-02 partial, FND-01 prep)
  ├── Create app/(site)/layout.tsx — extract public shell from root
  ├── Move public routes under app/(site)/
  ├── Slim app/layout.tsx (fonts, Toaster, CommandPalette)
  ├── Merge globals.css tokens
  └── Gate: pnpm --filter web build; public URLs unchanged

Wave 2 — Auth infrastructure (FND-03)
  ├── Port lib/supabase/* from admin (client, server SSR, middleware, requireUser, requireRole, types)
  ├── Add apps/web/src/middleware.ts
  ├── Create app/admin/login/page.tsx (adapt login; D-08 redirect)
  ├── Merge admin deps into web package.json
  ├── Merge .env.local keys (anon key minimum)
  └── Gate: middleware compiles; /admin/login renders without sidebar

Wave 3 — API migration (FND-04)
  ├── Copy apps/admin/src/app/api/** → apps/web/src/app/api/** (except marketplace route.ts)
  ├── Merge /api/marketplace handlers (dual GET)
  ├── Copy lib/observability/, lib/actions/ as needed
  ├── Copy admin-only lib/utils, lib/types
  └── Gate: curl /api/deals with session cookie → 200; curl without → 401

Wave 4 — Admin UI (FND-02 complete, FND-01 complete)
  ├── Copy features/* → src/admin/*; update imports @/features → @/admin
  ├── Move shell components → components/admin/
  ├── Create app/admin/(portal)/layout.tsx + thin page re-exports (21 pages)
  ├── Copy public assets; wire CommandPalette
  └── Gate: /admin renders sidebar; CRM pages fetch data

Wave 5 — Config consolidation (FND-05, FND-06)
  ├── Move supabase/migrations/ → apps/web/supabase/migrations/
  ├── Update root package.json: dev → --filter=web; remove dev:admin/start:admin
  ├── Update tsconfig.json: remove apps/admin reference
  ├── Update pnpm-workspace.yaml if needed (keep apps/admin path for Phase 5 deletion)
  ├── Merge next.config.js image patterns (Supabase storage from web config)
  └── Gate: pnpm dev starts single app; pnpm check green
```

**Parallelizable within Phase 1:** Wave 1 and FND-05 migration folder move (different files).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Auth cookies from port 3600 dev don't auto-work on 1300 — users re-login once | Runtime State | Low — dev-only inconvenience |
| A2 | `apps/admin/public/` assets served from root despite empty glob — may live in gitignored or manual deploy | Pitfall 7 | Medium — broken admin chrome until assets copied |
| A3 | Phase 1 keeps `apps/admin` in `pnpm-workspace.yaml` but excludes from `pnpm dev` via `--filter=web` | FND-06 | Low — planner must clarify workspace vs scripts |
| A4 | ESLint `boundaries.js` cross-app import rule becomes moot after merge — no code imports from apps/admin | Architecture | Low — copy files, don't import across apps |

## Open Questions

1. **Keep `apps/admin` in pnpm workspace during Phase 1?**
   - What we know: D-11 keeps directory; FND-06 removes references
   - Recommendation: Remove from `tsconfig.json` references and turbo `dev` filter; keep in workspace until Phase 5 to avoid breaking path references in docs/scripts

2. **CommandPalette scope — global or admin-only?**
   - What we know: Admin has it in root layout; public site doesn't use it
   - Recommendation: Root layout (harmless on public); or lazy-load in `(portal)` layout only — planner discretion

3. **Consolidate duplicate `components/ui/` now or Phase 4 (CONS-04)?**
   - What we know: Phase 1 scope excludes CONS-04
   - Recommendation: Copy admin ui components to web `components/ui/` as-is for build pass; dedup later

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js build | ✓ | v24.14.0 | — (>=18 required) |
| pnpm | Workspace | ✓ | 10.28.1 | — |
| Supabase CLI | Migration apply (manual) | ✗ | — | Manual apply via dashboard; migrations are SQL files in repo |
| Supabase hosted project | Auth + API | ✓ (assumed) | — | Dev blocked without `.env.local` |
| Resend API key | Email routes (migrate but Phase 2 primary) | env-dependent | — | Routes exist; email fails gracefully |
| OpenAI API key | agent-create route | env-dependent | — | Route fails without key; not Phase 1 blocker |

**Missing dependencies with no fallback:**
- Supabase credentials in `apps/web/.env.local` — required for auth middleware and API routes

**Step 2.6 note:** External services (Supabase hosted) cannot be probed from sandbox — availability marked env-dependent.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — v1 quality gate is lint + typecheck + build only [VERIFIED: .planning/codebase/TESTING.md] |
| Config file | none |
| Quick run command | `pnpm --filter web check-types` |
| Full suite command | `pnpm check` (lint + typecheck + build all packages) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-01 | Unified app builds | build | `pnpm --filter web build` | ✅ script exists |
| FND-02 | Admin layout no public chrome | manual UAT | — | ❌ manual-only |
| FND-03 | Unauth /admin → /admin/login | manual UAT | — | ❌ manual-only |
| FND-04 | Admin API returns 401 without session | manual curl | — | ❌ manual-only |
| FND-05 | Migrations folder at apps/web/supabase/migrations | file check | `test -d apps/web/supabase/migrations && ls apps/web/supabase/migrations \| wc -l` | ❌ Wave 5 |
| FND-06 | dev:admin removed | script check | `grep -L dev:admin package.json` | ❌ Wave 5 |

### Sampling Rate

- **Per task commit:** `pnpm --filter web check-types`
- **Per wave merge:** `pnpm --filter web build`
- **Phase gate:** `pnpm check` + manual UAT checklist from ROADMAP success criteria

### Wave 0 Gaps

- [ ] No test framework — Phase 1 relies on build + manual smoke (aligned with PROJECT.md v1 scope)
- [ ] Manual UAT script/checklist for ROADMAP 5 success criteria — planner should embed in PLAN.md verification steps
- [ ] Marketplace dual-GET regression — needs explicit curl test cases in plan (anonymous + authenticated)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Supabase Auth + middleware session refresh |
| V3 Session Management | yes | `@supabase/ssr` cookie handling; return supabaseResponse with cookies |
| V4 Access Control | yes | `requireUser()` + `requireRole()` on admin API routes |
| V5 Input Validation | yes | Zod schemas at API boundaries (existing pattern) |
| V6 Cryptography | no | No new crypto in Phase 1 |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Middleware-only auth bypass | Elevation | Handler-level `requireUser()` on every admin API route [CITED: CVE-2025-29927 analysis] |
| Public signup via `/api/auth/register` | Spoofing | Route migrates in Phase 1; **hardening deferred Phase 3 (SEC-01)** — document as known gap |
| Service role on public GET | Info disclosure | Marketplace public GET keeps published-only filter; no auth expansion |

## Sources

### Primary (HIGH confidence)
- `apps/admin/src/lib/supabase/middleware.ts` — auth redirect pattern
- `apps/web/src/app/layout.tsx` — public shell coupling
- `apps/admin/src/app/api/marketplace/route.ts` + `apps/web/src/app/api/marketplace/route.ts` — API conflict
- Glob counts: 57 admin API routes, 31 migrations, 8 feature modules, 21 admin pages
- [Supabase SSR Next.js guide](https://supabase.com/docs/guides/auth/server-side/nextjs) — cookie session, proxy migration note
- `.planning/phases/01-foundation-app-merge/01-CONTEXT.md` — locked decisions
- `.planning/research/ARCHITECTURE.md`, `PITFALLS.md` — merge patterns and pitfalls

### Secondary (MEDIUM confidence)
- npm registry version checks (next 16.2.9, @supabase/ssr 0.12.0) — project stays on pinned versions
- `.planning/codebase/TESTING.md` — no test framework confirmed

### Tertiary (LOW confidence)
- Admin background asset location — not found in repo; needs manual verification during execution

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — pinned versions verified in package.json + npm
- Architecture: HIGH — brownfield code mapped with exact file counts
- Pitfalls: HIGH — PITFALLS.md + codebase audit align

**Research date:** 2026-06-14
**Valid until:** 2026-07-14 (stable stack; Next.js/Supabase may update faster)
