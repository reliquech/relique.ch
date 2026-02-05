# CRM Next Steps (Detailed Backlog)

> Mục tiêu: lưu lại các ý tưởng cải tiến đã thống nhất để xử lý ở phase sau.
> Tài liệu này tập trung vào tính năng, scope, UI/UX, data model, API, và acceptance.

## 1) Upload Attachments (Full UX)

### Mục tiêu
- Trải nghiệm upload đủ “production”: kéo‑thả, preview, progress, retry, và kiểm soát lỗi.

### Scope chi tiết
- UI upload panel cho Customer/Lead/Deal/Message:
- Kéo‑thả nhiều file, chọn từ file picker.
- Hàng đợi upload với progress từng file.
- Hủy upload đang chạy.
- Retry file bị lỗi.
- Preview ảnh và download file.
- Gắn metadata (title, note) trước khi upload.

### UI/UX
- Dropzone full width trong `AttachmentsPanel`.
- Hiển thị file size + type icon.
- 3 trạng thái mỗi file: uploading, failed, done.
- Toast khi upload thành công/thất bại.

### Data & API
- Dùng `storage` bucket `crm-attachments`.
- Table `crm_attachments` (nếu chưa có) cần lưu:
- `entity_type`, `entity_id`, `storage_path`, `file_name`, `mime_type`, `size`, `created_by`.
- API:
- `POST /api/attachments` tạo record + signed upload URL.
- `PATCH /api/attachments/[id]` update metadata.
- `DELETE /api/attachments/[id]` xóa record + file.

### Acceptance
- Upload 5 files cùng lúc vẫn ổn định.
- Lỗi mạng retry được mà không mất file trước đó.
- Preview ảnh/ PDF mở được.

---

## 2) Custom Fields nâng cao

### Mục tiêu
- Cho phép custom fields mạnh hơn: grouping, visibility theo role, export/import.

### Scope chi tiết
- Group fields theo tab/section.
- Conditional visibility: field A chỉ hiện khi field B = X.
- Role visibility: viewer chỉ xem, editor admin mới sửa.
- Export/Import template cấu hình custom fields (JSON/CSV).

### UI/UX
- Custom Fields settings page có tabs theo entity.
- Thêm field: chọn group, visibility rule.
- Preview mẫu form ngay trong settings.

### Data & API
- Bổ sung `group` + `visibility_rules` JSONB.
- API export/import:
- `GET /api/custom-fields/export?entity=...`
- `POST /api/custom-fields/import`

### Acceptance
- Import template có thể overwrite hoặc merge.
- Viewer không sửa được custom fields.

---

## 3) Dashboard nâng cao

### Mục tiêu
- Dashboard có báo cáo “thực dụng”: so sánh thời gian, cohort, và saved reports.

### Scope chi tiết
- Compare range: 7d vs previous 7d.
- Saved report presets (gắn vào user).
- Funnel breakdown theo owner / source.
- Deal velocity: avg days in stage.

### UI/UX
- Range picker có compare toggle.
- Saved report dropdown.
- Tooltip giải thích metric.

### Data & API
- Thêm RPC:
- `crm_stage_velocity(start_date, end_date)`
- `crm_funnel_by_source(start_date, end_date)`
- Saved report table: `dashboard_reports`.

### Acceptance
- Saved report lưu lại filters và chart options.
- Compare view hiển thị delta (%) và absolute.

---

## 4) Automations nâng cao

### Mục tiêu
- Automations mạnh hơn, dễ debug, có scheduling window.

### Scope chi tiết
- Business hours: chỉ chạy trong 9h‑18h.
- Rule priority: high → low.
- Dry‑run mode: xem rule nào match.
- Action chaining: create task + notify.

### UI/UX
- Rule builder có preview match count.
- “Run now” hiển thị kết quả trước khi áp dụng.

### Data & API
- `alert_rules` thêm:
- `priority`, `active_hours`, `actions` (array).
- API `POST /api/alert-rules/preview` trả list entity.

### Acceptance
- Không chạy ngoài giờ đã đặt.
- Dry‑run không tạo dữ liệu thật.

---

## 5) CRM Bulk Actions

### Mục tiêu
- Chọn nhiều rows và thao tác hàng loạt.

### Scope chi tiết
- Bulk assign owner.
- Bulk update stage/status.
- Bulk export CSV.
- Bulk delete (admin only).

### UI/UX
- Checkbox ở DataTable + action bar.
- Confirm modal trước bulk delete.

### Data & API
- `POST /api/leads/bulk-update`
- `POST /api/deals/bulk-update`
- `POST /api/customers/bulk-update`
- Payload: `ids[]` + `patch`.

### Acceptance
- 100 items update trong < 3s.
- Error summary per item (nếu có).

---

## 6) Activity Timeline (Entity‑centric)

### Mục tiêu
- Mỗi Customer/Lead/Deal có timeline tổng hợp.

### Scope chi tiết
- Gộp: audit logs + messages + tasks + notes + attachments.
- Filter theo loại event.
- Sort theo thời gian.

### UI/UX
- Timeline view ở detail drawer.
- Quick add note + task.

### Data & API
- `GET /api/activity?entity_type&entity_id`
- Combine multiple sources ở server.

### Acceptance
- Timeline load < 1s cho entity trung bình.

---

## 7) Ownership & Assignment

### Mục tiêu
- Cho phép assign owner cho lead/deal/customer.

### Scope chi tiết
- Owner column + filter.
- “Assign to me” CTA.
- Role guard: viewer không assign.

### Data & API
- Add `owner_id` to CRM tables (nếu chưa có).
- API filter: `owner_id`.

### Acceptance
- Owner filter chạy ổn trên list.

---

## 8) Saved Views UX nâng cao

### Mục tiêu
- Saved views dễ dùng, có share.

### Scope chi tiết
- Set default view per user.
- Share view (admin) → team.
- Pin favorite views.

### Data & API
- `crm_saved_views` thêm `is_default`, `shared`.

### Acceptance
- Mở lại trang nhớ view cuối.

---

## 9) Observability tối thiểu

### Mục tiêu
- Biết được API fail bao nhiêu %.

### Scope chi tiết
- Client logging lỗi API vào `audit_logs` hoặc `error_logs` table.
- Server log cho /api/* nếu status >= 500.

---

## 10) Mobile UX pass

### Mục tiêu
- CRM usable trên mobile.

### Scope chi tiết
- Table → card view khi < 768px.
- Drawer full‑screen trên mobile.
- Sticky action bar.

---

## Ưu tiên khuyến nghị
1. Upload Attachments Full UX
2. Custom Fields nâng cao
3. Dashboard compare + saved reports
4. Automations nâng cao
5. Bulk actions

---

## Notes
- Các API/DB thay đổi phải cập nhật `apps/admin/README.md`.
- Khi triển khai nên làm từng module để dễ rollback.

