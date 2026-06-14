# Architecture Patterns — Unified Next.js Memorabilia Platform

**Domain:** Sports memorabilia authentication + marketplace (public site + internal CRM)
**Researched:** 2026-06-14
**Confidence:** HIGH (brownfield codebase mapped + official Supabase/Next.js patterns verified)

## Recommended Architecture

Single Next.js 16 App Router application (`apps/web`) serving both the public marketing/marketplace site and the authenticated admin CRM at `/admin/*`. Shared domain packages (`@relique/shared`, `@relique/ui`) remain workspace packages. Supabase is the single data plane. One deploy, one middleware/proxy session layer, one API namespace under `/api/*`.

### Target Directory Layout

```
apps/web/src/
├── app/
│   ├── layout.tsx                 # Root: html, fonts, global Toaster only
│   ├── globals.css
│   │
│   ├── (site)/                    # Route group — NO URL segment
│   │   ├── layout.tsx             # Public shell: Header, Footer, Currency, Compare
│   │   ├── page.tsx               # → /
│   │   ├── marketplace/           # → /marketplace
│   │   ├── verify/                # → /verify
│   │   ├── consign/               # → /consign
│   │   ├── contact/               # → /contact
│   │   └── ...                    # about, terms-policies, authenticate
│   │
│   ├── admin/                     # URL segment — → /admin/*
│   │   ├── layout.tsx             # Admin shell: sidebar, notifications, profile
│   │   ├── page.tsx               # → /admin (dashboard)
│   │   ├── deals/page.tsx         # Thin re-export → features/crm
│   │   ├── leads/page.tsx
│   │   ├── marketplace/...
│   │   └── ...
│   │
│   ├── login/page.tsx             # → /login (outside both shells)
│   │
│   └── api/
│       ├── marketplace/           # Public read (published listings)
│       ├── verify/                # Public write (future)
│       ├── consign/               # Public write (future)
│       ├── contact/               # Public write (future)
│       ├── deals/                 # Admin — requireUser + requireRole
│       ├── customers/
│       └── ...                    # ~58 admin routes migrated from apps/admin
│
├── features/                      # Admin business modules (from apps/admin)
│   ├── crm/                       # pages/, components/, services/, hooks/
│   ├── marketplace/
│   ├── submissions/
│   ├── notifications/
│   └── ...
│
├── components/
│   ├── shell/                     # Public: Header, Footer
│   ├── admin/                     # Admin wrappers (PortalSidebar, etc.)
│   ├── app/                       # shadcn wrappers (shadcn-guard)
│   └── shared/
│
├── lib/
│   ├── supabase/                  # client, server, middleware, requireUser, requireRole
│   ├── services/                  # Public facades + api/ + impl/
│   ├── actions/                   # Command palette registry
│   └── schemas/
│
└── middleware.ts                  # Session refresh + /admin redirect (→ proxy.ts in N16)
```

**Terminology note:** PROJECT.md says "route group `/admin`" but `/admin` is a **URL segment** (`app/admin/`), not a parenthesized route group. Use `(site)` for public layout isolation; use `admin/` for the CRM URL prefix. This matches the existing `apps/admin/src/app/admin/` pattern — only the host app changes.

### Layout Nesting Model

```
RootLayout (app/layout.tsx)
├── (site)/layout.tsx          → Header + Footer + public providers
│   └── Public pages
├── admin/layout.tsx           → Sidebar + admin header (client)
│   └── CRM pages
└── login/page.tsx             → Minimal auth page (inherits root only)
```

**Why split root vs `(site)` layout:** Admin pages must NOT inherit Header/Footer/CompareDrawer. Today `apps/web/src/app/layout.tsx` wraps everything in the public shell — moving that shell into `(site)/layout.tsx` is the first structural change required for merge.

| Layout | Metadata | robots | Shell |
|--------|----------|--------|-------|
| Root | Shared fonts, base title template | — | `<html>`, `<body>`, Toaster |
| `(site)` | SEO-rich (OG, sitemap URLs) | index, follow | Header, Footer, Currency, Compare |
| `admin` | `robots: noindex` | noindex, nofollow | PortalSidebar, NotificationCenter, CommandPalette |
| `login` | noindex | noindex | Centered form only |

