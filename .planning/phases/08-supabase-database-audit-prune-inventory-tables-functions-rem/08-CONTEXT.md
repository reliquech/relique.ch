# Phase 8 Context: Supabase Database Audit & Prune

**Gathered:** 2026-06-14  
**Status:** Ready for `/gsd-discuss-phase 8` → `/gsd-plan-phase 8`

## Vấn đề

Supabase schema hiện có **35 migration files** (001–035), nhiều overlap brownfield (RLS 005+009, RPC 014→020→025, profiles/functions lặp 001+015+030). App chỉ query **~21 tables** nhưng DB mang full CRM + reporting + alert stack từ admin legacy — cần inventory rõ **giữ / gỡ / gộp** trước khi squash baseline.

**Phase 7** đã làm manifest + 035 indexes. **Phase 8** đi sâu: usage audit, prune dead schema, consolidate functions, RLS/index review theo code thực tế.

---

## Inventory hiện tại (35 migrations)

| Nhóm | Files | Nội dung |
|------|-------|----------|
| Core | 001–007 | profiles, marketplace, consign, audit, RLS, indexes, triggers |
| RLS patch | 009 | Performance fix (overlap 005) |
| CRM core | 010–012 | customers, leads, deals, messages, attachments, pipeline seed |
| CRM extended | 013–022 | notifications, alert_rules, reporting RPCs, views/filters, email_logs, tasks, custom fields |
| CRM polish | 023–028 | attachments metadata, dashboard_reports, alert actions, owner_id, saved views |
| Ops | 029–031 | error_logs, admin_upsert_profile (030), marketplace metadata |
| Public flows | 032–034 | product_id, consign bucket, email_logs nullable |
| Optimize | 035 | public browse + CRM queue indexes |

---

## Tables — usage vs app (`src/`)

| Table | Migrations | App usage | Verdict |
|-------|------------|-----------|---------|
| `profiles` | 001, 015, 030 | Auth, requireRole, users API, profile pages | **GIỮ** — core |
| `marketplace_items` | 002, 031, 032 | Marketplace API, verify lookup | **GIỮ** — core |
| `consigned_items` | 003 | Consign API, admin queue, convert | **GIỮ** — core |
| `audit_logs` | 004 | Mọi mutate route + activity | **GIỮ** — core |
| `customers` | 010 | CRM API | **GIỮ** |
| `leads` | 010 | CRM, contact, consign, alert-rules | **GIỮ** |
| `deals` | 010, 027 | CRM, alert-rules | **GIỮ** |
| `messages` | 010 | CRM, contact, activity | **GIỮ** |
| `attachments` | 010, 023 | CRM, consign photos | **GIỮ** |
| `pipeline_stages` | 010, 012 | CRM pipeline | **GIỮ** |
| `notifications` | 013 | Notifications API, alert run | **GIỮ** |
| `alert_rules` | 013, 021, 026 | Alert rules API + run/preview | **GIỮ** — review complexity |
| `crm_saved_views` | 016, 028 | CRM views API | **GIỮ** |
| `crm_saved_filters` | 016 | CRM filters API | **GIỮ** |
| `crm_recent_searches` | 016 | CRM searches API | **GIỮ** — low value? audit UX |
| `crm_custom_fields` | 019, 024 | Custom fields API | **GIỮ** |
| `crm_custom_field_values` | 019 | Custom field values API | **GIỮ** |
| `tasks` | 018 | Tasks API, activity, alert run | **GIỮ** |
| `notification_preferences` | 022 | Prefs API, alert run | **GIỮ** |
| `dashboard_reports` | 025 | Dashboard reports API | **GIỮ** |
| `error_logs` | 029 | error-log API, serverErrorLog | **GIỮ** |
| `email_logs` | 017, 034 | **Không có query trong `src/`** | **AUDIT** — wire Resend logging hoặc drop table |

---

## RPC / Functions — usage vs app

| Function | Defined in | Called from app | Verdict |
|----------|------------|-----------------|---------|
| `handle_updated_at()` | 001, 030 | Trigger only | **GỘP** — giữ 1 definition trong baseline |
| `handle_new_user()` | 001, 015, 030 | Trigger only | **GỘP** — 3 lần redefine |
| `log_audit_event()` | 007 | Trigger only | **GIỮ** |
| `set_marketplace_state_timestamps()` | 002 | Trigger only | **GIỮ** |
| `crm_dashboard_summary` | 014 | `api/dashboard` | **GIỮ** |
| `crm_activity_series` | 014 | `api/dashboard` | **GIỮ** |
| `crm_funnel_summary` | 020 | `api/dashboard` | **GIỮ** |
| `crm_lead_source_performance` | 020 | `api/dashboard` | **GIỮ** |
| `crm_deal_aging` | 020 | `api/dashboard` | **GIỮ** |
| `crm_stage_velocity` | 025 | `api/dashboard` | **GIỮ** |
| `crm_funnel_by_source` | 025 | `api/dashboard` | **GIỮ** |
| `admin_upsert_profile` | 030 | **Không gọi** — users API dùng `.upsert()` trực tiếp | **XEM XÓA** hoặc wire vào invite flow |

