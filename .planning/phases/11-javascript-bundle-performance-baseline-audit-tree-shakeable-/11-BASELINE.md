# Phase 11 Baseline

**Captured:** 2026-06-15 (pre-optimization build)  
**Source:** `npm run build && npm run phase11:bundle-baseline`

## Summary

| Metric | Value |
|--------|-------|
| Total JS chunks | **2602.5 KB** |
| Chunk file count | 52 files |
| Framework | Next.js 16.2.9 |
| Build warnings | Edge runtime disables static generation (existing) |

## Top 15 Chunks (pre-optimization)

| KB | Filename |
|----|----------|
| 334.9 | 3mza7-vvxtb0r.js |
| 285.4 | 3a837ce6pcwhc.js |
| 235.6 | 02byliej3l7rj.js |
| 222.0 | 3peubv2924kx4.js |
| 134.2 | (varies by build hash) |
| 131.6 | |
| 110.0 | |
| 66.4 | |
| 56.0 | |
| 54.9 | |

> Next.js 16 does not print per-route First Load JS in build output. Chunk scan is the automated baseline. Use `npm run analyze` for visual treemap.

## Tooling added

- `@next/bundle-analyzer` + `ANALYZE=true npm run analyze`
- `scripts/phase11-bundle-report.mjs`
- `scripts/phase11-bundle-compare.mjs`

## Raw data

`11-baseline-chunks.json` in this directory.
