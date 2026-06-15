---
phase: 16
slug: marketplace-editor-image-upload-ux-remove-clip-path-skew-16
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-15
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Next.js compilation + linting |
| **Config file** | `package.json`, `eslint.config.js`, `tsconfig.json` |
| **Quick run command** | `npm run lint && npm run typecheck` |
| **Full suite command** | `npm run lint && npm run typecheck && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npm run typecheck`
- **After every plan wave:** Run `npm run lint && npm run typecheck && npm run build`
- **Before \`/gsd-verify-work\`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | ITEMS-13-04 | — | N/A | static | `npm run typecheck` | ✅ | ⬜ pending |
| 16-01-02 | 01 | 1 | ITEMS-13-04 | — | N/A | static | `npm run typecheck` | ✅ | ⬜ pending |
| 16-01-03 | 01 | 1 | ITEMS-13-04 | — | N/A | static | `npm run typecheck` | ✅ | ⬜ pending |
| 16-02-01 | 02 | 2 | ITEMS-13-04 | — | N/A | static | `npm run typecheck` | ✅ | ⬜ pending |
| 16-02-02 | 02 | 2 | ITEMS-13-04 | — | N/A | static | `npm run typecheck` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements (lint, typecheck, build).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Slant Skew Removal | ITEMS-13-04 | Visual layout | Open `/admin/items/new` or edit page. Verify the upload zone and image previews do not have slanted diagonals. |
| Aspect Ratio (16:9 vs 1:1) | ITEMS-13-04 | Visual layout | Inspect cover preview width/height ratio matches 16:9 (aspect-video) and additional thumbnail grid matches 1:1 (aspect-square). |
| Native Drag & Drop Grid Reorder | ITEMS-13-04 | Complex user drag interaction | Upload 3 images. Drag the second image to the first position. Assert visual reorder occurs and the updated order is synchronized to the Zod schema state. |
| Lightbox interaction & keyboard | ITEMS-13-04 | Interaction model | Open lightbox on click. Use `ArrowRight`/`ArrowLeft` to navigate. Press `Escape` to close and assert focus traps loop properly. |
| Object URL revocation | ITEMS-13-04 | Browser garbage collection | Remove a previewed image. Verify in developer tools memory/performance profiling that `URL.revokeObjectURL` is invoked. |
| Retry upload on fail | ITEMS-13-04 | Temporary error handling | Mock a failed upload in network tab. Verify error state overlay displays a "Retry" button. Click "Retry" and assert upload is re-attempted. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