## Component Boundaries

| Component | Responsibility | Communicates With | Location |
|-----------|---------------|-------------------|----------|
| **Public Pages** | Render marketing, marketplace browse, verify/consign flows | Public service facades, `@relique/ui` | `app/(site)/**/page.tsx`, co-located `components/` |
| **Admin Feature Modules** | Encapsulate CRM, marketplace mgmt, submissions domains | Admin client services → `/api/*` | `features/{domain}/` |
| **Thin Route Files** | Map URL → feature page; no business logic | Feature barrel exports | `app/admin/**/page.tsx` |
| **Public Service Facades** | Stable import surface; delegate API vs local impl | `/api/marketplace`, `/api/verify`, etc. | `lib/services/{domain}Service.ts` |
| **Admin Client Services** | HTTP wrappers for admin API routes | `/api/deals`, `/api/customers`, etc. | `features/{domain}/services/` |
| **API Route Handlers** | Auth, Zod validation, Supabase queries, audit logging | Supabase service-role client | `app/api/**/route.ts` |
| **Supabase Auth Layer** | Session refresh, `requireUser`, `requireRole` | `@supabase/ssr`, `profiles` table | `lib/supabase/*` |
| **Middleware/Proxy** | Cookie refresh, optimistic `/admin` redirect | Supabase anon client | `middleware.ts` (migrate to `proxy.ts`) |
| **Domain Package** | Schemas, contracts, types — cross-surface truth | Zod only | `packages/shared/src/domain/` |
| **UI Package** | Shared design system primitives | Radix, Tailwind | `packages/ui/` |

### Boundary Rules

1. **Public pages never import `features/crm/*`** — admin modules stay behind `/admin` routes.
2. **Admin features never import public route components** — shared UI comes from `@relique/ui` or `components/shared/`.
3. **All Supabase writes go through Route Handlers** — no service-role client in client components.
4. **API routes are the authorization boundary** — middleware is UX redirect only, not security.
5. **Row mapping stays colocated with API routes** — `mapRowToListing` pattern per resource.

## Data Flow

### Public Marketplace (read-only, post-merge)

```
Browser → /marketplace
  → MarketplaceGrid (client)
    → marketplaceService.list() [facade]
      → GET /api/marketplace
        → route.ts: Zod query parse
        → createServiceRoleClient()
        → SELECT marketplace_items WHERE published + public
        → mapRowToListing → JSON
  → Render cards
```

### Admin CRM Mutation (auth-required)

```
Browser → /admin/deals
  → middleware: refresh session, redirect if no user
  → admin/layout.tsx: useProfile() for display
  → DealsPage (features/crm)
    → dealsService.update()
      → PATCH /api/deals/[id]
        → requireUser() → 401 if missing
        → requireRole({ allow: ['admin','editor'] }) → 403
        → createServiceRoleClient()
        → UPDATE deals + INSERT audit_logs
  → Client refetch
```

### Verify/Consign (target state — replaces localStorage)

```
Browser → /verify
  → VerifyFormSection
    → verifyService.run() [facade]
      → POST /api/verify
        → Zod input validation
        → Supabase lookup (products / certificates table)
        → Result<T,E> response
  → VerifyResultPanel

Admin: /admin/submissions/consign
  → features/submissions
    → GET /api/consigned (requireUser)
    → Admin processes → PATCH /api/consigned/[id]
```

### Auth Session Flow (unified)

```
Every matched request
  → middleware/proxy: createServerClient (anon key)
  → supabase.auth.getUser() — refresh cookies
  → If path starts with /admin AND no user → redirect /login?redirect=...

Login POST
  → Supabase client signInWithPassword
  → Cookies set via SSR helper
  → Redirect to ?redirect or /admin

API request (parallel path, NOT gated by middleware)
  → route.ts top: requireUser() / requireRole()
  → Independent of middleware — survives CVE-2025-29927 class bypasses
```

**Data flow direction:** Always **UI → client service → Route Handler → Supabase**. Never UI → Supabase direct for writes. Public reads may use service-role in handlers (current pattern) but should migrate toward RLS + anon client where feasible in later hardening phases.

## Patterns to Follow

### Pattern 1: Parenthesized Route Group for Public Shell

