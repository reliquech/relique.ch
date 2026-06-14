# Phase 5: Admin UX Redesign - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning
**Mode:** auto-discuss (recommended defaults)

<domain>
## Phase Boundary

Redesign **admin CRM only** (`/admin/*`) — operators làm việc hiệu quả hơn. Deliverables:

- Dashboard layout, navigation, visual hierarchy mới
- CRM pages (leads, deals, customers, tasks) redesigned + tablet-usable
- Marketplace management (items, submissions, featured) redesigned
- **Functional fixes:** real edit flow, submission status transitions, audit logging on publish/approve

**Không trong phase này:** public site UX redesign (PROJECT.md — functional fixes only on public), payments, monorepo restructure (Phase 6 nếu chưa xong).

</domain>

<decisions>
## Implementation Decisions

### Visual Direction & Scope
- **D-01:** **Admin-only redesign** — public `(site)` routes **không** redesign; chỉ fix broken functional nếu phát hiện trong QA
- **D-02:** Visual language: **professional CRM** — dense data tables, clear hierarchy, sidebar nav; không marketing-style hero layouts
- **D-03:** Reuse **shadcn-guard wrappers** (`components/shared/**`, `components/admin/**`) — không fork raw `components/ui/**`
- **D-04:** Color/spacing: align existing admin CSS tokens + Relique brand navy/gold — không full rebrand

### Navigation & Layout (UX-01)
- **D-05:** **Persistent left sidebar** (giữ PortalSidebar pattern) — improve grouping: CRM | Marketplace | Operations | Settings
- **D-06:** Dashboard `/admin` là **landing hub** — KPI cards + recent activity + quick links (leads queue, pending submissions)
- **D-07:** Breadcrumbs trên detail/edit pages — không bắt buộc trên list pages
- **D-08:** Mobile: **tablet-first** (UX-04) — sidebar collapses to sheet/drawer ≥768px usable; phone secondary

### CRM Pages (UX-02)
- **D-09:** Leads, deals, customers, tasks — **unified table + filter bar pattern** (reuse/enhance DataTable generic)
- **D-10:** Detail views: **slide-over panel hoặc dedicated detail page** — planner picks per entity; leads/deals get detail page, tasks có thể inline expand
- **D-11:** Empty states: actionable CTA ("Create lead", "No submissions yet") — không blank tables
- **D-12:** Giữ existing API services — redesign là presentation layer, không rewrite data layer

### Marketplace Admin (UX-03)
- **D-13:** Items list: **row actions** Edit / Publish / Archive visible — fix ADM-01 no-op edit
- **D-14:** Item edit: **dedicated edit route** `/admin/marketplace/[id]/edit` hoặc modal full-screen — không console.log stub
- **D-15:** Submissions queue: **status chips + bulk actions** (submitted → in_review → approved/rejected) — ADM-02
- **D-16:** Featured management: drag-reorder hoặc simple up/down — không cần fancy DnD v1 nếu complexity high (Claude discretion)

### Operator Actions & Audit (ADM-01–03)
- **D-17:** Marketplace item Edit → **opens real edit form** wired to existing PATCH API — ADM-01
- **D-18:** Consign submission status transitions → **dropdown + confirm** on queue row — ADM-02; states: `submitted`, `in_review`, `approved`, `rejected`
- **D-19:** Publish/approve mutations → **write `audit_logs` entry** (who, what, entity_id, timestamp) — ADM-03
- **D-20:** Destructive actions (delete, reject) → **confirmation modal** — reuse DeleteConfirmModal pattern

### Component Architecture
- **D-21:** Files **<300 lines** — extract subcomponents khi redesign (project rule + shadcn-guard)
- **D-22:** Split oversized existing pages (`LeadsPage`, `TasksPage`, `MarketplaceForm`) during redesign — không copy-paste monolith

### Claude's Discretion
- Exact dashboard KPI selection (from existing `/api/dashboard` data)
- Icon set additions (lucide only)
- Whether item edit is modal vs route
- Table column defaults per entity
- Animation/motion level (minimal recommended)

</decisions>

<canonical_refs>
## Canonical References

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 5 goal, UX-01–04, ADM-01–03
- `.planning/REQUIREMENTS.md` — UX and ADM acceptance criteria
- `.planning/PROJECT.md` — Admin-only UX redesign v1; public minimal touch
- `.planning/phases/01-foundation-app-merge/01-CONTEXT.md` — Admin code placement `src/admin/`, shell `components/admin/`

### Admin Implementation
- `apps/web/src/admin/` — domain modules (crm, marketplace, submissions, dashboard)
- `apps/web/src/components/admin/` — PortalSidebar, admin shell
- `apps/web/src/app/admin/` — route files

### Functional Gaps to Fix
- `apps/web/src/admin/marketplace/pages/ItemsPage.tsx` — edit no-op
- `apps/web/src/admin/submissions/` — status workflow
- `apps/web/src/app/api/marketplace/` — publish mutations for audit hook

### UI Conventions
- `.cursor/rules/shadcn-guard.mdc` — wrapper-only shadcn edits
- `.planning/codebase/CONCERNS.md` — oversized files list

### Research
- `.planning/research/FEATURES.md` — operator workflow expectations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PortalSidebar`, admin layout — extend, don't replace from scratch
- `DataTable` (admin) — needs generic typing (Phase 4 may touch); redesign consumes improved version
- `DeleteConfirmModal`, `EmailDialog` — reuse for confirmations
- Existing feature pages under `src/admin/{domain}/pages/` — redesign targets

### Established Patterns
- Thin routes re-export admin pages (Phase 1 D-04)
- Supabase API services per domain (`crmSearchesService`, etc.)
- Role-based UI hiding — complement with API guards (Phase 3)

### Integration Points
- `/api/dashboard`, `/api/leads`, `/api/deals`, `/api/consigned`, `/api/marketplace`
- Audit log table (migration may be needed — planner researches existing schema)
- Tablet breakpoint: Tailwind `md:` / `lg:` consistent with public site

</code_context>

<specifics>
## Specific Ideas

- [auto] Professional CRM aesthetic — dense tables, not consumer marketplace style
- [auto] Fix real operator pain: edit no-op, submission status, audit trail
- [auto] Tablet-usable — sidebar collapse pattern

</specifics>

<deferred>
## Deferred Ideas

- Public site admin-adjacent pages redesign — out of scope v1
- Real-time notifications center overhaul — minimal fix only
- Custom dashboard builder — v2
- Mobile-native admin app — out of scope

</deferred>

---

*Phase: 05-admin-ux-redesign*
*Context gathered: 2026-06-14*
