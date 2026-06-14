# Phase 2: Supabase Data Layer & Public Flows - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Thay thế mock/localStorage backends cho **verify**, **consign**, và **contact** bằng Supabase persistence thật. Deliverables:

- Verify lookup qua database (`marketplace_items`) — không còn `verify.local.ts`
- Consign public submit → `consigned_items` + photo uploads + auto-lead CRM
- Contact form persist CRM (leads + messages) — **không gửi email**
- Xóa localStorage adapters cho verify/consign production data (DATA-04)
- **Resend đã bỏ hoàn toàn** — không transactional emails (ADM-04 deferred/out of v1)

**Không trong phase này:** security hardening API (Phase 3), schema consolidation sang `@relique/shared` (Phase 4), admin UX redesign (Phase 5), payment flows (v2), camera-based QR scanner UI (defer — chỉ parse code từ input/URL v1).

</domain>

<decisions>
## Implementation Decisions

### Verify — Data Source & Lookup
- **D-01:** Verify lookup từ **`marketplace_items`** — không tạo bảng `verify_records` riêng Phase 2
- **D-02:** User có thể tra cứu bằng **cả hai**: product ID format `RLQ-XXXX-XXXX` **và** COA reference (`auth.coa_refs`, e.g. `REL-2024-001`)
- **D-03:** Verify status map từ **`auth.status`** trên marketplace item → map sang `qualified` / `inconclusive` / `disqualified` (planner/researcher xác định mapping table cụ thể)
- **D-04:** Code hợp lệ format nhưng không tìm thấy trong DB → UI **"not found"** (giữ `VerifyNotFoundState` hiện tại)
- **D-05:** Marketplace link (VRFY-04) chỉ hiện khi item **`state.lifecycle = published`** (và visibility public)
- **D-06:** QR/barcode v1: **parse code từ URL/input** (`?code=`, raw string) — không cần camera scanner UI Phase 2
- **D-07:** **Xóa localStorage verify history** — không giữ browser-only history (DATA-04)
- **D-08:** Admin verify queue (`/admin/submissions` verify tab): **placeholder/trống** Phase 2 — không đọc localStorage history

### Consign — Public Submit Flow
- **D-09:** Public submit qua **API route mới** (không auth) — không mở rộng `/api/consigned` POST hiện tại (vẫn admin-only `requireUser`)
- **D-10:** **Bỏ draft localStorage** — single-shot submit, không save-progress draft (DATA-04)
- **D-11:** Mỗi consign submit **auto-create lead** trong CRM (`leads` table, source = consign) — CNSG-05
- **D-12:** On-screen confirmation: **redirect `/consign/success`** sau submit thành công — CNSG-02
- **D-13:** Initial submission status: **`submitted`** (workflow: submitted → in_review → approved/rejected) — CNSG-04

### Consign — Photo Upload & Storage
- **D-14:** Bucket mới **`consign-submissions`** (private) — migration riêng, không reuse `crm-attachments`
- **D-15:** Upload mechanism: **API public multipart** — server-side upload qua service role (anon user không upload trực tiếp Supabase Storage)
- **D-16:** **Ít nhất 1 ảnh bắt buộc** — thêm photo upload UI vào consign form (form hiện chưa có field)
- **D-17:** Giới hạn: **tối đa 10 ảnh**, **10MB/ảnh** — image types jpeg/png/webp
- **D-18:** Link ảnh qua **`attachments`** table (`entity_type: consigned_item`, `entity_id`) — pattern CRM hiện có

### Contact (no email — locked 2026-06-14)
- **D-19:** Contact form → tạo **`messages`** record + **auto-create `leads`** (pattern giống consign) — CNTC-01
- **D-20:** **KHÔNG gửi email** — Resend removed; operator thấy lead/message trong admin CRM — CNTC-02/03 satisfied via CRM persistence only
- **D-21:** Consign submit **KHÔNG gửi confirmation email** — on-screen `/consign/success` only — CNSG-03 via UI
- **D-22:** Contact form UX: **inline success state** trên page (giữ layout hiện tại, không redesign)
- **D-24:** Xóa mọi dead code Resend/`sendTransactional`/email env vars nếu còn sót trong `src/`

### Public Code (Minimal Touch — kế thừa Phase 1 D-05)
- **D-23:** Phase 2 **minimal** thay đổi public UI — chỉ wire backend thật + thêm photo upload field consign; không redesign verify/contact/consign pages

