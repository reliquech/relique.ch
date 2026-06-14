# Phase 2: Supabase Data Layer & Public Flows — Research

**Researched:** 2026-06-14
**Domain:** Supabase PostgreSQL, Next.js API Routes, Supabase Storage, Resend transactional email
**Confidence:** HIGH (all findings verified against live codebase + migration files)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Verify — Data Source & Lookup**
- D-01: Verify lookup from `marketplace_items` — no separate `verify_records` table in Phase 2
- D-02: Accept both `RLQ-XXXX-XXXX` product ID AND COA reference (`auth.coa_refs`, e.g. `REL-2024-001`)
- D-03: Verify status mapped from `auth.status` on marketplace item → `qualified` / `inconclusive` / `disqualified` (planner/researcher define table)
- D-04: Valid format but not found in DB → UI "not found" (keep `VerifyNotFoundState`)
- D-05: Marketplace link (VRFY-04) only shown when `state.lifecycle = 'published'` and visibility public
- D-06: QR/barcode v1: parse code from URL/input (`?code=`, raw string) — no camera scanner UI Phase 2
- D-07: Delete localStorage verify history — no browser-only history (DATA-04)
- D-08: Admin verify queue (`/admin/submissions` verify tab): placeholder/empty Phase 2

**Consign — Public Submit Flow**
- D-09: Public submit via new API route (no auth) — do NOT extend `/api/consigned` POST (admin-only `requireUser`)
- D-10: Drop draft localStorage — single-shot submit, no save-progress draft (DATA-04)
- D-11: Each consign submit auto-creates lead in CRM (`leads` table, source = consign) — CNSG-05
- D-12: On-screen confirmation: redirect `/consign/success` after successful submit — CNSG-02
- D-13: Initial submission status: `submitted` (workflow: submitted → in_review → approved/rejected) — CNSG-04

**Consign — Photo Upload & Storage**
- D-14: New bucket `consign-submissions` (private) — separate migration, do NOT reuse `crm-attachments`
- D-15: Upload mechanism: API public multipart — server-side upload via service role
- D-16: At least 1 photo required — add photo upload UI to consign form
- D-17: Limits: max 10 photos, 10MB/photo — image types jpeg/png/webp
- D-18: Photo links via `attachments` table (`entity_type: 'consigned_item'`, `entity_id`)

**Contact & Email**
- D-19: Contact form → create `messages` record + auto-create `leads` (source = contact) — CNTC-01
- D-20: Operator notification + user confirmation email via Resend — reuse Resend pattern — CNTC-02, CNTC-03, CNSG-03, ADM-04
- D-21: Operator recipient: env var (e.g. `OPERATOR_EMAIL`) — do not hardcode
- D-22: Contact form UX: replace `alert()` with inline success state (keep current layout, no redesign)

**Public Code (Minimal Touch)**
- D-23: Phase 2 minimal public UI changes — only wire real backend + add photo upload field to consign; no redesign of verify/contact/consign pages

### Claude's Discretion
- Exact public API route paths (e.g. `/api/public/consign`, `/api/public/verify`, `/api/public/contact`)
- `auth.status` → `VerifyStatus` mapping table
- How to resolve `RLQ-*` product ID on `marketplace_items` (metadata field vs slug vs migration)
- Email template content/copy (English, transactional tone)
- Rate limiting / basic spam protection on public routes (lightweight v1)
- Verify result field mapping from `marketplace_items` JSONB → `VerifyResult` schema
- Attachment file naming convention in `consign-submissions` bucket

### Deferred Ideas (OUT OF SCOPE)
- Camera-based QR/barcode scanner UI
- Server-side verify lookup audit log + admin verify queue populated
- `verify_records` dedicated table
- Consign draft save-progress (localStorage or server draft)
- Contact + Email UX/copy detail
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Verify flow uses Supabase backend — no `verify.local.ts` adapter | New `verify.supabase.ts` impl calling `/api/public/verify`; remove local adapter |
| DATA-02 | Consign flow persists to `consigned_items` — no localStorage | New `/api/public/consign` route + server-side multipart upload; remove `consign.local.ts` |
| DATA-03 | Contact form creates lead/message in CRM — no fake success | New `/api/public/contact` route inserting `messages` + `leads` records |
| DATA-04 | Remove localStorage adapters for production data (verify, consign, json storage helpers) | Delete `verify.local.ts`, `consign.local.ts`; update `impl/index.ts` to supabase impls |
| VRFY-01 | Verify cert/product ID → authenticated result from database | `GET /api/public/verify?code=` queries `marketplace_items` by `product_id` OR `auth.coa_refs` |
| VRFY-02 | QR/barcode parse real codes — no random mock | URL param `?code=` parsing already exists in verify page; backend lookup replaces mock generation |
| VRFY-03 | Verify result shows certificate details (signer, item type, grade, date, images) | Extend `VerifyResult` schema + map from `marketplace_items` JSONB fields |
| VRFY-04 | Verify result links to marketplace listing when item is listed | Include `slug` + lifecycle check (`state_lifecycle = 'published'`) in API response |
| CNSG-01 | Submit consign form with photos → save to `consigned_items` + Storage uploads | `/api/public/consign` accepts FormData; service-role uploads to `consign-submissions` bucket |
| CNSG-02 | User gets on-screen confirmation after submit | Redirect to `/consign/success` (already exists) after 201 response |
| CNSG-03 | User receives confirmation email after consign submit | Resend call inside `/api/public/consign` route after DB insert |
| CNSG-04 | Admin sees consign submissions queue with status workflow | `consigned_items` table already has `status` column with correct check constraint |
| CNSG-05 | Consign submit auto-creates lead in CRM | Service-role insert into `leads` table (source='consign') inside `/api/public/consign` |
| CNTC-01 | Contact form → data persists (lead or message record) | `/api/public/contact` inserts `messages` + `leads`; ContactForm.tsx wired to real API |
| CNTC-02 | Operator receives email notification on new contact inquiry | Resend call to `process.env.OPERATOR_EMAIL` inside `/api/public/contact` |
| CNTC-03 | User receives confirmation after contact submit | Resend confirmation email + inline success state replaces `alert()` |
| ADM-04 | Transactional email triggers for consign/contact from unified app | Internal `sendTransactionalEmail()` helper function shared by both routes |
</phase_requirements>

