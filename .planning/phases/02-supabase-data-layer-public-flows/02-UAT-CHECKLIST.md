# Phase 2 UAT Checklist

**Scope:** Verify, consign, contact — Supabase persistence, **no transactional email** (ADM-04 out of scope).

**Prerequisites:** `npm run dev`, `.env.local` with Supabase keys, migrations 032–034 applied, seeded `marketplace_items` row with `product_id = RLQ-TEST-0001`.

| Req | Step | Pass |
|-----|------|------|
| VRFY-01 | `/verify?code=RLQ-TEST-0001` → result from DB (not mock) | ⬜ |
| VRFY-02 | URL `?code=` auto-runs verify on page load | ⬜ |
| VRFY-03 | Result shows signer, grade, hero image when in JSONB | ⬜ |
| VRFY-04 | Published item shows link to `/marketplace/[slug]` | ⬜ |
| VRFY-01/D-04 | Unknown code → not-found state | ⬜ |
| CNSG-01 | Consign with 1+ photos → `consigned_items` + `attachments` | ⬜ |
| CNSG-02 | Redirect `/consign/success?id=...` | ⬜ |
| CNSG-03 | On-screen success only — **no email** | ⬜ |
| CNSG-04 | Admin consignments tab shows `submitted` item | ⬜ |
| CNSG-05 | `leads.source = consign` row created | ⬜ |
| CNTC-01 | `messages` + `leads` with `source=contact` | ⬜ |
| CNTC-02 | Operator sees lead in admin CRM — **no email** | ⬜ |
| CNTC-03 | Contact inline success — no `alert()` | ⬜ |
| DATA-01 | Verify hits Supabase API | ⬜ |
| DATA-02 | Consign hits Supabase API | ⬜ |
| DATA-03 | Contact hits Supabase API | ⬜ |

**Automated helpers:**
```bash
npm run phase2:smoke   # optional — requires dev server
npm run phase2:gate    # required — no-email + data-layer + build
```

**Sign-off:** Type `approved` after all rows checked, or list failures.
