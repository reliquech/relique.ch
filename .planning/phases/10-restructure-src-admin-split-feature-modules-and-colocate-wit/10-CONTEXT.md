# Phase 10 Context — Restructure src/admin

**Gathered:** 2026-06-15  
**Status:** Ready for planning  
**Source:** User intent + 10-RESEARCH.md

<domain>
## Phase Boundary

Di chuyển toàn bộ `src/admin/**` (~82 files, 7 domain) sang cấu trúc 3 lớp:

1. **`src/app/admin/**`** — thin routes (one-line re-export)
2. **`src/components/admin/{domain}/`** — UI (pages, components, shell)
3. **`src/features/{domain}/`** — logic (services, hooks, types, schemas)

**Sau phase:** `src/admin/` **không tồn tại**; zero import `@/admin/*`.

Không thay đổi API routes, Supabase schema, auth, hay admin UX redesign (Phase 5).
</domain>

<decisions>
## Implementation Decisions

### Layout (locked)
- UI → `components/admin/{crm,marketplace,dashboard,submissions,users,notifications}/`
- Shell → `components/admin/shell/` (PortalSidebar, AdminPortalLayout)
- Logic → `features/{domain}/` (extend stubs marketplace + crm đã có)
- `CrmViewBar` → `components/admin/crm/CrmViewBar.tsx` (rời `components/shared/`)

### File size (locked)
- Mọi `.tsx` sau migrate **≤ 300 lines**
- Split bắt buộc: MarketplaceForm (478), LeadsPage (355), CustomersPage (346)

### Hooks (locked)
- Canonical `useDebounce` → `@/hooks/useDebounce`
- Xóa `src/lib/hooks/useDebounce.ts` sau migrate callers

### Wave order (locked)
0. Prep + grep baseline  
1. users + notifications  
2. dashboard  
3. submissions  
4. marketplace (+ merge marketplace-form)  
5. crm (+ CrmViewBar)  
6. Delete `src/admin/` + phase10:gate

### Claude's Discretion
- Rename `marketplace-form/` → `marketplace/form/` (recommended Wave 4)
- Barrel `index.ts` per domain (optional)
- Profile page: consolidate duplicate app vs admin copy
</decisions>

<canonical_refs>
## Canonical References

### Current admin tree
- `src/admin/**` — source to delete
- `src/app/admin/(portal)/**/page.tsx` — thin re-exports today
- `src/components/admin/**` — partial shell + marketplace-form

### Partial migration already done
- `src/features/marketplace/constants.ts`, `utils/uploadPaths.ts`
- `src/features/crm/types.ts`

### Gate template
- `scripts/phase9-grep-gate.mjs` — pattern for phase10 grep gate

### Rules
- `.cursor/rules/shadcn-guard.mdc` — no edit `components/ui/**`
- `CLAUDE.md` — quality gate lint + typecheck + build
</canonical_refs>
