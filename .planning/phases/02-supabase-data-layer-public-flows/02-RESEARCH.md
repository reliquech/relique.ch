# Phase 2: Supabase Data Layer & Public Flows — Research

**Researched:** 2026-06-14  
**Domain:** Supabase/Next.js API routes, multipart upload, transactional email  
**Confidence:** HIGH — all findings verified against live codebase

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Verify — Data Source & Lookup**
- D-01: Verify lookup từ `marketplace_items` — không tạo bảng `verify_records` riêng Phase 2
- D-02: User có thể tra cứu bằng cả hai: product ID format `RLQ-XXXX-XXXX` AND COA reference (`auth.coa_refs`, e.g. `REL-2024-001`)
- D-03: Verify status map từ `auth.status` trên marketplace item → map sang `qualified` / `inconclusive` / `disqualified` (researcher xác định mapping table cụ thể — xem § `auth.status → VerifyStatus Mapping`)
- D-04: Code hợp lệ format nhưng không tìm thấy trong DB → UI "not found" (giữ `VerifyNotFoundState`)
- D-05: Marketplace link (VRFY-04) chỉ hiện khi item `state.lifecycle = published` (và visibility public)
- D-06: QR/barcode v1: parse code từ URL/input (`?code=`, raw string) — không cần camera scanner UI
- D-07: Xóa localStorage verify history — không giữ browser-only history (DATA-04)
- D-08: Admin verify queue (`/admin/submissions` verify tab): placeholder/trống Phase 2

**Consign — Public Submit Flow**
- D-09: Public submit qua API route mới (không auth) — không mở rộng `/api/consigned` POST hiện tại
- D-10: Bỏ draft localStorage — single-shot submit, không save-progress draft
- D-11: Mỗi consign submit auto-create lead trong CRM (`leads` table, source = consign) — CNSG-05
- D-12: On-screen confirmation: redirect `/consign/success` sau submit thành công — CNSG-02
- D-13: Initial submission status: `submitted` (workflow: submitted → in_review → approved/rejected) — CNSG-04

**Consign — Photo Upload & Storage**
- D-14: Bucket mới `consign-submissions` (private) — migration riêng, không reuse `crm-attachments`
- D-15: Upload mechanism: API public multipart — server-side upload qua service role (anon user không upload trực tiếp Supabase Storage)
- D-16: Ít nhất 1 ảnh bắt buộc — thêm photo upload UI vào consign form
- D-17: Giới hạn: tối đa 10 ảnh, 10MB/ảnh — image types jpeg/png/webp
- D-18: Link ảnh qua `attachments` table (`entity_type: consigned_item`, `entity_id`) — pattern CRM hiện có

**Contact & Email**
- D-19: Contact form → tạo `messages` record + auto-create `leads` (pattern giống consign) — CNTC-01
- D-20: Operator notification + user confirmation email qua Resend — reuse pattern `/api/email/send` — CNTC-02, CNTC-03, CNSG-03, ADM-04
- D-21: Operator recipient: env var (e.g. `OPERATOR_EMAIL`) — không hardcode
- D-22: Contact form UX: thay `alert()` fake bằng inline success state — giữ layout hiện tại
- D-23: Phase 2 minimal thay đổi public UI — chỉ wire backend thật + thêm photo upload field consign

### Claude's Discretion
- Exact public API route paths (e.g. `/api/public/consign`, `/api/public/verify`, `/api/public/contact`)
- `auth.status` → `VerifyStatus` mapping table chi tiết
- Cách resolve `RLQ-*` product ID trên `marketplace_items` (metadata field vs slug vs migration)
- Email template content/copy (English, transactional tone)
- Rate limiting / basic spam protection trên public routes (lightweight v1)
- Verify result field mapping từ `marketplace_items` JSONB sang `VerifyResult` schema
- Attachment file naming convention trong `consign-submissions` bucket

