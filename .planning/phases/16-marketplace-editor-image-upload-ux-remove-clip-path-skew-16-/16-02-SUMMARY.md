---
phase: 16
plan: "02"
subsystem: admin-marketplace
tags: [drag-drop, images, react-hook-form, html5-dnd]
dependency_graph:
  requires:
    - phase: 16-01
      provides: [retryUpload, ImageLightbox, skew-free-image-section]
  provides: [reorderAdditionalImages, DraggableAdditionalTile, native-dnd-reorder]
  affects: [MarketplaceForm, MarketplaceImageSection, useMarketplaceFormImages]
tech_stack:
  added: []
  patterns: [html5-native-drag-drop, hook-reorder-with-rhf-sync]
key_files:
  created:
    - src/components/admin/marketplace/MarketplaceImageTiles.tsx
  modified:
    - src/features/marketplace/hooks/useMarketplaceFormImages.ts
    - src/components/admin/marketplace/MarketplaceImageSection.tsx
    - src/components/admin/marketplace/MarketplaceForm.tsx
key-decisions:
  - Dùng HTML5 Drag and Drop native thay vì @dnd-kit cho grid ảnh phụ — đủ nhẹ, không thêm dependency
  - Validate index bounds trong hook để tránh mutation state ngoài phạm vi (threat model Tampering)
  - Tách tile components ra file riêng để giữ MarketplaceImageSection gọn
patterns-established:
  - "Reorder pattern: splice array → cập nhật ref → syncAdditionalUrls → setValue images"
requirements-completed: [ITEMS-13-04]
metrics:
  duration: "~10 phút"
  completed: "2026-06-15"
---

# Phase 16 Plan 02: Native Drag-and-Drop Reorder — Summary

**Kéo-thả HTML5 để sắp xếp lại ảnh phụ trong editor marketplace, đồng bộ thứ tự về React Hook Form `images`.**

## Performance

- **Duration:** ~10 phút
- **Tasks:** 2 (+ 1 refactor)
- **Files modified:** 4

## Accomplishments

- `reorderAdditionalImages(activeIndex, overIndex)` trong hook — splice an toàn, sync RHF
- Tile ảnh phụ draggable với cursor grab/grabbing, opacity khi kéo, ring khi hover drop target
- Wire `onAdditionalReorder` qua `MarketplaceForm` → `MarketplaceImageSection` → `DraggableAdditionalTile`

## Task Commits

| Task | Mô tả | Commit |
|------|--------|--------|
| 16-02-01 | `reorderAdditionalImages` + bounds validation + sync RHF | `edf3b92` |
| 16-02-02 | HTML5 DnD handlers + visual cues + form wiring | `6c45531` |
| Refactor | Tách `MarketplaceImageTiles.tsx` | `bd0ce20` |

**Plan metadata:** _(commit SUMMARY riêng)_

## Thay đổi chính

### Hook `useMarketplaceFormImages`
- `reorderAdditionalImages` — bỏ qua nếu `activeIndex === overIndex`
- Kiểm tra index trong `[0, length)` trước splice
- Cập nhật `additionalImagesRef` và gọi `syncAdditionalUrls` để `setValue("images", ...)`

### `DraggableAdditionalTile` (`MarketplaceImageTiles.tsx`)
- `draggable` + `onDragStart` lưu index qua `dataTransfer`
- `onDragOver` → `preventDefault()`, `dropEffect = "move"`
- `onDrop` → `onReorder(srcIndex, destIndex)`, reset drag state
- `onDragEnd` dọn state khi thả ngoài vùng hợp lệ
- Style: `cursor-grab` / `active:cursor-grabbing`, `opacity-50` khi kéo, `ring-2 ring-primary` tại drop target

### `MarketplaceForm`
- `onAdditionalReorder={images.reorderAdditionalImages}`

## Xác minh

| Kiểm tra | Kết quả |
|----------|---------|
| `npm run check-types` | PASS |
| ESLint trên file đã sửa | PASS |

## Decisions Made

- Native DnD đủ cho reorder grid nhỏ; không dùng @dnd-kit ở đây
- `img` bên trong tile giữ `draggable={false}` để tránh xung đột với wrapper draggable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Tách tile components ra module riêng**
- **Found during:** Task 16-02-02 (sau khi tích hợp DnD)
- **Issue:** `MarketplaceImageSection.tsx` vượt ~370 dòng sau khi thêm `DraggableAdditionalTile` inline — khó bảo trì, vi phạm hướng dẫn file size
- **Fix:** Tạo `MarketplaceImageTiles.tsx` chứa `ImageTile`, `DraggableAdditionalTile`, `getImageSrc`; re-export types từ section
- **Files modified:** `MarketplaceImageSection.tsx`, `MarketplaceImageTiles.tsx` (mới)
- **Commit:** `bd0ce20`

## Issues Encountered

- Plan ghi `npm run typecheck` — script thực tế là `npm run check-types` (monorepo unified). Đã chạy `check-types` thay thế.

## User Setup Required

Không — chỉ thay đổi client admin.

## Known Stubs

Không có — reorder đồng bộ đầy đủ với form state.

## Threat Flags

Không có surface mới — validation index trong hook đáp ứng mục Tampering/DoS trong threat model.

## Next Phase Readiness

- Reorder ảnh phụ hoàn chỉnh; sẵn sàng UAT phase 16 hoặc plan tiếp theo trong roadmap
- Phụ thuộc 16-01 (lightbox, retry, layout) đã có từ plan trước

## Self-Check: PASSED

- FOUND: `src/features/marketplace/hooks/useMarketplaceFormImages.ts`
- FOUND: `src/components/admin/marketplace/MarketplaceImageTiles.tsx`
- FOUND: `src/components/admin/marketplace/MarketplaceImageSection.tsx`
- FOUND: commit `edf3b92`
- FOUND: commit `6c45531`
- FOUND: commit `bd0ce20`
