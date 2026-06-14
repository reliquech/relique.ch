# Feature Landscape

**Domain:** Sports memorabilia authentication & operator-owned marketplace platform  
**Project:** Relique.co — unified platform (public site + `/admin` CRM)  
**Researched:** 2026-06-14  
**Milestone context:** Subsequent milestone — complete verify, consign, contact, payments flows and admin CRM; move from mock/localStorage to production Supabase backend.

## Scope Lens

Relique v1 is **not** a multi-vendor P2P marketplace like eBay or Fanatics Collect. It is an **operator-owned** platform: Relique authenticates items, lists inventory, and sells directly. Admin CRM supports internal operators managing leads, consignments, deals, and listings. This lens separates industry table stakes from features that apply only to auction houses, vault platforms, or Web3 marketplaces.

**Confidence:** HIGH for table stakes (verified against PSA/Beckett verify flows, Fanatics/Heritage consignment patterns, existing Relique codebase). MEDIUM for differentiator prioritization (brownfield assumptions + competitor positioning). LOW for blockchain/NFT features (explicitly out of scope; included only as anti-features).

---

## Table Stakes

Features users and operators expect. Missing any of these in a "production-ready" release undermines trust or blocks core workflows.

### Public — Authentication & Trust

| Feature | Why Expected | Complexity | Notes | Relique Status |
|---------|--------------|------------|-------|----------------|
| Certificate / product ID lookup | Industry standard (PSA Cert Verification, Beckett BAS lookup). Buyers verify before purchase. | Medium | Lookup by alphanumeric cert number; show signer, item type, grade/status, date. PSA warns cert lookup alone doesn't eliminate fraud — UI must set expectations. | UI exists; backend is prefix-based mock (`verify.local.ts`). **Must replace with Supabase-backed lookup.** |
| Clear authentication outcome | Three-state result (qualified / inconclusive / disqualified) matches domain language in terms and verify contract. | Low | Outcome must map to real records, not `RLQ-QUAL-*` prefix rules. | Contract + UI exist; logic is mock. |
| QR / barcode scan input | NFC/QR verification is emerging norm (Authority RFID cases, Sportafi VDT QR). Collectors expect phone-based lookup. | Medium | Scan must parse real code, not generate random `RLQ-QUAL-XXX` (`QRScanInput.tsx` bug). | Broken mock; manual entry works. |
| Certificate details on result | Beckett/PSA show signer, item type, notes, grade, images. Minimum trust payload. | Low | `VerifyResult` schema already has `certificate`, `authenticationResult`, `dateOfAnalysis`. | Schema ready; needs real data source. |
| Link verify result to marketplace listing | Buyers expect cert number on detail page to match verify lookup. | Medium | `marketplace_items.auth` JSONB + `refs` can hold cert/product IDs. | Data model supports; wiring TBD. |
| Terms, privacy, authentication disclaimers | Legal/compliance copy exists in `terms-policies.data.ts`; users expect accessible policies. | Low | Static content acceptable for v1. | Exists. |

### Public — Marketplace

| Feature | Why Expected | Complexity | Notes | Relique Status |
|---------|--------------|------------|-------|----------------|
| Browse authenticated inventory | Core marketplace value prop. Every competitor leads with catalog. | Low | Grid/list with images, title, price, category. | **Validated** — Supabase-backed. |
| Item detail with trust panel | Collectors need COA issuer, signed-by, condition, provenance before high-value purchase. | Low | `TrustPanel` component exists. | Exists; depends on `auth` JSONB quality. |
| Search, filter, sort | Standard e-commerce expectation for catalogs >20 items. | Medium | Category, price, sport, sort by price/date. | Exists on web. |
| Image gallery | Visual inspection is primary authentication proxy online. | Low | Hero + gallery from `media` JSONB. | Exists. |
| Published-only public visibility | Draft/private items must never leak. Filter `state_lifecycle=published` + `state_visibility=public`. | Medium | Security-critical; regression = trust loss. | Implemented; needs ongoing hardening (RLS vs service-role). |
| Slug-based detail URLs | Shareable, SEO-friendly item links. | Low | `/marketplace/[slug]`. | **Validated**. |
| Currency display | International collectors expect USD (minimum) with clear formatting. | Low | `CurrencyContext` exists. | Exists. |

### Public — Consignment Intake

| Feature | Why Expected | Complexity | Notes | Relique Status |
|---------|--------------|------------|-------|----------------|
| Online consign submission form | Heritage, Sotheby's, Lelands, Fanatics all start with photo + description intake. | Medium | Contact info, item description, category, photos. | UI + validation exist. |
| File/photo upload on submit | Operators cannot evaluate items without images. Fanatics/Lelands require photos at intake. | Medium | Upload to Supabase Storage; not browser-only. | Form has upload UI; persistence is localStorage mock. |
| Submission confirmation | User must know submission was received (on-screen + email). | Low | Without this, consign feels broken even if data saves. | Missing — no real submit path. |
| Consign status visibility (minimal) | Sellers expect at least "submitted" acknowledgment; full portal is v2. | Low | Email confirmation satisfies v1 minimum. | Not implemented. |

