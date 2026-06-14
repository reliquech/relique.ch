# Relique.co - Frontend Application

**Version:** 1.1  
**Status:** Production-Ready  
**Type:** Full-Stack Ready (Frontend Complete)

---

## 📋 Tổng quan

Relique.co là platform probabilistic authentication cho sports collectibles và memorabilia. Frontend application với design system hoàn chỉnh, component library có thể scale, và comprehensive documentation.

### Đặc điểm chính

- **Modern Stack:** Next.js 16+ App Router, TypeScript, Tailwind CSS
- **Design System:** Comprehensive theme với motion library, utilities, và documentation
- **Component Library:** 97+ components với clear patterns và guidelines
- **Theme System:** Dark-only với standardized colors, typography, và animations
- **Developer Tools:** Motion variants, theme utilities, typography classes
- **Responsive:** Desktop-first design với mobile support
- **Single App:** Public site + Admin CRM trong một Next.js app (port 1300)
- **Documentation:** Complete guides cho design system, components, và improvements

---

## 🛠️ Tech Stack

### Core
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI + Tailwind)
- **Forms:** React Hook Form + Zod
- **State:** React hooks + localStorage
- **Theme:** Dark-only (forced dark mode)

### Design System
- **Theme:** rounded-0 (no border radius)
- **Colors:** Navy/blue primary + Gold accent
- **Modes:** Dark-only (single-tone dark)
- **Typography:** Work Sans (body/UI), Zapf Renaissance (display/brand)
- **Responsive:** Desktop-first design

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone repository
git clone [repository-url]
cd relique.co

# Install dependencies
npm install

# Run development server (port 1300)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development

- App: `http://localhost:1300`
- Admin CRM: `http://localhost:1300/admin`

### Database / Supabase

- **Migrations:** `supabase/migrations/` (canonical path, 001–035 incremental chain)
- **Docs:** [`supabase/MIGRATIONS.md`](supabase/MIGRATIONS.md) (apply workflow), [`supabase/MIGRATION_MANIFEST.md`](supabase/MIGRATION_MANIFEST.md) (inventory), [`supabase/STORAGE_GUIDE.md`](supabase/STORAGE_GUIDE.md) (buckets)
- **Brownfield:** keep incremental chain on existing DBs; see manifest for overlap notes and baseline deferral

---

## 📁 Project Structure