**What:** `(site)` wraps all public pages; URL paths unchanged (`/marketplace` not `/site/marketplace`).
**When:** Any time public and admin need different layouts in one app.
**Relique application:** Move existing `apps/web/src/app/{marketplace,verify,...}` under `app/(site)/` and relocate Header/Footer from root layout to `(site)/layout.tsx`.

### Pattern 2: Thin Admin Routes + Feature Modules

**What:** `app/admin/deals/page.tsx` contains only `export { default } from "@/features/crm/pages/DealsPage"`.
**When:** Admin domains with 5+ components and dedicated services.
**Relique application:** Preserve `apps/admin/src/features/*` structure — move wholesale to `apps/web/src/features/*`.

### Pattern 3: Defense-in-Depth Auth (3 layers)

**What:**
1. **Middleware/proxy** — session refresh + redirect unauthenticated `/admin` requests
2. **Route handlers** — `requireUser()` + `requireRole()` on every admin `/api/*` mutation
3. **Server components (optional)** — `getUser()` check in sensitive admin pages for SSR gating

**When:** Always for admin surfaces. Supabase docs (2026) recommend proxy for cookie refresh; handler-level checks are authoritative.

**Relique application:** Port `apps/admin/src/lib/supabase/middleware.ts`, `requireUser.ts`, `requireRole.ts` unchanged. Extend matcher to cover all `/admin` subpaths. Audit every migrated `route.ts` for handler-level auth.

```typescript
// middleware.ts — optimistic guard (UX, not security boundary)
if (!user && pathname.startsWith("/admin")) {
  return NextResponse.redirect(`/login?redirect=${pathname}`);
}

// route.ts — authoritative guard
const { user, response } = await requireUser();
if (response) return response;
const roleCheck = await requireRole({ allow: ["admin", "editor"] });
if (roleCheck.response) return roleCheck.response;
```

### Pattern 4: Unified API Namespace with Route-Prefix Conventions

**What:** Single `app/api/` tree; distinguish public vs admin by auth requirements, not separate apps.
**When:** One deploy, shared Supabase project.
**Convention for Relique:**

| Prefix | Auth | Example |
|--------|------|---------|
| `/api/marketplace` | None (published-only filter) | GET listings |
| `/api/verify`, `/api/consign`, `/api/contact` | Rate-limit + validation; no session | Public submissions |
| `/api/deals`, `/api/customers`, ... | `requireUser` + role | CRM |
| `/api/auth/register` | Harden before merge — remove or gate | Security fix |

### Pattern 5: Service Facade for Backend Swappability

**What:** Pages import `marketplaceService`, not `fetch()` directly. Facade delegates to `api/` or `impl/` adapter.
**When:** Public flows transitioning mock → Supabase (verify, consign).
**Relique application:** Keep `lib/services/` structure; swap `impl/*.local.ts` → `api/*Service.ts` per domain without touching pages.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Single Root Layout with Public Header on Admin

**What:** Current web `layout.tsx` wraps all children in Header/Footer.
**Why bad:** Admin CRM unusable under marketing shell; duplicate nav, broken sidebar layout.
**Instead:** `(site)/layout.tsx` for public shell only; `admin/layout.tsx` for portal shell.

### Anti-Pattern 2: Middleware as Sole Auth Gate

**What:** Assuming `middleware.ts` protects `/admin` and `/api/admin/*`.
**Why bad:** Matcher gaps, CVE-2025-29927 bypass class, API routes explicitly excluded from admin matcher today.
**Instead:** Handler-level `requireUser()` on every sensitive route; middleware for redirect UX only.

### Anti-Pattern 3: Big-Bang File Copy

**What:** Copy all admin `app/`, `features/`, `api/` in one PR.
**Why bad:** Build breaks for days; impossible to bisect; type errors compound (~50 existing `@ts-expect-error`).
**Instead:** Incremental merge in dependency order (see Build Order below).

### Anti-Pattern 4: Duplicating Supabase Client Factories

**What:** Separate `lib/supabase/` per former app after merge.
**Why bad:** Cookie handling diverges; session desync between public and admin.
**Instead:** One `lib/supabase/` in `apps/web`; delete admin copies after migration.

