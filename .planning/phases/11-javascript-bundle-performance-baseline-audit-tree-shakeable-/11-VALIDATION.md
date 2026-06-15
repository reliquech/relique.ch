# Phase 11 Validation Strategy

**Phase:** JavaScript bundle performance  
**Requirements:** PERF-11-01..04

## Requirement → Automated Command Map

| Req ID | Behavior | Test Type | Automated Command | Plan |
|--------|----------|-----------|-------------------|------|
| PERF-11-01 | Baseline metrics captured | artifact | `test -f .planning/phases/11-*/11-BASELINE.md` | 01 |
| PERF-11-02 | No UI/feature/API regression | build + manual | `npm run build` + smoke checklist in 11-VERIFICATION.md | 02–05, 06 |
| PERF-11-03 | Bundle size ≤ baseline (or documented delta) | script | `npm run phase11:bundle-compare` | 06 |
| PERF-11-04 | Composite gate | composite | `npm run phase11:gate` | 06 |

## Composite Gate

```bash
npm run phase11:gate
# = phase11:bundle-compare && check-types && build
```

## Per-Wave Sampling

| Wave | After plan | Command |
|------|------------|---------|
| 1 | 11-01 | `npm run build`, verify `11-BASELINE.md` |
| 2 | 11-02 | `npm run check-types`, public route smoke |
| 3 | 11-03, 11-04 | `npm run check-types` |
| 4 | 11-05 | `npm run check-types`, `npm run build` |
| 5 | 11-06 | `npm run phase11:gate` |

## Manual UAT (PERF-11-02)

- [ ] `/` — home renders, animations work on scroll
- [ ] `/marketplace` — grid loads, filters work
- [ ] `/admin/login` — login form (no cmdk on public `/` — verify separately)
- [ ] `/admin` — dashboard chart loads after dynamic import
- [ ] `/admin/deals` — deals page loads
- [ ] Cmd+K command palette works on `/admin/*` portal routes only

## Nyquist Notes

- No unit/E2E tests in v1 — chunk compare script + build + manual smoke are authoritative
- Hydration: watch browser console on `/` and `/admin` after dynamic imports
