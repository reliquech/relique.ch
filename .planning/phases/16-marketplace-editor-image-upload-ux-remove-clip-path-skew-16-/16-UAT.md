---
status: testing
phase: 16-marketplace-editor-image-upload-ux-remove-clip-path-skew-16-
source: [16-VERIFICATION.md]
started: "2026-06-15T12:10:00Z"
updated: "2026-06-15T12:10:00Z"
---

## Current Test

number: 1
name: Mở /admin/items/new hoặc edit — kiểm tra preview không còn góc xiên/slant
expected: |
  Cover và thumbnail vuông/chữ nhật thẳng, không clip-path skew
awaiting: user response

## Tests

### 1. Gỡ skew / layout
expected: Cover aspect-video 16:9; grid responsive 2/3/4 cột; tile aspect-square; không góc xiên
result: [pending]

### 2. Lightbox & bàn phím
expected: Click preview → lightbox; ArrowLeft/Right; Escape đóng; Tab loop focus; focus trả về thumbnail sau đóng
result: [pending]

### 3. Retry upload
expected: Overlay lỗi + nút Retry; upload thử lại với file đã cache khi mock lỗi mạng
result: [pending]

### 4. Drag reorder → form state
expected: Kéo đổi thứ tự ảnh phụ; grid và RHF `images` khớp; form đánh dấu dirty
result: [pending]

### 5. Thu hồi Object URL (tùy chọn)
expected: revokeObjectURL khi remove/unmount preview
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