### Anti-Pattern 5: Route Group Confusion for `/admin`

**What:** Using `(admin)` route group expecting `/admin` URL.
**Why bad:** `(admin)/dashboard` → `/dashboard`, not `/admin/dashboard`.
**Instead:** `app/admin/` URL segment for CRM; `(site)` only for layout grouping.

## Suggested Build Order

Foundation-first per PROJECT.md. Each step should leave `pnpm build` passing before the next.

```
Phase 0: Shared foundation (no route migration yet)
  ├── Consolidate schemas → @relique/shared/domain
  ├── Merge Supabase types (single types.ts)
  └── Move supabase/migrations/ to repo-root or apps/web/supabase/

Phase 1: Layout split in apps/web (prep, still no admin merge)
  ├── Create app/(site)/layout.tsx — move Header/Footer from root
  ├── Move public routes under app/(site)/
  ├── Slim root layout.tsx
  └── Verify: build + all public URLs unchanged

Phase 2: Auth infrastructure in apps/web
  ├── Copy lib/supabase/* from admin
  ├── Add middleware.ts (session refresh + /admin guard)
  ├── Add login/page.tsx (placeholder or full)
  └── Verify: middleware compiles; login route renders

Phase 3: API layer migration (highest dependency — admin UI depends on this)
  ├── Copy app/api/* from admin → apps/web/app/api/*
  ├── Ensure requireUser/requireRole on all admin routes
  ├── Fix route conflicts (both apps have /api/marketplace — merge handlers)
  ├── Harden /api/auth/register
  └── Verify: curl admin APIs with session cookie

Phase 4: Admin features + routes
  ├── Move features/* from admin → apps/web/src/features/*
  ├── Move admin components (shell, command palette)
  ├── Create app/admin/layout.tsx + thin page re-exports
  ├── Move admin static assets (background image)
  └── Verify: /admin/* renders; sidebar nav works

Phase 5: Public data layer (replace mocks)
  ├── verify: impl/local → /api/verify + Supabase
  ├── consign: impl/local → /api/consign + Supabase
  ├── contact: wire Resend
  └── Verify: end-to-end public flows persist to DB

Phase 6: Consolidation + cleanup
  ├── Remove apps/admin from workspace
  ├── Update turbo.json, pnpm-workspace.yaml, root scripts
  ├── Deduplicate components/ui (wrapper pattern)
  ├── Delete legacy localStorage services
  └── Single deploy config (Vercel root = apps/web)

Phase 7: Admin UX redesign (depends on stable /admin shell)
  └── Feature-by-feature UI overhaul within features/*
```

### Build Order Dependency Graph

```
@relique/shared schemas
        ↓
Supabase lib + middleware
        ↓
Admin API routes (/api/*)
        ↓
Admin features + /admin pages
        ↓
Public mock → Supabase APIs
        ↓
apps/admin deletion
        ↓
Admin UX redesign
```

**Critical path:** API routes before admin pages (pages fetch `/api/*` on mount). Layout split before admin routes (admin must not inherit public shell). Middleware before admin pages (redirect loop prevention).

**Parallelizable:**
- Phase 0 schema work ∥ Phase 1 layout split (different files)
- Phase 5 public flows ∥ Phase 7 admin UX (after Phase 4 completes)
- `@relique/ui` dedup ∥ Phase 6 cleanup

### API Route Conflict Resolution

Both apps expose `/api/marketplace`. Merge strategy:

| App | Handler behavior | Unified decision |
|-----|------------------|------------------|
| web GET | Public published listings | Keep as public GET |
| admin GET/POST/PATCH | Full CRUD with auth | Admin mutations under same `/api/marketplace` with `requireUser` on write methods |
| admin upload | `/api/marketplace/upload/*` | Move as-is |

Use HTTP method + auth to separate concerns, not duplicate route trees.

## /admin Route Group Patterns with Middleware Auth

### Matcher Configuration

