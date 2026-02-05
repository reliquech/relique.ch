# Admin Dashboard - Relique CRM

## 📋 Tổng quan

Admin Dashboard là ứng dụng quản lý toàn diện cho Relique platform, cung cấp giao diện quản trị cho marketplace, verification records, submissions, và system management. Dashboard được xây dựng dựa trên CRM dashboard với tab-based navigation và dark theme interface.

### Tính năng chính

- ✅ **Tab-based Navigation**: Client-side routing với sidebar navigation
- ✅ **Dashboard Analytics**: Platform metrics với charts và statistics
- ✅ **Marketplace Management**: Quản lý items, featured carousel
- ✅ **Verification Records**: Quản lý verification certificates và results
- ✅ **Audit Trail**: Security audit logs với real-time tracking
- ✅ **Authentication**: Login + OTP two-factor authentication flow
- ✅ **Data Visualization**: Charts với recharts library

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) hoặc npm/yarn

### Installation

```bash
# Install dependencies (từ root)
pnpm install

# Setup environment variables
cd apps/admin
cp .env.local.example .env.local
# Edit .env.local và thêm Supabase credentials của bạn

# Run admin dashboard (port 3001)
pnpm dev

# Hoặc từ root
pnpm dev:admin
```

### Environment Variables

Copy từ `.env.example` trong thư mục `apps/admin/` sang `.env.local`, rồi điền giá trị. Các biến bắt buộc:

```env
# Supabase Configuration
# Get these values from: https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=support@relique.co
```

**Lưu ý quan trọng:**
- `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` là public và có thể expose trong client-side code
- `SUPABASE_SERVICE_ROLE_KEY` là secret key - **KHÔNG BAO GIỜ** expose trong client-side code, chỉ dùng trong API routes và server actions

### Deploy Checklist (Production)

1. **Environment**
   - Trên Vercel/Netlify: set **đúng** `NEXT_PUBLIC_SUPABASE_URL` (phải trùng với project Supabase bạn đang dùng, ví dụ custom domain hoặc `https://<project-ref>.supabase.co`).
   - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
2. **Migrations**
   - Run all SQL migrations in `apps/admin/supabase/migrations/`
3. **Storage Buckets**
   - Ensure buckets exist:
     - `marketplace-images`
     - `crm-attachments`
   - Apply storage policies from migrations
4. **Health Check**
   - Call `GET /api/health` and expect `{ ok: true, db: "ok" }`
5. **Build & Start**
   - `pnpm build`
   - `pnpm start` (port 3600)

**Lỗi `ENOTFOUND ... supabase.co` khi deploy:**  
Lỗi này xảy ra khi **biến môi trường trên hosting** (Vercel/Netlify/…) đang trỏ sai URL Supabase (project không tồn tại hoặc hostname sai). Cần vào **Settings → Environment Variables** của project deploy và đặt `NEXT_PUBLIC_SUPABASE_URL` (và các key) **giống với môi trường local** (cùng project Supabase bạn dùng khi chạy `pnpm dev`). Sau khi sửa env, redeploy.

### QA Checklist (Manual)

- Login/logout flow
- API auth guard returns 401 when not logged in
- Dashboard loads CRM summary + chart (range 7/30/90)
- Dashboard shows funnel + lead source + deal aging
- Export CSV report from dashboard
- Notifications list loads + mark read/mark all read
- Notification preferences toggle (in-app/email + types)
- Alert rules runner creates notifications/tasks from CRM data
- Tasks list loads + mark done + create (admin/editor)
- Automations list loads + toggle/CRUD (admin/editor)
- Profile updates display name + phone via Supabase
- Users management (invite + update role)
- RBAC: Viewer read-only, Editor CRUD, Admin pipeline + users
- Email send from Customer/Lead + email log created
- Customers CRUD + attachments
- Custom fields CRUD + show in CRM forms
- Leads CRUD + convert dialog
- Deals CRUD + kanban + detail + attachments
- Pipeline stages CRUD + reorder
- Messages list + view + status update + attachments
- Submissions load
- Logs load
- `GET /api/health` returns `{ ok: true, db: "ok" }`

### Access

- Development: `http://localhost:3001`
- Login: `http://localhost:3001/login`
- Admin Dashboard: `http://localhost:3001/admin`

### Default Credentials

```
Email: admin@relique.co hoặc admin@gmail.com
Password: admin123
OTP: 123456
```

---

## 🎯 Features

### 1. Authentication System

