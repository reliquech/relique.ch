# Phase 15 — Automated Verification

**Phase:** 15-marketplace-items-instant-view-toggle-and-list-query-cache-n  
**Plan:** 15-04  
**Recorded:** 2026-06-15  
**Environment:** Node (local), Next.js 16.2.9

## Tóm tắt

| Gate | Lệnh | Kết quả | Ghi chú |
|------|------|---------|---------|
| Targeted lint | `npx eslint --max-warnings 0` (3 file Phase 15) | **PASS** | Không có warning/error trên file Phase 15 |
| Typecheck | `npm run check-types` | **PASS** | `next typegen` + `tsc --noEmit` |
| Build | `npm run build` | **PASS** | Production build hoàn tất (~31s) |
| Full lint | `npm run lint` | **FAIL** | Nợ lint toàn repo (không liên quan Phase 15) |

**Kết luận Phase 15:** Các gate tĩnh cho file Phase 15 đều pass. Full lint fail do nợ kỹ thuật có sẵn — không phát hiện regression trên file Phase 15. Hành vi cache/refetch cần xác minh thủ công qua `15-HUMAN-UAT.md`.

---

## 1. Targeted lint (Phase 15)

**Lệnh:**

```bash
npx eslint --max-warnings 0 \
  src/features/marketplace/hooks/useMarketplaceItemsQuery.ts \
  src/components/admin/marketplace/pages/ItemsPage.tsx \
  src/components/admin/marketplace/items/MarketplaceItemsToolbar.tsx
```

**Kết quả:** PASS (exit 0)

**File kiểm tra:**

- `src/features/marketplace/hooks/useMarketplaceItemsQuery.ts` — query key, cache SWR, `refetch({ force: true })`
- `src/components/admin/marketplace/pages/ItemsPage.tsx` — wiring cache, mutations, view toggle
- `src/components/admin/marketplace/items/MarketplaceItemsToolbar.tsx` — indicator Refreshing/Cached

---

## 2. `npm run check-types`

**Lệnh:** `npm run check-types` (`next typegen && tsc --noEmit`)

**Kết quả:** PASS (exit 0)

---

## 3. `npm run build`

**Lệnh:** `npm run build`

**Kết quả:** PASS (exit 0)

- Compile thành công (~7.4s)
- TypeScript check trong build pass (~6.0s)
- Static generation 66 routes hoàn tất

---

## 4. `npm run lint` (full repo)

**Lệnh:** `npm run lint` (`eslint --max-warnings 0`)

**Kết quả:** FAIL (exit 1)

**Thống kê:** ~2904 errors, ~28 warnings trong ~187 files

**Phân tách Phase 15 vs nợ không liên quan:**

| Phạm vi | Kết quả |
|---------|---------|
| 3 file Phase 15 (targeted lint ở mục 1) | PASS — không xuất hiện trong báo cáo full lint |
| Toàn repo | FAIL — nợ lint có sẵn, không do thay đổi Phase 15 |

**Ví dụ đại diện nợ lint không liên quan** (top files theo ESLint):

| File | Vấn đề chính |
|------|----------------|
| `live-browser.js` | `no-undef` (367), `@typescript-eslint/no-unused-vars` (15) |
| `detect-antipatterns-browser.js` | `no-undef` (178), `no-misleading-character-class` (6) |
| `index.mjs` | `no-undef` (175) |
| `modern-screenshot.umd.js` | `@typescript-eslint/no-unused-expressions` (78) |
| `checks.mjs` | `no-undef` (39) |

**Top rules toàn repo:** `no-undef` (2396×), `@typescript-eslint/no-unused-vars` (173×), `@typescript-eslint/no-unused-expressions` (156×)

> **Lưu ý (T15-08):** Full lint không dùng làm gate regression cho Phase 15. Dùng targeted lint trên 3 file Phase 15 làm gate chính; hành vi mạng/refetch xem `15-HUMAN-UAT.md`.

---

## Requirement traceability

| Requirement | Automated evidence |
|-------------|-------------------|
| CACHE-15-01 | Query key không chứa `density` — verified plans 15-01/15-02 |
| CACHE-15-02 | Cache helpers + hook — targeted lint PASS |
| CACHE-15-03 | `refetch({ force: true })` — targeted lint PASS |
| CACHE-15-04 | Mutation invalidation — targeted lint PASS |
| CACHE-15-05 | Artifact này + `15-HUMAN-UAT.md` |

---

## Manual follow-up

Xem `15-HUMAN-UAT.md` cho:

- Không có request `/api/marketplace` khi chuyển Table/Grid
- Cache hit trong TTL 30s
- Background refresh không chặn UI
- Retry và mutation force refresh
