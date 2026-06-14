# Phase 2: Supabase Data Layer & Public Flows - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-14
**Phase:** 2-Supabase Data Layer & Public Flows
**Areas discussed:** Verify source, Consign submit, Consign photos & storage

---

## Verify — Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Lookup marketplace_items | Tra cứu từ `marketplace_items.auth` JSONB | ✓ |
| Bảng verify_records riêng | Tạo table verify riêng | |
| Hybrid | Marketplace + verify_records | |
| Bạn quyết định | Claude discretion | |

**User's choice:** Lookup marketplace_items

| Option | Description | Selected |
|--------|-------------|----------|
| Hiển thị "not found" | Code không tồn tại → VerifyNotFoundState | ✓ |
| Trả inconclusive | | |
| Trả disqualified | | |

**User's choice:** Hiển thị "not found"

| Option | Description | Selected |
|--------|-------------|----------|
| Link nếu item published | VRFY-04 — chỉ khi lifecycle published | ✓ |
| Luôn link | | |
| Không link | | |

**User's choice:** Link nếu item published

| Option | Description | Selected |
|--------|-------------|----------|
| Xóa localStorage history | DATA-04 — không giữ browser history | ✓ |
| Giữ browser-only | | |
| Server-side audit log | | |

**User's choice:** Xóa localStorage history

---

## Verify — Supplemental

| Option | Description | Selected |
|--------|-------------|----------|
| Cả RLQ-* và COA ref | Tra cứu product ID và auth.coa_refs | ✓ |
| Chỉ RLQ-* | | |
| Chỉ COA ref | | |

**User's choice:** Cả RLQ-* và COA ref

| Option | Description | Selected |
|--------|-------------|----------|
| Map từ auth.status | qualified/inconclusive/disqualified từ auth JSONB | ✓ |
| Luôn qualified | | |
| Admin set riêng | | |

**User's choice:** Map từ auth.status

| Option | Description | Selected |
|--------|-------------|----------|
| Parse code từ URL/input | VRFY-02 — không camera v1 | ✓ |
| Chỉ camera scan | | |
| Defer QR | | |

**User's choice:** Parse code từ URL/input

| Option | Description | Selected |
|--------|-------------|----------|
| Admin queue placeholder | Verify tab trống Phase 2 | ✓ |
| Server lookup log | | |
| Ẩn page | | |

**User's choice:** Admin queue placeholder

---

## Consign — Public Submit

| Option | Description | Selected |
|--------|-------------|----------|
| API route public mới | Route riêng không auth | ✓ |
| Server Action | | |
| Mở rộng /api/consigned | | |

**User's choice:** API route public mới

| Option | Description | Selected |
|--------|-------------|----------|
| Bỏ draft localStorage | Single-shot submit | ✓ |
| Giữ draft localStorage | | |
| Draft server-side | | |

**User's choice:** Bỏ draft localStorage

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-create lead mỗi submit | CNSG-05 | ✓ |
| Lead chỉ khi email mới | | |
| Không auto-lead | | |

**User's choice:** Auto-create lead mỗi submit

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect /consign/success | CNSG-02 | ✓ |
| Toast + ở lại form | | |
| Success với reference ID | | |

**User's choice:** Redirect /consign/success

---

## Consign — Photos & Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Bucket mới consign-submissions | Private bucket riêng | ✓ |
| Reuse crm-attachments | | |
| Reuse marketplace bucket | | |

**User's choice:** Bucket mới consign-submissions

| Option | Description | Selected |
|--------|-------------|----------|
| API public multipart | Server-side upload | ✓ |
| Signed URL | | |
| Base64 JSON | | |

**User's choice:** API public multipart

| Option | Description | Selected |
|--------|-------------|----------|
| Ít nhất 1 ảnh bắt buộc | CNSG-01 | ✓ |
| Ảnh optional | | |
| Ít nhất 3 ảnh | | |

**User's choice:** Ít nhất 1 ảnh bắt buộc

| Option | Description | Selected |
|--------|-------------|----------|
| Tối đa 10 ảnh, 10MB/ảnh | | ✓ |
| Tối đa 5 ảnh | | |
| Tối đa 3 ảnh | | |

**User's choice:** Tối đa 10 ảnh, 10MB/ảnh

---

## Claude's Discretion

Contact form (CNTC-01–03) và transactional email (ADM-04, CNSG-03) — user chọn không thảo luận; defaults captured in CONTEXT.md D-19–D-22.

## Deferred Ideas

- Camera QR scanner UI
- Server-side verify audit log + populated admin verify queue
- `verify_records` dedicated table
- Consign draft save-progress