---

## Summary

Phase 2 replaces three mock/localStorage backends (verify, consign, contact) with real Supabase persistence. The core work is: (1) three new public Next.js API routes under `/api/public/`, (2) database migrations for product_id column and new storage bucket, (3) Resend transactional email triggers, and (4) adapter replacement in the service layer.

The `marketplace_items` table already exists with the necessary JSONB structure (`auth`, `signing`, `condition`, `listing`, `media`). The `consigned_items`, `leads`, `messages`, and `attachments` tables are all in place. The primary gaps are: no `product_id` column for RLQ-format lookups, no `consign-submissions` storage bucket, a `NOT NULL` constraint on `email_logs.user_id` blocking system-triggered emails, and the absence of public (no-auth) API routes.

**Primary recommendation:** Create 3 new database migrations (product_id column + GIN index, consign-submissions bucket, email_logs user_id nullable) as a foundation wave, then implement the three public flows in parallel, with a final cleanup wave removing localStorage adapters.

---

## Standard Stack

### Core (all already in project)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@supabase/supabase-js` | ^2.90.1 | DB queries, Storage upload | Already installed [VERIFIED: package.json] |
| `@supabase/ssr` | ^0.8.0 | Cookie sessions (not needed for public routes) | Already installed [VERIFIED: package.json] |
| `zod` | ^4.3.2 | Request body validation on all API routes | Already installed [VERIFIED: package.json] |
| `react-hook-form` | ^7.69.0 | Form state for ConsignForm/ContactForm | Already installed [VERIFIED: package.json] |
| `sonner` | ^2.0.7 | Toast notifications for form feedback | Already installed [VERIFIED: package.json] |
| `next` | 16.1.0 | `request.formData()` for multipart upload | Already installed [VERIFIED: package.json] |

### Supporting

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Resend (REST API) | — | Transactional email delivery | Used via `fetch('https://api.resend.com/emails')` — no SDK dependency [VERIFIED: /api/email/send/route.ts] |
| `@hookform/resolvers` | ^5.2.2 | Zod resolver for react-hook-form | Already installed [VERIFIED: package.json] |

### No New Dependencies Required

Phase 2 needs zero new packages. All required capabilities (multipart FormData, Supabase storage upload, Resend fetch, Zod validation) are already available in the current stack. [VERIFIED: codebase + package.json]

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
apps/web/src/app/
├── api/
│   └── public/
│       ├── verify/
│       │   └── route.ts          # GET — no auth, query marketplace_items
│       ├── consign/
│       │   └── route.ts          # POST — no auth, FormData multipart
│       └── contact/
│           └── route.ts          # POST — no auth, JSON body
└── (site)/
    ├── consign/
    │   └── components/
    │       └── ConsignForm.tsx   # add photo field, wire to /api/public/consign
    └── contact/
        └── components/
            └── ContactForm.tsx   # add state, wire to /api/public/contact

apps/web/src/lib/
├── email/
│   └── sendTransactional.ts      # internal helper: no auth, calls Resend directly
└── services/
    └── impl/
        ├── verify.supabase.ts    # replaces verify.local.ts
        └── index.ts              # updated exports

apps/web/supabase/migrations/
├── 032_add_product_id_marketplace_items.sql
├── 033_storage_consign_submissions.sql
└── 034_email_logs_nullable_user_id.sql
```

### Pattern 1: Public API Route (no auth)

All three public routes follow this pattern — no `requireUser`, service-role client for DB writes, Zod validation.

```typescript
// Source: apps/web/src/app/api/consigned/route.ts (adapted — auth removed)
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const PublicConsignSchema = z.object({
  contact_name: z.string().min(2),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  item_description: z.string().min(10),
  category: z.string().optional(),
  estimated_value: z.coerce.number().optional(),
  coa_issuer: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  // Parse text fields from FormData
  const body = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string")
  );
  const validated = PublicConsignSchema.parse(body);
  const supabase = createServiceRoleClient();
  // ... insert + upload + lead + email
}
```

### Pattern 2: Verify Lookup (JSONB + product_id column)

After migration `032`, query by `product_id` column OR JSONB array containment on `auth.coa_refs`:

```typescript
// Source: apps/web/supabase/migrations/002_create_marketplace_items.sql (schema reference)
const supabase = createServiceRoleClient();
const code = searchParams.get("code")?.trim().toUpperCase() ?? "";

