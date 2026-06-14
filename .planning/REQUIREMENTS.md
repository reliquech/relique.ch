# Requirements: Relique.co Unified Platform

**Defined:** 2026-06-14
**Core Value:** Người dùng có thể tin tưởng Relique — verify thật, consign/submit thật, liên hệ được — trên một codebase, một deploy. Marketplace browse-only v1 (không checkout).

## v1 Requirements

### Foundation — App Merge

- [ ] **FND-01**: `apps/admin` được gộp vào `apps/web` — một Next.js app, một deploy
- [ ] **FND-02**: Admin routes nằm tại route group `/admin` với layout riêng (sidebar, auth shell)
- [ ] **FND-03**: Middleware bảo vệ `/admin/*` — unauthenticated redirect tới `/admin/login`
- [ ] **FND-04**: Tất cả admin API routes (`/api/*`) migrate sang unified app
- [ ] **FND-05**: Supabase migrations folder consolidate vào unified app (`supabase/migrations/`)
- [ ] **FND-06**: Root scripts/turbo config cập nhật — xóa `dev:admin`, `apps/admin` references

### Foundation — Data Layer

- [ ] **DATA-01**: Verify flow dùng Supabase backend — không còn `verify.local.ts` adapter
- [ ] **DATA-02**: Consign flow persist vào `consigned_items` table — không còn localStorage
- [ ] **DATA-03**: Contact form tạo lead/message trong CRM — không còn fake success
- [ ] **DATA-04**: Xóa localStorage adapters cho production data (`verify`, `consign`, `json` storage helpers)
- [ ] **DATA-05**: Schema imports consolidate sang `@relique/shared/domain` — xóa deprecated schema files
- [ ] **DATA-06**: Supabase types regenerate từ schema — giảm `@ts-expect-error` trên API routes

### Verify

- [ ] **VRFY-01**: User lookup cert/product ID → kết quả authenticated từ database (qualified/inconclusive/disqualified)
- [ ] **VRFY-02**: QR/barcode scan parse code thật — không generate random mock codes
- [ ] **VRFY-03**: Verify result hiển thị certificate details (signer, item type, grade, date, images)
- [ ] **VRFY-04**: Verify result có thể link tới marketplace listing tương ứng (nếu item listed)

### Consign

- [ ] **CNSG-01**: User submit consign form với photos → lưu `consigned_items` + Supabase Storage uploads
- [ ] **CNSG-02**: User nhận on-screen confirmation sau submit thành công
- [ ] **CNSG-03**: User nhận confirmation email sau consign submit (Resend)
- [ ] **CNSG-04**: Admin xem consign submissions trong queue với status workflow (submitted → in_review → approved/rejected)
- [ ] **CNSG-05**: Consign submit auto-create lead trong CRM

### Contact

- [ ] **CNTC-01**: User submit contact form → data persist (lead hoặc message record)
- [ ] **CNTC-02**: Operator nhận email notification khi có contact inquiry mới
- [ ] **CNTC-03**: User nhận confirmation sau contact submit

### Security

- [ ] **SEC-01**: Register endpoint yêu cầu auth hoặc bị disable — không public signup
- [ ] **SEC-02**: Public API routes audit — không expose service-role unnecessarily
- [ ] **SEC-03**: Admin API routes enforce `requireUser` + `requireRole` consistently
- [ ] **SEC-04**: Published-only marketplace filter enforced (lifecycle + visibility)

### Admin — Operations

- [ ] **ADM-01**: Admin listing edit hoạt động — fix no-op edit trên ItemsPage
- [ ] **ADM-02**: Admin submission queue actions hoạt động (status transitions)
- [ ] **ADM-03**: Audit logging trên publish/approve mutations
- [ ] **ADM-04**: Transactional email triggers cho consign/contact từ unified app

### Consolidation

- [ ] **CONS-01**: Xóa `relique-marketplace/` Vite prototype
- [ ] **CONS-02**: Xóa `apps/admin/` sau khi merge hoàn tất
- [ ] **CONS-03**: Xóa legacy admin localStorage services (`apps/admin/src/lib/legacy/`)
- [ ] **CONS-04**: Migrate shadcn imports sang `@relique/ui` wrappers — giảm duplicate `components/ui/`
- [ ] **CONS-05**: Xóa/fix trust-breaking mocks (watchlist fake notifications, contact fake success)

