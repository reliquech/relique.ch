---
phase: 15
slug: marketplace-items-instant-view-toggle-and-list-query-cache-n
status: approved
nyquist_compliant: true
created: 2026-06-15
---

# Phase 15 Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | none added |
| Automated gate | targeted ESLint + `npm run check-types` + `npm run build` |
| Manual gate | browser UAT for network/refetch behavior |

## Per-Task Verification Map

| Task ID | Plan | Requirement | Verification |
|---------|------|-------------|--------------|
| 15-01-01 | 15-01 | CACHE-15-01 | `useMarketplaceItemsQuery.ts` exports `getMarketplaceItemsQueryKey`; grep confirms no `density` in key construction |
| 15-01-02 | 15-01 | CACHE-15-02 | cache constants and helpers exist; targeted ESLint passes |
| 15-02-01 | 15-02 | CACHE-15-02 | hook exposes `refreshing`, `isStale`, `queryKey`; targeted ESLint + typecheck pass |
| 15-02-02 | 15-02 | CACHE-15-03 | `refetch({ force: true })` path exists; stale cache does background refresh |
| 15-03-01 | 15-03 | CACHE-15-04 | mutation handlers call forced refetch/invalidation |
| 15-04-01 | 15-04 | CACHE-15-05 | verification and UAT artifacts created |

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| No network request on Table/Grid switch | browser network observation | Open DevTools Network, switch views repeatedly, confirm no `/api/marketplace` request caused by view switch |
| Cached return renders instantly | timing/UI behavior | Visit filter A, filter B, return A within TTL, confirm rows render without skeleton |
| SWR refresh still happens | browser network observation | Return to cached query and confirm background request updates data without blanking list |
| Mutation invalidates cache | data correctness | Publish/archive/delete item and confirm active list refreshes |

## Sign-Off

- [x] Every plan has automated verification.
- [x] Browser-only behaviors have UAT coverage.
- [x] No new test framework required.

