# Phase 4: Stack Consolidation - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning
**Mode:** auto-discuss (recommended defaults)

<domain>
## Phase Boundary

Dọn tech debt codebase **sau** security hardening, **trên cấu trúc hiện tại hoặc đã flatten** (nếu Phase 6 chạy trước). Deliverables còn lại sau Phase 6 absorb:

- Schema imports thống nhất — xóa deprecated local schema copies
- Supabase types regenerated — giảm `@ts-expect-error`
- Trust-breaking mocks disabled/removed (watchlist fake notifications, etc.)
- Type safety improvements trên API mutations

**Absorbed bởi Phase 6 (không lặp):** CONS-01 xóa `relique-marketplace/`, CONS-02 xóa `apps/admin/`, CONS-04 inline `@relique/ui` (Phase 6 merges packages), xóa pnpm workspace packages.

**Không trong phase này:** admin UX redesign (Phase 5), payments (v2), test framework/CI (v2).

</domain>

<decisions>
## Implementation Decisions

### Scope vs Phase 6 Overlap
- **D-01:** **CONS-01, CONS-02, CONS-04** — owned by **Phase 6** (flatten + delete legacy dirs + inline packages); Phase 4 **không** duplicate delete/inline work
- **D-02:** Phase 4 chạy **sau Phase 3**; nếu Phase 6 đã chạy trước → Phase 4 làm việc trên **flat `src/` layout** (paths adjust accordingly)
- **D-03:** **CONS-03** legacy admin localStorage — moot sau Phase 6 xóa `apps/admin/`; verify no imports remain in survivor app

### Schema Consolidation (CONS-03 scope → DATA-05)
- **D-04:** Xóa deprecated schema files tại `apps/web/src/lib/schemas/**` (hoặc `src/lib/schemas/**` post-Phase 6)
- **D-05:** Imports migrate sang **`@relique/shared/domain`** nếu Phase 4 chạy pre-Phase-6; nếu post-Phase-6 → imports trỏ **`@/lib/domain/**`** (inlined từ packages/shared)
- **D-06:** Xóa `apps/web/src/lib/services/contracts.ts` duplicate sau migration
- **D-07:** Không đổi Zod schema semantics — chỉ consolidate import paths

### UI Package Strategy (CONS-04)
- **D-08:** **Pre-Phase-6:** incremental migrate high-traffic admin components sang `@relique/ui` wrappers — **chỉ nếu Phase 4 chạy trước Phase 6**
- **D-09:** **Post-Phase-6:** CONS-04 satisfied by inline — Phase 4 chỉ verify không còn duplicate `components/ui/` drift vs `src/lib/ui/` (or equivalent inlined path)
- **D-10:** Luôn tuân **shadcn-guard** — không sửa raw `components/ui/**`; wrappers tại `components/shared/**` hoặc `components/app/**`

### Type Safety (DATA-06)
- **D-11:** Regenerate Supabase types từ migrations (`supabase gen types`) — single source `src/lib/supabase/types.ts` (path adjusts post-flatten)
- **D-12:** Target: **giảm ≥50%** `@ts-expect-error` trên API mutation routes — fix bằng typed inserts/updates, không suppress mới
- **D-13:** Ưu tiên routes: marketplace, leads, deals, consigned — highest mutation volume

### Mock & Trust Cleanup (CONS-05)
- **D-14:** **WatchlistButton** fake notifications — **disable** hoặc remove localStorage notification scheduler; giữ watchlist toggle UI nếu backend chưa có (no fake alerts)
- **D-15:** Contact fake success — **đã fixed Phase 2**; Phase 4 verify không regression
- **D-16:** QR random mock — **đã fixed Phase 2**; Phase 4 grep confirm no `RLQ-QUAL` generators remain
- **D-17:** `json.ts` localStorage helpers — remove nếu còn production usage; keep only dev/test if any

### localStorage Adapters (CONS-02 related)
- **D-18:** **DATA-04 completed Phase 2** — Phase 4 grep audit confirm zero production localStorage adapters for verify/consign

### Claude's Discretion
- Codemod vs manual import migration for schemas
- Order of @ts-expect-error cleanup by route cluster
- Whether to split oversized files (>300 lines) touched during migration — only if blocking type fixes

</decisions>

<canonical_refs>
## Canonical References

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 4 goal, CONS/DATA requirements
- `.planning/REQUIREMENTS.md` — CONS-01–05, DATA-05, DATA-06
- `.planning/PROJECT.md` — Package strategy (updated when Phase 6 completes)
- `.planning/phases/06-flat-root-npm-restructure/06-CONTEXT.md` — Overlap boundaries D-01

### Tech Debt Source
- `.planning/codebase/CONCERNS.md` — Duplicate schemas, triplicated shadcn, @ts-expect-error, mocks
- `.planning/codebase/CONVENTIONS.md` — Result pattern, service layer

### Schema & Types
- `packages/shared/src/domain/` — canonical schemas (pre-Phase-6)
- `apps/web/src/lib/schemas/` — deprecated copies to remove
- `apps/web/src/lib/supabase/types.ts` — regenerate target

### Mock Targets
- `apps/web/src/components/interactive/WatchlistButton.tsx`
- `apps/web/src/lib/services/impl/` — confirm no .local.ts survivors

### Conventions
- `.cursor/rules/shadcn-guard.mdc`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@relique/shared/domain` — full Zod schemas and contracts already exist
- `packages/ui` — shadcn wrappers (pre-Phase-6 migration target)

### Established Patterns
- Service layer `lib/services/impl/index.ts` — already Supabase post-Phase 2
- API routes use service-role + @ts-expect-error pattern — primary cleanup target

### Integration Points
- All imports of `@/lib/schemas/*` — codemod to shared/inlined domain
- Admin + web duplicate schema files — delete after import migration
- Supabase typegen pipeline — wire into `npm run check-types` post-Phase 6

</code_context>

<specifics>
## Specific Ideas

- [auto] Phase 4 scope shrinks when Phase 6 runs first — focus schema + types + mocks only
- [auto] No big-bang shadcn migration if Phase 6 inlines packages — avoid double work

</specifics>

<deferred>
## Deferred Ideas

- Vitest/Playwright test framework — v2 per PROJECT.md
- Split all >300 line files — only when touched; full split is backlog
- Blockchain/NFT verify — out of scope

</deferred>

---

*Phase: 04-stack-consolidation*
*Context gathered: 2026-06-14*