```
relique.co/
├── apps/
│   ├── web/                      # Main Next.js application (port 3000)
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── (home)/           # Home route group
│   │   │   │   ├── page.tsx      # Home page (server component)
│   │   │   │   └── components/   # Home sections (17 files)
│   │   │   ├── marketplace/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [slug]/page.tsx
│   │   │   │   └── components/   # Marketplace wrappers
│   │   │   ├── verify/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/   # Verify wrappers
│   │   │   ├── consign/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/   # Consign wrappers
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── posts/
│   │   │   ├── events/
│   │   │   ├── terms-policies/
│   │   │   ├── (admin)/          # Admin routes (requires dev flag)
│   │   │   └── layout.tsx        # Root layout
│   │   ├── src/
│   │   │   ├── fonts/            # Local fonts
│   │   │   │   └── Zapf Renaissance Book.ttf
│   │   │   ├── components/       # Reusable components (type-based)
│   │   │   │   ├── logo/         # 3 brand logo components
│   │   │   │   ├── cards/        # 10 card components
│   │   │   │   ├── filters/      # 4 filter components
│   │   │   │   ├── inputs/       # 3 input components
│   │   │   │   ├── states/       # 4 state components
│   │   │   │   ├── results/      # 3 result components
│   │   │   │   ├── primitives/   # 6 UI primitives
│   │   │   │   ├── interactive/  # 3 interactive features
│   │   │   │   ├── display/      # 7 display components
│   │   │   │   ├── grids/        # 3 grid layouts
│   │   │   │   ├── layout/       # 4 layout wrappers
│   │   │   │   ├── forms/        # 2 form components
│   │   │   │   ├── form-sections/# 7 form sections
│   │   │   │   ├── drafts/       # 2 draft components
│   │   │   │   ├── lists/        # 2 list components
│   │   │   │   ├── blocks/       # 1 content block
│   │   │   │   ├── navigation/   # 3 navigation components
│   │   │   │   ├── timeline/     # 1 timeline component
│   │   │   │   ├── upsells/      # 1 upsell component
│   │   │   │   ├── shared/       # 5 shared utilities
│   │   │   │   ├── shell/        # 2 shell components (Header, Footer)
│   │   │   │   └── ui/           # 20 shadcn/ui components
│   │   │   ├── lib/              # Utilities, services, hooks
│   │   │   │   ├── hooks/        # Custom hooks
│   │   │   │   ├── services/     # Mock services
│   │   │   │   ├── utils/        # Utility functions
│   │   │   │   ├── validations/  # Zod schemas
│   │   │   │   ├── motion-variants.ts  # Animation presets
│   │   │   │   └── theme-utils.ts      # Theme helpers
│   │   │   ├── data/             # Static data
│   │   │   └── mocks/            # Mock data (JSON)
│   │   └── public/               # Static assets
│   ├── admin/                    # Admin dashboard (port 3001)
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── login/            # Login page
│   │   │   └── admin/            # Admin routes (Overview, Dashboard, Submissions, Profile)
│   │   └── src/
│   │       ├── components/       # React components
│   │       └── lib/              # Utilities, services
│   └── docs/                     # Documentation app
├── packages/
│   ├── shared/                   # Shared schemas, types, storage
│   ├── ui/                       # Shared UI components
│   ├── eslint-config/            # ESLint configs
│   └── typescript-config/        # TypeScript configs
├── docs/                         # Project documentation
│   ├── THEME.md                  # Design system guide (500+ lines)
│   ├── COMPONENT_STRUCTURE.md    # Component inventory (800+ lines)
│   └── THEME_IMPROVEMENTS.md     # Improvement roadmap (900+ lines)
└── README.md
```

### Route Groups

- **`(public)`:** Public pages (Home, Verify, Marketplace, Consign, About, Contact, Posts, Events)
- **`(portal)`:** Admin dashboard (Login, Overview, Dashboard, Submissions, Profile)
- **`(admin)`:** Admin-lite (Dashboard, Marketplace CRUD, Content CRUD)
- **`(legal)`:** Legal pages (Policies, Terms)

---

## 🎯 Features

### Public Pages

- **Home (`/`):** Module-based layout với bento grid, hero section, featured items/posts/events
- **Verify (`/verify`):** Input code, loading ~5s, result table với status explanations, save history
- **Marketplace (`/marketplace`):** List với search, filters, sort, grid/list toggle, pagination
- **Marketplace Detail (`/marketplace/[slug]`):** Gallery, metadata, trust panel, related items, favorite button
- **Consign (`/consign`):** Long form, drag/drop upload, autosave draft, validation
- **About (`/about`):** Anchor navigation, 4 sections, partner block, team grid
- **Policies/Terms:** Long-form readable content với TOC
- **Contact (`/contact`):** Simple form với validation
- **Posts/Events:** Content hub với list + detail pages

### Admin Dashboard (Separate App - Port 3001)

Admin dashboard là một Next.js app riêng trong monorepo, chạy trên port 3001:

- **Login (`/login`):** 3 login methods (Email/Password, Magic Link, Social) - UI tabs, mock authentication
- **Overview (`/admin`):** Home page với quick stats và quick actions
- **Dashboard (`/admin/dashboard`):** Welcome message, quick stats, recent activity
- **Submissions (`/admin/submissions`):** Consign drafts + verify history list với advanced search và table personalization
- **Profile (`/admin/profile`):** User profile, data export/reset

**Chạy admin dashboard:**
```bash
pnpm dev:admin
# hoặc
cd apps/admin
pnpm dev
```

### Admin-Lite (Mock)

**Lưu ý:** Admin chỉ accessible khi set `NEXT_PUBLIC_ENABLE_ADMIN=true` trong `.env.local`