### Public — Contact & Support

| Feature | Why Expected | Complexity | Notes | Relique Status |
|---------|--------------|------------|-------|----------------|
| Working contact / inquiry form | Every memorabilia site has "sell with us" / "get estimate" intake. | Low | Name, email, message → delivered to operators. | UI exists; **fake success** (`ContactForm.tsx`). |
| Inquiry → operator visibility | Submissions must reach CRM, not disappear. | Medium | Create `leads` or `messages` record + email notification. | Admin CRM exists; public intake not wired. |

### Commerce — Buy Flow

| Feature | Why Expected | Complexity | Notes | Relique Status |
|---------|--------------|------------|-------|----------------|
| Buy-now checkout | Operator-owned inventory requires payment to complete "marketplace" promise. | High | Stripe Checkout or Payment Intents; no payment = browse-only catalog. | **Not started** (listed in PROJECT.md Active). |
| Order confirmation | Buyer receipt email + on-screen confirmation after payment. | Medium | Resend already integrated in admin CRM. | Email infra exists; no order flow. |
| Inventory / sold state on purchase | Item must not remain purchasable after sale. | Medium | Update `state.lifecycle` to `sold` or `unavailable`. | Data model supports via `state` JSONB. |
| Secure payment handling | PCI compliance via Stripe; no raw card data on Relique servers. | Medium | Stripe-hosted checkout preferred for v1 speed. | Not implemented. |

### Admin — Operations (CRM & Inventory)

| Feature | Why Expected | Complexity | Notes | Relique Status |
|---------|--------------|------------|-------|----------------|
| Marketplace listing CRUD | Operators create, edit, publish, unpublish inventory. | Medium | Title, price, media, auth metadata, featured flag. | **Validated** — admin marketplace + API. Edit action currently no-op stub. |
| Consignment / submission queue | Operators must see web consign intake. `consigned_items` table exists. | Medium | Status workflow: `draft → submitted → in_review → approved/rejected`. | API + page exist; web doesn't write to it; submissions page has stub actions. |
| Lead management | Contact and consign inquiries become leads. | Medium | Fanatics/Sotheby's model: intake → specialist review. | **Validated** — leads CRM. |
| Customer & deal pipeline | High-value memorabilia sales are relationship-driven; pipeline is operator table stakes. | Medium | Kanban stages, deal value, linkage to customers. | **Validated** — deals, pipeline stages, customers. |
| Role-based admin access | viewer/editor/admin separation for ops team. | Medium | `requireUser` + `requireRole` on API routes. | **Validated**; security audit needed. |
| Internal messaging / notes | Operators coordinate on leads, deals, consignments. | Low | Threaded messages on CRM entities. | **Validated** — messages, activity feed. |
| Task assignment | Follow-up tasks on leads/deals/submissions. | Low | Due dates, assignee, status. | **Validated** — tasks module. |
| Email to customers from admin | Operators reply to consignors/buyers from CRM. | Medium | Resend via `email/send` API. | **Validated** — needs extension to transactional triggers. |
| Audit trail for sensitive actions | Who published, approved, or edited high-value items. | Medium | `audit_logs` table exists. | Partially implemented on some routes. |

### Platform — Production Baseline

| Feature | Why Expected | Complexity | Notes | Relique Status |
|---------|--------------|------------|-------|----------------|
| Supabase as single source of truth | No localStorage for production user data. | High | Foundation requirement per PROJECT.md. | Marketplace yes; verify/consign/contact no. |
| Authenticated admin routes | `/admin/*` guarded by session middleware. | Medium | Unified app must preserve guard after merge. | **Validated** in admin app. |
| Transactional email (Resend) | Confirmations for contact, consign, purchase. | Medium | `RESEND_API_KEY` required. | Admin outbound exists; public triggers missing. |

---

## Differentiators

Features that strengthen Relique's position. Not all are required for launch, but they define competitive advantage beyond "another consignment form + catalog."