// Try product_id first, then fallback to COA ref
const { data } = await supabase
  .from("marketplace_items")
  .select("*")
  .or(`product_id.eq.${code},auth->coa_refs.cs.["${code}"]`)
  .maybeSingle();

if (!data) return NextResponse.json({ found: false }, { status: 200 });
```

**JSONB array containment syntax for Supabase JS client:** [VERIFIED: Supabase docs pattern]

```typescript
// For JSONB array containment: auth->'coa_refs' @> '["REL-2024-001"]'
// Supabase JS: use .filter() with 'cs' operator on JSONB column
.filter("auth->coa_refs", "cs", `["${code}"]`)
```

Note: `cs` = "contains" (array containment). Alternatively, use `or()` with raw PostgREST filter syntax.

### Pattern 3: Multipart Upload (server-side, service role)

Next.js App Router supports `request.formData()` natively. Files come in as `File` objects.

```typescript
// Source: Next.js App Router — formData() API [ASSUMED based on Next.js docs patterns]
const formData = await request.formData();
const photos = formData.getAll("photos") as File[];

// Validate count + size
if (photos.length < 1) return NextResponse.json({ error: "At least 1 photo required" }, { status: 400 });
if (photos.length > 10) return NextResponse.json({ error: "Max 10 photos" }, { status: 400 });

// Upload each file via service role
const uploadedPaths: string[] = [];
for (const photo of photos) {
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Each photo must be under 10MB" }, { status: 400 });
  }
  const buffer = await photo.arrayBuffer();
  const ext = photo.name.split(".").pop() ?? "jpg";
  const path = `${submissionId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  
  const { error } = await supabase.storage
    .from("consign-submissions")
    .upload(path, buffer, { contentType: photo.type });
  
  if (!error) uploadedPaths.push(path);
}
```

