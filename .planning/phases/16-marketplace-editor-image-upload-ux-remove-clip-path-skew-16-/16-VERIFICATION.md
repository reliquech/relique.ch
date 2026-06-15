---
phase: 16-marketplace-editor-image-upload-ux-remove-clip-path-skew-16-
verified: 2026-06-15T12:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Mở /admin/items/new hoặc trang edit — kiểm tra preview ảnh không còn góc xiên/slant"
    expected: "Cover và thumbnail vuông/chữ nhật thẳng, không clip-path skew"
    why_human: "Xác nhận visual layout không grep được chính xác trên mọi viewport"
  - test: "Upload cover + 3 ảnh phụ — đo tỷ lệ cover 16:9 và tile phụ 1:1 trên grid 2/3/4 cột"
    expected: "Cover aspect-video; grid responsive sm:3 md:4; tile aspect-square"
    why_human: "Tailwind class có mặt trong code nhưng tỷ lệ thực tế cần xem trên browser"
  - test: "Click preview uploaded → lightbox; dùng ArrowLeft/ArrowRight; Escape đóng; Tab loop focus"
    expected: "Chuyển ảnh, hiển thị n/total, scroll body khóa, focus không thoát dialog"
    why_human: "Focus trap và keyboard nav cần tương tác thực"
  - test: "Mock upload fail (network offline/block) → nhấn Retry"
    expected: "Overlay lỗi + nút Retry; upload thử lại với file đã cache"
    why_human: "Cần mô phỏng lỗi mạng/API — không chạy được trong verifier"
  - test: "Upload 3 ảnh phụ → kéo ảnh thứ 2 lên vị trí 1"
    expected: "Grid đổi thứ tự; field RHF `images` khớp thứ tự URL mới"
    why_human: "HTML5 DnD và sync form state cần thao tác chuột thực"
---

# Phase 16: Marketplace Editor Image Upload UX — Báo cáo xác minh

**Mục tiêu phase:** Cải thiện UX upload ảnh trong marketplace editor — bỏ clip-path skew, cover 16:9, grid vuông, lightbox, retry, drag reorder.

**Đã xác minh:** 2026-06-15T12:00:00Z  
**Trạng thái:** `human_needed`  
**Xác minh lại:** Không — lần đầu

## Đạt mục tiêu

### Các sự kiện phải đúng (Observable Truths)