### Deferred Ideas (OUT OF SCOPE)
- Camera-based QR/barcode scanner UI
- Server-side verify lookup audit log + admin verify queue populated
- `verify_records` dedicated table
- Consign draft save-progress
- Contact + Email UX/copy chi tiết
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Verify flow dùng Supabase backend — không còn `verify.local.ts` adapter | New `verify.supabase.ts` adapter queries `marketplace_items` via service role |
| DATA-02 | Consign flow persist vào `consigned_items` table — không còn localStorage | New `/api/public/consign` route inserts into `consigned_items` + attachments |
| DATA-03 | Contact form tạo lead/message trong CRM — không còn fake success | New `/api/public/contact` route inserts `messages` + `leads` |
| DATA-04 | Xóa localStorage adapters cho production data | Delete `verify.local.ts`, `consign.local.ts`; update `impl/index.ts` |
| VRFY-01 | User lookup cert/product ID → kết quả authenticated từ database | `/api/public/verify` queries `marketplace_items` by `metadata->>'product_id'` OR `auth->'coa_refs'` |
| VRFY-02 | QR/barcode scan parse code thật | Already implemented: `?code=` URL param + manual input in `verify/page.tsx` |
| VRFY-03 | Verify result hiển thị certificate details (signer, item type, grade, date, images) | Field mapping: `signing.signers`, `listing.title`, `condition.grade`, `state.updated_at`, `media.hero_id` |
| VRFY-04 | Verify result có thể link tới marketplace listing (nếu item listed) | Show link only when `state_lifecycle = 'published'` AND `state_visibility = 'public'` |
| CNSG-01 | User submit consign form với photos → lưu `consigned_items` + Supabase Storage | Multipart API + service role `storage.from('consign-submissions').upload()` |
| CNSG-02 | User nhận on-screen confirmation sau submit | Already: `router.push('/consign/success')` — ensure this fires on API success |
| CNSG-03 | User nhận confirmation email sau consign submit (Resend) | New public email helper; `email_logs.user_id` must be nullable (needs migration) |
| CNSG-04 | Admin xem consign submissions trong queue với status workflow | `consigned_items.status` column already supports `submitted → in_review → approved/rejected` |
| CNSG-05 | Consign submit auto-create lead trong CRM | Insert into `leads` with `source = 'consign'` inside `/api/public/consign` handler |
| CNTC-01 | User submit contact form → data persist (lead/message record) | Insert `messages` + `leads` in `/api/public/contact` |
| CNTC-02 | Operator nhận email notification khi có contact inquiry mới | Resend call to `process.env.OPERATOR_EMAIL` |
| CNTC-03 | User nhận confirmation sau contact submit | Resend call to submitter email; inline success state replaces alert() |
| ADM-04 | Transactional email triggers cho consign/contact từ unified app | New public email helper decoupled from `requireUser` guard |
</phase_requirements>

---

## Summary

Phase 2 thay thế toàn bộ localStorage mock backends bằng Supabase persistence thật cho ba public flows: **verify**, **consign**, và **contact**. Codebase đã có schema DB đầy đủ (`marketplace_items`, `consigned_items`, `leads`, `messages`, `attachments`) và Resend email infrastructure (`/api/email/send`). Phần lớn work là:

1. **Wire** verify lookup lên `marketplace_items` thay vì `verify.local.ts` (random mock)
2. **Create** ba public API routes mới không auth (`/api/public/{verify,consign,contact}`)
3. **Handle** multipart photo upload cho consign qua service role client
4. **Fix** hai DB constraints blocking Phase 2: `email_logs.user_id NOT NULL` và thiếu column/index cho `RLQ-*` product ID lookup
5. **Delete** `verify.local.ts` và `consign.local.ts`

**Primary recommendation:** Implement theo 4 plans — migrations → verify backend → consign submit+upload → contact+email+cleanup. Wave 1 (migrations + verify) unblocks Wave 2 và Wave 3 có thể chạy song song.

---

## `auth.status` → VerifyStatus Mapping

**Recommendation cho D-03:** [VERIFIED: codebase — `packages/shared/src/domain/schemas/marketplace.ts:84`, `apps/web/src/components/app/VerificationStatusBadge.tsx`]

`auth.status` enum (AuthSchema): `"none" | "pending" | "verified" | "rejected"`

| `auth.status` | → `VerifyStatus` | Rationale |
|---------------|-------------------|-----------|
| `"verified"` | `"qualified"` | Item has been authenticated by provider (PSA, JSA, etc.) |
| `"none"` | `"inconclusive"` | No authentication attempted — item exists but unverified |
| `"pending"` | `"inconclusive"` | Authentication in progress — cannot confirm or deny |
| `"rejected"` | `"disqualified"` | Authentication failed or COA invalidated |

