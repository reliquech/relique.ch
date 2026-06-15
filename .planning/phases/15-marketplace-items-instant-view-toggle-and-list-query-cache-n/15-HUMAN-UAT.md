# Phase 15 — Human UAT Checklist

**Phase:** 15-marketplace-items-instant-view-toggle-and-list-query-cache-n  
**Plan:** 15-04  
**Mục tiêu:** Xác minh hành vi cache/refetch qua DevTools Network (không thể kiểm tra bằng lint/typecheck).

**Chuẩn bị:**

1. Chạy app local: `npm run dev` (port 1300)
2. Đăng nhập admin và mở `/admin/items`
3. Mở DevTools → tab **Network**, filter `marketplace` hoặc `/api/marketplace`
4. (Tuỳ chọn) Bật **Disable cache** để quan sát rõ hơn — ghi chú trong cột Ghi chú nếu dùng

---

## Checklist

### CACHE-15-01 / CACHE-15-02 — View toggle không refetch

- [ ] Mở `/admin/items`, xóa log Network panel, chuyển Table ↔ Grid **5 lần**; **no /api/marketplace request** occurs from view switch alone.

**Cách kiểm tra:** Sau mỗi lần bấm Table/Grid, xác nhận không xuất hiện request mới tới `/api/marketplace`. Rows và layout đổi ngay; indicator không nhảy sang "Refreshing" chỉ vì đổi view.

---

### CACHE-15-02 — Filter mới gọi network

- [ ] Đổi sang filter mới (search, status, sort, v.v.); **đúng một** request `/api/marketplace` xảy ra cho bộ filter đó.

**Cách kiểm tra:** Ghi lại query params trên request; dữ liệu khớp filter mới.

---

### CACHE-15-03 — Cache hit trong TTL 30 giây

- [ ] Quay lại filter đã dùng **within 30 seconds**; rows hiển thị **ngay lập tức** (không skeleton toàn trang); background refresh **không chặn** tương tác (có thể thấy "Refreshing" nhỏ cạnh count).

**Cách kiểm tra:** Chuyển filter A → B → A trong &lt;30s. Lần về A: list có ngay; có thể có request nền sau đó nhưng UI không blank.

---

### CACHE-15-03 — Retry force network

- [ ] Từ trạng thái lỗi (hoặc mô phỏng lỗi mạng), bấm **Retry**; **forced network request** occurs to `/api/marketplace`.

**Cách kiểm tra:** Request xuất hiện ngay sau Retry; không chỉ đọc cache cũ.

---

### CACHE-15-04 — Mutation làm mới list

- [ ] Sau **publish / archive / delete** (hoặc bulk tương đương) một item, list đang active **refresh** và phản ánh trạng thái mới.

**Cách kiểm tra:** Item biến mất hoặc đổi status đúng; có request refresh sau mutation thành công.

---

## Ghi chú tester

| Ngày | Người test | Môi trường | Kết quả tổng |
|------|------------|------------|--------------|
| | | | ☐ Pass / ☐ Fail |

**Ghi chú bổ sung:**

---

## Tham chiếu

- Automated gates: `15-VERIFICATION.md`
- Chiến lược validation: `15-VALIDATION.md`
- Threat model: T15-07 (browser network), T15-08 (tách full lint debt)