**Two-Factor Authentication (2FA) Flow:**
- Email/password login
- OTP verification (6 digits)
- Session management
- Secure logout với audit logging

**Files:**
- `src/app/login/page.tsx` - Login và OTP flow

### 2. Dashboard Overview

**Platform Metrics:**
- CRM statistics grid (Leads, Customers, Messages, Deals)
- Activity chart theo thời gian (range 7/30/90)
- Export CSV report
- Recent audit logs sidebar

**Components:**
- `src/components/dashboard/StatsGrid.tsx` - Statistics cards
- `src/app/admin/page.tsx` - Main dashboard với charts
 - `src/lib/services/api/dashboardService.ts` - Dashboard API client

### 3. Marketplace Management

**Features:**
- Browse và search marketplace items
- Status management (Published, Draft, Archived)
- Featured items toggle
- Price display và formatting
- Item editing và deletion

**Tabs:**
- **Items**: Full marketplace items table với search
- **Carousel**: Featured items manager với drag-to-reorder

### 4. Featured Carousel Manager

**Features:**
- Reorder featured items (up/down arrows)
- Add/remove items từ featured carousel
- Live preview của carousel order
- Selection explorer để tìm items chưa featured

**Components:**
- Main carousel manager trong dashboard
- Drag-to-reorder functionality
- Real-time order updates

### 5. Verification Records

**Features:**
- View verification certificates (Product ID, Name, Signatures, Result, Date)
- Search by Product ID (PID)
- Create new certificates
- Status tracking (Qualified, Inconclusive, Disqualified)

**Data Table:**
- Product ID display với monospace font
- Result status pills với color coding
- Date formatting

### 6. Audit Trail & Logs

**Features:**
- Complete audit log của tất cả admin actions
- Real-time log updates
- Timestamp formatting
- Actor tracking (who performed the action)
- Entity tracking (what was affected)

**Log Actions:**
- LOGIN, LOGOUT
- PUBLISH, DELETE, CREATE
- FEATURE, UNFEATURE, REORDER
- BULK_DELETE
- và nhiều actions khác

### 7. System Settings

**Features:**
- Admin profile management
- Security settings (password change)
- System configurations

---

## 🗂️ Architecture

### Tab Navigation

Dashboard sử dụng client-side tab navigation với các tabs sau:

1. **Dashboard** - Platform overview với metrics và charts
2. **Items** - Marketplace items management
3. **Carousel** - Featured items manager
4. **Verify** - Verification records
5. **Logs** - Security audit trail
6. **Settings** - System configurations
7. **Submissions** - Authenticate và Consign submissions (placeholder)
8. **Messages** - Contact inquiries (placeholder)

### Component Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Main admin dashboard (tab navigation)
│   ├── login/
│   │   └── page.tsx          # Login + OTP flow
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── shell/
│   │   └── PortalSidebar.tsx # Sidebar navigation
│   ├── dashboard/
│   │   └── StatsGrid.tsx     # Statistics cards
│   └── shared/
│       └── DataTable.tsx     # Reusable data table
└── lib/
    ├── types.ts              # TypeScript types và enums
    ├── auth.ts               # Authentication utilities
    └── utils.ts              # Utility functions
```

### Key Components

**PortalSidebar**
- Tab-based navigation
- Menu groups (Overview, Marketplace, Verification, Submissions, System)
- Active tab highlighting
- Logout button

**StatsGrid**
- 4 statistics cards
- Icons với color coding
- Percentage changes
- Hover effects

**DataTable**
- Reusable table component
- Column configuration
- Custom rendering
- Actions (View, Edit, Delete)
- Empty state handling

---

## 🎨 Styling & Theme

### Color Scheme

```css
--primary: #0055FF      /* Blue */
--accent: #00CCFF       /* Cyan */
--surface: #121212      /* Dark surface */
--border: #333333       /* Border color */
--success: #10B981      /* Green */
--warning: #F59E0B      /* Orange */
--destructive: #EF4444  /* Red */
--bg-0: #0A0A0A         /* Background */
```

### Design System

- **Theme**: Dark-only
- **Typography**: Inter font family
- **Border Radius**: Rounded-xl, rounded-2xl
- **Spacing**: Consistent spacing scale
- **Shadows**: Subtle shadows với color tints

### Status Pills

Status được hiển thị với color-coded pills:
- **Published**: Green với CheckCircle icon
- **Draft**: Gray với FileEdit icon
- **Archived/Disqualified**: Red với Archive icon
- **In Review/Inconclusive**: Orange với Clock icon
- **Qualified**: Cyan với ShieldCheck icon

---

## 📦 Dependencies

### Core Dependencies

```json
{
  "next": "16.1.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "recharts": "^3.6.0",
  "lucide-react": "^0.468.0",
  "sonner": "^2.0.7"
}
```

### UI Libraries

- **shadcn/ui**: Radix UI components
- **recharts**: Charts và data visualization
- **lucide-react**: Icon library
- **tailwindcss**: Styling framework

---

## 🔧 Development

### Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm check-types

# Linting
pnpm lint
```