| Feature | Value Proposition | Complexity | Notes | Relique Status |
|---------|-------------------|------------|-------|----------------|
| Unified auth + marketplace + CRM platform | Single codebase/deploy; operators see consign → listing → sale in one system. Most competitors silo verify (PSA), sell (Fanatics), and CRM (internal tools). | High | Architecture decision in PROJECT.md. | In progress — merge `apps/admin` → `apps/web`. |
| In-house Relique authentication brand | PSA/Beckett verify *their* certs; Relique can authenticate and certify *its own* inventory with branded cert numbers. | High | Requires `verify_records` table linking cert → item → outcome. Core to "trust and transact" value prop. | Mock only; key v1 differentiator once real. |
| AI-assisted listing image generation | Faster cataloging; reduces operator time per listing. | Medium | `agent-create` route + OpenAI integration exists. | **Validated** — admin-only; fragile but shipped. |
| Rich memorabilia metadata model | Jersey-specific schema (sport, club, kit, signing, condition, auth) vs generic e-commerce SKU. | Medium | `marketplace_items` JSONB structure. | **Validated** — domain-specific depth. |
| Verify history (user-side) | Collectors re-check past lookups; builds engagement loop. | Low | Browser history acceptable v1; account-based v2. | UI exists; localStorage mock. |
| CRM automations & alert rules | Proactive operator workflow (stale lead alerts, task creation). | Medium | `alert_rules`, `notifications` tables + runner. | **Validated** — beyond typical SMB marketplace admin. |
| Saved CRM views, filters, custom fields | Operator productivity at scale. | Medium | `crm_saved_views`, `crm_custom_fields`. | **Validated** — enterprise-leaning CRM depth. |
| Featured / curated marketplace sections | Story-driven merchandising for high-value relics. | Low | `featured` flag + admin Featured page. | **Validated**. |
| Certificate-to-listing deep link | Verify result page links directly to purchasable item. | Low | Closes trust → transaction loop. | Schema supports; UX wiring TBD. |
| Compare / favorites (lightweight) | Collector engagement; secondary to checkout. | Low | Compare drawer, favorites exist. | Exists; favorites localStorage only. |

### v1 Differentiator Priority (if scope tight)

1. **Real in-house verify backend** — without this, Relique is a PSA lookup clone.
2. **End-to-end consign → CRM → listing pipeline** — operator workflow moat.
3. **Working checkout** — completes "transact" in core value prop.
4. **AI listing generation** — already built; polish and stabilize.

---

## Anti-Features

Deliberately **not** building in v1. Documented to prevent scope creep during roadmap creation.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Blockchain / NFT / VDT provenance | High complexity, regulatory uncertainty, not in Relique's validated stack. Sportafi/Web3 is differentiator for others, not table stakes for Relique v1. | Store provenance in `auth` + `refs` JSONB; branded cert lookup. |
| Live auctions, Dutch auctions, bidding | Heritage/Sotheby's model; Relique schema is buy-now listing. Major scope expansion. | Fixed-price checkout v1; revisit auction module v2+ if business requires. |
| Multi-vendor seller portal | Relique is operator-owned inventory, not Fanatics-style peer consignment marketplace. | Admin-managed listings; consign intake feeds operators, not self-serve seller dashboards. |
| P2P escrow / Stripe Connect marketplace | Escrow (Escrow.com, Stripe Connect) needed for peer-to-peer; overkill for single-seller operator model. | Simple Stripe Checkout; funds to Relique merchant account. |
| Physical vaulting & fulfillment logistics | Authority/Fanatics vault model requires warehousing ops Relique doesn't have in codebase. | Display "shipping calculated at checkout" or flat rate; manual fulfillment v1. |
| Photo-matching / ML authentication | Witness-based systems (The Realest) require on-site authenticators + ML pipeline. | Human operator review in admin; structured verify outcome from authenticated records. |
| Public user registration & accounts | PROJECT.md: admin-provisioned users only; reduces auth scope. | Guest checkout + email; optional "save verify history" via localStorage v1. |
| Watchlist price-drop notifications (mock) | `WatchlistButton.tsx` fakes notifications — damages trust if shipped. | Remove mock notifications or defer watchlist to v2 with real price tracking. |
| Native mobile apps | Out of scope per PROJECT.md. | Responsive web. |
| i18n / multi-language | Out of scope; English-only v1. | — |
| Public site UX redesign | Admin-only redesign priority; public gets functional fixes only. | Fix broken flows (contact, verify, consign, checkout) without visual overhaul. |
| Full test framework + CI | Deferred v2 per PROJECT.md. | Lint + typecheck + build gate. |
| Real-time inventory sync across channels | eBay/Shopify multi-channel (Marketplace.Live) is separate product surface. | Single Relique catalog as source of truth. |
| Signature pre-authentication ($10 quick opinion) | Beckett BAS Signature Review is separate paid service. | Route inquiries through contact/consign to human review. |
| Automated seller payouts / commission splits | Multi-party payout logic for P2P marketplaces. | Operator handles settlement offline or single-merchant Stripe. |
| Social login / OAuth for buyers | Not required for guest checkout or verify lookup. | Email-based contact only. |

---

## Feature Dependencies

