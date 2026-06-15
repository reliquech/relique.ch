# Product

## Register

product

## Surface registers

- **Brand** — Public marketing and transactional browse surfaces: `/`, `/about`, `/marketplace`, `/verify`, `/consign`, `/contact`. Design is part of the trust promise; editorial craft and credibility matter.
- **Product** — Admin CRM and ops tools: `/admin/*`. Design serves dense workflows — listings, leads, deals, submissions, users.

Default register is `product` because v1 design priority is the admin UX overhaul. Override per task when working on public surfaces.

## Users

**Collectors and buyers** browse authenticated marketplace inventory, verify memorabilia authenticity (QR/product ID), and submit items for consignment. They arrive skeptical of fakes, researching provenance, often on mobile between events or at home comparing listings.

**Internal ops team** (admin, editor, viewer roles) manages CRM pipeline, marketplace listings, consign/authenticate submissions, leads, deals, and customer comms. They work in sustained sessions on desktop, switching between data tables, forms, and detail views under time pressure.

Both audiences need to **trust** Relique; neither tolerates ambiguity about authentication status or listing legitimacy.

## Product Purpose

Relique is a unified authentication and marketplace platform for sports memorabilia. Success means users can verify items are real, consign and submit through real backends, contact the team, and browse Supabase-backed marketplace inventory — all on one Next.js deploy with no mock data in production paths.

Core value: **relics you can rely on** — trust is the product, not a feature bullet.

## Brand Personality

**Premium sport** — ESPN meets luxury retail. Energetic but credible. Expert authority without cold institutional distance.

Voice: confident, precise, warm where it matters (consign, verify outcomes). Not hype-driven, not bargain-bin casual.

## Anti-references

- **Crypto/Web3** — neon accents, glassmorphism, "to the moon" language, speculative energy
- **Marketplace clutter** — eBay/Craigslist density, noisy filter walls, bargain aesthetics, visual chaos
- **Generic SaaS landing** (secondary) — purple gradients, hero metrics, identical card grids, eyebrow kickers on every section

## Design Principles

1. **Trust is the product** — Authentication status, provenance, and expert process must be visible and legible before persuasion.
2. **Workflow over decoration in admin** — Ops users need fast paths through dense data; ornamentation that slows scanning is a bug.
3. **Premium sport energy on public** — Credible excitement for memorabilia culture; never hype or speculation.
4. **Show provenance, not promises** — Partners, press, verification outcomes, and listing metadata over vague claims.
5. **One identity, two registers** — Shared navy/blue core and typography across public and admin even when tone shifts editorial vs. utilitarian.

## Accessibility & Inclusion

WCAG 2.1 AA for v1: body text ≥4.5:1 contrast, large text ≥3:1, visible focus states, full keyboard navigation on interactive controls, and `@media (prefers-reduced-motion: reduce)` alternatives for all motion. English-only for v1; no i18n requirements yet.