### Environment

- **Port**: 3001 (default)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

---

## 📝 Types & Interfaces

### Enums

```typescript
enum MarketplaceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

enum VerificationStatus {
  QUALIFIED = 'qualified',
  INCONCLUSIVE = 'inconclusive',
  DISQUALIFIED = 'disqualified'
}

enum SubmissionStatus {
  NEW = 'new',
  IN_REVIEW = 'in_review',
  CLOSED = 'closed'
}
```

### Interfaces

```typescript
interface MarketplaceItem {
  id: string;
  title: string;
  athlete: string;
  category: string;
  status: MarketplaceStatus;
  is_featured: boolean;
  price_usd: number;
  featured_order?: number | null;
}

interface VerifyRecord {
  id: string;
  pid: string;
  name: string;
  signatures: number;
  result: VerificationStatus;
  date: string;
}

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
}
```

---

## 🔐 Authentication Flow

1. User enters email và password
2. System validates credentials
3. If valid, OTP screen appears
4. User enters 6-digit OTP
5. If OTP correct, user is authenticated
6. Session is created và user redirected to dashboard
7. All actions are logged trong audit trail

---

## 📊 Data Flow

### State Management

- **Client-side state**: React useState hooks
- **Local state**: Component-level state
- **Data persistence**: Currently mock data (can be extended với API integration)

### Data Tables

- **Marketplace Items**: Filterable, searchable table
- **Verification Records**: Searchable by Product ID
- **Audit Logs**: Chronological list với timestamps

---

## CRM API Endpoints

Tất cả CRM API dùng JSON, base URL là `/api` (relative to app origin). Mỗi thao tác create/update/delete ghi vào `public.audit_logs`.

### Base paths

| Resource | Base path |
|----------|-----------|
| Customers | `/api/customers` |
| Leads | `/api/leads` |
| Deals | `/api/deals` |
| Pipeline stages | `/api/pipeline-stages` |
| Messages | `/api/messages` |
| Attachments | `/api/attachments` |
| Dashboard | `/api/dashboard` |
| Notifications | `/api/notifications` |
| Alert rules | `/api/alert-rules` |
| Tasks | `/api/tasks` |
| Users | `/api/users` |
| CRM Views | `/api/crm-views` |
| CRM Filters | `/api/crm-filters` |
| CRM Searches | `/api/crm-searches` |
| Email send | `/api/email/send` |
| Custom fields | `/api/custom-fields` |
| Custom field values | `/api/custom-field-values` |
| Notification preferences | `/api/notification-preferences` |
| Activity (timeline) | `/api/activity` |
| Activity note | `/api/activity/note` |
| Error log (observability) | `/api/error-log` |

### List (GET)

- **Customers**: `?page=1&pageSize=50&status=active|inactive&owner_id=uuid&q=search`
- **Leads**: `?page=1&pageSize=50&status=new|contacted|qualified|unqualified&owner_id=uuid&q=search`
- **Deals**: `?page=1&pageSize=50&status=open|won|lost&pipeline_stage_id=uuid&customer_id=uuid&lead_id=uuid&owner_id=uuid&q=search`
- **Pipeline stages**: `?sort=position|name` — trả `{ items: [...] }` (không phân trang)
- **Messages**: `?page=1&pageSize=50&status=new|open|pending|closed&q=search`
- **Attachments**: `?entity_type=...&entity_id=...` — trả `{ items: [...] }`
- **Notifications**: `?page=1&pageSize=50&unread=true|false`
- **Tasks**: `?page=1&pageSize=50&status=open|done&due=overdue|today|upcoming`

### Reporting & Alerts