```
[Supabase migration / unified app] 
    → [Real verify backend]
    → [Certificate ↔ listing linkage]
    → [Trust panel shows live cert data]

[Supabase migration / unified app]
    → [Real consign submit → consigned_items]
    → [Admin submission queue actions]
    → [Lead auto-create from consign]
    → [Consign confirmation email]

[Contact form backend]
    → [Lead/message in CRM]
    → [Operator email notification]

[Marketplace listing CRUD] 
    → [Checkout / Stripe]
    → [Sold state update]
    → [Order confirmation email]

[Resend email infra]
    → [Contact confirmation]
    → [Consign confirmation]
    → [Purchase receipt]

[Auth + RBAC hardening]
    → [All admin mutations]
    → [Public API route security]

[Fix QR scan parsing]
    → [Verify by QR] (depends on real verify backend)

[Remove localStorage adapters]
    → [All public production flows] (verify, consign, favorites — decide per feature)

[Admin edit listing (fix no-op)]
    → [Operator listing maintenance]
    → [Consign approved → marketplace_item creation]
```

### Critical Path for v1 Production

```
Foundation (merge app, Supabase, security)
  ├─ Verify backend ──────────────────────┐
  ├─ Consign → consigned_items ───────────┼─→ Admin CRM visibility
  ├─ Contact → leads/messages + email ────┘
  └─ Stripe checkout → sold state + receipt email
```

---

## MVP Recommendation (v1 Production-Ready)

### Must ship (table stakes — users leave without these)

1. **Real verify lookup** — cert/product ID → authenticated result from database  
2. **Real consign submit** — form + photos → `consigned_items` + confirmation email  
3. **Working contact form** — inquiry → CRM lead/message + operator notification  
4. **Stripe buy-now checkout** — pay → sold state → buyer receipt  
5. **Admin submission queue** — view, status transitions, link consign → listing (manual OK)  
6. **Fix trust-breaking mocks** — QR scan, contact fake success, watchlist fake notifications  

### Should ship (operators blocked or embarrassed without these)

7. **Admin listing edit** — fix no-op edit on ItemsPage  
8. **Consign → lead auto-creation** — operator doesn't re-type intake data  
9. **Transactional emails** — consign/contact/purchase confirmations via Resend  
10. **Audit logging** on publish/approve/payment mutations  

### Defer to v2+ (differentiators or non-blocking)

- Account-based verify history sync across devices  
- Watchlist with real price alerts  
- Escrow / buyer protection program for items >$X  
- Auction formats  
- Seller self-serve portal  
- Public UX redesign  
- Automated tests + CI  
- Compare/favorites backed by user accounts  

---

## Relique v1 Feature Matrix (Brownfield Gap Summary)

| Area | Has UI | Has Admin | Has Real Backend | Production Blocker |
|------|--------|-----------|------------------|-------------------|
| Marketplace browse | ✓ | ✓ | ✓ | No |
| Marketplace buy | partial | — | ✗ | **Yes** |
| Verify | ✓ | partial | ✗ (mock) | **Yes** |
| Consign | ✓ | ✓ | ✗ (localStorage) | **Yes** |
| Contact | ✓ | ✓ (CRM) | ✗ (fake) | **Yes** |
| CRM (leads/deals/tasks) | — | ✓ | ✓ | No |
| Email (operator) | — | ✓ | ✓ (Resend) | No |
| Email (public transactional) | — | — | ✗ | **Yes** |
| AI listing generation | — | ✓ | ✓ | No (stabilize) |

---

## Sources

| Source | Confidence | Used For |
|--------|------------|----------|
| [PSA Cert Verification](https://www.psacard.com/cert) | HIGH | Verify lookup table stakes, disclaimer patterns |
| [Beckett BAS Certificate Verification](https://www.beckett-authentication.com/verify-certificate) | HIGH | Cert lookup UX, mobile verify expectations |
| [Fanatics Collect Consignment](https://www.fanaticscollect.com/consign) | MEDIUM | Consign intake, payout communication patterns |
| [Heritage Auctions Consignment Process](https://sports.ha.com/heritage-auctions-eight-step-consignment-process.s) | MEDIUM | Operator workflow stages, consignor communication |
| [Sotheby's Sports Memorabilia Consign](https://www.sothebys.com/en/consign/sports-memorabilia) | MEDIUM | Photo-first intake, specialist review model |
| [Escrow.com × Marketplace.Live](https://www.escrow.com/news/articles/escrow_com_partners_with_marketplacelive) | MEDIUM | Escrow as P2P differentiator, not operator-owned table stakes |
| [Sportafi Verified Marketplace](https://www.sportafi.com/verified-marketplace/) | LOW | Web3 features → anti-features for Relique v1 |
| Relique `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, codebase inspection | HIGH | Brownfield status, validated vs mock features, schema capabilities |

---

*Research feeds requirements definition for subsequent milestone roadmap. Categorization aligned to production transition: mock → Supabase → Stripe.*