### Admin UX

- [ ] **UX-01**: Admin dashboard redesign — layout, navigation, visual hierarchy
- [ ] **UX-02**: Admin CRM pages redesign (leads, deals, customers, tasks)
- [ ] **UX-03**: Admin marketplace management redesign (items, submissions, featured)
- [ ] **UX-04**: Admin responsive layout — usable trên tablet

## v2 Requirements

### Commerce — Payments

- **PAY-01**: User checkout marketplace item qua Stripe Checkout (hosted)
- **PAY-02**: Stripe webhook cập nhật order state sau payment thành công
- **PAY-03**: Item chuyển `sold`/`unavailable` sau purchase — không còn purchasable
- **PAY-04**: Buyer nhận order confirmation email sau payment
- **ADM-05**: Transactional email trigger cho purchase confirmation

### Testing & Quality

- **TEST-01**: Vitest unit test framework
- **TEST-02**: Playwright E2E tests cho critical flows
- **TEST-03**: CI pipeline (GitHub Actions) — lint, typecheck, test, build

### User Features

- **USER-01**: Account-based verify history sync across devices
- **USER-02**: Watchlist với real price alerts
- **USER-03**: Guest checkout nâng cấp lên user accounts

### Platform

- **PLAT-01**: Public site UX redesign (homepage, marketplace, verify, consign)
- **PLAT-02**: Stripe Connect / escrow cho high-value items
- **PLAT-03**: Auction formats (bidding, timed auctions)
- **PLAT-04**: i18n / multi-language support

## Out of Scope

| Feature | Reason |
|---------|--------|
| **Marketplace payments / Stripe Checkout v1** | User decision 2026-06-14 — browse-only catalog v1; defer PAY-01–04 to v2 |
| Public site UX redesign | Admin-only redesign priority cho v1; public chỉ functional fixes |
| Full test framework + CI | Defer v2; v1 chỉ lint + typecheck + build |
| Separate `apps/admin` app | Đang bị thay thế bởi unified app |
| `relique-marketplace/` prototype | Archive/xóa sau merge |
| Blockchain / NFT / VDT provenance | Không phù hợp operator-owned model v1 |
| Live auctions / bidding | Defer v2 |
| Multi-vendor seller portal | Operator-owned inventory model |
| P2P escrow / Stripe Connect | Defer v2 |
| Physical vaulting & fulfillment | Manual fulfillment v1 |
| Public user registration | Admin-provisioned users only |
| Native mobile apps | Web-only, responsive |
| i18n | English-only v1 |
| Social login / OAuth | Email-based contact only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| VRFY-01 | Phase 2 | Pending |
| VRFY-02 | Phase 2 | Pending |
| VRFY-03 | Phase 2 | Pending |
| VRFY-04 | Phase 2 | Pending |
| CNSG-01 | Phase 2 | Pending |
| CNSG-02 | Phase 2 | Pending |
| CNSG-03 | Phase 2 | Pending |
| CNSG-04 | Phase 2 | Pending |
| CNSG-05 | Phase 2 | Pending |
| CNTC-01 | Phase 2 | Pending |
| CNTC-02 | Phase 2 | Pending |
| CNTC-03 | Phase 2 | Pending |
| ADM-04 | Phase 2 | Pending |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 3 | Pending |
| SEC-04 | Phase 3 | Pending |
| CONS-01 | Phase 4 | Pending |
| CONS-02 | Phase 4 | Pending |
| CONS-03 | Phase 4 | Pending |
| CONS-04 | Phase 4 | Pending |
| CONS-05 | Phase 4 | Pending |
| DATA-05 | Phase 4 | Pending |
| DATA-06 | Phase 4 | Pending |
| UX-01 | Phase 5 | Pending |
| UX-02 | Phase 5 | Pending |
| UX-03 | Phase 5 | Pending |
| UX-04 | Phase 5 | Pending |
| ADM-01 | Phase 5 | Pending |
| ADM-02 | Phase 5 | Pending |
| ADM-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-14*
*Last updated: 2026-06-14 — payments removed from v1 (deferred to v2)*