```typescript
// Source: verified against AuthSchema enum in packages/shared/src/domain/schemas/marketplace.ts
function mapAuthStatusToVerifyStatus(
  authStatus: "none" | "pending" | "verified" | "rejected"
): "qualified" | "inconclusive" | "disqualified" {
  switch (authStatus) {
    case "verified":  return "qualified";
    case "rejected":  return "disqualified";
    case "none":
    case "pending":
    default:          return "inconclusive";
  }
}
```

---

## RLQ Product ID Resolution Strategy

**Recommendation cho D-02:** [VERIFIED: codebase — migration `002_create_marketplace_items.sql`, `031_add_marketplace_metadata.sql`]

### Problem
`marketplace_items` không có column `product_id`. Các fields hiện có: `id` (uuid), `slug` (url-friendly), `sku` (text not null, dùng format `SKU-0001` trong fixtures), `metadata` (jsonb, added migration 031).

### Recommended Approach: `metadata->>'product_id'` + COA refs GIN index

**Store:** Admin đặt `RLQ-*` code vào `metadata->>'product_id'` khi tạo/edit item.

**Query:**
```sql
-- Lookup by product ID (RLQ-*) OR COA ref (REL-*)
SELECT * FROM marketplace_items
WHERE (metadata->>'product_id' = $1 OR auth->'coa_refs' ? $1)
  AND state_lifecycle = 'published';
```

**Migration required:**
```sql
-- Expression index for product_id lookup
CREATE INDEX marketplace_items_product_id_idx
  ON marketplace_items((metadata->>'product_id'));

-- GIN index for COA refs array membership check
CREATE INDEX marketplace_items_auth_gin
  ON marketplace_items USING GIN(auth);
```

**Rationale vs alternatives:**
- ❌ Reuse `sku` field: `sku` đang dùng cho internal SKU (`SKU-0001`), repurpose gây confusion
- ❌ New `product_id` column: requires schema change + RLS policy update, overkill when `metadata` already exists
- ✅ `metadata->>'product_id'`: metadata column already added (migration 031), no schema changes needed, expression index efficient for equality lookup

**Input normalization:**
```typescript
// Source: VerifyRunInputSchema — code is trimmed + uppercased on verify page
const isCoaRef = /^REL-\d{4}-\d{3,}$/i.test(input.code);  // e.g. REL-2024-001
const isProductId = /^RLQ-[A-Z0-9]+-[A-Z0-9]+$/i.test(input.code);  // e.g. RLQ-XXXX-XXXX
// If neither matches → return "not_found" immediately without DB query (D-04)
```

---

## VerifyResult Field Mapping

**From `marketplace_items` row → `VerifyResult` schema:** [VERIFIED: codebase — `VerifyResultSchema`, `AuthSchema`, `marketplace.json` fixtures]

```typescript
// Source: packages/shared/src/domain/schemas/verify.ts (VerifyResultSchema)
// Source: packages/shared/src/domain/schemas/marketplace.ts (AuthSchema, SigningSchema)
function mapItemToVerifyResult(row: MarketplaceListing, inputCode: string): VerifyResult {
  return {
    productId: row.metadata?.product_id ?? row.sku,  // RLQ-* or fallback to sku
    itemName: row.listing.title,                      // e.g. "Michael Jordan Signed Basketball"
    signatures: row.signing.count,                    // signing.count integer
    status: mapAuthStatusToVerifyStatus(row.auth.status),
    date: row.state.updated_at,                       // last updated timestamp
    certificate: row.auth.coa_refs[0] ?? "",          // first COA ref
    authenticationResult: buildAuthText(row.auth),    // e.g. "Authenticated by PSA"
    dateOfAnalysis: row.state.created_at,             // original authentication date
  };
}

// VRFY-04: marketplace link condition
const showMarketplaceLink =
  row.state_lifecycle === "published" && row.state_visibility === "public";
const marketplaceUrl = showMarketplaceLink ? `/marketplace/${row.slug}` : null;
```

**Note:** `VerifyResultDisplay` hiện không có field `marketplaceUrl`. Cần mở rộng `VerifyResult` schema hoặc pass separately. **Recommendation:** Pass `marketplaceUrl` as separate optional prop to `VerifyResultDisplay`, không extend `VerifyResultSchema` (giữ schema stability).

---

## Architecture Patterns

### 1. Public API Route Pattern (no auth)

```typescript
// apps/web/src/app/api/public/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const BodySchema = z.object({ code: z.string().min(1) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();  // service role, no requireUser
  // ... query logic
}
```