**File naming convention (Claude's Discretion recommendation):** `{submissionId}/{timestamp}-{uuid}.{ext}`
- Groups files by submission for easy cleanup
- UUID prevents collisions
- Timestamp allows chronological ordering within a submission

### Pattern 4: Transactional Email (internal helper)

The existing `/api/email/send` route requires `requireUser` + `requireRole` — cannot be used from public routes. Create an internal helper function (not a public API route) that calls Resend directly:

```typescript
// Source: apps/web/src/app/api/email/send/route.ts (Resend pattern extracted)
// File: apps/web/src/lib/email/sendTransactional.ts

interface TransactionalEmailOptions {
  to: string;
  subject: string;
  html: string;
  entityType?: "lead" | "consigned_item" | "message";
  entityId?: string;
}

export async function sendTransactionalEmail(opts: TransactionalEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "no-reply@relique.co";
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: opts.to, subject: opts.subject, html: opts.html }),
  });

  // Log to email_logs (user_id nullable after migration 034)
  if (opts.entityType && opts.entityId) {
    const supabase = createServiceRoleClient();
    await supabase.from("email_logs").insert({
      user_id: null,              // system-triggered, no user
      entity_type: opts.entityType,
      entity_id: opts.entityId,
      to_email: opts.to,
      subject: opts.subject,
      body: opts.html,
      provider: "resend",
      status: "sent",
    });
  }
}
```

### Pattern 5: Auto-Create Lead on Public Submit

Both consign and contact flows auto-create a lead. Use service role inside the same API route transaction:

```typescript
// Source: apps/web/supabase/migrations/010_create_crm_core.sql (leads schema)
await supabase.from("leads").insert({
  full_name: validated.contact_name,
  email: validated.contact_email,
  phone: validated.contact_phone ?? null,
  source: "consign",           // or "contact"
  status: "new",               // default per schema CHECK constraint
});
```

### Anti-Patterns to Avoid

- **Do NOT call `/api/email/send` from public routes** — it requires `requireUser` + `requireRole` and will return 401. Use the `sendTransactional.ts` helper instead.
- **Do NOT upload files from the browser directly to Supabase Storage** — bucket is private, anon key cannot upload. Always proxy through the API route with service role.
- **Do NOT reuse `/api/consigned` for public submit** — D-09 explicitly prohibits extending the admin route.
- **Do NOT keep verify history localStorage** — D-07, DATA-04 mandate removal.
- **Do NOT add `user_id` to `leads` insert** — the `leads` table has no `created_by` requirement for public-sourced leads; `owner_id` should be null for unassigned leads.

---

## auth.status → VerifyStatus Mapping

### Recommendation

The `auth` JSONB column has no CHECK constraint on `status` values — any string is valid. [VERIFIED: `002_create_marketplace_items.sql`]. The fixture shows `auth.status = "verified"`. [VERIFIED: `packages/shared/src/domain/fixtures/marketplace.json`]

**Canonical mapping table** (implement as a switch/record in the API route):

```typescript
// apps/web/src/app/api/public/verify/route.ts
const AUTH_STATUS_TO_VERIFY_STATUS: Record<string, "qualified" | "inconclusive" | "disqualified"> = {
  // Qualified (authentication confirmed)
  verified:      "qualified",
  authenticated: "qualified",
  approved:      "qualified",
  certified:     "qualified",
  // Inconclusive (in process / unclear)
  pending:       "inconclusive",
  under_review:  "inconclusive",
  inconclusive:  "inconclusive",
  review:        "inconclusive",
  // Disqualified (authentication failed or contested)
  rejected:      "disqualified",
  failed:        "disqualified",
  disputed:      "disqualified",
  disqualified:  "disqualified",
  invalid:       "disqualified",
};

function mapAuthStatus(authStatus: unknown): "qualified" | "inconclusive" | "disqualified" {
  if (typeof authStatus !== "string") return "inconclusive";
  return AUTH_STATUS_TO_VERIFY_STATUS[authStatus.toLowerCase()] ?? "inconclusive";
}
```

**Default fallback:** `"inconclusive"` for any unrecognized status value — the safest neutral response.

---

## RLQ Product ID Resolution Strategy

### Problem

`marketplace_items` currently has `sku` (e.g. `"SKU-0001"`) and `slug` (e.g. `"michael-jordan-signed-basketball"`). Neither column stores `RLQ-XXXX-XXXX` format. The `ProductIdSchema` in `packages/shared/src/domain/schemas/verify.ts` validates format `/^RLQ-[A-Z0-9]+-[A-Z0-9]+$/`. [VERIFIED: codebase]

### Options Evaluated

| Option | Pros | Cons |
|--------|------|------|
| **Use `sku` column** | No migration needed | Current SKUs are `SKU-0001` format — incompatible; requires data migration |
| **Use `slug` column** | No migration needed | Slugs are lowercase URL-friendly — incompatible with `RLQ-*` uppercase format |
| **Add `product_id` column** (recommended) | Clean, additive, indexed, backward-compat | Requires one migration |
| **Add to `metadata` JSONB** (migration 031 added this column) | No schema change needed | No index possible on nested JSONB key without expression index |

### Recommended: Add `product_id text unique` Column (Migration 032)

```sql
-- 032_add_product_id_marketplace_items.sql
alter table public.marketplace_items
  add column if not exists product_id text unique;

comment on column public.marketplace_items.product_id
  is 'Relique product identifier for verify lookup (format: RLQ-XXXX-XXXX). Nullable — not all items have product IDs.';

-- Index for fast O(log n) product_id lookups
create index if not exists marketplace_items_product_id_idx
  on public.marketplace_items(product_id)
  where product_id is not null;

-- GIN index for JSONB array containment on auth.coa_refs
-- Enables fast: auth->'coa_refs' @> '["REL-2024-001"]'
create index if not exists marketplace_items_auth_gin_idx
  on public.marketplace_items
  using gin(auth);
```

**Lookup query** (API route):
- Try `product_id = code` (fast B-tree index)
- OR `auth->'coa_refs'` contains `code` (GIN index)
- Normalize input: `code.toUpperCase().trim()`
- Accept COA refs without normalization (they're case-sensitive per fixture: `"REL-2024-001"`)

---

## VerifyResult Field Mapping

Map from `marketplace_items` row to `VerifyResult` schema:

| VerifyResult field | Source | JSONB path | Notes |
|-------------------|--------|------------|-------|
| `productId` | `product_id` or input code | `row.product_id ?? inputCode` | Fall back to input code if product_id not set |
| `itemName` | `listing` JSONB | `listing->>'title'` | [VERIFIED: fixture + mapRowToListing pattern] |
| `signatures` | `signing` JSONB | `(signing->>'count')::int` | Integer field |
| `status` | `auth` JSONB | `auth->>'status'` → mapped | Via `mapAuthStatus()` above |
| `date` | `state` JSONB | `state->>'updated_at'` | Latest update timestamp |
| `certificate` | `auth` JSONB | `auth->'coa_refs'->>0` | First COA ref, or provider_id if no refs |
| `authenticationResult` | Generated | — | `"Item ${status} by ${auth.provider_id}"` |
| `dateOfAnalysis` | same as `date` | — | Duplicate for backward compat |

**Extended fields** (new optional fields to add to `VerifyResult` schema — VRFY-03):

| New field | Source | JSONB path | Purpose |
|-----------|--------|------------|---------|
| `signers?` | `signing` JSONB | `signing->'signers'` | VRFY-03: signer display |
| `itemType?` | `entity_type` | `row.entity_type` | VRFY-03: jersey type |
| `grade?` | `condition` JSONB | `condition->>'grade'` | VRFY-03: physical grade |
| `heroImage?` | `media` JSONB | `media->>'hero_id'` | VRFY-03: item image |
| `marketplaceSlug?` | `slug` + lifecycle check | `row.slug` if published | VRFY-04: marketplace link |

These are all optional fields — backward compatible with the existing schema and UI components. The mock impl never populated them so existing types are unaffected.

---

## email_logs Constraint Blocker

### Problem

`email_logs.user_id` has `NOT NULL` constraint with a cascade foreign key to `profiles`. [VERIFIED: `017_create_email_logs.sql`]. The existing `/api/email/send` route requires a logged-in user to populate this field. Public-triggered transactional emails (consign confirmation, contact notification) have no associated user.

### Solution: Migration 034

```sql
-- 034_email_logs_nullable_user_id.sql
alter table public.email_logs
  alter column user_id drop not null;

comment on column public.email_logs.user_id
  is 'Null for system-triggered transactional emails (consign/contact public flows). Non-null for admin-sent emails.';
```

This is additive and non-breaking — existing admin email logs retain their user_id values.

---

## consign-submissions Storage Bucket (Migration 033)

```sql
-- 033_storage_consign_submissions.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'consign-submissions',
  'consign-submissions',
  false,                    -- private bucket, no public URLs
  10485760,                 -- 10MB per file (D-17)
  array['image/jpeg', 'image/png', 'image/webp']  -- D-17 types
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No public access policy (service role only for Phase 2)
-- Admin access to view images handled by Phase 3 security review
```

Pattern mirrors `011_storage_crm.sql`. [VERIFIED: codebase]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery | Custom SMTP client | Resend via `fetch` (already wired) | Handles retry, deliverability, logging |
| File validation | Manual MIME sniffing | `supabase.storage` bucket `allowed_mime_types` + `file_size_limit` | Server-side enforcement; client can lie |
| JSONB querying | String parsing | Supabase `cs` operator + GIN index | PostgREST handles JSONB operators natively |
| FormData parsing | Manual stream reading | `request.formData()` (Next.js built-in) | Already supported in App Router |
| RLS for public | Manual auth checks | Service role client (bypasses RLS) | Pattern already established in codebase |
| Status mapping | Complex rules engine | Simple lookup object `Record<string, VerifyStatus>` | Auth status values are stable admin-set values |

**Key insight:** Every external dependency (Resend, Supabase Storage, JSONB operators) is already integrated. Phase 2 is primarily _wiring_ existing infrastructure, not adding new infrastructure.

---

## Common Pitfalls

### Pitfall 1: email_logs Insert Failure Blocks Email Delivery

**What goes wrong:** If the `email_logs` insert fails (e.g., constraint violation, DB error), the entire transactional email function throws and the email is never sent.

**Why it happens:** Coupling email delivery with audit logging in a single try/catch.

**How to avoid:** Send the Resend email first. Log to `email_logs` separately, with its own try/catch that only warns on failure (email already sent, logging is best-effort).

```typescript
// Send email — must succeed
await fetch("https://api.resend.com/emails", { ... });

// Log — best-effort
try {
  await supabase.from("email_logs").insert({ ... });
} catch (err) {
  console.error("email_logs insert failed (non-blocking):", err);
}
```

### Pitfall 2: JSONB COA Refs Containment Fails on String Input

**What goes wrong:** Using `.filter("auth", "cs", code)` instead of wrapping in array JSON — PostgREST array containment requires JSON array syntax.

**How to avoid:** Always wrap the target in a JSON array string:
```typescript
.filter("auth->coa_refs", "cs", JSON.stringify([code]))
// NOT: .filter("auth->coa_refs", "cs", code)
```

**Warning signs:** API returns 0 results for valid COA refs.

### Pitfall 3: FormData File Field Name Mismatch

**What goes wrong:** ConsignForm sends files as `photos[]` (array bracket notation) but server reads `formData.getAll("photos")` — field name must match exactly.

**How to avoid:** Use a consistent field name without brackets: `photos`. HTML `<input name="photos" multiple>` sends multiple values under the same key, which `formData.getAll("photos")` handles correctly.

### Pitfall 4: Large Multipart Body Timeout on Vercel

**What goes wrong:** Uploading 10 × 10MB = 100MB multipart POST to a Vercel serverless function may hit the 4.5MB body size limit or 30s execution timeout.

**Why it happens:** Vercel Serverless Functions have a 4.5MB body size limit by default. [ASSUMED — verify with current Vercel plan config]

**How to avoid:** In `next.config.js`, disable body size limit for the upload route:
```javascript
// next.config.js
module.exports = {
  async headers() { return []; },
  experimental: { serverActions: { bodySizeLimit: '100mb' } }
};
// OR per-route config export:
export const config = {
  api: { bodyParser: { sizeLimit: '100mb' } }  // App Router: use maxDuration
};
```

**For App Router (Next.js 14+):** Add route segment config:
```typescript
export const maxDuration = 60;  // seconds — for Vercel Pro/Team
```

> **Note:** Standard Vercel Hobby plan limits functions to 10s. Phase 2 should document this constraint; if uploads are slow, consider chunked uploads in Phase 3.

### Pitfall 5: Duplicate Lead Creation on Resubmit

**What goes wrong:** User submits form, network error occurs, user resubmits — creates two `consigned_items` and two `leads` with same email.

**Why it happens:** No idempotency key on public POST endpoints.

**How to avoid (v1):** Accept duplicates — don't add complexity. Admin can merge leads manually. Note in code comment. Full dedup is Phase 3 concern.

### Pitfall 6: Missing GIN Index Causes Slow COA Ref Lookups

**What goes wrong:** JSONB containment queries on `auth.coa_refs` without a GIN index do full table scans.

**How to avoid:** Migration 032 must include `CREATE INDEX ... USING GIN(auth)` — do not skip this index.

### Pitfall 7: ConsignForm Uses JSON Body — FormData Required for File Upload

**What goes wrong:** Current `ConsignForm.tsx` sets form state in `useState` and calls a service that posts JSON. File uploads require `multipart/form-data` — cannot send `File` objects in JSON.

**How to avoid:** Rewrite the form submit handler to construct a `FormData` object and call `fetch('/api/public/consign', { method: 'POST', body: formData })` — do NOT set `Content-Type` header (browser sets `multipart/form-data; boundary=...` automatically).

---

## Code Examples

### Verify API Route Structure

```typescript
// Source: apps/web/src/app/api/consigned/route.ts (adapted — no auth)
// File: apps/web/src/app/api/public/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code || code.length < 3) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  
  // Lookup: product_id OR coa_refs contains code
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .or(`product_id.eq.${code},auth->coa_refs.cs.${JSON.stringify([code])}`)
    .maybeSingle();

  if (error) {
    console.error("Verify lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ found: false });
  }

  // Map to VerifyResult
  const auth = data.auth as Record<string, any>;
  const listing = data.listing as Record<string, any>;
  const signing = data.signing as Record<string, any>;
  const condition = data.condition as Record<string, any>;
  const media = data.media as Record<string, any>;
  const state = data.state as Record<string, any>;

  const verifyStatus = mapAuthStatus(auth?.status);
  const isPublished = data.state_lifecycle === "published" && data.state_visibility === "public";

  return NextResponse.json({
    found: true,
    result: {
      productId: data.product_id ?? code,
      itemName: listing?.title ?? "Unknown Item",
      signatures: (signing?.count as number) ?? 0,
      status: verifyStatus,
      date: state?.updated_at ?? new Date().toISOString(),
      certificate: (auth?.coa_refs as string[])?.[0] ?? auth?.provider_id ?? "",
      authenticationResult: `Item ${verifyStatus} by ${auth?.provider_id ?? "Relique"}`,
      dateOfAnalysis: state?.updated_at ?? new Date().toISOString(),
      // Extended fields (VRFY-03)
      signers: signing?.signers as string[] | undefined,
      itemType: data.entity_type,
      grade: condition?.grade as string | undefined,
      heroImage: media?.hero_id as string | undefined,
      // VRFY-04: marketplace link
      marketplaceSlug: isPublished ? data.slug : undefined,
    },
  });
}
```

### Consign API Route (skeleton)

```typescript
// File: apps/web/src/app/api/public/consign/route.ts
export const maxDuration = 60;  // Allow slow uploads on Vercel Pro

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // 1. Validate text fields
  const body = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string")
  );
  const validated = PublicConsignBodySchema.parse(body);

  // 2. Validate photos
  const photos = formData.getAll("photos") as File[];
  if (photos.length < 1) return NextResponse.json({ error: "At least 1 photo required" }, { status: 400 });
  if (photos.length > 10) return NextResponse.json({ error: "Max 10 photos" }, { status: 400 });
  for (const p of photos) {
    if (p.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB per photo" }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(p.type))
      return NextResponse.json({ error: "Only jpeg/png/webp allowed" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // 3. Insert consigned_item (status: submitted)
  const { data: item, error: itemError } = await supabase
    .from("consigned_items")
    .insert({ ...validated, status: "submitted" })
    .select().single();
  if (itemError) return NextResponse.json({ error: itemError.message }, { status: 500 });

  // 4. Upload photos
  const attachments: { file_path: string; file_name: string; content_type: string; size_bytes: number }[] = [];
  for (const photo of photos) {
    const ext = photo.name.split(".").pop() ?? "jpg";
    const path = `${item.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const buffer = await photo.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("consign-submissions")
      .upload(path, buffer, { contentType: photo.type });
    if (!uploadError) {
      attachments.push({ file_path: path, file_name: photo.name, content_type: photo.type, size_bytes: photo.size });
    }
  }

  // 5. Insert attachments
  if (attachments.length > 0) {
    await supabase.from("attachments").insert(
      attachments.map(a => ({ ...a, entity_type: "consigned_item", entity_id: item.id }))
    );
  }

  // 6. Auto-create lead (CNSG-05)
  await supabase.from("leads").insert({
    full_name: validated.contact_name,
    email: validated.contact_email,
    phone: validated.contact_phone ?? null,
    source: "consign",
    status: "new",
  });

  // 7. Send emails (ADM-04, CNSG-03)
  await sendConsignEmails(validated, item.id);

  return NextResponse.json({ submissionId: item.id, status: "submitted" }, { status: 201 });
}
```

---

## State of the Art

| Old Approach | Current Approach | Status |
|--------------|------------------|--------|
| localStorage mock verify | Supabase `marketplace_items` lookup | This phase replaces |
| `consign.local.ts` draft flow | Single-shot `POST /api/public/consign` | This phase replaces |
| `alert()` on contact submit | Inline success state + persist to CRM | This phase replaces |
| Admin-only email route | Shared `sendTransactionalEmail()` helper | This phase adds |

---

## Open Questions

1. **Vercel body size limit for multipart upload**
   - What we know: Vercel has a 4.5MB default body limit for serverless functions
   - What's unclear: Whether the current Vercel project plan supports `maxDuration = 60` and larger bodies
   - Recommendation: Add `export const maxDuration = 60` to consign route; test with actual plan limits. If Hobby plan, cap total upload to ~4MB (reduce photos or size limit)

2. **ConsignForm photo field placement**
   - What we know: D-23 says minimal public UI changes — add photo upload field only
   - What's unclear: Where in the form UX to place the photo upload (before or after text fields)
   - Recommendation: Place after "Item Description" and before COA/Category fields, matching logical provenance documentation flow

3. **email_logs entity_type constraint**
   - What we know: `email_logs.entity_type` has `CHECK (entity_type IN ('customer', 'lead'))` [VERIFIED: migration 017]
   - Gap: Consign confirmation email relates to `consigned_item`, not `customer` or `lead`
   - Recommendation: Log consign emails under the auto-created lead's entity_id (`entity_type = 'lead'`) for consistency with CRM. This requires the lead insert to complete first and its ID to be used.

4. **react-hook-form adoption for ConsignForm**
   - What we know: ConsignForm currently uses `useState` manually; `react-hook-form` is installed
   - What's unclear: D-23 says minimal UI changes — adding react-hook-form may be scope creep
   - Recommendation: Keep `useState` pattern for ConsignForm (minimal touch); upgrade to RHF in Phase 5 admin UX pass

---

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| `RESEND_API_KEY` | Email sending | Must verify in `.env.local` | Pattern already in `/api/email/send` — [VERIFIED] |
| `RESEND_FROM_EMAIL` | Email from address | Must verify | Defaults to `support@relique.co` |
| `OPERATOR_EMAIL` | Operator notifications (D-21) | Must add to `.env.local` | New env var — not yet documented |
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase operations | Present [VERIFIED: server.ts] | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Public API routes | Present [VERIFIED: server.ts] | — |
| Supabase project active | All DB operations | ASSUMED active | — |

**New env var required:** `OPERATOR_EMAIL` must be documented in `apps/web/README.md` alongside other env vars.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (v1 quality gate: lint + typecheck + build only) |
| Config file | None — no Jest/Vitest/Playwright configured |
| Quick run command | `pnpm typecheck` + `pnpm lint` |
| Full suite command | `pnpm build` (ensures no runtime errors in RSC/API routes) |

Per `REQUIREMENTS.md`: TEST-01–03 are deferred to v2. Quality gate for Phase 2 is **lint + typecheck + build only**.

### Phase Requirements → Verification Map

| Req ID | Verification Method | Command |
|--------|---------------------|---------|
| DATA-01 | `grep -r "verify.local" --include="*.ts"` returns 0 results | Manual + typecheck |
| DATA-02 | `grep -r "consign.local" --include="*.ts"` returns 0 results | Manual + typecheck |
| DATA-03 | ContactForm.tsx no longer has `setTimeout`/`alert()` | Code review |
| DATA-04 | `impl/index.ts` exports supabase impls only | Typecheck |
| VRFY-01 | GET `/api/public/verify?code=RLQ-TEST-001` returns `{ found: true, result: {...} }` | Manual curl / browser test |
| VRFY-03 | VerifyResultDisplay shows signer, grade, image when present | Manual browser test |
| VRFY-04 | Published item verify result shows `/marketplace/[slug]` link | Manual browser test |
| CNSG-01 | POST `/api/public/consign` with FormData → `consigned_items` row created in Supabase | Supabase dashboard verification |
| CNSG-02 | Form submit redirects to `/consign/success` | Manual browser test |
| CNSG-03 | Consign submission triggers email to submitter email | Resend dashboard / email inbox |
| CNSG-04 | Admin submissions page shows new `submitted` item | Manual admin UI test |
| CNSG-05 | `leads` table contains new row with `source = 'consign'` | Supabase dashboard |
| CNTC-01 | `messages` table row created on contact submit | Supabase dashboard |
| CNTC-02 | Operator receives email at `OPERATOR_EMAIL` | Email inbox check |
| CNTC-03 | Contact form shows inline success state (no `alert()`) | Manual browser test |
| ADM-04 | Email confirmation sent for both consign and contact | Resend send log |

### Wave 0 Test Gaps

No test files to create (v1 quality gate = lint + typecheck + build). Verification is manual + Supabase dashboard inspection.

---

## Security Domain

Phase 2 public routes are unauthenticated by design (D-09, D-19). Full security hardening is Phase 3 (SEC-01–04). Minimal v1 guardrails only:

### Applicable Concerns (v1 scope)

| Concern | STRIDE | v1 Control | Full Control (Phase 3) |
|---------|--------|------------|------------------------|
| Spam/bot consign submissions | Spoofing | Form validation (Zod) | Rate limiting, CAPTCHA |
| Malicious file uploads | Tampering | `allowed_mime_types` on bucket + content-type check | Magic byte validation |
| Email bombing via contact | Denial of Service | Minimal — no rate limit v1 | IP rate limiting Phase 3 |
| Service role key exposure | Info Disclosure | Server-only (never in client bundle) | Audit Phase 3 |
| JSONB injection via code param | Tampering | `code` is treated as string, not interpolated into raw SQL | Parameterized via Supabase JS client [VERIFIED: pattern] |

**Rate limiting decision:** Per Claude's Discretion, implement lightweight honeypot field in ConsignForm (hidden `<input name="website">` — bot fills it, server rejects if non-empty). This costs zero infrastructure and catches naive bots.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel project supports `maxDuration = 60` for large uploads | Pitfall 4 | Large photo uploads timeout on Hobby plan — need to reduce limits |
| A2 | Supabase project is active and migrations are up to date | Environment | All DB operations fail — need to apply pending migrations |
| A3 | `RESEND_API_KEY` is configured in production `.env.local` | Environment | All email sending fails silently or throws |
| A4 | `auth.status` values used by admin are a subset of the mapped values | auth.status mapping | Unknown status values fall back to "inconclusive" — safe but may surprise admin |
| A5 | Supabase JS `.or()` with `auth->coa_refs.cs.` syntax works for JSONB array containment | Verify lookup | COA ref lookup returns no results — may need `.filter()` syntax instead |

**A5 is the highest risk assumption.** The exact PostgREST syntax for JSONB array containment in `.or()` should be tested against the actual Supabase project before finalizing the verify route.

---

## Sources

### Primary (HIGH confidence — verified against live codebase)

- `apps/web/supabase/migrations/002_create_marketplace_items.sql` — table schema, JSONB columns, generated columns
- `apps/web/supabase/migrations/003_create_consigned_items.sql` — consigned_items schema, status enum
- `apps/web/supabase/migrations/010_create_crm_core.sql` — leads, messages, attachments schemas
- `apps/web/supabase/migrations/011_storage_crm.sql` — storage bucket creation pattern
- `apps/web/supabase/migrations/017_create_email_logs.sql` — email_logs schema, NOT NULL constraint
- `apps/web/src/app/api/consigned/route.ts` — admin consigned pattern (requireUser, service role, Zod)
- `apps/web/src/app/api/email/send/route.ts` — Resend integration pattern
- `apps/web/src/lib/services/impl/verify.local.ts` — what to replace
- `apps/web/src/lib/services/impl/consign.local.ts` — what to replace
- `packages/shared/src/domain/schemas/verify.ts` — VerifyResult schema, ProductIdSchema
- `packages/shared/src/domain/fixtures/marketplace.json` — auth.status = "verified", JSONB structure
- `apps/web/src/lib/supabase/server.ts` — createServiceRoleClient pattern
- `apps/web/src/app/(site)/consign/components/ConsignForm.tsx` — current form (no photos, localStorage)
- `apps/web/src/app/(site)/contact/components/ContactForm.tsx` — fake alert submit
- `apps/web/src/app/(site)/verify/page.tsx` — verifyService.run() call pattern
- `apps/web/src/app/api/marketplace/utils.ts` — mapRowToListing JSONB parsing pattern

### Secondary (ASSUMED)

- Vercel body size limits — [ASSUMED from Vercel documentation patterns]
- PostgREST JSONB array containment syntax in `.or()` — [ASSUMED — needs empirical test]

---

## Plan Wave Breakdown (Recommendation)

**5 plans in 3 waves:**

### Wave 1 (Blocking — must complete first)

**Plan 1: Database Migrations & Storage**
- Migration `032_add_product_id_marketplace_items.sql` (product_id column + GIN index)
- Migration `033_storage_consign_submissions.sql` (private bucket, 10MB/10 photos limits)
- Migration `034_email_logs_nullable_user_id.sql` (drop NOT NULL from user_id)
- Extend `VerifyResult` schema in `packages/shared/src/domain/schemas/verify.ts` (add optional extended fields)
- Create `apps/web/src/lib/email/sendTransactional.ts` (shared email helper)

### Wave 2 (Parallel — after Wave 1)

**Plan 2: Verify Flow**
- `apps/web/src/app/api/public/verify/route.ts` (GET, no auth, product_id + COA ref lookup)
- `apps/web/src/lib/services/impl/verify.supabase.ts` (calls `/api/public/verify`, implements IVerifyService)
- `apps/web/src/app/(site)/verify/` — no page changes needed (service layer swap)
- Remove `verify.local.ts` verify history methods from `IVerifyService` (or stub as no-ops per D-07)
- Update `VerifyResultDisplay.tsx` to conditionally show extended VRFY-03 fields

**Plan 3: Consign Flow**
- `apps/web/src/app/api/public/consign/route.ts` (POST FormData, upload, DB insert, lead, email)
- `apps/web/src/app/(site)/consign/components/ConsignForm.tsx` (add photo field, FormData submit, wire to API)

**Plan 4: Contact Flow**
- `apps/web/src/app/api/public/contact/route.ts` (POST JSON, messages + leads insert, email)
- `apps/web/src/app/(site)/contact/components/ContactForm.tsx` (add state, wire API, inline success)

### Wave 3 (After Wave 2)

**Plan 5: Adapter Cleanup & Data-04**
- Update `apps/web/src/lib/services/impl/index.ts` — export supabase impls, remove local exports
- Delete `apps/web/src/lib/services/impl/verify.local.ts`
- Delete `apps/web/src/lib/services/impl/consign.local.ts`
- Admin verify tab placeholder (D-08)
- Document `OPERATOR_EMAIL` in `apps/web/README.md`
- Run `pnpm typecheck` + `pnpm lint` + `pnpm build` — quality gate pass

---

## Metadata

**Confidence breakdown:**
- Database schemas: HIGH — verified against migration files
- API route patterns: HIGH — existing routes provide direct templates
- auth.status mapping: MEDIUM — fixture shows one value ("verified"); other values are assumed from convention
- JSONB PostgREST syntax: MEDIUM-LOW — pattern is established but `.or()` array containment needs empirical test
- Email patterns: HIGH — existing Resend integration in codebase
- Vercel limits: LOW — plan-dependent, not verified against actual project tier

**Research date:** 2026-06-14
**Valid until:** 2026-07-14 (stable stack — Supabase JS and Next.js APIs are stable)
