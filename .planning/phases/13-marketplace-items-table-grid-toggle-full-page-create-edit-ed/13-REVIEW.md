---
phase: 13
status: warnings
reviewed: 2026-06-15
---

# Phase 13 Code Review

## Findings

### P2: Media workflow UI is not the canonical submitted image source

`MarketplaceEditorPage` renders the existing `MarketplaceForm`, whose `MarketplaceImageSection` remains the actual form-bound upload path. The new `MarketplaceMediaWorkflow` renders separately and demonstrates the planned drag/drop/reorder/alt/primary controls, but it is not currently bound into `MarketplaceFormData.image` / `MarketplaceFormData.images`.

Impact: draft/publish still preserves the existing functional upload behavior, but the new workflow controls need a follow-up integration before they can be considered production-canonical media editing.

Suggested fix: move `MarketplaceMediaWorkflow` into `MarketplaceForm` and bind it to `useMarketplaceFormImages`, or extend the form image hook with workflow-native file upload/reorder/primary APIs.

## Checks

- Targeted Phase 13 lint: pass
- `npm run check-types`: pass
- `npm run build`: pass
- Full `npm run lint`: fails due unrelated pre-existing repository lint debt

