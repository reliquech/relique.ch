# Phase 14 Context

**Source:** `/gsd-add-phase` user analysis (2026-06-15)  
**Scope:** Public marketplace surfaces + `GET /api/marketplace` routing — **không redesign admin UI ngoài publish/visibility nếu cần**

## Executive summary

**Rule “chỉ Published lên marketplace” đã có sẵn** ở API public (`publicGet`) và RLS Supabase. Phase này **không thiết kế lại từ đầu** — đóng các lỗ hổng nơi public site vẫn thấy draft/archived hoặc dùng mock data.

## Data model (source of truth)

Bảng `marketplace_items` (generated columns):

| Field | Values | Meaning |
|-------|--------|---------|
| `state_lifecycle` | `draft`, `published`, `archived` | Admin status pills |
| `state_visibility` | `public`, `unlisted`, `private` | Public browse eligibility |

**Public catalog rule (locked):** `state_lifecycle = 'published'` **AND** `state_visibility = 'public'`

RLS policy (anon): published + (`public` OR `unlisted` for direct slug) — second defense layer.

## Current architecture

### Already correct

| Layer | Path | Behavior |
|-------|------|----------|
| Public list API | `publicGet()` in `src/app/api/marketplace/route.ts` | `.eq(state_lifecycle, published).eq(state_visibility, public)` |
| Public detail | `publicGetBySlug()` in `src/app/api/marketplace/[param]/route.ts` | Same lifecycle + visibility filters |
| RLS | `supabase/migrations/000_baseline.sql` | Anon SELECT gated |
| Admin publish | `PATCH /api/marketplace/[id]/status`, bulk publish | Sets `state.lifecycle` |

### Known gaps (must fix in phase)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| G1 | **Session routes public → admin list** | `GET /api/marketplace` L263–267: `if (sessionUser) return adminGet()` | Admin logged in browsing `/marketplace` sees **draft/archived** |
| G2 | **Homepage carousel uses mock** | `src/app/(home)/components/MarketplaceSection.tsx` → `MOCK_ITEMS` from `src/data/marketplace.data.ts` | Homepage ignores DB + publish rule |
| G3 | **Featured / related depend on G1** | `marketplaceService.list()` → same route | Same session bleed |
| G4 | **Publish may not set visibility** | Status PATCH / bulk publish | Item `published` but `visibility != public` → invisible on public list |
| G5 | **Dual API clients** | `src/lib/services/api/marketplaceService.ts` (public) vs `src/features/marketplace/services/marketplaceService.ts` (admin) | Risk of wrong client on wrong surface |

## Locked requirements

### A. Operations (document + verify, minimal code)

1. Admin publishes item via `/admin/items` or status API
2. On publish: ensure `state.visibility = 'public'` (code if UI missing)
3. Draft/archived never appear on `/marketplace` for anonymous users

### B. Public vs admin API split (primary code work)

**Default approach (planner discretion):** query param or header, not necessarily new route tree.

| Surface | Must call | Filter |
|---------|-----------|--------|
| Public site (`/marketplace`, homepage, related) | **always public scope** | published + public |
| Admin (`/admin/items`, featured admin) | **admin scope** | no lifecycle filter (tabs handle it) |

Options (pick one in plan):

1. `?scope=public` on existing `GET /api/marketplace` — public callers always pass it; ignore session for scope=public
2. Split routes: keep `GET /api/marketplace` public-only; move admin list to `GET /api/admin/marketplace` (larger change)
3. `Referer` / `x-relique-context: public` — **avoid** (fragile)

**Locked outcome:** Admin session on public pages **must not** widen catalog beyond published+public.

Same rule for `GET /api/marketplace/[param]` when param is **slug** (public) vs **UUID** (admin).

### C. Replace homepage mock

- `MarketplaceSection` fetches real published items (server component or API)
- Cap carousel count (e.g. featured or newest 8–12)
- Loading/error fallback: empty state, not `MOCK_ITEMS`

### D. Publish workflow hardening

- Publish / bulk publish sets `lifecycle: published` **and** `visibility: public`
- Unpublish / archive sets appropriate visibility (planner: archive → hidden from public)
- Document in VERIFICATION.md

### E. Verification matrix (UAT)

| Case | Expected |
|------|----------|
| Draft item | Not on `/marketplace` (anon) |
| Publish item | Appears on `/marketplace` |
| Archive item | Removed from public list |
| Draft slug URL | 404 public |
| Admin logged in + `/marketplace` | **Still only published+public** (locked) |
| Published + visibility not public | Not in public list; admin sees in items |

### F. Out of scope

- Stripe / payments
- Phase 13 table/grid/editor UX (unless publish button touch needed)
- Redesign unrelated pages
- New RLS policies unless audit finds gap

## Hard constraints

- Preserve existing admin routes and Phase 12 items page behavior
- No regression: admin list must still show all statuses for operators
- `npm run lint`, `check-types`, `build` pass
- RLS remains authoritative — API split complements, not replaces

## Canonical references

```217:222:src/app/api/marketplace/route.ts
  let query = supabase
    .from("marketplace_items")
    .select("*", { count: "exact" })
    .eq("state_lifecycle", "published")
    .eq("state_visibility", "public")
```

```260:267:src/app/api/marketplace/route.ts
export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    return adminGet(request);
  }
  return publicGet(request);
}
```

```1:14:src/app/(home)/components/MarketplaceSection.tsx
import { MOCK_ITEMS } from "@/data/marketplace.data";
// ...
<MarketplaceCarousel items={MOCK_ITEMS} />
```

## Depends on

**Phase 12** (admin publish/bulk exists). May run parallel to Phase 13.

## Claude's discretion

- `scope=public` vs dedicated admin route
- Server-side fetch on homepage vs client `marketplaceService`
- Deprecate or gate `MOCK_ITEMS` export (keep for Storybook/fixtures only if needed)

## Deliverables

- Files changed list
- Data-flow diagram (public vs admin)
- API contract notes
- Remaining backend gaps (if any)
- `14-VERIFICATION.md` with UAT matrix above