- **Admin Dashboard (`/admin`):** Admin shell
- **Admin Marketplace (`/admin/marketplace`):** CRUD mock cho listings (localStorage)
- **Admin Content (`/admin/content`):** CRUD mock cho posts/events (localStorage)

---

## 🎨 Design System

**Complete Documentation:** See [`docs/THEME.md`](docs/THEME.md)

### Theme

- **Colors:** Navy (#0F2854), Primary Blue (#1C4D8D), Accent Blue (#498BC4), Highlight Ice (#BDE8F5)
- **Surfaces:** bgDark (#0A0A0A), cardDark (#121212), borderDark (#333333)
- **Typography:** Work Sans (body/UI), Zapf Renaissance (display/brand wordmark)
- **Fonts:** `apps/web/src/fonts/Zapf Renaissance Book.ttf`
- **Motion:** Framer Motion với centralized variants library
- **Border Radius:** rounded-0 (no border radius)

### Developer Tools

**Motion Variants Library** (`apps/web/src/lib/motion-variants.ts`)
- 15+ pre-built animation patterns (fadeInUp, slideInLeft, scaleIn, stagger, hover)
- Easing presets (premium, sharp, linear)
- Viewport configurations

**Theme Utilities** (`apps/web/src/lib/theme-utils.ts`)
- Status helpers (getStatusClasses, getStatusBadge, getStatusColor)
- Typography helpers (getMetadataClasses, getLinkArrowClasses)
- Formatting functions (formatPrice, formatDate, getRelativeTime)

**Typography Classes** (`apps/web/src/app/globals.css`)
- Display: .text-display-hero, .text-display-section
- Cards: .text-card-title, .text-card-subtitle
- Metadata: .text-metadata, .text-metadata-primary
- Focus rings: .focus-ring-primary, .focus-ring-ice

### Component Architecture

**Total:** ~97 components organized by **type-based pattern**

#### Organization Strategy
- **Route Sections:** Page-specific components in `app/[route]/components/`
- **Reusable Components:** Type-based organization in `src/components/`
- **No Domain Silos:** Components grouped by type (cards, filters, inputs) not by domain

#### Component Structure

```
apps/web/src/
├── app/                          # Route-specific components
│   ├── (home)/
│   │   └── components/           # Home page sections (17 files)
│   │       ├── HeroSection.tsx
│   │       ├── MarketplaceSection.tsx
│   │       ├── DualBlocks.tsx
│   │       ├── dual-blocks/      # Block sub-components
│   │       ├── marketplace/      # Marketplace sub-components
│   │       └── testimonials/     # Testimonials sub-components
│   ├── marketplace/
│   │   └── components/           # Marketplace wrappers
│   ├── verify/
│   │   └── components/           # Verify wrappers
│   └── consign/
│       └── components/           # Consign wrappers
│
└── components/                   # Reusable by TYPE (not domain)
    ├── logo/            (3)      # Brand logo components
    │   ├── ReliqueMark.tsx        # Logo icon (R. mark)
    │   ├── ReliqueWordmark.tsx    # Logo wordmark with Zapf Renaissance
    │   └── ReliqueLogo.tsx        # Combined mark + wordmark
    ├── cards/           (10)     # ALL cards across all domains
    │   ├── TestimonialCard.tsx
    │   ├── HomeCarouselCard.tsx
    │   ├── ListingCard.tsx
    │   ├── FeaturedItemCard.tsx
    │   ├── PostCard.tsx
    │   ├── EventCard.tsx
    │   ├── AboutCard.tsx
    │   ├── BentoCard.tsx
    │   └── MediaCard.tsx
    ├── filters/         (4)      # ALL filter components
    │   ├── CategoryFilter.tsx
    │   ├── SortFilter.tsx
    │   ├── AdvancedFilters.tsx
    │   └── MarketplaceSearch.tsx
    ├── inputs/          (3)      # Form inputs
    │   ├── VerifyInput.tsx
    │   ├── QRScanInput.tsx
    │   └── FileUpload.tsx
    ├── states/          (4)      # Loading, empty, error states
    │   ├── VerifyStates.tsx
    │   ├── VerifyEmptyState.tsx
    │   ├── VerifyErrorState.tsx
    │   └── VerifyLoading.tsx
    ├── results/         (3)      # Result displays
    ├── primitives/      (6)      # UI primitives
    │   ├── StatusBadge.tsx
    │   ├── ScrollProgressBar.tsx
    │   ├── DraggableCarousel.tsx
    │   ├── FormProgress.tsx
    │   ├── Pagination.tsx
    │   └── ListingPageHeader.tsx
    ├── interactive/     (3)      # Interactive features
    │   ├── FavoriteButton.tsx
    │   ├── WatchlistButton.tsx
    │   └── CompareDrawer.tsx
    ├── display/         (7)      # Display components
    ├── grids/           (3)      # Grid layouts
    │   ├── BentoFeatureGrid.tsx
    │   ├── TeamGrid.tsx
    │   └── IconFeatureList.tsx
    ├── layout/          (4)      # Layout wrappers
    │   ├── SectionHeader.tsx
    │   ├── ContentSection.tsx
    │   ├── SplitHero.tsx
    │   └── MediaStrip.tsx
    ├── forms/           (2)      # Form components
    │   ├── ConsignForm.tsx
    │   └── ConsignFormFields.tsx
    ├── form-sections/   (7)      # Multi-step form sections
    │   ├── YourInformationSection.tsx
    │   ├── ItemDetailsSection.tsx
    │   └── ... (5 more)
    ├── drafts/          (2)      # Draft management
    │   ├── DraftManager.tsx
    │   └── DraftStatusBar.tsx
    ├── lists/           (2)      # List components
    ├── blocks/          (1)      # Content blocks
    ├── navigation/      (3)      # Navigation components
    ├── timeline/        (1)      # Timeline components
    ├── upsells/         (1)      # Upsell components
    ├── shared/          (5)      # Shared utilities
    │   ├── EmptyState.tsx
    │   ├── LoadingState.tsx
    │   ├── LazyImage.tsx
    │   ├── Media.tsx
    │   └── ResultTable.tsx
    ├── shell/           (2)      # App shell
    │   ├── Header.tsx
    │   └── Footer.tsx
    └── ui/              (20)     # shadcn/ui components
        ├── button.tsx
        ├── card.tsx
        └── ... (18 more)
```

#### Key Benefits
- 🔍 **Easy Discovery:** Find components by type (all cards in `cards/`, all filters in `filters/`)
- ♻️ **High Reusability:** Components not tied to specific domains
- 📏 **Clear Boundaries:** Route-specific vs reusable components
- 🎯 **Consistent Patterns:** Same organization across entire codebase
- 🚀 **Scalable:** Adding new components follows clear mental model

#### Guidelines
- **Component Inventory:** [`docs/COMPONENT_STRUCTURE.md`](docs/COMPONENT_STRUCTURE.md)
- **Component Rules:** File size ≤200 lines, shadcn guard, composition over inheritance
- **Improvement Roadmap:** [`docs/THEME_IMPROVEMENTS.md`](docs/THEME_IMPROVEMENTS.md)

---

## 📝 Development Guidelines

### Code Quality

- **TypeScript:** Strict mode, no `any` types
- **Linting:** ESLint với max-warnings 0
- **Formatting:** Prettier (nếu configured)
- **File Size:** Components ≤ 200 lines

### Component Structure

```typescript
// Example component structure
"use client";

import { ComponentProps } from "react";
import { BaseComponent } from "@/components/ui/base";

type Props = ComponentProps<typeof BaseComponent> & {
  // Custom props
};

export function MyComponent({ ...props }: Props) {
  return <BaseComponent {...props} />;
}
```

### Mock Data

- **Location:** `src/mocks/*.json`
- **Services:** `src/lib/services/*Service.ts`
- **Storage:** `packages/shared/src/storage/*` (typed localStorage helpers with versioning)

### State Management

- **Client State:** React hooks (`useState`, `useEffect`)
- **Persistence:** localStorage với versioned keys (`relique.v1.*`)
- **Shared Types:** `@repo/shared` package (schemas + types + storage)
- **Form State:** React Hook Form + Zod validation

---

## 🧪 Testing

### Smoke Tests

```bash
# Run smoke tests
cd apps/web
pnpm test
```

Smoke tests cover critical flows:
- Login mock → Dashboard (app-portal)
- Verify → Result → Save history
- Marketplace → Detail → Favorite
- Consign → Upload → Autosave → Submit
- Storage sync between web and app-portal (shared keys)

### Manual Testing

See `UAT_CHECKLIST.md` for manual testing checklist.

---

## 📚 Documentation

### Core Documentation

- **README.md** - Project overview và setup
- **docs/PROJECT_STRUCTURE.md** - Detailed project structure
- **docs/MONOREPO_CONVENTIONS.md** - Monorepo conventions

### Design System

- **docs/THEME.md** - Complete design system guidelines (500+ lines)
- **docs/COMPONENT_STRUCTURE.md** - Component inventory (800+ lines, ~97 components)
- **docs/THEME_IMPROVEMENTS.md** - Improvement roadmap (900+ lines)

### Developer Tools

- **Motion Variants:** `apps/web/src/lib/motion-variants.ts` (370+ lines, 15+ variants)
- **Theme Utilities:** `apps/web/src/lib/theme-utils.ts` (440+ lines, helpers & formatters)
- **Typography Classes:** `apps/web/src/app/globals.css` (extended utilities)

### Contract & Process

- **docs/SOW_OUTLINE.md** - Statement of Work
- **docs/SCOPE_MATRIX.md** - Scope boundaries
- **docs/ACCEPTANCE_CRITERIA.md** - Acceptance criteria
- **docs/DEFINITION_OF_DONE.md** - DoD checklist
- **docs/UAT_CHECKLIST.md** - Testing checklist
- **docs/CHANGE_CONTROL.md** - Change process
- **docs/RISK_REGISTER.md** - Risk management
- **docs/SIGN_OFF_PROCESS.md** - Sign-off process

---

## ⚠️ Known Limitations

### Mock-Only

- **Authentication:** Mock - nhập bất kỳ email/password đều login được
- **Verification:** Result là mock - không có real authentication logic
- **Marketplace:** Data là mock - không có real inventory
- **Consignment:** Submission là mock - không có real processing

### LocalStorage

- **Data Persistence:** Tất cả data persist trong localStorage (browser only)
- **Storage Keys:** Versioned keys (`relique.v1.*`) - clean slate approach (no migration from old keys)
- **Storage Sync:** Web app và app-portal share data qua cùng storage keys (localStorage sync)
- **File Uploads:** Chỉ lưu metadata (name, size, type) - không lưu binary files vào localStorage
- **Blob URLs:** File preview URLs có thể mất khi reload (chỉ lưu metadata)
- **Session:** Session chỉ lưu trong localStorage, không secure
- **Size Limits:** Guardrails để tránh localStorage quá lớn (max 200 items/key, 100KB/item)

### Frontend-Only

- **No Backend:** Không có backend server, không có API endpoints
- **No Database:** Không có database, không có persistent storage
- **No Real-time:** Không có real-time updates

Xem `KNOWN_LIMITATIONS.md` để biết chi tiết.

---

## 🔧 Environment Variables

Tạo file `.env.local` trong `apps/web/`:

```env
# Optional: Add environment variables here
# Currently no required env vars (all mock data)
```

---

## 🚢 Build & Deploy

### Build

```bash
# Build web app
cd apps/web
pnpm build

# Build from root
pnpm build --filter=web
```

### Production

```bash
# Start production server
pnpm start
```

**Note:** Application chưa ready cho production deployment (frontend-only, mock data).


---

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Implement feature (follow guidelines)
3. Test locally
4. Submit for review

### Code Review

- TypeScript errors = blocker
- Linting errors = blocker
- File size > 200 lines = refactor required
- Missing tests = review required

---

## 📄 License

[To be defined per contract]

---

## 📞 Contact

[Contact information]

---

**Last Updated:** 2026-01-19  
**Version:** 1.1  
**Maintained by:** Relique.co Development Team