**Pattern rules:**
- `createServiceRoleClient()` — server-side only, never exposed to browser
- Zod validation tất cả inputs trước khi query DB
- No `requireUser()` / `requireRole()` — these are anon-accessible endpoints
- Rate limiting: lightweight (check IP frequency in memory or via middleware header) — full hardening Phase 3

### 2. Multipart Photo Upload Pattern

```typescript
// apps/web/src/app/api/public/consign/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Extract text fields
  const contactName = formData.get("contact_name") as string;
  const photos = formData.getAll("photos") as File[];

  // Validate photo count and size
  if (photos.length === 0) {
    return NextResponse.json({ error: "At least 1 photo required" }, { status: 400 });
  }
  if (photos.length > 10) {
    return NextResponse.json({ error: "Maximum 10 photos" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // 1. Insert consigned_item → get ID
  const { data: consignedItem } = await supabase
    .from("consigned_items")
    .insert({ contact_name: contactName, /* ... */ status: "submitted" })
    .select("id")
    .single();

  // 2. Upload each photo to storage
  for (const photo of photos) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const ext = photo.name.split(".").pop();
    const path = `${consignedItem.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("consign-submissions")
      .upload(path, buffer, { contentType: photo.type });

    if (uploadError) continue; // log but don't fail submission

    // 3. Link via attachments table
    await supabase.from("attachments").insert({
      entity_type: "consigned_item",
      entity_id: consignedItem.id,
      file_path: path,
      file_name: photo.name,
      content_type: photo.type,
      size_bytes: photo.size,
    });
  }
}
```

**File naming convention (Claude's Discretion):**
`{consignedItemId}/{epoch}-{uuid}.{ext}` — ensures no collision, sortable by time, grouped by submission.

### 3. Auto-Lead Creation Pattern

```typescript
// Reuse pattern from existing CRM — insert into leads table
await supabase.from("leads").insert({
  full_name: contactName,
  email: contactEmail,
  phone: contactPhone ?? null,
  source: "consign",           // or "contact" for contact form
  status: "new",               // default per leads table check constraint
  score: 0,
});
```

**Note:** `leads.owner_id` references `profiles(id)` — leave NULL for auto-created leads (no admin assigned yet). This is fine since owner_id is nullable.

### 4. Public Email Helper Pattern

The existing `/api/email/send` requires `requireUser` — cannot be reused for public routes. Need new helper:

```typescript
// apps/web/src/lib/email/sendPublicEmail.ts
async function sendPublicEmail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "Missing RESEND_API_KEY" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "support@relique.co",
      to: params.to,
      subject: params.subject,
      text: params.text,
    }),
  });

  // Log to email_logs (user_id nullable after migration)
  // ...
  return { success: res.ok };
}
```

### 5. Verify Supabase Adapter Pattern

```typescript
// apps/web/src/lib/services/impl/verify.supabase.ts
export const verifyServiceSupabase: IVerifyService = {
  async verifyByCode(input: VerifyRunInput): Promise<Result<VerifyResult>> {
    const parsed = VerifyRunInputSchema.safeParse(input);
    if (!parsed.success) return err(validationError("Invalid input"));

    // HTTP call to /api/public/verify — keeps browser client thin
    // OR: direct service function (for server-side usage)
    const response = await fetch("/api/public/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: input.code }),
    });

    if (response.status === 404) return err(notFoundError("Item not found", "marketplace_item"));
    if (!response.ok) return err(unknownError("Verify failed"));

    const data = await response.json();
    const validated = VerifyResultSchema.safeParse(data);
    if (!validated.success) return err(validationError("Invalid server response"));
    return ok(validated.data);
  },

  // History methods — no-ops after D-07 (delete localStorage history)
  async getVerifyHistory() { return ok([]); },
  async saveVerifyHistory() { return ok(undefined); },
  async clearVerifyHistory() { return ok(undefined); },
};
```

**Note:** `verifyByCode` calls `/api/public/verify` via fetch (browser) — this works because the verify page is a client component. The adapter DOES NOT import from supabase directly (that would pull server-only code into browser bundle).

---

## Standard Stack

### Core (all verified in existing codebase)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@supabase/supabase-js` | ^2.90.1 | DB queries, Storage upload | Already installed [VERIFIED] |
| `@supabase/ssr` | ^0.8.0 | Cookie session client for server | Already installed [VERIFIED] |
| `zod` | ^4.3.2 | Input validation in API routes | Already installed [VERIFIED] |
| Resend (fetch) | n/a | Transactional email via REST API | Already used in `/api/email/send` [VERIFIED] |
| `next/navigation` `useRouter` | Next.js 16 | Redirect to /consign/success | Already used in ConsignForm [VERIFIED] |