### Claude's Discretion
- Exact public API route paths (e.g. `/api/public/consign`, `/api/public/verify`, `/api/public/contact`)
- `auth.status` → `VerifyStatus` mapping table chi tiết
- Cách resolve `RLQ-*` product ID trên `marketplace_items` (metadata field vs slug vs migration thêm column)
- Email template content/copy (English, transactional tone)
- Rate limiting / basic spam protection trên public routes (lightweight v1 — full hardening Phase 3)
- Verify result field mapping từ `marketplace_items` JSONB (`listing`, `signing`, `condition`, `auth`, `media`) sang `VerifyResult` schema
- Attachment file naming convention trong `consign-submissions` bucket

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, requirement IDs
- `.planning/REQUIREMENTS.md` — DATA-01–04, VRFY-01–04, CNSG-01–05, CNTC-01–03, ADM-04 acceptance criteria
- `.planning/PROJECT.md` — Core value, no-mock constraint, public UI minimal-touch policy
- `.planning/phases/01-foundation-app-merge/01-CONTEXT.md` — D-05 minimal public touch, unified app structure

### Domain Schemas & Contracts
- `packages/shared/src/domain/schemas/verify.ts` — VerifyResult, VerifyRunInput, ProductIdSchema
- `packages/shared/src/domain/contracts/verify.contract.ts` — IVerifyService interface
- `packages/shared/src/domain/fixtures/marketplace.json` — `auth`, `signing`, `condition`, `media` JSONB shape
- `apps/web/src/lib/validations/consignSchema.ts` — Consign form validation (if exists)

### Existing Mock Implementations (replace)
- `apps/web/src/lib/services/impl/verify.local.ts` — mock verify to remove
- `apps/web/src/lib/services/impl/consign.local.ts` — localStorage consign to remove
- `apps/web/src/lib/services/impl/index.ts` — adapter switch point
- `apps/web/src/app/(site)/contact/components/ContactForm.tsx` — fake submit
- `apps/web/src/app/(site)/consign/components/ConsignForm.tsx` — localStorage submit flow

### Supabase Schema
- `apps/web/supabase/migrations/002_create_marketplace_items.sql` — `auth` JSONB, lifecycle columns
- `apps/web/supabase/migrations/003_create_consigned_items.sql` — consign persistence
- `apps/web/supabase/migrations/010_create_crm_core.sql` — `leads`, `messages`, `attachments`
- `apps/web/supabase/migrations/011_storage_crm.sql` — storage bucket pattern reference
- `apps/web/supabase/migrations/017_create_email_logs.sql` — email logging

### API & Email Patterns
- `apps/web/src/app/api/consigned/route.ts` — admin consigned_items CRUD (auth-required)
- `apps/web/src/app/api/email/send/route.ts` — Resend integration pattern

### Public UI Entry Points
- `apps/web/src/app/(site)/verify/page.tsx` — verify orchestration
- `apps/web/src/app/(site)/consign/components/ConsignForm.tsx` — consign form
- `apps/web/src/app/(site)/contact/components/ContactForm.tsx` — contact form
- `apps/web/src/components/results/VerifyResultDisplay.tsx` — verify result UI

### Conventions
- `.planning/codebase/CONVENTIONS.md` — Result pattern, service layer
- `.cursor/rules/shadcn-guard.mdc` — Do not edit `components/ui/**`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VerifyResultPanel`, `VerifyNotFoundState`, `VerifyResultDisplay` — verify UI states sẵn có
- `/consign/success` page — success confirmation route
- `attachments` table + CRM storage patterns — reuse cho consign photos metadata
- `/api/email/send` + `email_logs` — Resend transactional email infrastructure
- `createServiceRoleClient()` — server-side Supabase cho public routes
- Admin consign queue tại `/admin/submissions?tab=consignments` — đọc `consigned_items`

### Established Patterns
- Service layer: `lib/services/` facade → `impl/` adapters (switch từ local → supabase)
- API routes: Zod validate body → service role insert → audit log
- Public pages: client components gọi service layer (cần chuyển sang API routes cho anon submit)

### Integration Points
- `apps/web/src/lib/services/impl/index.ts` — swap verify/consign adapters
- New public API routes under `apps/web/src/app/api/public/` (or similar)
- New migration: `consign-submissions` storage bucket + RLS policies
- Admin submissions pages — consign tab reads real `consigned_items`; verify tab empty placeholder
- CRM leads/messages — auto-create on consign + contact submit

</code_context>

<specifics>
## Specific Ideas

- Verify placeholder text "RLQ-XXXX-XXXX" giữ nguyên — nhưng backend cũng accept COA refs
- Consign success flow giữ redirect `/consign/success` như hiện tại
- Không camera QR scanner v1 — chỉ parse `?code=` URL params và manual entry (đã có trong verify page)

</specifics>

<deferred>
## Deferred Ideas

- Camera-based QR/barcode scanner UI — future enhancement
- Server-side verify lookup audit log + admin verify queue populated — post Phase 2
- `verify_records` dedicated table — không cần nếu marketplace_items đủ
- Consign draft save-progress (localStorage hoặc server draft) — user chọn bỏ
- Contact + Email UX/copy chi tiết — deferred to Claude's discretion during implementation

</deferred>

---

*Phase: 02-supabase-data-layer-public-flows*
*Context gathered: 2026-06-14*
