# Phase 6: Flat Root App & npm Simplify - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning
**Mode:** auto-discuss (user-requested restructure + recommended defaults)

<domain>
## Phase Boundary

Flatten monorepo thành **single Next.js app tại repo root**. Deliverables:

- `apps/web/src/**` → `src/**` (root)
- `apps/web/supabase/` → `supabase/` (root)
- `apps/web/public/` → `public/` (root)
- Single root `package.json` — **npm** (không pnpm workspace, không Turborepo)
- Xóa `apps/`, `packages/`, `turbo.json`, `pnpm-workspace.yaml`
- Inline `packages/shared` + `packages/ui` vào `src/`
- Upgrade core deps lên latest stable
- Xóa `apps/admin/`, `relique-marketplace/` (CONS-01, CONS-02)

**User intent (2026-06-14):** "giờ setup, restructure lại toàn bộ" — **ưu tiên thực thi sớm**, có thể chạy **ngay sau Phase 2** (trước Phase 3–5) nếu planner reorder.

**Không trong phase này:** admin UX redesign (Phase 5), deep security audit (Phase 3), schema @ts-expect-error cleanup (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Execution Priority
- **D-01:** **Reorder allowed** — Phase 6 có thể execute **sau Phase 2** (code complete) mà không đợi Phase 3–5; update ROADMAP depends-on khi plan
- **D-02:** Phase 2 UAT (migrations push) **không block** file move — nhưng `npm run build` phải pass trước phase gate

### Target Directory Layout
- **D-03:** Root structure:
  ```
  relique.co/
  ├── src/
  │   ├── app/          # Next.js app router (from apps/web/src/app)
  │   ├── admin/        # admin modules
  │   ├── components/
  │   └── lib/
  │       ├── domain/   # inlined from packages/shared/src/domain
  │       └── ui/       # inlined from packages/ui (shadcn + wrappers)
  ├── supabase/
  ├── public/
  ├── package.json
  ├── next.config.ts
  ├── tsconfig.json
  └── tailwind.config.ts
  ```
- **D-04:** `@/` path alias → `./src/*` (tsconfig paths)
- **D-05:** **Không** giữ `apps/` folder — zero nested apps

### Package Manager & Tooling
- **D-06:** **npm** là package manager duy nhất — xóa `pnpm-workspace.yaml`, `packageManager` field pnpm
- **D-07:** Xóa **Turborepo** — `turbo.json` deleted; root scripts: `dev`, `build`, `start`, `lint`, `check-types` trực tiếp gọi Next.js
- **D-08:** **Không** giữ workspace packages — merge `apps/web/package.json` deps lên root `package.json`
- **D-09:** Lockfile: `package-lock.json` (npm); xóa `pnpm-lock.yaml`
- **D-10:** ESLint/PostCSS/Tailwind configs hoist từ `apps/web/` lên root

### Inlining Workspace Packages
- **D-11:** `@relique/shared` → `src/lib/domain/**` — update imports `@relique/shared/domain` → `@/lib/domain` (codemod)
- **D-12:** `@relique/ui` → `src/lib/ui/**` — update imports `@relique/ui` → `@/lib/ui` hoặc `@/components/...` per export map
- **D-13:** `@repo/eslint-config`, `@repo/typescript-config` — inline minimal configs vào root hoặc drop nếu redundant
- **D-14:** Sau inline, **xóa** `packages/` directory entirely

### Legacy Deletion (CONS-01, CONS-02)
- **D-15:** **Xóa** `apps/admin/` — merge đã xong Phase 1
- **D-16:** **Xóa** `relique-marketplace/` Vite prototype — không trong workspace, không deploy
- **D-17:** **Xóa** `apps/web/` sau move verify — không orphan files

### Dependency Upgrades
- **D-18:** Upgrade **latest stable** trong cùng major trước: Next.js, React, React-DOM, Supabase JS, Zod, TypeScript
- **D-19:** Major bumps (Next 16→17 nếu có, Zod 4, etc.) — **allowed** nếu `npm run build` + `check-types` pass; document breaking changes
- **D-20:** Không upgrade mọi transitive dep — chỉ direct deps + critical peers
- **D-21:** Giữ Node `>=18` engines (bump to 20 LTS recommended — Claude discretion)

### Config & Env
- **D-22:** `.env.example` và `.env.local` tại **repo root** (move from `apps/web/`)
- **D-23:** Supabase CLI `supabase/` config paths unchanged relative to root
- **D-24:** `components.json` (shadcn) path update → `src/components/ui` với **shadcn-guard** still enforced

### CI / Docs Updates
- **D-25:** Update README, any scripts referencing `pnpm`, `turbo`, `apps/web`
- **D-26:** Root `check` script = `npm run lint && npm run check-types && npm run build`

### Claude's Discretion
- Exact import codemod strategy (jscodeshift vs manual)
- Whether `src/lib/ui` vs `src/components/ui` for inlined shadcn primitives
- Next.config option merges during hoist
- Node engines version (18 vs 20)
- Handling `docs/`, `.agents/` — leave untouched

</decisions>

<canonical_refs>
## Canonical References

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria
- `.planning/PROJECT.md` — Architecture constraints (update post-flatten: single root app)
- `.planning/phases/01-foundation-app-merge/01-CONTEXT.md` — Survivor app decisions
- `.planning/phases/04-stack-consolidation/04-CONTEXT.md` — Overlap: CONS-01/02/04 owned here

### Current Monorepo Layout
- `apps/web/` — survivor app (all source to move)
- `apps/admin/` — delete target
- `packages/shared/` — inline to `src/lib/domain`
- `packages/ui/` — inline to `src/lib/ui`
- `relique-marketplace/` — delete target
- `package.json` (root) — replace with npm single-app scripts
- `pnpm-workspace.yaml`, `turbo.json` — delete

### Config Files to Hoist
- `apps/web/package.json` — dependency source of truth
- `apps/web/next.config.ts` (or .js)
- `apps/web/tsconfig.json`
- `apps/web/tailwind.config.ts`
- `apps/web/postcss.config.js`
- `apps/web/.env.example`

### Conventions
- `.cursor/rules/shadcn-guard.mdc` — still applies post-move
- `.planning/codebase/STRUCTURE.md` — update after execute
- `.planning/codebase/STACK.md` — update after execute

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Entire `apps/web/` tree — move wholesale, minimal logic changes
- Workspace packages — copy then codemod imports, don't rewrite schemas

### Established Patterns
- `@/` alias already used in apps/web — same alias at root
- Supabase migrations at `apps/web/supabase/migrations/` — 34 files, move intact

### Integration Points
- All `@relique/shared` and `@relique/ui` imports across `apps/web/src/**`
- Root turbo scripts in CI/docs
- `pnpm --filter web` → `npm run dev`

</code_context>

<specifics>
## Specific Ideas

- User: "bỏ apps, dùng src ra ngoài, bỏ turbo, npm đơn giản, package mới nhất"
- [auto] Big-bang move preferred over gradual — user wants full restructure now
- [auto] Inline packages — no workspace after flatten

</specifics>

<deferred>
## Deferred Ideas

- npm workspaces for future packages — out of scope; single app v1
- Docker/deploy config changes — update if exists, not redesign
- Phase 4 schema cleanup — runs after flatten on new paths

</deferred>

---

*Phase: 06-flat-root-npm-restructure*
*Context gathered: 2026-06-14*