### Supporting

| Library | Purpose | Notes |
|---------|---------|-------|
| `react-hook-form` | Photo upload + form field management | Already in deps; ConsignForm currently uses bare state |
| `sonner` | Toast for errors | Already in ConsignForm |

**No new dependencies required.** All stack is already installed.

---

## DB Constraint Blockers

### Blocker 1: `email_logs.user_id NOT NULL`

**Problem:** `email_logs` table has `user_id uuid references public.profiles(id) on delete cascade NOT NULL`. Public API routes have no authenticated user. Cannot log emails from consign/contact without a user.

**Migration required:**
```sql
-- Migration: 032_email_logs_nullable_user.sql
ALTER TABLE public.email_logs ALTER COLUMN user_id DROP NOT NULL;
-- Update RLS policy to allow system inserts (service role bypasses RLS anyway)
```

**Impact:** Without this migration, `sendPublicEmail` cannot log to `email_logs`. Could skip logging for v1, but better to fix properly.

### Blocker 2: No product_id index on `marketplace_items`

**Problem:** Verify lookup by `metadata->>'product_id'` and `auth->'coa_refs'` will be seq scans without indexes. At low data volume this is fine, but add indexes now for correctness.

**Migration required:**
```sql
-- Migration: 033_verify_lookup_indexes.sql
CREATE INDEX IF NOT EXISTS marketplace_items_product_id_idx
  ON marketplace_items((metadata->>'product_id'));

CREATE INDEX IF NOT EXISTS marketplace_items_auth_gin
  ON marketplace_items USING GIN(auth);
```

### Blocker 3: `consign-submissions` bucket missing

**Problem:** New private storage bucket needed (D-14). Current buckets: `crm-attachments`, `marketplace` (from migration 008). `consign-submissions` not yet created.

**Migration required:**
```sql
-- Migration: 034_storage_consign_submissions.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consign-submissions',
  'consign-submissions',
  false,
  10485760,  -- 10MB per file (D-17)
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- D-17
);

-- Service role bypasses RLS; anon users never upload directly
-- Admin read access:
CREATE POLICY "Authenticated read consign submissions"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'consign-submissions');
```

---

## Recommended Project Structure (new files)

```
apps/web/src/
├── app/api/public/
│   ├── verify/route.ts          # POST — lookup by product_id or COA ref (new)
│   ├── consign/route.ts         # POST multipart — submit + upload photos (new)
│   └── contact/route.ts         # POST — create message + lead (new)
├── lib/
│   ├── email/
│   │   └── sendPublicEmail.ts   # Resend helper without requireUser (new)
│   └── services/impl/
│       ├── verify.supabase.ts   # IVerifyService → /api/public/verify (new)
│       └── index.ts             # Updated: swap verify/consign adapters
apps/web/supabase/migrations/
├── 032_email_logs_nullable_user.sql    # make user_id nullable
├── 033_verify_lookup_indexes.sql       # product_id expr idx + auth GIN idx
└── 034_storage_consign_submissions.sql # new private bucket
```

**Delete after Phase 2:**
- `apps/web/src/lib/services/impl/verify.local.ts`
- `apps/web/src/lib/services/impl/consign.local.ts`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Multipart form parsing | Custom body parser | `request.formData()` — native Next.js App Router [VERIFIED: Next.js docs] |
| File upload to storage | Presigned URL flow (anon users) | Service role `supabase.storage.upload()` — per D-15 |
| Email sending | Custom SMTP client | Resend REST API via fetch — already in codebase |
| Input validation | Manual type checks | Zod `safeParse()` — project standard |
| Rate limiting (v1) | IP tracking middleware | Simple: trust `x-forwarded-for` header, log abuse — full hardening Phase 3 |

---

## Common Pitfalls

### Pitfall 1: `email_logs.user_id NOT NULL` Causes Silent Failure
**What goes wrong:** Route inserts to `email_logs` with `user_id: null` → Postgres constraint violation → 500 error → email "sent" but transaction rolls back or partial insert.
**Prevention:** Migration 032 (make nullable) MUST run before any public email routes go live.
**Warning signs:** `{error: "null value in column user_id violates not-null constraint"}` in API logs.

