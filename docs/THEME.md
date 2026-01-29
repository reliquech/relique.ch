# Relique.co Design System & Theme Guidelines

**Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** Production

---

## 📋 Mục lục

1. [Triết lý Thiết kế](#1-triết-lý-thiết-kế)
2. [Hệ thống Màu sắc](#2-hệ-thống-màu-sắc)
3. [Typography](#3-typography)
4. [Motion System](#4-motion-system)
5. [Component Patterns](#5-component-patterns)
6. [Layout Guidelines](#6-layout-guidelines)
7. [Code Templates](#7-code-templates)
8. [Best Practices](#8-best-practices)
9. [Đề xuất cải tiến](#9-đề-xuất-cải-tiến)

---

## 1. Triết lý Thiết kế

### 1.1 Core Concept

**"Capital Markets meet Sports Heritage"**

Relique.co kết hợp sự sang trọng của thị trường vốn (Capital Markets) với di sản thể thao (Sports Heritage), tạo nên một nền tảng xác thực đồ sưu tầm thể thao với tiêu chuẩn cao nhất.

### 1.2 Brand Identity

- **Institutional Grade**: Thiết kế chuyên nghiệp như các nền tảng tài chính
- **Forensic Tech**: Nhấn mạnh công nghệ AI và khoa học phân tích
- **Transparent**: Minh bạch trong mọi thông tin và quy trình
- **High-End**: Sang trọng, không phô trương, tinh tế

### 1.3 Visual Language

#### Đặc điểm chính:
- **Diagonal Cuts**: Các đường chéo tạo chiều sâu và năng động
- **High Contrast**: Tương phản cao giữa dark backgrounds và blue accents
- **Sharp Edges**: Không bo góc (`rounded-none`), tạo cảm giác sắc sảo, chính xác
- **Layered Depth**: Sử dụng gradients, overlays, và borders để tạo chiều sâu

#### Target Audience:
- **Institutional Investors**: Các nhà đầu tư tổ chức tìm kiếm alternative assets
- **Private Collectors**: Người sưu tầm cá nhân với khối tài sản lớn
- **Sports Dealers**: Các dealer chuyên nghiệp trong ngành memorabilia
- **Sports Historians**: Các chuyên gia và nhà sử học thể thao

---

## 2. Hệ thống Màu sắc

### 2.1 Primary Palette

```css
/* Brand Colors */
--relique-navy: #0F2854;           /* Navy chủ đạo */
--relique-primary-blue: #1C4D8D;   /* Blue chính cho CTA, highlights */
--relique-accent-blue: #498BC4;    /* Blue nhạt cho hover, secondary */
--relique-highlight-ice: #BDE8F5;  /* Ice blue cho giá trị cao, AI scores */
```

#### Hướng dẫn sử dụng:

**Navy (`#0F2854`):**
- Background cho hero sections
- Overlay gradients
- Secondary CTA buttons
- **Khi nào dùng**: Sections cần tạo sự khác biệt với black background

**Primary Blue (`#1C4D8D`):**
- Primary CTA buttons
- Section titles (text accents)
- Status "Qualified"
- Links và interactive elements
- **Khi nào dùng**: Yếu tố quan trọng nhất cần attention

**Accent Blue (`#498BC4`):**
- Hover states cho buttons
- Secondary borders
- Decorative elements
- **Khi nào dùng**: Lighter touch, hover effects

**Highlight Ice (`#BDE8F5`):**
- Price tags (đặc biệt ≥ $1M)
- AI confidence scores
- Status "Verified" accents
- Premium feature highlights
- **Khi nào dùng**: Giá trị cao, thông tin quan trọng, success states

### 2.2 Surface Hierarchy

```css
/* Dark Surfaces */
--relique-bg-0: #0A0A0A;           /* Background chính - không pure black */
--relique-bg-1: #121212;           /* Cards, panels, elevated surfaces */
--relique-border: #333333;         /* Borders chính */
```

#### Hướng dẫn sử dụng:

```tsx
// Page background
<body className="bg-bgDark"> {/* #0A0A0A */}

// Card/Panel
<div className="bg-cardDark"> {/* #121212 */}

// Subtle borders
<div className="border border-borderDark"> {/* #333333 */}

// Ultra-subtle dividers
<div className="border-t border-white/5">
```

**Quy tắc z-index surfaces:**
- Level 0 (bg-0): Page background
- Level 1 (bg-1): Cards, panels
- Level 2: Modals, dropdowns (sử dụng `bg-cardDark` + higher opacity overlays)

### 2.3 Text Hierarchy

```css
/* Text Colors */
--relique-text-primary: #FFFFFF;   /* Text chính */
--relique-text-secondary: #B3B3B3; /* Text phụ, muted content */
```

```tsx
// Primary text (headings, important content)
<h1 className="text-white">

// Secondary text (descriptions, metadata)
<p className="text-textSec">

// Tertiary text (captions, footnotes)
<span className="text-white/40">
```

### 2.4 Semantic Colors

#### Status Colors

```tsx
// Qualified - Success
<Badge className="bg-green-600 text-white">Qualified</Badge>

// Inconclusive - Warning
<Badge className="bg-amber-600 text-white">Inconclusive</Badge>

// Disqualified - Error
<Badge className="bg-red-600 text-white">Disqualified</Badge>
```

**Mapping:**
- `qualified` → `bg-green-600/text-white`
- `inconclusive` → `bg-amber-600/text-white`
- `disqualified` → `bg-red-600/text-white`

#### Interactive States

```tsx
// Default button
bg-primaryBlue hover:bg-accentBlue

// Ghost/Secondary
border border-borderDark hover:bg-highlightIce hover:text-navy

// Danger/Delete
bg-red-600 hover:bg-red-700
```

### 2.5 Opacity Levels

Quy tắc cho white overlays:

```css
border-white/5   /* Ultra subtle dividers */
border-white/10  /* Subtle borders on cards */
border-white/20  /* Noticeable borders */
bg-white/10      /* Light overlay */
bg-white/40      /* Visible overlay */
text-white/40    /* Tertiary text */
text-white/60    /* Secondary muted text */
```

**Gradient Overlays:**

```tsx
// Image overlays (để text readable)
<div className="bg-gradient-to-br from-black/60 to-black/40" />

// Subtle diagonal background
<div className="bg-gradient-to-t from-cardDark to-transparent" />
```

---

## 3. Typography

### 3.1 Font Families

```css
/* Primary Font (Body, UI) */
font-family: 'Work Sans', sans-serif;
font-weight: 500; /* Default body weight */

/* Display Font (Hero, Large Titles) */
font-family: 'Times New Roman', Times, serif;
font-style: italic;
```

### 3.2 Typography Scale

#### Hero / Display Text (80px - 120px)

**Sử dụng:** Landing hero, flagship headlines

```tsx
<h1 
  className="text-5xl md:text-[80px] lg:text-[120px] font-medium tracking-tight leading-[0.85]"
  style={{ fontFamily: '"Times New Roman", Times, serif' }}
>
  Relique <span className="text-primaryBlue">you can rely on</span>
</h1>
```

**Đặc điểm:**
- Font: Times New Roman
- Style: `italic` (tùy context)
- Tracking: `tracking-tight`
- Leading: `leading-[0.85]` (tight line height)
- Weight: `font-medium` hoặc `font-normal`

#### Section Title (48px - 72px)

**Sử dụng:** Section headings, page titles

```tsx
<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
  Consigned <span className="text-primaryBlue">Marketplace</span>
</h2>
```

**Đặc điểm:**
- Font: Work Sans
- Weight: `font-bold` (700) hoặc `font-semibold` (600)
- Tracking: `tracking-tight`
- Accent: Wrap keywords với `<span className="text-primaryBlue">`

#### Subsection Title (32px - 48px)

```tsx
<h3 className="text-3xl md:text-4xl font-semibold tracking-tight">
  Meet Our Team
</h3>
```

#### Card Title (24px - 32px)

```tsx
<h4 className="text-2xl font-semibold group-hover:text-highlightIce transition-colors">
  Championship Jersey
</h4>
```

**Tip:** Add hover effect cho interactivity

#### Metadata / Labels (9px - 11px)

**Sử dụng:** Category tags, timestamps, small labels

```tsx
<span className="text-[10px] font-black uppercase tracking-[0.4em] text-primaryBlue">
  Curated Listings
</span>
```

**Đặc điểm:**
- Size: `text-[9px]`, `text-[10px]`, `text-[11px]`
- Weight: `font-black` (900)
- Transform: `uppercase`
- Tracking: `tracking-[0.3em]` đến `tracking-[0.4em]`
- Color: `text-primaryBlue` hoặc `text-highlightIce`

#### Body Text (16px)

```tsx
<p className="text-base font-medium leading-7 text-textSec">
  Lorem ipsum dolor sit amet...
</p>
```

### 3.3 Typography Utilities (globals.css)

```css
/* Pre-defined styles */
.text-h1 { @apply text-2xl md:text-3xl font-semibold tracking-tight; }
.text-h2 { @apply text-2xl md:text-3xl font-bold tracking-tight; }
.text-h3 { @apply text-2xl md:text-3xl font-semibold tracking-tight; }
.text-h4 { @apply text-xl md:text-2xl font-semibold tracking-tight; }
.text-body { @apply text-base leading-7; }
.text-caption { @apply text-sm text-muted-foreground; }
```

### 3.4 Best Practices

✅ **DO:**
- Sử dụng Times New Roman cho hero text để tạo sự khác biệt
- Uppercase + wide tracking cho metadata
- Combine bold weights với blue accents cho emphasis
- Use `leading-tight` cho large headings

❌ **DON'T:**
- Không mix quá nhiều font weights trong một section
- Tránh tracking quá rộng cho body text
- Không dùng Times New Roman cho body text (khó đọc)
- Tránh all-caps cho paragraphs dài

---

## 4. Motion System

### 4.1 Easing Functions

```typescript
// Premium Easing - Smooth, luxury feel
const premiumEasing = [0.16, 1, 0.3, 1];

// Sharp Easing - Quick interactions
const sharpEasing = "easeInOut";

// Linear - For infinite loops
const linearEasing = "linear";
```

**Khi nào dùng:**
- **Premium**: Page load animations, scroll reveals, major transitions
- **Sharp**: Button hovers, quick interactions, toggles
- **Linear**: Rotating elements, infinite scroll, loaders

### 4.2 Standard Animation Variants

#### Fade In Up

```tsx
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={fadeInUp}
>
```

#### Slide In (Left/Right)

```tsx
// From Left
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>

// From Right
<motion.div
  initial={{ opacity: 0, x: 50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
```

#### Scale Hover

```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -8 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
  className="group cursor-pointer"
>
```

#### Stagger Children

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

<motion.div variants={container} initial="hidden" whileInView="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {/* content */}
    </motion.div>
  ))}
</motion.div>
```

### 4.3 Hover Interactions

#### Button Hover

```tsx
// Gap expansion
<motion.div 
  className="inline-flex items-center gap-4"
  whileHover={{ gap: 24 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
  View Details <span>→</span>
</motion.div>

// Scale + Shadow
<motion.div
  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(28, 77, 141, 0.3)" }}
  whileTap={{ scale: 0.95 }}
>
```

#### Card Hover

```tsx
<motion.div
  whileHover={{ y: -12, scale: 1.02 }}
  className="group"
>
  <img className="transition-all duration-1000" />
</motion.div>
```

### 4.4 Decorative Animations

#### Infinite Pulse

```tsx
<motion.div
  animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
  transition={{ repeat: Infinity, duration: 4 }}
  className="absolute w-64 h-64 border-[40px] border-white rounded-full"
/>
```

#### Infinite Rotation

```tsx
<motion.div
  animate={{ rotate: [0, 360] }}
  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
  className="absolute w-48 h-48"
/>
```

### 4.5 Viewport Settings

```tsx
// Standard viewport (trigger once when 50% visible)
viewport={{ once: true }}

// Early trigger (starts animation before element fully visible)
viewport={{ once: true, margin: "-100px" }}

// Late trigger (waits until element almost centered)
viewport={{ once: true, margin: "-50px" }}
```

### 4.6 Performance Tips

✅ **DO:**
- Use `transform` properties (x, y, scale, rotate) - GPU accelerated
- Use `opacity` - GPU accelerated
- Set `viewport={{ once: true }}` để tránh re-animate on scroll back
- Use `will-change` cho heavy animations

❌ **DON'T:**
- Không animate `width`, `height` - causes layout reflow
- Tránh animate nhiều elements cùng lúc (stagger thay vì simultaneous)
- Không quá 0.6s duration cho micro-interactions

---

## 5. Component Patterns

### 5.1 Card Patterns

#### A. Marketplace Card

**Đặc điểm:**
- Status badge với backdrop-blur
- Gradient overlay để text readable
- Border `border-white/10`

```tsx
<motion.div
  whileHover={{ y: -12, scale: 1.02 }}
  className="bg-cardDark border border-borderDark/60 group"
>
  <div className="relative h-[580px] overflow-hidden">
    {/* Image */}
    <Image
      src={image}
      className="group-hover:scale-110 transition-all duration-1000"
    />
    
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bgDark/90" />
    
    {/* Status badge */}
    <div className="absolute top-6 right-6">
      <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md bg-green-400/10 text-green-400">
        Qualified
      </span>
    </div>
  </div>
  
  <div className="p-8">
    <h3 className="text-2xl font-semibold group-hover:text-highlightIce transition-colors">
      {title}
    </h3>
  </div>
</motion.div>
```

#### B. Team Card

**Đặc điểm:**
- Background logo watermark
- Hover lift effect
- Blue accent on role

```tsx
<motion.div
  whileHover={{ y: -10 }}
  className="bg-cardDark border border-borderDark p-10 group relative overflow-hidden"
>
  {/* Watermark */}
  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
    <span className="text-6xl font-black italic">R</span>
  </div>
  
  <div className="relative z-10">
    <h3 className="text-2xl font-semibold group-hover:text-highlightIce transition-colors">
      {name}
    </h3>
    <p className="text-primaryBlue font-black text-[10px] uppercase tracking-widest">
      {role}
    </p>
  </div>
</motion.div>
```

#### C. Feature Card with Diagonal Bars

```tsx
<div className="bg-cardDark border border-borderDark p-8 relative">
  <div className="flex gap-1 mb-4">
    <div className="w-1 h-4 bg-primaryBlue" />
    <div className="w-1 h-4 bg-accentBlue" />
  </div>
  <h3>{title}</h3>
  <p>{description}</p>
</div>
```

### 5.2 Section Patterns

#### A. Standard Section

```tsx
<section className="py-24 bg-bgDark border-t border-white/5">
  <div className="container mx-auto px-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Metadata label */}
      <span className="text-primaryBlue font-black uppercase text-[10px] tracking-[0.4em] mb-4 block">
        Category Name
      </span>
      
      {/* Section title */}
      <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
        Section <span className="text-primaryBlue">Title</span>
      </h2>
      
      {/* Content */}
    </motion.div>
  </div>
</section>
```

#### B. Diagonal Background Section

```tsx
<section className="py-24 bg-bgDark diagonal-bg">
  <div className="container mx-auto px-6 relative z-10">
    {/* Content */}
  </div>
</section>
```

**CSS (globals.css):**
```css
.diagonal-bg {
  position: relative;
  overflow: hidden;
}
.diagonal-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -10%;
  width: 120%;
  height: 200%;
  background: linear-gradient(160deg, transparent 40%, var(--relique-navy) 45%, var(--relique-primary-blue) 55%, transparent 60%);
  opacity: 0.15;
  transform: rotate(-15deg);
  z-index: 0;
  pointer-events: none;
}
```

### 5.3 Interactive Elements

#### A. Primary CTA Button

```tsx
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <Link
    href="/authenticate"
    className="px-12 py-5 bg-primaryBlue hover:bg-accentBlue text-white font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(28,77,141,0.3)] inline-block"
  >
    Authenticate Now
  </Link>
</motion.div>
```

#### B. Secondary/Ghost Button

```tsx
<Link
  href="/marketplace"
  className="px-6 py-2 border border-borderDark hover:bg-highlightIce hover:text-navy text-xs font-black uppercase tracking-widest transition-all clip-path-slant inline-block"
>
  Explore All
</Link>
```

**CSS:**
```css
.clip-path-slant {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%);
}
```

#### C. Interactive Arrow Link

```tsx
<motion.span
  className="text-white font-black text-xs tracking-[0.2em] uppercase flex items-center gap-2"
  whileHover={{ x: 5 }}
>
  View History <span className="text-primaryBlue">▶</span>
</motion.span>
```

### 5.4 Status Indicators

#### A. Status Badges

```tsx
// Helper function (đề xuất tạo trong lib/theme-utils.ts)
function getStatusBadge(status: string) {
  switch (status) {
    case "qualified":
      return <Badge className="bg-green-600 text-white border-0">Qualified</Badge>;
    case "inconclusive":
      return <Badge className="bg-amber-600 text-white border-0">Inconclusive</Badge>;
    case "disqualified":
      return <Badge className="bg-red-600 text-white border-0">Disqualified</Badge>;
    default:
      return null;
  }
}
```

#### B. Timeline Dots

```tsx
<div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center border-green-500">
  <div className="w-2 h-2 rounded-full bg-green-500" />
</div>
```

### 5.5 Image Handling

#### Marketplace Images

```tsx
<Image
  src={item.image}
  alt={item.name}
  width={800}
  height={800}
  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
  loading="lazy"
  draggable={false}
/>
```

**Key patterns:**
- `group-hover:scale-110` để zoom in on hover
- `transition-all duration-1000` cho smooth transition
- `loading="lazy"` cho performance
- `draggable={false}` cho drag carousels

#### Hero Images với Overlay

```tsx
<div className="relative h-full">
  <Image src={bg} alt="" fill className="object-cover" priority />
  <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40" />
  <div className="relative z-10">{/* Content */}</div>
</div>
```

---

## 6. Layout Guidelines

### 6.1 Container System

```tsx
// Standard container (max-width: 1280px)
<div className="container mx-auto px-6">

// Full width (no max-width)
<div className="w-full px-6">

// Narrow container (cho prose content)
<div className="max-w-4xl mx-auto px-6">
```

### 6.2 Section Spacing

```tsx
// Standard section padding
className="py-24"

// Large section padding (hero-like)
className="py-32"

// Small section padding
className="py-16"

// Responsive
className="py-16 md:py-24"
```

### 6.3 Grid Systems

#### 12-Column Grid (Bento-style)

```tsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-6">Half</div>
  <div className="col-span-12 md:col-span-6">Half</div>
  <div className="col-span-12">Full width</div>
</div>
```

#### Responsive Grids

```tsx
// 1 col mobile, 2 col tablet, 3 col desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

// Equal columns with auto-fit
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
```

### 6.4 Spacing Scale

```
gap-2    8px
gap-4    16px
gap-6    24px
gap-8    32px
gap-12   48px
gap-16   64px
gap-20   80px
```

**Quy tắc:**
- Content trong card: `p-8` hoặc `p-10`
- Gap giữa cards: `gap-6` hoặc `gap-8`
- Section padding: `py-24`
- Container padding: `px-6`

### 6.5 Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Ultra-wide */
```

**Best practices:**
- Design mobile-first
- Test at 1280px (standard desktop)
- Optimize for ultra-wide (1920px+) cho institutional users

---

## 7. Code Templates

### 7.1 Standard Section Template

```tsx
"use client";

import { motion } from "framer-motion";

export function MySection() {
  return (
    <section className="py-24 bg-bgDark border-t border-white/5">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <span className="text-primaryBlue font-black uppercase text-[10px] tracking-[0.4em] mb-4 block">
            Category
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Section <span className="text-primaryBlue">Title</span>
          </h2>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Items */}
        </div>
      </div>
    </section>
  );
}
```

### 7.2 Marketplace Card Template

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface CardProps {
  title: string;
  image: string;
  status: "qualified" | "inconclusive" | "disqualified";
  category: string;
}

export function MarketplaceCard({ title, image, status, category }: CardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "qualified": return "text-green-400 bg-green-400/10";
      case "inconclusive": return "text-amber-400 bg-amber-400/10";
      case "disqualified": return "text-red-400 bg-red-400/10";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      className="bg-cardDark border border-borderDark/60 relative group"
    >
      <div className="relative h-[580px] overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={800}
          height={800}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bgDark/90" />
        
        <div className="absolute top-6 left-6">
          <div className="bg-navy/80 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {category}
          </div>
        </div>
        
        <div className="absolute top-6 right-6">
          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${getStatusColor()}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-semibold group-hover:text-highlightIce transition-colors">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
```

### 7.3 Animated Hero Template

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden diagonal-bg pt-20">
      <div className="container mx-auto px-6 flex items-center justify-center relative z-10">
        <motion.div
          className="text-center max-w-5xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 
            className="text-5xl md:text-[80px] lg:text-[120px] font-medium tracking-tight leading-[0.85] mb-8"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            Your <span className="text-primaryBlue">Hero</span>
            <br />
            <span className="text-primaryBlue">Title</span> Here
          </h1>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/cta"
              className="px-12 py-5 bg-primaryBlue hover:bg-accentBlue text-white font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(28,77,141,0.3)] inline-block"
            >
              Call to Action
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
```

### 7.4 Split Feature Block Template

```tsx
"use client";

import { motion } from "framer-motion";

export function SplitFeature() {
  return (
    <section className="py-24 bg-bgDark">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primaryBlue font-black uppercase text-[10px] tracking-[0.4em] mb-4 block">
              Feature Category
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Feature Title
            </h2>
            <p className="text-textSec text-lg leading-relaxed">
              Description text goes here...
            </p>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Image or graphic */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

### 7.5 Timeline Component Template

```tsx
"use client";

import { motion } from "framer-motion";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: "success" | "info" | "warning";
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "border-green-500 bg-green-500";
      case "info": return "border-blue-500 bg-blue-500";
      case "warning": return "border-amber-500 bg-amber-500";
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-6">
          {index < events.length - 1 && (
            <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
          )}
          
          <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center ${getTypeColor(event.type)}`}>
            <div className={`w-2 h-2 rounded-full ${getTypeColor(event.type)}`} />
          </div>
          
          <div className="space-y-1">
            <h4 className="font-medium text-sm">{event.title}</h4>
            <p className="text-xs text-muted-foreground">{event.description}</p>
            <p className="text-xs text-muted-foreground">
              {event.date.toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 8. Best Practices

### 8.1 Accessibility

✅ **DO:**
- Luôn có `alt` text cho images
- Sử dụng semantic HTML (`<section>`, `<article>`, `<nav>`)
- Maintain text contrast ratio ≥ 4.5:1
- Add focus indicators (`focus-visible:ring-2`)
- Support keyboard navigation
- Use ARIA labels khi cần thiết

```tsx
// Good
<button 
  aria-label="Add to favorites"
  className="focus-visible:ring-2 focus-visible:ring-primaryBlue"
>
  <HeartIcon />
</button>
```

### 8.2 Performance

✅ **DO:**
- Use `loading="lazy"` cho images below fold
- Use `priority` cho hero images
- Implement skeleton states
- Use `viewport={{ once: true }}` cho animations
- Lazy load heavy components

```tsx
// Good
<Image src={hero} alt="Hero" priority />
<Image src={gallery} alt="Gallery" loading="lazy" />
```

### 8.3 Responsive Design

✅ **DO:**
- Test ở 375px (mobile), 768px (tablet), 1280px (desktop), 1920px (ultra-wide)
- Use mobile-first approach
- Hide decorative elements on mobile
- Stack grids vertically on mobile

```tsx
// Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="hidden md:block">{/* Decorative element */}</div>
```

### 8.4 Code Organization

✅ **DO:**
- Keep components under 200 lines
- Extract repeated patterns into shared components
- Use TypeScript interfaces
- Document complex logic
- Group related styles

❌ **DON'T:**
- Hardcode colors (use Tailwind classes)
- Duplicate animation variants
- Create deeply nested components
- Mix business logic with UI

---

## 9. Đề xuất cải tiến

### 9.1 Standardization (Priority: HIGH)

#### A. Motion Variants Library

**File:** `apps/web/src/lib/motion-variants.ts`

```typescript
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Usage:
import { fadeInUp } from "@/lib/motion-variants";

<motion.div variants={fadeInUp} initial="hidden" whileInView="visible">
```

**Benefit:** Giảm 70% code duplication trong animations

#### B. Typography Utility Classes

**File:** `apps/web/src/app/globals.css` (thêm vào)

```css
/* Display Typography */
.text-display-hero {
  @apply text-5xl md:text-[80px] lg:text-[120px] font-medium tracking-tight leading-[0.85];
  font-family: "Times New Roman", Times, serif;
}

.text-display-section {
  @apply text-4xl md:text-6xl font-bold tracking-tight;
}

.text-metadata {
  @apply text-[10px] font-black uppercase tracking-[0.4em];
}

/* Usage */
<h1 className="text-display-hero">
<span className="text-metadata text-primaryBlue">
```

**Benefit:** Consistent typography, easier to maintain

#### C. Status Utility Function

**File:** `apps/web/src/lib/theme-utils.ts`

```typescript
export function getStatusStyle(status: string) {
  const styles = {
    qualified: "bg-green-600 text-white",
    inconclusive: "bg-amber-600 text-white",
    disqualified: "bg-red-600 text-white",
  };
  return styles[status as keyof typeof styles] || "";
}

// Usage:
<Badge className={getStatusStyle(item.status)}>
  {item.status}
</Badge>
```

**Benefit:** Centralized status logic, easy to update

### 9.2 Performance (Priority: MEDIUM)

#### A. Image Optimization

```tsx
// Implement blur placeholders
<Image
  src={item.image}
  alt={item.title}
  placeholder="blur"
  blurDataURL={item.blurDataURL}
/>

// Use next/image với proper sizing
<Image
  src={hero}
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
/>
```

#### B. Code Splitting

```tsx
// Lazy load heavy components
const DragCarousel = dynamic(() => import("@/components/DragCarousel"), {
  loading: () => <Skeleton />
});
```

#### C. Reduced Motion Hook

```typescript
// apps/web/src/hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  return prefersReducedMotion;
}

// Usage:
const shouldAnimate = !useReducedMotion();
<motion.div animate={shouldAnimate ? { y: -10 } : {}}>
```

### 9.3 Accessibility (Priority: HIGH)

#### A. Focus Indicators

```css
/* Add to globals.css */
.focus-ring-primary {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryBlue focus-visible:ring-offset-2 focus-visible:ring-offset-bgDark;
}
```

#### B. Skip to Content

```tsx
// Add to layout
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primaryBlue focus:text-white"
>
  Skip to main content
</a>

<main id="main-content">
```

### 9.4 Developer Experience (Priority: LOW)

#### A. Component Generator

```bash
# Script to generate component boilerplate
pnpm create-component MySection --type=section
```

#### B. Storybook Setup

```typescript
// .storybook/preview.ts
export default {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0A0A0A' },
      ],
    },
  },
};
```

### 9.5 Design System Evolution (Priority: LOW)

#### A. Spacing Scale

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    spacing: {
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
      24: '96px',
    }
  }
}
```

#### B. Component Size Variants

```tsx
// Standardize button sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

---

## 📚 Tài liệu liên quan

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Cấu trúc project và conventions
- [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md) - Chi tiết từng component
- [THEME_IMPROVEMENTS.md](./THEME_IMPROVEMENTS.md) - Roadmap cải tiến

---

**Maintained by:** Relique.co Development Team  
**Questions?** Check component examples trong `apps/web/src/components/`
