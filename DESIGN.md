---
name: Relique
description: Relics you can rely on — premium sport authentication and marketplace
colors:
  navy-deep: "#0F2854"
  primary-blue: "#1C4D8D"
  accent-blue: "#498BC4"
  highlight-ice: "#BDE8F5"
  bg-dark: "#0A0A0A"
  surface-dark: "#121212"
  border-dark: "#333333"
  text-primary: "#FFFFFF"
  text-secondary: "#B3B3B3"
  admin-bg: "#f4f6fa"
  admin-surface: "#ffffff"
  stitch-surface-container: "#f0f2f7"
  stitch-on-surface: "#0f172a"
  stitch-on-surface-variant: "#475569"
  stitch-outline: "#94a3b8"
  success: "#10B981"
  warning: "#F59E0B"
  destructive: "#ef4444"
typography:
  display:
    fontFamily: "Zapf Renaissance, Georgia, serif"
    fontSize: "clamp(2.25rem, 8vw, 7.5rem)"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "clamp(1.125rem, 2vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "clamp(0.875rem, 1.5vw, 1rem)"
    fontWeight: 500
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Work Sans, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "0.3em"
rounded:
  sharp: "0px"
  scrollbar: "4px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "clamp(3rem, 6vw, 6rem)"
components:
  button-primary:
    backgroundColor: "{colors.primary-blue}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "16px 48px"
  button-admin-default:
    backgroundColor: "{colors.primary-blue}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sharp}"
    padding: "8px 16px"
    height: "40px"
  button-admin-outline:
    backgroundColor: "{colors.admin-surface}"
    textColor: "{colors.stitch-on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sharp}"
    padding: "8px 12px"
    height: "36px"
  input-admin:
    backgroundColor: "{colors.admin-surface}"
    textColor: "{colors.stitch-on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sharp}"
    padding: "8px 12px"
    height: "40px"
---

# Design System: Relique

## Overview

**Creative North Star: "The Locker Room Vault"**

Relique's visual system treats authenticated memorabilia like artifacts in a premium vault — dark, confident surfaces; sharp geometry; blue as the thread of trust. Public surfaces carry broadcast energy (uppercase CTAs, ice-blue accents, serif hero type); admin surfaces stay utilitarian and scannable (Stitch tonal containers, Work Sans at medium weight, data-first layouts). Depth comes from tonal layering, not decoration.

The system explicitly rejects crypto/Web3 neon, marketplace clutter, and generic SaaS landing tropes from PRODUCT.md. Trust is shown through provenance, status, and expert process — never through hype gradients or bargain-bin density.

**Key Characteristics:**
- Dual register: **brand** (dark public site) vs **product** (light admin CRM), one navy/blue identity
- **0px radius** on brand CTAs and global `--radius`; admin inherits shadcn structure with sharp token base
- **Zapf Renaissance** for display hero; **Work Sans 500** as default body weight
- **Tonal elevation** via Stitch `surface-container-*` steps — shadows are rare and purposeful
- **Uppercase tracked metadata** (`0.3em`+) on public interactive labels only
- **WCAG 2.1 AA** contrast floor on all body text and focus rings

## Colors

A committed blue palette on near-black public surfaces; cool gray-blue admin neutrals derived from Stitch tokens.