### Pitfall 2: Service Role Client in Browser Bundle
**What goes wrong:** Importing `createServiceRoleClient` in a `"use client"` component leaks `SUPABASE_SERVICE_ROLE_KEY` to browser.
**Prevention:** `verify.supabase.ts` adapter calls `/api/public/verify` via fetch — NEVER imports `server.ts` directly. Server-side code stays in `route.ts` files only.
**Warning signs:** Next.js build warning "Module not found in browser context."

### Pitfall 3: `request.formData()` with Large Files Exceeds Next.js Body Limit
**What goes wrong:** Default Next.js body size limit is 1MB. 10 photos × 10MB = 100MB theoretical max.
**Prevention:** Add `export const config = { api: { bodyParser: false } }` — but in App Router, this is handled differently. For App Router, set `nextConfig.experimental.serverBodySizeLimit` or use streaming. [ASSUMED — verify against Next.js 16 docs]
**Alternative:** Process photos one at a time with multiple requests from client (progress UX).
**Warning signs:** `PayloadTooLargeError` 413 on consign submit.

**Recommendation (Claude's Discretion):** For v1 simplicity, limit to single multipart request but document that large uploads may need chunking. Next.js App Router defaults to 4MB. Config: add `export const maxDuration = 60` to route.

### Pitfall 4: COA Ref Lookup is Case-Sensitive in Postgres `?` Operator
**What goes wrong:** User enters `rel-2024-001` (lowercase), DB stores `REL-2024-001`. `auth->'coa_refs' ? 'rel-2024-001'` returns false.
**Prevention:** Normalize input to uppercase before DB query. Already done in verify page: `id.trim().toUpperCase()`.
**Warning signs:** Verify returns "not found" for valid COA refs with mixed case.

### Pitfall 5: ConsignForm Still Using `consignService.drafts.save()` After Cleanup
**What goes wrong:** After deleting `consign.local.ts`, `ConsignForm.tsx` still calls `consignService.drafts.save()` → runtime error.
**Prevention:** Rewrite `ConsignForm.tsx` to call `/api/public/consign` directly via fetch (single-shot, no draft) — this is part of Plan 3 scope.
**Warning signs:** TypeScript errors at build time after deleting the local adapter.

### Pitfall 6: `attachments.entity_id` is `text`, Not `uuid`
**What goes wrong:** The `attachments` table has `entity_id text not null` (not UUID type). This is intentional (generic FK). Pass `consignedItem.id` as string — but ensure it's the actual DB-generated UUID.
**Prevention:** Always use the `id` returned from the `consigned_items` insert, not a client-generated ID.

---

## Code Examples (from codebase)

### Existing: Service Role Client (verified pattern)
```typescript
// Source: apps/web/src/lib/supabase/server.ts:44-62
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

### Existing: Admin Consign Insert + Audit Log Pattern
```typescript
// Source: apps/web/src/app/api/consigned/route.ts:82-106
const { data, error } = await supabase
  .from("consigned_items")
  .insert(validated)
  .select()
  .single();

await supabase.from("audit_logs").insert({
  action: "CREATE",
  entity_type: "consigned_item",
  entity_id: data.id,
  metadata: { item: data },
});
```

### Existing: Resend Call Pattern
```typescript
// Source: apps/web/src/app/api/email/send/route.ts:35-47
const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: process.env.RESEND_FROM_EMAIL ?? "support@relique.co",
    to: validated.to,
    subject: validated.subject,
    text: validated.body,
  }),
});
```

### Existing: CRM Storage Bucket Pattern (to replicate for consign-submissions)
```sql
-- Source: apps/web/supabase/migrations/011_storage_crm.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('crm-attachments', 'crm-attachments', false, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
```

---

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All public API routes | ✓ (assumed from Phase 1) | Set in `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | All public API routes | ✓ (assumed from Phase 1) | Set in `.env.local` |
| `RESEND_API_KEY` | Email triggers | ✓ (existing `/api/email/send` uses it) | Set in `.env.local` |
| `RESEND_FROM_EMAIL` | Email sender | ✓ (defaults to `support@relique.co`) | Optional |
| `OPERATOR_EMAIL` | Contact/consign notifications | ❓ New env var required | Must be added to `.env.local` |

**Action required:** Add `OPERATOR_EMAIL` to `.env.local` before testing contact/consign email flows. Document in `apps/web/README.md`.

---

## Validation Architecture

> `workflow.nyquist_validation` not explicitly `false` in config — include this section.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (v1 scope: lint + typecheck + build only per REQUIREMENTS.md) |
| Config file | n/a |
| Quick run command | `pnpm typecheck` |
| Full suite command | `pnpm build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| DATA-01 | verify.local.ts deleted | TypeScript | `pnpm typecheck` | Compiler error if old imports remain |
| DATA-02 | consign_items insert works | Manual | Call `/api/public/consign` with Postman/curl | No Vitest v1 |
| DATA-03 | messages + leads created on contact submit | Manual | Submit contact form, check Supabase dashboard | No Vitest v1 |
| DATA-04 | No localStorage imports remain | TypeScript + grep | `rg "localStorage" apps/web/src/lib/services/impl/` | Should return 0 matches |
| VRFY-01 | Verify returns result from DB | Manual + build | Submit RLQ-* code; check response shape | |
| VRFY-03 | All VerifyResult fields populated | TypeScript | `pnpm typecheck` — VerifyResultSchema validates | |
| CNSG-01 | Photos uploaded to consign-submissions | Manual | Check Supabase Storage dashboard after submit | |
| CNSG-03 | Email received after consign | Manual | Submit form; check inbox | |
| ADM-04 | Emails fire from unified app | Manual + env check | Verify `RESEND_API_KEY` in unified app env | |

### Build Gate
- `pnpm typecheck` — zero TypeScript errors (existing ~50 `@ts-expect-error` are pre-existing, do not regress)
- `pnpm lint` — zero ESLint errors with `--max-warnings 0`
- `pnpm build` — successful Next.js production build

---

## Security Domain

> `security_enforcement` not explicitly disabled — include this section. Note: SEC-01 through SEC-04 are Phase 3 scope. Phase 2 must not introduce NEW vulnerabilities but full hardening deferred.

### Applicable ASVS Categories

| ASVS Category | Applies | Phase 2 Control |
|---------------|---------|-----------------|
| V2 Authentication | Partial | Public routes intentionally unauthenticated; admin routes retain `requireUser` |
| V4 Access Control | Yes | New public routes must NOT expose service-role to browser; see Pitfall 2 |
| V5 Input Validation | Yes | Zod `safeParse()` on all request bodies |
| V12 File Upload | Yes | Validate MIME type + size (10MB/file, jpeg/png/webp only) via bucket config |

### Phase 2 Threat Patterns

| Pattern | Risk | Phase 2 Mitigation |
|---------|------|-------------------|
| Spam form submissions | Leads/messages table flooded | Accept for v1; full rate limiting in Phase 3 (SEC-02) |
| Oversized file upload | 413 / server OOM | Bucket `file_size_limit = 10485760` (10MB); Next.js body limit config |
| SQL injection via code param | DB corruption | Parameterized Supabase queries (never string concat) |
| Service role key exposure | Full DB access | Key only in server-side `route.ts`; never in `"use client"` files |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Next.js App Router default body limit applies to `formData()`; may need config for large uploads | Common Pitfalls #3 | Consign route fails with 413 for any upload |
| A2 | Phase 1 completed: unified app, migrations applied, env vars set | All sections | Public API routes won't work without Supabase credentials |
| A3 | Admin MarketplaceForm will be updated to set `metadata.product_id` for new items | RLQ Product ID Resolution | Verify lookup always returns "not found" for new items until admin populates product_id |

---

## Open Questions

1. **`metadata.product_id` retroactive population**
   - Existing DB items (if any) have no `metadata.product_id` yet
   - Recommendation: Document that admin must set product_id on each item via MarketplaceForm; or add one-time migration script if items exist
   - Not a Phase 2 blocker — lookup gracefully returns "not_found" for items without product_id

2. **Next.js body size limit for multipart**
   - App Router may need `export const config` or `runtime = 'edge'` adjustment
   - Recommendation: test with large uploads early; add `maxDuration = 60` export to consign route

3. **`VerifyResult` schema extension for marketplace link**
   - Current schema has no `marketplaceUrl` field
   - Recommendation: DO NOT extend schema; pass as separate prop to `VerifyResultDisplay`

---

## Plan Wave Breakdown (Primary Recommendation)

**4 plans — sequential dependencies, Wave 2+3 partially parallelizable after Wave 1:**

### Plan 1: DB Migrations (Wave 1) — MUST run first
**Goal:** Unblock all subsequent plans with correct schema + indexes + bucket.
- Migration 032: `email_logs.user_id` nullable
- Migration 033: `marketplace_items` verify lookup indexes (expression + GIN)
- Migration 034: `consign-submissions` private storage bucket
- Apply migrations: `supabase db push` or Supabase dashboard SQL editor
- Add `OPERATOR_EMAIL` to `.env.local` and `apps/web/README.md`

### Plan 2: Verify Supabase Backend (Wave 1)
**Goal:** Replace `verify.local.ts` random mock with real DB lookup. Covers DATA-01, VRFY-01, VRFY-02, VRFY-03, VRFY-04, DATA-04 (partial).
- New `apps/web/src/app/api/public/verify/route.ts`
- New `apps/web/src/lib/services/impl/verify.supabase.ts`
- Update `apps/web/src/lib/services/impl/index.ts` → swap adapter
- Add `marketplaceUrl` prop to `VerifyResultDisplay` (VRFY-04)
- Delete `verify.local.ts`

### Plan 3: Consign Public Submit + Photo Upload (Wave 2)
**Goal:** Real consign persistence + photos. Covers DATA-02, CNSG-01, CNSG-02, CNSG-03, CNSG-05, ADM-04 (consign email).
**Depends on:** Plan 1 (bucket + email_logs fix)
- New `apps/web/src/app/api/public/consign/route.ts` (multipart)
- New `apps/web/src/lib/email/sendPublicEmail.ts`
- Update `apps/web/src/app/(site)/consign/components/ConsignForm.tsx`:
  - Replace `consignService.drafts.save()` with direct `fetch('/api/public/consign', formData)`
  - Add photo upload field (min 1 required)
- Delete `consign.local.ts`, update `impl/index.ts`

### Plan 4: Contact Form + Email Triggers + Final Cleanup (Wave 3)
**Goal:** Real contact persistence + transactional email. Covers DATA-03, CNTC-01, CNTC-02, CNTC-03, ADM-04 (contact email), DATA-04 (final localStorage cleanup).
**Depends on:** Plan 1 (email_logs fix), Plan 2+3 complete (ensures localStorage fully removed)
- New `apps/web/src/app/api/public/contact/route.ts`
- Update `apps/web/src/app/(site)/contact/components/ContactForm.tsx`:
  - Add state management (name, email, message fields with `useState`)
  - Replace `alert()` with inline success state (D-22)
  - Call `/api/public/contact` on submit
- Verify `impl/index.ts` has no remaining localStorage references
- Final pass: confirm `rg localStorage apps/web/src/lib/services/impl/` = 0 matches

---

## Sources

### Primary (HIGH confidence — verified against live codebase)
- `apps/web/supabase/migrations/002_create_marketplace_items.sql` — marketplace_items schema, JSONB columns
- `apps/web/supabase/migrations/003_create_consigned_items.sql` — consigned_items schema + status constraint
- `apps/web/supabase/migrations/010_create_crm_core.sql` — leads, messages, attachments schemas
- `apps/web/supabase/migrations/011_storage_crm.sql` — storage bucket pattern
- `apps/web/supabase/migrations/017_create_email_logs.sql` — email_logs `user_id NOT NULL` constraint (blocker)
- `apps/web/supabase/migrations/031_add_marketplace_metadata.sql` — metadata column on marketplace_items
- `packages/shared/src/domain/schemas/marketplace.ts` — AuthSchema enum: `"none" | "pending" | "verified" | "rejected"`
- `packages/shared/src/domain/schemas/verify.ts` — VerifyResult, VerifyRunInput, ProductIdSchema
- `apps/web/src/lib/services/impl/verify.local.ts` — mock to replace
- `apps/web/src/lib/services/impl/consign.local.ts` — mock to replace
- `apps/web/src/app/api/consigned/route.ts` — admin consign insert + audit log pattern
- `apps/web/src/app/api/email/send/route.ts` — Resend integration pattern
- `apps/web/src/components/app/VerificationStatusBadge.tsx` — auth.status display values
- `apps/web/src/lib/supabase/server.ts` — createServiceRoleClient pattern

### Secondary (MEDIUM confidence)
- Next.js App Router `request.formData()` — [ASSUMED standard; verify against Next.js 16 release notes for body size limits]

---

**Research date:** 2026-06-14  
**Valid until:** 2026-07-14 (stable stack)