- **Dashboard**: `GET /api/dashboard?range=7|30|90` hoặc `?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - Response: `{ summary, series, funnel, lead_sources, deal_aging, range }`
- **Alert rules**:
  - `GET /api/alert-rules`
  - `POST /api/alert-rules`
  - `PATCH /api/alert-rules/{id}`
  - `DELETE /api/alert-rules/{id}`
  - `POST /api/alert-rules/run` body `{ dry_run?: boolean }` (run CRM rules; dry_run = preview only)
  - `GET /api/alert-rules/preview?rule_id=...&entities=1` (match count or entity ids)
- **Dashboard**: `?compare=previous` returns previous-period deltas; saved reports: `GET/POST /api/dashboard/reports`, `GET/PATCH/DELETE /api/dashboard/reports/{id}`
- **Activity**: `GET /api/activity?entity_type=lead|deal|customer|message&entity_id=uuid` — unified timeline (audit, tasks, attachments, messages). `POST /api/activity/note` body `{ entity_type, entity_id, body }` (admin/editor).
- **Bulk update**: `POST /api/leads/bulk-update`, `POST /api/deals/bulk-update`, `POST /api/customers/bulk-update` body `{ ids: uuid[], patch: { ... } }`.
- **Attachments**: `POST /api/attachments/upload-url` body `{ entity_type, entity_id, file_name, content_type }` → `{ upload_url, attachment_id }`; `PATCH /api/attachments/{id}` body `{ title?, note? }`.
- **Custom fields**: `GET /api/custom-fields/export?entity=...&format=json|csv`, `POST /api/custom-fields/import` body `{ merge|overwrite, ... }`.
- **CRM Views**: PATCH supports `is_default`, `shared`. GET returns own views + shared views from others.
- **Observability**: `POST /api/error-log` body `{ source: "client", path?, method?, status_code?, message?, details? }`. Server 5xx can be logged to `error_logs` table.

**Response (paginated)**: `{ items: T[], total: number, page: number, pageSize: number, totalPages: number }`

### Single (GET /:id)

- `GET /api/{resource}/{id}` — trả một bản ghi hoặc 404.

### Create (POST)

- `POST /api/{resource}` — body JSON (fields theo từng entity). Trả **201** và object vừa tạo.

**Ví dụ POST customer**: `{ "full_name": "John", "email": "john@example.com", "status": "active" }`

### Update (PATCH /:id)

- `PATCH /api/{resource}/{id}` — body JSON partial. Trả object đã cập nhật.

### Delete (DELETE /:id)

- `DELETE /api/{resource}/{id}` — không body. Trả `{ success: true }`.

### Ví dụ request/response

```http
GET /api/customers?page=1&pageSize=10
```

```json
{
  "items": [{ "id": "...", "full_name": "Jane", "email": "jane@example.com", "status": "active", "created_at": "...", "updated_at": "..." }],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

```http
POST /api/customers
Content-Type: application/json
{ "full_name": "Jane Doe", "email": "jane@example.com" }
```

```json
201
{ "id": "uuid", "full_name": "Jane Doe", "email": "jane@example.com", "status": "active", "created_at": "...", "updated_at": "..." }
```

### Migrations (CRM backlog)

- **023**: `attachments` — add `title`, `note`.
- **024**: `crm_custom_fields` — add `group`, `visibility_rules`.
- **025**: `dashboard_reports` table; RPCs `crm_stage_velocity`, `crm_funnel_by_source`.
- **026**: `alert_rules` — add `priority`, `active_hours`, `actions`.
- **027**: `deals`, `customers` — add `owner_id` (references profiles).
- **028**: `crm_saved_views` — add `is_default`, `shared`.
- **029**: `error_logs` — table for client/server error logging.

---

## 🚧 Future Enhancements

### Planned Features

- [ ] API integration thay vì mock data
- [ ] Real-time updates với WebSocket
- [ ] Advanced filtering và sorting
- [ ] Bulk operations
- [ ] User management
- [ ] Permission system
- [ ] Email notifications
- [ ] Dashboard customization

---

## 🐛 Known Issues

### Hydration Mismatch

- **Issue**: Date formatting có thể gây hydration mismatch
- **Solution**: Sử dụng `mounted` state để chỉ render formatted dates sau khi client-side mount

### Recharts SSR

- **Issue**: ResponsiveContainer cần client-side rendering
- **Solution**: Conditional rendering với `mounted` state

---

## 📚 Related Documentation

- [Project Structure](../../docs/PROJECT_STRUCTURE.md)
- [Root README](../../README.md)
- [Web App README](../web/README.md)

---

**Last Updated:** 2025-01-20  
**Version:** 0.1.0  
**Status:** Production-Ready
