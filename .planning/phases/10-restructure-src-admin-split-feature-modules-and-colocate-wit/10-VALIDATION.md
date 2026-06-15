# Phase 10 Validation Strategy

**Phase:** Restructure src/admin  
**Requirements:** RESTR-10-01..05

## Requirement → Automated Command Map

| Req ID | Behavior | Test Type | Automated Command | Plan |
|--------|----------|-----------|-------------------|------|
| RESTR-10-01 | Zero `@/admin/` imports | grep gate | `npm run phase10:grep-gate` | 01, 07 |
| RESTR-10-02 | Domains migrated | typecheck | `npm run check-types` | 02–06 (per wave) |
| RESTR-10-03 | Production build | build | `npm run build` | 07 |
| RESTR-10-04 | Admin routes render | manual smoke | Dev: `/admin`, `/admin/leads`, `/admin/items` | 07 |
| RESTR-10-05 | Components ≤300 lines | static | `node scripts/phase10-line-gate.mjs` (optional) or manual wc in 07 | 05, 06, 07 |

## Composite Gate

```bash
npm run phase10:gate
# = phase10:grep-gate && check-types && build
```

## Per-Wave Sampling

| Wave | After plan | Command |
|------|------------|---------|
| 01 | 10-01 | `npm run phase10:grep-baseline`, `npm run check-types` |
| 02 | 10-02 | `npm run check-types` |
| 03 | 10-03, 10-04 | `npm run check-types` |
| 04 | 10-05, 10-06 | `npm run check-types` |
| 05 | 10-07 | `npm run phase10:gate` |

## Manual UAT (RESTR-10-04)

- [ ] `/admin/login` — login form loads
- [ ] `/admin` — dashboard loads
- [ ] `/admin/leads` — CRM list loads
- [ ] `/admin/items` — marketplace list loads
- [ ] `/admin/deals` — deals list loads

## Nyquist Notes

- No Vitest/Playwright in v1 — grep + tsc + build are authoritative automated gates
- File-size enforcement: split during Plans 05–06; audit in Plan 07 VERIFICATION.md
