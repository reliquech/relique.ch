# Component Structure & Feature Mapping

**Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** Production

Tài liệu này mô tả chi tiết từng component trong hệ thống Relique.co, bao gồm purpose, features, dependencies, và styling patterns.

---

## 📋 Mục lục

1. [Home Page Components](#1-home-page-components)
2. [Marketplace Components](#2-marketplace-components)
3. [Consign Components](#3-consign-components)
4. [Verify Components](#4-verify-components)
5. [Content Components](#5-content-components)
6. [Sections Components](#6-sections-components)
7. [Shared Components](#7-shared-components)
8. [Shell Components](#8-shell-components)
9. [UI Components](#9-ui-components)
10. [Shared UI Package](#10-shared-ui-package)

---

## 1. Home Page Components

**Location:** `apps/web/src/components/home/`

### HeroSection.tsx (46 lines)

**Purpose:** Landing page hero với animated title và CTA button

**Features:**
- Diagonal background effect (`diagonal-bg` class)
- Times New Roman display typography
- Animated fade-in với premium easing
- CTA button với shadow effect và hover animation

**Dependencies:**
- `framer-motion` - Animation library
- `next/link` - Client-side navigation

**Props:** None (static content)

**Styling Patterns:**
- `diagonal-bg` class cho background effect
- Inline `fontFamily` cho Times New Roman
- `tracking-tight` và `leading-[0.85]` cho hero text
- Premium easing: `[0.16, 1, 0.3, 1]`

**Code Example:**
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
>
```

---

### DualBlocks.tsx (118 lines)

**Purpose:** Split-screen CTA blocks (Verification vs Consignment)

**Features:**
- Two side-by-side interactive blocks
- Background images với gradient overlays
- Sequential reveal animation (slide from left/right)
- Hover scale effect
- Animated decorative elements (pulsing circle, rotating square)
- Full-height clickable areas với Next.js Link

**Dependencies:**
- `framer-motion` - Animations
- `next/image` - Optimized images
- `next/link` - Navigation

**Props:** None (static)

**Styling Patterns:**
```tsx
// Z-index layering
z-0: Background image
z-[1]: Gradient overlay
z-10: Content

// Gradient overlays
bg-gradient-to-br from-black/60 to-black/40

// Hover effects
whileHover={{ scale: 1.02 }}
whileHover={{ gap: 24 }} // Gap expansion
```

**Performance Notes:**
- Uses `priority` on images (above fold)
- Separates clickable Link từ visual animations

---

### MarketplaceSection.tsx (245 lines)

**Purpose:** Horizontal draggable carousel showcase cho marketplace items

**Features:**
- Touch-friendly drag interaction
- Grayscale images → color on hover
- Status badges với backdrop-blur
- Scroll progress indicator
- Dynamic constraints calculation based on viewport
- Responsive padding adjustment

**Dependencies:**
- `framer-motion` - Drag + animations
- `next/image` - Images
- `next/link` - Navigation
- `useState`, `useEffect`, `useRef` - State management

**Props:** None (uses internal `MOCK_ITEMS`)

**State Management:**
```tsx
const [constraints, setConstraints] = useState({ left: 0, right: 0 });
const [isDragging, setIsDragging] = useState(false);
const x = useMotionValue(0); // Performance optimization
```

**Styling Patterns:**
```tsx
// Image hover scale
className="transition-all duration-1000 group-hover:scale-110"

// Backdrop blur badge
className="backdrop-blur-md bg-green-400/10 text-green-400"

// Cursor states
className="cursor-grab active:cursor-grabbing"
```

**Performance Notes:**
- Uses `useMotionValue` thay vì state cho drag (tránh re-renders)
- `dragElastic={0.08}` và `dragTransition` cho smooth drag
- Lazy loading images
- `draggable={false}` và `pointer-events-none` trên images

**Accessibility Notes:**
- `select-none` để tránh text selection khi drag
- `touch-pan-y` để maintain vertical scroll on mobile

---

### TeamSection.tsx (112 lines)

**Purpose:** Team member showcase với cards

**Features:**
- Grid layout (responsive 1→2→3 columns)
- Staggered animation entrance
- Hover lift effect
- Background "R" watermark
- Blue accent cho roles
- Ultra-small typography cho credentials

**Dependencies:**
- `framer-motion` - Animations với variants

**Props:** None (uses internal `TEAM` array)

**Animation Patterns:**
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};
```

**Styling Patterns:**
```tsx
// Watermark
<div className="absolute top-0 right-0 opacity-5 group-hover:opacity-10">
  <span className="text-6xl font-black italic">R</span>
</div>

// Role metadata
<p className="text-primaryBlue font-black text-[10px] uppercase tracking-widest">
```

---

### TestimonialsSection.tsx (87 lines)

**Purpose:** Customer testimonials/reviews showcase

**Features:**
- 3-column grid layout
- Star ratings
- Verified badges
- Staggered entrance animation
- Hover border color change

**Dependencies:**
- `framer-motion` - Animations

**Props:** None (uses internal `REVIEWS` array)

**Styling Patterns:**
```tsx
// Star rendering
{[...Array(rating)].map((_, i) => (
  <span key={i} className="text-primaryBlue text-xs">★</span>
))}

// Verified badge
<div className="w-8 h-8 rounded-full bg-primaryBlue/10 border border-primaryBlue/20">
  <span className="text-[8px] font-black text-primaryBlue">V</span>
</div>
```

---

### TheWaySection.tsx (92 lines)

**Purpose:** Feature navigation cards (Mission, Investment, Trust)

**Features:**
- Grid layout với different column spans
- Click navigation với smooth scroll to anchor
- Hover effects (lift + border color change)
- Background color variants per card

**Dependencies:**
- `framer-motion` - Animations
- `next/link` - Navigation (via useRouter)
- `useRouter` - Client-side routing

**Props:** None (static cards)

**Styling Patterns:**
```tsx
// Variable column spans
className="col-span-12 md:col-span-6" // Half width
className="col-span-12" // Full width

// Background variants
bg-navy/40
bg-primaryBlue/20
bg-cardDark

// Hover effects
hover:border-highlightIce/30
group-hover:text-highlightIce
```

**Interaction Pattern:**
```tsx
const handleCardClick = (href: string) => {
  const [path, hash] = href.split("#");
  router.push(path || "/");
  if (hash) {
    setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView();
    }, 100);
  }
};
```

---

### StrategicPartnerSection.tsx (52 lines)

**Purpose:** Partnership showcase (St.B branding)

**Features:**
- Two-column split layout
- Text + visual branding
- Animated shine effect across logo
- Hover scale on logo container

**Dependencies:**
- `framer-motion` - Animations

**Props:** None (static)

**Styling Patterns:**
```tsx
// Shine effect (moving gradient)
<motion.div
  animate={{ x: ["-100%", "100%"] }}
  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
/>

// Rotated container
className="rotate-3"
```

---

### WhySection.tsx (62 lines)

**Purpose:** Value proposition section với CTA

**Features:**
- Split layout (text + visual)
- Inline badge với border
- CTA button với partnership info
- Decorative corner border element

**Dependencies:**
- `framer-motion` - Animations
- `next/link` - Navigation

**Props:** None (static)

**Styling Patterns:**
```tsx
// Inline badge
<div className="inline-block px-4 py-1 bg-primaryBlue/10 border border-primaryBlue/20">

// Decorative corner
<div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-2 border-r-2 border-highlightIce" />
```

---

### FeatureSection.tsx (62 lines)

**Purpose:** Feature tiles grid (Why Relique)

**Features:**
- Uses shared `FeatureTiles` component từ `@relique/ui`
- 4-column responsive grid
- Icon + title + description per tile
- Footer links

**Dependencies:**
- `lucide-react` - Icons
- `@relique/ui` - `FeatureTiles`, `Section` components

**Props:** None (static feature list)

**Data Structure:**
```tsx
{
  icon: <Sparkles />,
  title: "AI Authentication",
  description: "Advanced machine learning..."
}
```

---

### QuickActions.tsx (49 lines)

**Purpose:** Quick action grid (Verify, Marketplace, Consign, Learn)

**Features:**
- Uses `BentoFeatureGrid` component
- 4 action cards
- Header với description

**Dependencies:**
- `@/components/sections/BentoFeatureGrid` - Grid component

**Props:** None (static actions)

---

### UpcomingEvents.tsx (51 lines)

**Purpose:** Upcoming events showcase (3 latest)

**Features:**
- Loads events từ `contentService`
- Responsive grid (3 columns)
- Uses `EventCard` component
- Conditional render (hides if no events)

**Dependencies:**
- `contentService` - Data fetching
- `EventCard` - Display component
- `SectionHeader` - Header component

**State Management:**
```tsx
const [events, setEvents] = useState<Event[]>([]);

useEffect(() => {
  const loadEvents = async () => {
    const allEvents = await contentService.events.list(true);
    setEvents(allEvents.slice(0, 3));
  };
  loadEvents();
}, []);
```

**Props:** None

---

### FeaturedPosts.tsx (50 lines)

**Purpose:** Featured blog posts showcase (3 latest)

**Features:**
- Similar to UpcomingEvents
- Loads posts từ `contentService`
- Uses `PostCard` component

**Dependencies:**
- `contentService` - Data fetching
- `PostCard` - Display component
- `SectionHeader` - Header component

**Props:** None

---

## 2. Marketplace Components

**Location:** `apps/web/src/components/marketplace/`

### TrustPanel.tsx (255 lines)

**Purpose:** Authentication status và traceability timeline cho marketplace items

**Features:**
- Status badge display (Qualified/Inconclusive/Disqualified)
- Certificate ID display
- Authenticated date
- COA issuer info
- Collapsible timeline với events
- Timeline dots với type-based colors
- Icons cho mỗi event type
- Links to verify và about pages

**Dependencies:**
- `@/components/ui/card` - Card components
- `@/components/ui/badge` - Badge component
- `@/components/ui/button` - Button component
- `@/components/ui/collapsible` - Collapsible component
- `lucide-react` - Icons
- `next/link` - Navigation

**Props:**
```tsx
interface TrustPanelProps {
  listing: MarketplaceListing;
}
```

**Key Functions:**
```tsx
function generateMockTraceability(listing: MarketplaceListing): TimelineEvent[]
function getStatusBadge()
function getStatusExplanation()
```

**Styling Patterns:**
```tsx
// Timeline dot colors
border-green-500  // authenticated
border-blue-500   // verified
border-primary    // listed
border-muted-foreground // created

// Timeline connector
<div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
```

**Performance Notes:**
- Timeline là collapsed by default (better UX)
- Lazy render timeline content

---

### MarketplaceItemCard.tsx (79 lines)

**Purpose:** Individual marketplace item card

**Features:**
- Image với favorite button
- Status badge overlay
- Category, price, signed-by info
- Hover effects (border + ring)
- Link to detail page

**Dependencies:**
- `next/image`, `next/link`
- `@/components/ui/card` - Card components
- `@/components/ui/badge` - Badge
- `FavoriteButton` - Custom component

**Props:**
```tsx
interface MarketplaceItemCardProps {
  item: MarketplaceListing;
  className?: string;
}
```

**Styling Patterns:**
```tsx
// Hover effect
hover:border-accent hover:ring-2 hover:ring-accent hover:ring-offset-2

// Status badge positioning
<div className="absolute top-2 left-2">
```

---

### MarketplaceFilters.tsx, MarketplaceSearch.tsx, MarketplaceSort.tsx

**Purpose:** Filter, search, và sort controls cho marketplace

**Features:**
- Category filters
- Price range
- Authentication status filter
- Search input
- Sort dropdown

**Dependencies:**
- Various UI components
- Form libraries

---

### FavoriteButton.tsx, WatchlistButton.tsx

**Purpose:** Interactive buttons cho favorites và watchlist

**Features:**
- Toggle state
- LocalStorage persistence
- Icon toggle (outline → filled)

---

### CompareDrawer.tsx

**Purpose:** Side drawer để compare multiple items

**Features:**
- Sheet/Drawer UI
- Side-by-side comparison
- Spec comparison table

---

### AdvancedFilters.tsx

**Purpose:** Advanced filtering options

**Features:**
- Date range
- Multiple category selection
- Price range slider

---

## 3. Consign Components

**Location:** `apps/web/src/components/consign/`

### ConsignForm.tsx

**Purpose:** Main consignment form container

**Features:**
- Multi-step form wizard
- Form state management
- Validation
- Auto-save drafts
- Progress indicator

**Dependencies:**
- `react-hook-form`
- `zod` - Validation
- Draft persistence

---

### ConsignFormFields.tsx

**Purpose:** Form field components cho consign form

**Features:**
- Text inputs
- Textareas
- Select dropdowns
- File uploads
- Controlled components

---

### DraftManager.tsx

**Purpose:** Draft save/load/delete management

**Features:**
- LocalStorage operations
- Draft list display
- Load/delete actions

---

### DraftStatusBar.tsx

**Purpose:** Shows draft auto-save status

**Features:**
- "Saving..." indicator
- "Saved at [time]" display
- Auto-update on form changes

---

### FormProgress.tsx

**Purpose:** Step indicator cho multi-step form

**Features:**
- Step numbers
- Progress bar
- Active step highlighting
- Completed steps checkmarks

---

### FileUpload.tsx

**Purpose:** File upload component với preview

**Features:**
- Drag-and-drop
- Multiple file upload
- Image preview
- File size validation
- File type validation

---

### sections/

Các section components cho từng step của form:
- `YourInformationSection.tsx` - Personal info
- `ItemDetailsSection.tsx` - Item specs
- `ProvenanceSection.tsx` - Item history
- `SignatureInformationSection.tsx` - Signature details
- `EstimatedValueSection.tsx` - Value estimation
- `AdditionalInformationSection.tsx` - Extra notes
- `TermsSection.tsx` - Terms acceptance

---

## 4. Verify Components

**Location:** `apps/web/src/components/verify/`

### VerifyResult.tsx

**Purpose:** Display verification result

**Features:**
- Status display (Qualified/Inconclusive/Disqualified)
- Certificate info
- Authentication details
- Item info

---

### VerifyResultEnhanced.tsx

**Purpose:** Enhanced version với more details

**Features:**
- All of VerifyResult
- Plus: AI score visualization
- Detailed analysis
- Timeline

---

### QRScanInput.tsx

**Purpose:** QR code scanner input

**Features:**
- Camera access
- QR code detection
- Manual input fallback
- Paste from clipboard

---

### VerifyHistoryEnhanced.tsx

**Purpose:** Verification history list

**Features:**
- List of past verifications
- LocalStorage persistence
- Grouping by date
- Clear all option

---

### VerifyEmptyState.tsx

**Purpose:** Empty state when no verification yet

**Features:**
- Illustration/icon
- CTA to verify
- Instructions

---

### VerifyErrorState.tsx

**Purpose:** Error state display

**Features:**
- Error message
- Retry button
- Support link

---

### VerifyLoading.tsx

**Purpose:** Loading state

**Features:**
- Skeleton UI
- Progress indicator
- "Analyzing..." text

---

### StatusExplanations.tsx

**Purpose:** Explains what each status means

**Features:**
- Qualified explanation
- Inconclusive explanation
- Disqualified explanation
- Collapsible sections

---

### InconclusiveUpsell.tsx

**Purpose:** Upsell cho inconclusive results

**Features:**
- Call to action
- "Contact expert" button
- Additional verification options

---

## 5. Content Components

**Location:** `apps/web/src/components/content/`

### PostCard.tsx

**Purpose:** Blog post card

**Features:**
- Featured image
- Title, excerpt
- Author, date
- Read time
- Tags
- Link to full post

---

### EventCard.tsx

**Purpose:** Event card

**Features:**
- Event image
- Title, description
- Date, time, location
- RSVP/Register button

---

### FeaturedPost.tsx

**Purpose:** Large featured post card

**Features:**
- Larger format
- More prominent image
- Full excerpt
- "Featured" badge

---

### AnchorSection.tsx

**Purpose:** Content section với anchor link

**Features:**
- Auto-generated ID
- Scroll target
- Section heading

---

### AnchorNav.tsx

**Purpose:** Sticky navigation cho anchor links

**Features:**
- Table of contents
- Smooth scroll
- Active section highlighting

---

### AutoTOC.tsx

**Purpose:** Auto-generated table of contents

**Features:**
- Parses headings từ content
- Generates navigation
- Nested structure

---

### PartnerBlock.tsx

**Purpose:** Partner/sponsor display block

**Features:**
- Logo display
- Partner info
- Link to partner site

---

## 6. Sections Components

**Location:** `apps/web/src/components/sections/`

### SectionHeader.tsx (44 lines)

**Purpose:** Reusable section header với optional eyebrow, title, description, CTA

**Props:**
```tsx
interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
}
```

**Styling:** Uses `text-h2` utility class

---

### BentoFeatureGrid.tsx (56 lines)

**Purpose:** Bento-style feature grid (1 large + 2 small layout)

**Features:**
- Responsive layout
- First item spans 2 columns
- Next 2 items stack in 1 column
- Uses `BentoCard` component

**Props:**
```tsx
interface BentoFeatureGridProps {
  title?: string;
  subtitle?: string;
  items: FeatureItem[];
  className?: string;
}
```

---

### BentoCard.tsx

**Purpose:** Individual bento card

**Features:**
- Image (optional)
- Title, description
- CTA link
- Hover effects

---

### IconFeatureList.tsx

**Purpose:** List of features với icons

**Features:**
- Icon + text layout
- Vertical list
- Used in feature sections

---

### MediaCard.tsx

**Purpose:** Media content card (video, image)

**Features:**
- Media player/viewer
- Caption
- Lightbox support

---

### MediaStrip.tsx

**Purpose:** Horizontal media gallery

**Features:**
- Scrollable strip
- Multiple media items
- Thumbnail view

---

### SplitHero.tsx

**Purpose:** Split hero layout (text + image)

**Features:**
- 50/50 split
- Responsive (stacks on mobile)
- Used for landing pages

---

### StatRow.tsx

**Purpose:** Statistics display row

**Features:**
- Multiple stat blocks
- Large numbers
- Labels
- Optional icons

---

### TeamGrid.tsx

**Purpose:** Team member grid (reusable)

**Features:**
- Similar to TeamSection
- Accepts data as props
- Reusable across pages

---

### Ticker.tsx

**Purpose:** Scrolling ticker/marquee

**Features:**
- Infinite scroll
- Logos/text
- Smooth animation

---

### DataTable.tsx

**Purpose:** Generic data table component

**Features:**
- Sortable columns
- Pagination
- Row selection
- Custom cell renderers

---

### ContentSection.tsx

**Purpose:** Generic content section wrapper

**Features:**
- Consistent padding
- Container max-width
- Background options

---

## 7. Shared Components

**Location:** `apps/web/src/components/shared/`

### EmptyState.tsx

**Purpose:** Generic empty state component

**Features:**
- Icon/illustration
- Message
- Optional CTA
- Reusable across app

**Props:**
```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

---

### LoadingState.tsx

**Purpose:** Generic loading state

**Features:**
- Spinner
- Loading message
- Skeleton variants

---

### LazyImage.tsx

**Purpose:** Lazy-loaded image với blur placeholder

**Features:**
- Intersection Observer
- Blur-up effect
- Error handling

---

### Media.tsx

**Purpose:** Generic media component (image/video)

**Features:**
- Auto-detects type
- Responsive
- Lazy loading

---

### ResultTable.tsx

**Purpose:** Results display table

**Features:**
- Tabular data display
- Responsive table
- Used in verification results

---

## 8. Shell Components

**Location:** `apps/web/src/components/shell/`

### Header.tsx

**Purpose:** Main site header/navbar

**Features:**
- Logo
- Navigation links
- CTA button
- Mobile menu toggle

---

### Footer.tsx

**Purpose:** Site footer

**Features:**
- Link columns
- Social media links
- Copyright
- Newsletter signup

---

### AppSidebar.tsx

**Purpose:** Sidebar navigation (admin dashboard)

**Features:**
- Navigation items
- Active state
- Collapsible
- User info

---

### AppTopbar.tsx

**Purpose:** Top bar (admin dashboard)

**Features:**
- Search
- Notifications
- User menu
- Breadcrumbs

---

### ThemeToggle.tsx

**Purpose:** Dark/light mode toggle

**Features:**
- Theme switch
- Icon animation
- LocalStorage persistence

**Note:** Currently Relique.co is dark-only, nhưng component exists cho future

---

## 9. UI Components

**Location:** `apps/web/src/components/ui/`

Đây là các wrapper components cho shadcn/ui. **NEVER EDIT THESE FILES DIRECTLY**.

### Quy tắc:
- Các file này được generate bởi shadcn/ui CLI
- Nếu cần customize, tạo wrapper trong `apps/web/src/components/`
- Refer to `.cursor/rules/shadcn-guard.mdc` cho guidelines

### Components:
- `accordion.tsx` - Collapsible sections
- `alert.tsx` - Alert/notification boxes
- `badge.tsx` - Status badges
- `button.tsx` - Buttons
- `card.tsx` - Card containers
- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Dropdown menus
- `form.tsx` - Form components
- `input.tsx` - Text inputs
- `label.tsx` - Form labels
- `select.tsx` - Select dropdowns
- `sheet.tsx` - Side sheets/drawers
- `skeleton.tsx` - Loading skeletons
- `table.tsx` - Tables
- `tabs.tsx` - Tab navigation
- `textarea.tsx` - Multi-line text input

---

## 10. Shared UI Package

**Location:** `packages/ui/src/`

### shadcn/ui/ (NEVER EDIT)

Base shadcn/ui components. Refer to section 9 above.

---

### primitives/

**Purpose:** Layout primitives và building blocks

#### container.tsx
- Max-width container wrapper
- Padding variants

#### section.tsx (24 lines)
```tsx
export type SectionProps = {
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
};
```
- Vertical padding presets: sm (py-10), md (py-14), lg (py-16)
- Uses Radix `Slot` cho `asChild` pattern

#### stack.tsx
- Vertical/horizontal stack layout
- Gap control
- Alignment options

#### divider.tsx
- Horizontal/vertical dividers
- Styled separators

#### surface.tsx
- Elevated surface wrapper
- Border + shadow variants

#### kbd.tsx
- Keyboard shortcut display
- Styled `<kbd>` tag

#### page-header.tsx
- Standard page header layout
- Breadcrumbs + title + actions

---

### modules/

**Purpose:** Pre-built, reusable modules

#### bento-grid.tsx (40 lines)
```tsx
export function BentoGrid() // Grid container (12 cols)
export function BentoTile({ colSpan, rowSpan }) // Individual tile
```
- 12-column grid system
- Dynamic span control
- Safe bounds (1-12)

#### feature-tiles.tsx
- Feature grid layout
- Icon + title + description
- Multiple columns support

#### hero-centered.tsx
- Centered hero layout
- Title + subtitle + CTA
- Background options

#### partner-strip.tsx
- Partner logo strip
- Horizontal scroll
- Grayscale hover

#### quick-actions.tsx
- Action card grid
- Icon + label + link

#### team-grid.tsx
- Team member grid
- Photo + name + role + bio

#### trust-panel.tsx
- Verification trust indicators
- Timeline
- Status badges

---

### form/

#### form.tsx
- Form context provider
- react-hook-form integration

#### fields/text-field.tsx
- Text input với label + error
- Controlled component

#### fields/textarea-field.tsx
- Textarea với label + error
- Auto-resize option

#### upload-manager/upload-manager.tsx
- File upload manager
- Multiple files
- Progress tracking
- Preview grid

---

### table/

#### data-table.tsx
- Generic data table
- @tanstack/react-table integration
- Sortable
- Filterable
- Pagination

---

### states/

#### empty-state.tsx
- Empty state component
- Icon + message + CTA

#### error-state.tsx
- Error display
- Retry button

#### skeletons.tsx
- Loading skeleton components
- Multiple variants (card, list, table)

---

### media/

#### media.tsx
- Generic media display
- Image/video detection
- Responsive sizing

---

## 📊 Component Statistics

### By Domain:
- Home: 12 components
- Marketplace: 13 components
- Consign: 7 main + 7 sections = 14 components
- Verify: 9 components
- Content: 8 components
- Sections: 12 components
- Shared: 5 components
- Shell: 5 components
- UI (shadcn wrappers): 19 components

**Total:** ~97 components

### By Complexity (lines of code):
- Simple (< 50 lines): ~35%
- Medium (50-150 lines): ~45%
- Complex (> 150 lines): ~20%

### By Type:
- Display/Presentation: ~60%
- Interactive/Stateful: ~30%
- Layout/Structural: ~10%

---

## 🎯 Component Usage Guidelines

### Khi nào tạo component mới?

✅ **CREATE NEW khi:**
- Logic có thể reuse ở nhiều nơi
- Component > 200 lines (break down)
- Có state/behavior phức tạp riêng
- Có thể test independently

❌ **DON'T CREATE khi:**
- Chỉ dùng 1 lần duy nhất
- Quá đơn giản (< 10 lines JSX)
- Chỉ là styling variant của component có sẵn

### Naming Conventions:

```
PascalCase for component names
kebab-case for file names (optional, but consistent)
Descriptive names: MarketplaceItemCard, not Card
Suffix với type: Button, Modal, Section, etc.
```

### File Organization:

```
component/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Tests (if complex)
├── types.ts               # Type definitions (if many)
└── utils.ts               # Helper functions (if needed)
```

### Import Order:

```tsx
// 1. React imports
import { useState, useEffect } from "react";

// 2. External libraries
import { motion } from "framer-motion";
import Link from "next/link";

// 3. Internal components
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/sections/SectionHeader";

// 4. Types
import type { Item } from "@/lib/types";

// 5. Utilities
import { cn } from "@/lib/utils";
```

---

## 🔗 Tài liệu liên quan

- [THEME.md](./THEME.md) - Design system guidelines
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project structure
- [THEME_IMPROVEMENTS.md](./THEME_IMPROVEMENTS.md) - Improvement roadmap

---

**Maintained by:** Relique.co Development Team  
**Questions?** Xem implementation examples trong source code
