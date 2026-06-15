---
phase: 13
slug: marketplace-items-table-grid-toggle-full-page-create-edit-ed
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-15
---

# Phase 13 - Validation Strategy

> Validation contract for Marketplace Items table/grid toggle, full-page editor, media workflow, autosave, and UX polish.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none in v1; project quality gate is lint + typecheck + build |
| **Config file** | `eslint.config.js`, `tsconfig.json`, `next.config.js` |
| **Quick run command** | `npx eslint --max-warnings 0 <phase-files>` |
| **Full suite command** | `npm run check-types && npm run build` |
| **Estimated runtime** | ~20 seconds after dependencies are installed |

Full `npm run lint` is still expected by the roadmap, but the repo currently has unrelated lint debt. Phase execution must run full lint, capture any unrelated blockers, and keep Phase 13 targeted lint clean.

---

## Sampling Rate

- **After every task commit:** Run targeted lint for files touched by that task when feasible.
- **After every plan wave:** Run targeted Phase 13 lint.
- **Before verification:** Run targeted Phase 13 lint, `npm run check-types`, `npm run build`, and attempt full `npm run lint`.
- **Max feedback latency:** <30 seconds for targeted lint; <2 minutes for full build.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | ITEMS-13-01 | T13-01 | localStorage guarded by browser checks | lint/type | `npx eslint --max-warnings 0 src/features/marketplace/hooks/useMarketplaceItemsView.ts` | expected | pending |
| 13-01-02 | 01 | 1 | ITEMS-13-01 | T13-01 | no URL/filter state loss | lint/type | `npx eslint --max-warnings 0 src/components/admin/marketplace/items/MarketplaceItemsViewToggle.tsx src/components/admin/marketplace/items/MarketplaceItemsCountSummary.tsx` | expected | pending |
| 13-02-01 | 02 | 2 | ITEMS-13-02 | T13-02 | card actions stop propagation | lint/type | `npx eslint --max-warnings 0 src/components/admin/marketplace/items/MarketplaceItemsGrid.tsx src/components/admin/marketplace/items/MarketplaceItemsGridCard.tsx` | expected | pending |
| 13-03-01 | 03 | 3 | ITEMS-13-05 | T13-03 | mutating actions hidden/disabled for viewers/offline | lint/type | `npx eslint --max-warnings 0 src/components/admin/marketplace/items/MarketplaceTypedDeleteDialog.tsx src/features/marketplace/hooks/useOnlineStatus.ts` | expected | pending |
| 13-04-01 | 04 | 1 | ITEMS-13-03 | T13-04 | stale autosave responses ignored | lint/type | `npx eslint --max-warnings 0 src/features/marketplace/hooks/useMarketplaceAutosave.ts src/features/marketplace/hooks/useUnsavedChangesGuard.ts` | expected | pending |
| 13-05-01 | 05 | 2 | ITEMS-13-03 | T13-09 | full-page editor preserves form schema and field names | lint/type | `npx eslint --max-warnings 0 src/components/admin/marketplace/editor/MarketplaceEditorPage.tsx src/components/admin/marketplace/editor/MarketplaceEditorSections.tsx src/components/admin/marketplace/editor/MarketplaceEditorStatusRail.tsx` | expected | pending |
| 13-06-01 | 06 | 3 | ITEMS-13-04 | T13-12 | upload failures do not clear successful media | lint/type | `npx eslint --max-warnings 0 src/components/admin/marketplace/editor/MarketplaceMediaWorkflow.tsx src/features/marketplace/hooks/useMarketplaceTempUploads.ts src/features/marketplace/utils/uploadPaths.ts` | expected | pending |
| 13-07-01 | 07 | 4 | ITEMS-13-03, ITEMS-13-05 | T13-15 | publish confirmation blocks invalid/offline/uploading states | lint/type | `npx eslint --max-warnings 0 src/components/admin/marketplace/editor/MarketplacePublishConfirmDialog.tsx src/components/admin/marketplace/editor/MarketplaceEditorPage.tsx src/features/marketplace/services/marketplaceEditorService.ts` | expected | pending |
| 13-08-01 | 08 | 5 | ITEMS-13-05 | — | all gates documented | gate | `npm run check-types && npm run build` | expected | pending |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework is introduced in v1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile Grid default | ITEMS-13-01 | requires viewport and localStorage state | clear `relique.admin.marketplace.itemsView`, open `/admin/items` under 768px, confirm Grid is active |
| View switch preserves selection | ITEMS-13-01 | stateful browser interaction | select rows in Table, switch to Grid, confirm selected cards and bulk bar remain |
| Grid card action propagation | ITEMS-13-02 | browser event behavior | click card body, checkbox, and menu; only body opens edit |
| Autosave stale guard | ITEMS-13-03 | network timing behavior | edit fields rapidly with throttled network; confirm latest input survives |
| Unsaved navigation guard | ITEMS-13-03 | browser navigation behavior | dirty editor, try back/reload/internal navigation, confirm warning |
| Media reorder/primary/alt | ITEMS-13-04 | drag/drop and keyboard interaction | upload multiple images, reorder, set primary, edit alt, retry failed upload |
| Typed delete | ITEMS-13-05 | destructive dialog behavior | confirm delete disabled until exact title or `DELETE` for bulk is typed |
| Permission/offline states | ITEMS-13-05 | auth/network-dependent behavior | test viewer role and offline mode; confirm mutating controls are blocked |

---

## Validation Sign-Off

- [x] All tasks have automated targeted lint/type/build verification or manual UAT coverage.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references; no test framework installation needed.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-06-15