| # | Sự kiện | Trạng thái | Bằng chứng |
|---|---------|------------|------------|
| 1 | Không còn `clip-path-slant*` / skew trên preview form admin | ✓ VERIFIED | `grep` toàn bộ `src/components/admin/marketplace/**` — 0 match `clip-path-slant`, `skew`, `clipPath`. Cover/tile dùng `rounded-md` thẳng. |
| 2 | Cover 16:9; ảnh phụ grid vuông 2/3/4 cột responsive | ✓ VERIFIED | `MarketplaceImageSection.tsx` L102/L109: `aspect-video`; L167: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`; `DraggableAdditionalTile` L180: `aspect-square`. |
| 3 | `ImageLightbox`: Escape, mũi tên, chỉ số, khóa scroll, focus trap | ✓ VERIFIED | `ImageLightbox.tsx` L46-57 scroll lock; L62-77 Escape + arrows; L83-105 Tab trap; L123-125 `n / total`; L131-165 nút prev/next có `aria-label`. |
| 4 | `retryUpload` hoạt động và được wire UI | ✓ VERIFIED | Hook L338-376: tìm item `error`, dùng `file` cache, `uploading` → `uploadCoverItem`/`uploadAdditionalItem`. `MarketplaceForm` L110 `onRetry`. `UploadOverlay` L41-51 nút Retry. |
| 5 | HTML5 drag-drop reorder đồng bộ RHF `images` | ✓ VERIFIED | `DraggableAdditionalTile` L143-168 DnD handlers; hook L311-336 `reorderAdditionalImages` splice + `syncAdditionalUrls` → `setValue("images")`; form L109 wire. |

**Điểm:** 5/5 sự kiện xác minh được bằng code (cần UAT người dùng cho hành vi runtime)

### Artifacts bắt buộc

| Artifact | Mô tả | Trạng thái | Chi tiết |
|----------|-------|------------|----------|
| `src/components/shared/ImageLightbox.tsx` | Lightbox tái sử dụng | ✓ VERIFIED | 171 dòng; đầy đủ keyboard, a11y, overlay |
| `src/components/admin/marketplace/MarketplaceImageSection.tsx` | Section ảnh editor | ✓ VERIFIED | 199 dòng; layout + wire lightbox/DnD |
| `src/components/admin/marketplace/MarketplaceImageTiles.tsx` | Tile + DnD | ✓ VERIFIED | 185 dòng; `ImageTile`, `DraggableAdditionalTile` |
| `src/features/marketplace/hooks/useMarketplaceFormImages.ts` | Hook upload/retry/reorder | ✓ VERIFIED | `retryUpload`, `reorderAdditionalImages`, `syncAdditionalUrls` |
| `src/components/admin/marketplace/MarketplaceForm.tsx` | Wire props form | ✓ VERIFIED | L102-113 truyền đủ callbacks |

### Key Links

| From | To | Via | Trạng thái | Chi tiết |
|------|-----|-----|------------|----------|
| `MarketplaceForm` | `useMarketplaceFormImages` | props `images.*` | ✓ WIRED | reorder, retry, handlers |
| `MarketplaceImageSection` | `ImageLightbox` | `lightboxImages` + state | ✓ WIRED | chỉ ảnh `uploaded` |
| `ImageTile` / overlay | `retryUpload` | `onRetry` → `onRetry(id)` | ✓ WIRED | stopPropagation trên nút |
| `DraggableAdditionalTile` | `reorderAdditionalImages` | `onDrop` → `onReorder` | ✓ WIRED | `dataTransfer` index |
| `reorderAdditionalImages` | RHF `images` | `syncAdditionalUrls` → `setValue` | ✓ WIRED | L99-105, L331 |

### Data-Flow Trace (Level 4)

| Artifact | Biến dữ liệu | Nguồn | Dữ liệu thật | Trạng thái |
|----------|--------------|-------|--------------|------------|
| `MarketplaceImageSection` | `lightboxImages` | `coverImage` + `additionalImages` filtered `uploaded` | URL từ upload API | ✓ FLOWING |
| `DraggableAdditionalTile` | `additionalImages` order | `reorderAdditionalImages` splice | Thứ tự mảng hook | ✓ FLOWING |
| RHF field `images` | `string[]` | `syncAdditionalUrls` sau reorder/remove/upload | URL đã upload | ✓ FLOWING |
| `retryUpload` | `UploadItem` | `file` cache + `/api/marketplace/upload` | FormData POST | ✓ FLOWING |

### Behavioral Spot-Checks

| Hành vi | Lệnh | Kết quả | Trạng thái |
|---------|------|---------|------------|
| TypeScript compile | `npm run check-types` | exit 0 | ✓ PASS |
| Commits plan 16 | `git cat-file -t` × 6 hashes | tất cả `commit` | ✓ PASS |

### Probe Execution

Step 7c: BỎ QUA — phase không khai báo probe scripts.

### Requirements Coverage

| Requirement | Plan | Mô tả | Trạng thái | Bằng chứng |
|-------------|------|-------|------------|------------|
| ITEMS-13-04 | 16-01, 16-02 | Media: drag/drop, progress, reorder, alt, primary, retry, removal | ⚠️ PARTIAL (phạm vi phase) | Phase 16 đạt: reorder, retry, removal, progress overlay, DnD upload zone. **Chưa có trong phase 16:** alt text per image, primary image selector (cover đã là primary ngầm). Phần còn lại thuộc scope rộng hơn ITEMS-13-04 / phase 13. |

### Anti-Patterns

| File | Dòng | Pattern | Mức độ | Ảnh hưởng |
|------|------|---------|--------|-----------|
| — | — | Không phát hiện TBD/FIXME/stub trong file phase | — | — |

`clip-path-slant` vẫn tồn tại trong `globals.css` và public site — **không ảnh hưởng** admin editor (đúng phạm vi phase).

### Cần xác minh thủ công (Human Verification)

#### 1. Gỡ skew / layout

**Thao tác:** Mở `/admin/items/new` hoặc edit item có ảnh.  
**Kỳ vọng:** Không còn góc xiên; cover rộng 16:9; grid ảnh phụ vuông, 2→3→4 cột theo breakpoint.  
**Vì sao cần người:** CSS class có trong code nhưng cảm nhận visual cần browser.

#### 2. Lightbox & bàn phím

**Thao tác:** Click ảnh đã upload; dùng mũi tên và Escape; Tab qua các nút.  
**Kỳ vọng:** `n / total`, prev/next, đóng Escape, scroll nền khóa, focus lặp trong dialog.  
**Vì sao cần người:** Focus trap và keyboard không kiểm chứng đầy đủ bằng grep.

#### 3. Retry upload

**Thao tác:** Chặn `/api/marketplace/upload` → upload ảnh → Retry.  
**Kỳ vọng:** Overlay "Upload failed. Please try again." + nút Retry; upload chạy lại.  
**Vì sao cần người:** Cần mock lỗi mạng thực.

#### 4. Drag reorder → form state

**Thao tác:** Upload ≥3 ảnh phụ; kéo đổi thứ tự; inspect `images` trong form/devtools.  
**Kỳ vọng:** Thứ tự grid và mảng URL RHF khớp.  
**Vì sao cần người:** HTML5 DnD là tương tác chuột.

#### 5. Thu hồi Object URL (tùy chọn)

**Thao tác:** Xóa preview đang dùng `previewUrl`; quan sát `revokeObjectURL` trong DevTools.  
**Kỳ vọng:** Hook gọi revoke khi remove/unmount (L57-71, L206, L282, L297).  
**Vì sao cần người:** GC/memory profiling.

### Tóm tắt

Toàn bộ must-haves từ plan 16-01 và 16-02 **có mặt và được nối dây** trong codebase — không phát hiện stub hay orphan. SUMMARY claims khớp với implementation thực tế (hiếm; đã đối chiếu từng file).

Trạng thái `human_needed` vì các hành vi UI/runtime (layout visual, DnD, lightbox keyboard, retry khi lỗi mạng) cần UAT trên browser trước khi coi phase hoàn tất end-to-end.

**ITEMS-13-04** chỉ được đáp ứng **một phần** ở cấp requirement tổng (thiếu alt text / primary selector) — nằm ngoài must-haves phase 16, không chặn mục tiêu phase.

---

_Verified: 2026-06-15T12:00:00Z_  
_Verifier: Claude (gsd-verifier)_