### Primary
- **Vault Navy** (#0F2854): Deepest brand anchor — diagonal hero gradients, scrollbar track context, secondary headline accents on dark.
- **Primary Blue** (#1C4D8D): Main CTA fill, sidebar accent, stitch-primary (light mode), link emphasis. The trust signal color.
- **Broadcast Accent** (#498BC4): Hover state on public CTAs, scrollbar thumb hover, secondary interactive emphasis.
- **Ice Highlight** (#BDE8F5): Metadata accent on dark (`text-metadata-ice`), hero word highlights, focus ring variant on dark surfaces.

### Secondary
- **Stitch Primary Container** (#d8e2ff): Selected states, soft primary-tinted admin backgrounds, chip highlights in light admin.

### Neutral
- **Void Black** (#0A0A0A): Public page background (`--relique-bg-0`), hero canvas.
- **Locker Charcoal** (#121212): Card and panel surfaces on public dark UI.
- **Steel Divider** (#333333): Borders on dark surfaces, scrollbar thumb default.
- **Admin Mist** (#f4f6fa): Admin page background (`--bg-0`, `--stitch-background`).
- **Admin Paper** (#ffffff): Cards, sidebar, inputs in light admin.
- **Ink on Surface** (#0f172a): Primary admin text (`--stitch-on-surface`).
- **Muted Slate** (#475569): Secondary admin labels (`--stitch-on-surface-variant`).
- **Outline Cool** (#94a3b8 / #cbd5e1): Borders and dividers in admin.

### Named Rules
**The One Blue Voice Rule.** Primary Blue appears on every interactive trust action (authenticate, verify, consign, save). Accent Blue is hover/secondary only — never the default CTA fill.

**The Dark Public Rule.** Public marketing and transactional browse surfaces default to Void Black / Locker Charcoal. Admin never uses the public dark canvas for primary workflow screens.

## Typography

**Display Font:** Zapf Renaissance (local, `Zapf Renaissance Book.ttf`)
**Body Font:** Work Sans (Google, weights 400–700; **500 default on body**)
**Label Font:** Work Sans Black uppercase (metadata, public CTAs)

**Character:** Serif display lends institutional weight to hero headlines; Work Sans keeps body and admin UI athletic and legible at density. The pairing says "expert archive, modern operations."

### Hierarchy
- **Display** (500, clamp 2.25rem–7.5rem / up to 120px hero, line-height 0.85–0.95): Hero only (`text-display-hero`). Zapf Renaissance. `text-wrap: balance` on h1–h3.
- **Headline** (700, clamp 1.875rem–3.75rem, line-height 1.1): Section titles on public pages (`text-display-section`).
- **Title** (600, clamp 1.125rem–1.5rem): Card titles, admin page headers, form section labels.
- **Body** (500, 14–16px, line-height 1.625): Prose, table cells, form copy. Cap at 65–75ch in long-form (`prose-content`).
- **Label** (900, 10px, letter-spacing 0.3em, uppercase): Public metadata eyebrows, CTA text (`text-button-primary`, `text-metadata`). Use sparingly — not on every admin section.

### Named Rules
**The Serif Ceiling Rule.** Zapf Renaissance is for display hero and editorial moments only. Admin UI, tables, and forms use Work Sans exclusively.

**The Tracking Floor Rule.** Display hero letter-spacing never tighter than -0.04em. Metadata uppercase tracking never below 0.15em on mobile.

## Elevation

This system is **flat-by-default with tonal layering**. Depth is conveyed through Stitch surface-container steps (`#f8f9fc` → `#e0e4ec` in light admin; `#151c27` → `#2e3541` in dark admin mode), not persistent drop shadows. Public hero CTAs may use a single blue glow (`0 20px 40px rgba(28,77,141,0.3)`) on primary actions — that is a trust spotlight, not a card elevation pattern.

Admin cards and tables sit on Admin Paper atop Admin Mist with `outline-variant` borders. Modals and popovers use border + surface shift, not heavy shadow stacks.

### Shadow Vocabulary
- **CTA Spotlight** (`box-shadow: 0 20px 40px rgba(28, 77, 141, 0.3)`): Public primary CTA at rest only.
- **CTA Hover Glow** (`box-shadow: 0 0 30px rgba(28, 77, 141, 0.3)`): Public CTA hover via motion layer.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to primary CTA state on the public register — never as default card chrome in admin.

## Components

Public components are sharp, uppercase, and glow-accented. Admin components follow shadcn/Radix patterns with Relique blue assignment and Stitch surfaces.

### Buttons
- **Shape:** Sharp corners (0px radius) on public CTAs; admin shadcn buttons use token-derived radius (0px global `--radius`).
- **Public Primary:** Primary Blue fill, white uppercase label (10–12px, tracking 0.15–0.2em, font-black), padding 16–20px × 40–48px, min-height 44px touch target. Hover → Accent Blue + CTA Hover Glow.
- **Admin Primary:** `bg-primary text-primary-foreground`, h-10, px-4, font-medium (not uppercase). Hover `bg-primary/90`.
- **Admin Outline / Ghost:** Border `border-input`, hover `bg-accent`. Used in CRM view bars, dialogs, secondary actions.
- **Focus:** `focus-visible:ring-2 ring-ring ring-offset-2` (admin); `focus-ring-primary` on dark public (ring Primary Blue, offset bgDark).

### Chips
- **Style:** Stitch `primary-container` background for selected filters; outline-variant border for unselected.
- **State:** Admin CRM view chips — outline default, filled on active view.

### Cards / Containers
- **Public:** Locker Charcoal panels on Void Black; optional `diagonal-bg` gradient overlay at 15% opacity; `clip-path-slant` for editorial accents.
- **Admin:** Admin Paper on Admin Mist; borders `stitch-outline-variant`; internal padding 16–24px.
- **Shadow Strategy:** None at rest (see Elevation).
- **Border:** 1px `border-dark` (public) or `stitch-outline-variant` (admin).

### Inputs / Fields
- **Style:** Admin — white surface, 1px `border-input`, h-10, Work Sans 500.
- **Focus:** Ring 2px `ring-ring` with offset.
- **Error / Disabled:** `destructive` border/text; `opacity-50` disabled on buttons.

### Navigation
- **Public:** Header/footer on dark; uppercase metadata links with ice or primary blue accents; min 44px tap targets.
- **Admin:** `PortalSidebar` — white/dark sidebar surface, Primary Blue active accent, Work Sans labels. Command palette (`cmdk`) for power-user navigation. Breadcrumb + back affordance in portal header.

### Verification Status Badge (signature)
- Authentication status must be legible at a glance — color + label, not icon-only. Use success/warning semantic colors with explicit text ("Authenticated", "Pending", "Unverified").

## Do's and Don'ts

### Do:
- **Do** use Primary Blue (#1C4D8D) for every primary trust action (authenticate, verify, consign, save listing).
- **Do** keep admin tables and forms on Stitch tonal surfaces with clear `on-surface` / `on-surface-variant` text hierarchy.
- **Do** use Zapf Renaissance only for hero/display; Work Sans for everything operational.
- **Do** maintain 4.5:1 body text contrast — bump muted grays toward ink when in doubt.
- **Do** respect `prefers-reduced-motion`: replace framer-motion hero entrance with instant or crossfade.

### Don't:
- **Don't** use crypto/Web3 aesthetics — neon accents, glassmorphism, speculative hype language.
- **Don't** create marketplace clutter — eBay/Craigslist density, noisy filter walls, bargain-bin visual chaos.
- **Don't** deploy generic SaaS landing patterns — purple gradients, hero metrics, identical card grids, eyebrow kickers on every section.
- **Don't** use `border-left` greater than 1px as a colored accent stripe on cards or alerts.
- **Don't** apply uppercase tracked metadata labels to every admin section header — that's public-register grammar.
- **Don't** use gradient text (`background-clip: text`) for emphasis — solid Primary Blue or white only.
