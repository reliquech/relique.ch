# Phase 11 Audit — Ranked Findings

**Audited:** 2026-06-15  
**Baseline:** 2602.5 KB total chunks

## HIGH

### 1. CommandPalette in root layout

- **Impact:** `cmdk`, Dialog, `actionRegistry` loaded on every route including `/`, `/marketplace`, `/admin/login`
- **Evidence:** `src/app/layout.tsx` imported and rendered `<CommandPalette />`
- **Fix:** Plan 11-02 — move to `AdminPortalLayout.tsx`
- **Status:** ✅ Fixed

### 2. framer-motion fan-out (43 files)

- **Impact:** Animation library pulled into many client boundaries (buttons, cards, home sections)
- **Evidence:** 43 `from "framer-motion"` imports across `src/`
- **Fix:** Plan 11-04 — `next/dynamic` for below-fold home sections; defer button-level migration
- **Status:** ✅ Partial (home below-fold split)

## MEDIUM

### 3. recharts on DashboardPage

- **Impact:** Chart library in admin dashboard initial parse path
- **Evidence:** `DashboardPage.tsx` direct `from "recharts"`
- **Fix:** Plan 11-03 — extract `DashboardRevenueChart` + `dynamic(..., { ssr: false })`
- **Status:** ✅ Fixed

### 4. No code-splitting pattern

- **Impact:** All home sections statically imported in `HomeContent.tsx`
- **Evidence:** 0 `next/dynamic` before phase
- **Fix:** Plan 11-04
- **Status:** ✅ Fixed

## LOW

### 5. Unused `motion` npm package

- **Impact:** Duplicate of `framer-motion`; 0 imports
- **Evidence:** `package.json` listed `motion`; ripgrep 0 matches in `src/`
- **Fix:** Plan 11-05 — `npm uninstall motion`
- **Status:** ✅ Fixed

### 6. Dead TestimonialsSection import

- **Impact:** Unused import in `HomeContent.tsx`
- **Evidence:** Imported but never rendered
- **Fix:** Removed during Plan 11-04
- **Status:** ✅ Fixed

## OK (no change)

- `CompareDrawer` + `CurrencyProvider` scoped to `(site)/layout.tsx` only
- `SpeedInsights` on site layout only
- `lucide-react` uses named imports (tree-shakeable)

## Deferred

| Item | Reason |
|------|--------|
| framer-motion on shared buttons (`lib/ui/buttons/*`) | High touch; needs visual QA per button |
| `QRScanInput` lazy load | Browser API; defer until verify flow audit |
| Marketplace detail page dynamic sections | Out of scope; recommend Phase 12 |
| Per-route First Load JS automation | Next 16 build output lacks table; use analyzer manually |
