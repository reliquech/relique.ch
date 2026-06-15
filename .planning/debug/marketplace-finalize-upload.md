# Debug: marketplace finalize — Object not found (round 2)

**Status:** DEBUG COMPLETE

## Root causes (multiple)

1. **Unmount `sendBeacon` cleanup** — React remount/HMR gọi cleanup effect → xóa file trong Storage trước khi submit.
2. **`cleanupStale` on mount** — có thể xóa file temp đang dùng (race).
3. **`storage.move` tmp→items** — file không tồn tại tại path tmp khi finalize (đã bị xóa hoặc move không ổn định).

## Fix

1. Upload thẳng vào `marketplace/items/{session}/{timestamp}-{random}.{ext}` — không qua `marketplace/tmp`.
2. Finalize **passthrough** cho staging paths (chỉ `getPublicUrl`, không `move`).
3. Giữ legacy `move` cho path cũ `marketplace/tmp/...` nếu còn.
4. Xóa unmount `sendBeacon` cleanup + bỏ `cleanupStale` on mount.

## Files

- `src/features/marketplace/utils/uploadPaths.ts`
- `src/admin/marketplace/utils/uploadPaths.ts`
- `src/app/api/marketplace/upload/finalize/route.ts`
- `src/admin/marketplace/hooks/useMarketplaceTempUploads.ts`
