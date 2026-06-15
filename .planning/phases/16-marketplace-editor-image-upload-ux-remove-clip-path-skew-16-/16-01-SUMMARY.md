---
phase: 16
plan: "01"
subsystem: admin-marketplace
tags: [images, lightbox, upload-ux, clip-path-removal]
dependency_graph:
  requires: []
  provides: [retryUpload, ImageLightbox, skew-free-image-section]
  affects: [MarketplaceForm, MarketplaceImageSection]
tech_stack:
  added: []
  patterns: [wrapper-lightbox, hook-extracted-upload-helpers]
key_files:
  created:
    - src/components/shared/ImageLightbox.tsx
  modified:
    - src/features/marketplace/hooks/useMarketplaceFormImages.ts
    - src/components/admin/marketplace/MarketplaceImageSection.tsx
    - src/components/admin/marketplace/MarketplaceForm.tsx
decisions:
  - Tách uploadCoverItem/uploadAdditionalItem để dùng chung cho upload ban đầu và retry
  - Lightbox chỉ mở với ảnh status uploaded (đúng spec preview sau upload thành công)
  - Không sửa components/ui/** — giữ wrapper pattern
metrics:
  duration: "~15 phút"
  completed: "2026-06-15"
---

# Phase 16 Plan 01: Skew Removal, Layout & Image Lightbox — Summary

**Một dòng:** Gỡ clip-path skew khỏi editor ảnh marketplace, layout 16:9/vuông responsive, lightbox đầy đủ a11y, và retry upload từ hook.

## Kết quả

| Task | Mô tả | Commit |
|------|--------|--------|
| 16-01-01 | `retryUpload` + cleanup object URL trong hook | `233a8bc` |
| 16-01-02 | Component `ImageLightbox` tái sử dụng | `42f4833` |
| 16-01-03 | Refactor `MarketplaceImageSection` + wire form | `5c58ed9` |

## Thay đổi chính

### Hook `useMarketplaceFormImages`
- Thêm `retryUpload(id)` — tìm item lỗi, tạo temp path mới, upload lại file đã cache.
- Trích `uploadCoverItem` / `uploadAdditionalItem` dùng chung cho upload và retry.
- Copy lỗi theo UI spec: "Upload failed. Please try again."

### `ImageLightbox`
- Overlay `bg-black/90 backdrop-blur-md`.
- Escape đóng; ArrowLeft/ArrowRight chuyển ảnh.
- Khóa scroll body, focus trap, hiển thị chỉ số `n / total`.
- Nút điều khiển có `aria-label`.

### `MarketplaceImageSection`
- **Đã gỡ** toàn bộ `clip-path-slant*`.
- Cover: `aspect-video` (16:9).
- Additional: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`, tile `aspect-square`.
- Nút xóa tròn `h-8 w-8`; overlay lỗi có nút **Retry**.
- Click preview uploaded → mở lightbox đúng index.

## Xác minh

| Kiểm tra | Kết quả |
|----------|---------|
| `npm run check-types` | PASS |
| ESLint trên file đã sửa | PASS |
| `npm run lint` (toàn repo) | FAIL — lỗi có sẵn trong file ngoài scope (`live-browser.js`, v.v.), không phát sinh từ plan 16-01 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Sắp xếp lại thứ tự helper trong hook**
- **Found during:** Task 16-01-01
- **Issue:** `handleCoverImageChange` tham chiếu `uploadCoverItem` trước khi khai báo.
- **Fix:** Đưa `uploadCoverItem` / `uploadAdditionalItem` lên trước handlers.
- **Files modified:** `useMarketplaceFormImages.ts`
- **Commit:** `233a8bc`

**2. [Rule 1 - Bug] Index lightbox cho additional images**
- **Found during:** Task 16-01-03
- **Issue:** Index ban đầu dùng `findIndex` thô — sai khi có item chưa uploaded.
- **Fix:** Duyệt chỉ ảnh `uploaded` khi map index.
- **Files modified:** `MarketplaceImageSection.tsx`
- **Commit:** `5c58ed9`

### Môi trường thực thi

Worktree assertion (`worktree-agent-*`, base `d955a540`) không thỏa — agent chạy trên `main` @ `bd9594b`. Commits được tạo trực tiếp trên branch hiện tại; orchestrator xử lý merge/worktree nếu cần.

## Known Stubs

Không có — lightbox, retry, và layout đã wire đầy đủ.

## Threat Flags

Không có surface mới ngoài threat model (client-side admin, MIME/size validation giữ nguyên).

## Self-Check: PASSED

- FOUND: `src/components/shared/ImageLightbox.tsx`
- FOUND: `src/features/marketplace/hooks/useMarketplaceFormImages.ts`
- FOUND: `src/components/admin/marketplace/MarketplaceImageSection.tsx`
- FOUND: commit `233a8bc`
- FOUND: commit `42f4833`
- FOUND: commit `5c58ed9`