**Ghi chú:** 7 reporting RPCs đều active — không prune RPC dashboard; tối ưu bằng merge SQL body vào baseline, không drop.

---

## Storage buckets

| Bucket | Migration | App usage | Verdict |
|--------|-----------|-----------|---------|
| marketplace images | 008 | marketplace upload/finalize | **GIỮ** |
| CRM attachments | 011 | storageService, upload-url | **GIỮ** |
| consign-submissions | 033 | public consign upload | **GIỮ** |

---

## Overlap / nặng cần xử lý

1. **RLS duplicate:** `005_create_rls_policies.sql` + `009_fix_rls_performance.sql` — không squash trên DB đã apply; document + baseline mới gộp.
2. **RPC chain:** `014` → `020` → `025` — 3 files extend; baseline = 1 file với 7 functions cuối.
3. **Profiles DDL duplicate:** `001` + `030` (recreate table + functions) — `030` redundant nếu 001–015 đã apply.
4. **35-file chain** — fresh install chậm; Phase 8 deliverable: `000_baseline.sql` + `migrations/legacy/` archive.
5. **`email_logs`** — schema có, app không log — quyết định wire hoặc drop.
6. **`admin_upsert_profile`** — dead RPC.
7. **RLS policy count** — ~50+ policies across migrations; audit theo table vs service-role bypass pattern hiện tại.
8. **Indexes** — 035 đã thêm browse indexes; audit thêm: `audit_logs` (high write), `alert_rules` run queries, `crm_custom_field_values` joins.

---

## Checklist công việc (cho plan phase)

### A. Audit & inventory (read-only)
- [ ] Script/grep: map mọi `.from("table")` và `.rpc("fn")` trong `src/` → `SUPABASE_USAGE.md`
- [ ] Liệt kê tables/functions/policies/triggers/indexes từ migrations → cross-ref usage
- [ ] Supabase Dashboard: so sánh live DB vs migration manifest (orphan objects?)
- [ ] Đánh dấu KEEP / PRUNE / DEFER / WIRE-UP cho từng object

### B. Prune dead schema (migration mới, không sửa history)
- [ ] Drop `admin_upsert_profile` nếu confirm unused (migration 036)
- [ ] Quyết định `email_logs`: implement logging trong Resend helper HOẶC drop table + migration
- [ ] Review `crm_recent_searches` — có feature UI không? prune nếu unused
- [ ] Review alert_rules complexity (021, 026) — fields nào UI/API thực sự dùng?

### C. Consolidate for new installs
- [ ] Author `supabase/migrations/000_baseline.sql` — squash 001–035 state
- [ ] Move 001–035 → `supabase/migrations/legacy/` (document only, không xóa)
- [ ] Update `MIGRATION_MANIFEST.md` + `MIGRATIONS.md` với dual-path: existing chain vs baseline

### D. RLS & performance
- [ ] RLS audit matrix: table × role × operation (anon/authenticated/service)
- [ ] Align public read paths với SEC-04 (marketplace published only)
- [ ] Index review: EXPLAIN hot queries (marketplace browse, leads queue, consigned queue)
- [ ] `audit_logs` retention strategy — partition hoặc archive job?

### E. Types & app alignment
- [ ] Regenerate `src/lib/supabase/types.ts` từ schema sau prune
- [ ] Giảm `as never` casts trên mutations
- [ ] Verify `npm run build` + manual smoke admin dashboard RPCs

### F. Verification
- [ ] Fresh Supabase project: apply baseline only → full app smoke
- [ ] Existing project: apply 036+ incremental only → no regression
- [ ] Document rollback + apply order trong `supabase/MIGRATIONS.md`

---

## Phụ thuộc

- **Depends on Phase 7** — manifest + 035 indexes là nền
- **Không break production DB** — prune qua migration mới (036+), không rewrite 001–035 đã apply
- **Coordination Phase 4** — schema dedup types có thể overlap; Phase 8 owns DB side

---

## Success criteria (draft)

1. `SUPABASE_USAGE.md` — bảng table/function/bucket với KEEP/PRUNE verdict và file evidence
2. Migration 036+ prune confirmed dead objects (ít nhất `admin_upsert_profile`; `email_logs` có quyết định rõ)
3. `000_baseline.sql` cho fresh install (≤1 file thay 35)
4. RLS audit doc — mỗi table có policy map
5. Types regenerated, build pass
6. Dashboard RPCs + public flows smoke pass sau prune