```typescript
export const config = {
  matcher: [
    // Refresh session on pages; exclude static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Do NOT** exclude `/api` from session refresh if admin API routes need cookie-based `requireUser()`. Current admin middleware skips env validation for `/api` but still passes through — preserve this. API auth is handler-level, not middleware redirect.

### Path Rules

| Path | Middleware action | Handler auth |
|------|-------------------|--------------|
| `/`, `/marketplace`, `/verify`, ... | Refresh session only | None (public) |
| `/admin`, `/admin/*` | Refresh + redirect if no user | N/A (pages) |
| `/login` | Refresh; allow unauthenticated | N/A |
| `/api/marketplace` GET | Pass through | None + published filter |
| `/api/deals` | Pass through | `requireUser` + role |
| `/api/auth/register` | Pass through | Harden/block |

### Next.js 16 Proxy Migration

Supabase docs (2026) rename `middleware.ts` → `proxy.ts` with `getClaims()` for JWT validation. Next.js 16 supports this migration. **Recommendation:** Start merge with existing `middleware.ts` (proven in admin); migrate to `proxy.ts` + `getClaims()` as a discrete hardening task after unified app builds. Both files should not coexist.

### Login Redirect Flow

```
/admin/deals (no session)
  → middleware redirect → /login?redirect=/admin/deals
  → sign in success
  → router.push(redirect) → /admin/deals
```

Preserve `apps/admin` behavior exactly — operators depend on this flow.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Auth session refresh** | Single middleware pass/request | Consider matcher narrowing to `/admin`, `/login`, `/api` | Edge proxy + short-lived JWT; monitor cookie size |
| **API route count (~60)** | Monolithic `app/api/` fine | Split by domain into route groups with shared `lib/api/` helpers | Extract high-traffic routes to edge functions or dedicated BFF |
| **Admin client state** | Local fetch + useState (current) | Introduce React Query for cache/dedup | Required for CRM performance |
| **Public marketplace** | Service-role read acceptable | Add Redis/ISR cache for listing grid | CDN + read replicas; RLS-scoped anon reads |
| **File uploads** | Supabase Storage direct | Presigned URLs (already in admin) | Bucket policies per tenant |
| **Build time** | Single app faster than two apps | Turborepo remote cache for `packages/*` | Module federation only if admin UX becomes fully independent (unlikely) |

## Monorepo After Merge

```
relique.co/
├── apps/
│   └── web/                 # Single Next.js app (public + admin)
├── packages/
│   ├── shared/              # Domain layer
│   ├── ui/                  # Design system
│   ├── eslint-config/
│   └── typescript-config/
├── supabase/                # Migrations (relocated from apps/admin)
└── turbo.json               # build: web only
```

Keep `packages/*` as workspace dependencies. Remove `apps/admin` from `pnpm-workspace.yaml` and `turbo.json` pipeline. Root scripts simplify: `pnpm dev` → `apps/web` only.

## Sources

| Source | Confidence | Used for |
|--------|------------|----------|
| `.planning/codebase/ARCHITECTURE.md` | HIGH | Current layers, data flows, auth patterns |
| `.planning/codebase/STRUCTURE.md` | HIGH | File locations, naming conventions |
| `.planning/PROJECT.md` | HIGH | Merge requirements, foundation-first order |
| `apps/admin/src/lib/supabase/middleware.ts` | HIGH | Existing auth redirect logic |
| `apps/web/src/app/layout.tsx` | HIGH | Public shell coupling issue |
| [Supabase SSR Next.js guide](https://supabase.com/docs/guides/auth/server-side/nextjs) | HIGH | Cookie session, proxy migration, getClaims |
| [Makerkit App Router structure](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure) | MEDIUM | `(public)` + `admin/` layout split pattern |
| [Next.js security best practices 2026](https://www.authgear.com/post/nextjs-security-best-practices/) | MEDIUM | Defense-in-depth, middleware not security boundary |
| [CVE-2025-29927 analysis](https://faultlinesec.com/blog/nextjs-middleware-auth) | MEDIUM | Handler-level auth requirement |
| [Next.js 16 proxy.ts auth](https://shubhra.dev/tutorials/nextjs-16-authentication-3-layer-security) | MEDIUM | middleware → proxy rename, 3-layer model |

**LOW confidence (not primary basis):** Generic monorepo merge articles recommending keeping separate apps — contradicted by Relique's explicit single-deploy decision.

---

*Architecture research for unified platform milestone. Informs roadmap phase ordering and component boundary decisions.*
