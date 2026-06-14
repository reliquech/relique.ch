# RELIQUE Button System

Hệ thống button có tổ chức với 9 variants, tất cả wrapper từ shadcn button gốc với framer-motion animations.

## 📦 Installation

Buttons đã được export sẵn từ `@relique/ui`:

```typescript
import { PrimaryButton, SecondaryButton, OutlineButton } from "@relique/ui/buttons";
```

## 🎨 Button Variants

### 1. PrimaryButton

Main CTA button cho actions quan trọng nhất.

**Đặc điểm:**
- Background: `#1C4D8D` (primaryBlue)
- Hover: `#498BC4` (accentBlue) với glow effect
- Animation: Scale 1.05 + shadow glow

**Usage:**

```tsx
import { PrimaryButton } from "@relique/ui/buttons";

// Basic usage
<PrimaryButton onClick={handleSubmit}>
  Submit Form
</PrimaryButton>

// With link
<PrimaryButton href="/authenticate">
  Authenticate Now
</PrimaryButton>

// With loading state
<PrimaryButton loading={isSubmitting} loadingText="Submitting...">
  Submit
</PrimaryButton>

// Disabled
<PrimaryButton disabled>
  Cannot Submit
</PrimaryButton>
```

**Props:**
- `children`: ReactNode - Nội dung button
- `href?`: string - Nếu có, render như Next.js Link
- `loading?`: boolean - Hiển thị loading spinner
- `loadingText?`: string - Text khi loading
- `className?`: string - Custom className
- `disableAnimation?`: boolean - Tắt animation
- `...rest`: ButtonHTMLAttributes

---

### 2. SecondaryButton

Button phụ cho secondary actions.

**Đặc điểm:**
- Background: secondary color
- Border: subtle `#333333`
- Hover: `#BDE8F5` (highlightIce) với navy text
- Animation: Subtle lift (y: -4)

**Usage:**

```tsx
import { SecondaryButton } from "@relique/ui/buttons";

<SecondaryButton>
  Learn More
</SecondaryButton>

<SecondaryButton href="/docs">
  View Documentation
</SecondaryButton>
```

---

### 3. AlertButton

Destructive button cho actions nguy hiểm (delete, remove, etc.)

**Đặc điểm:**
- Background: `bg-red-600`
- Hover: `bg-red-700` với shake effect
- Animation: Shake on hover để cảnh báo
- Optional: Confirmation dialog

**Usage:**

```tsx
import { AlertButton } from "@relique/ui/buttons";

// Basic
<AlertButton onClick={handleDelete}>
  Delete Item
</AlertButton>

// With icon
<AlertButton showIcon>
  Delete with Warning Icon
</AlertButton>

// With confirmation
<AlertButton 
  requireConfirm
  confirmMessage="Bạn có chắc muốn xóa?"
  onConfirm={handleDelete}
>
  Delete Permanently
</AlertButton>
```

**Props:**
- `requireConfirm?`: boolean - Yêu cầu xác nhận
- `confirmMessage?`: string - Message cho confirm dialog
- `onConfirm?`: () => void - Callback khi confirm
- `showIcon?`: boolean - Hiển thị AlertTriangle icon

---

### 4. NavyButton

Navy background button theo RELIQUE design system.

**Đặc điểm:**
- Background: `#0F2854` (navy)
- Border: `border-white/10`
- Hover: Gradient overlay primaryBlue → accentBlue
- Animation: Gradient slide effect

**Usage:**

```tsx
import { NavyButton } from "@relique/ui/buttons";

<NavyButton href="/consign">
  Start Consignment
</NavyButton>

<NavyButton>
  View Collection
</NavyButton>
```

---

### 5. OutlineButton

Border button với primaryBlue accent.

**Đặc điểm:**
- Variant: `outline` từ shadcn
- Border: `2px border-primaryBlue`
- Hover: Fill với `bg-primaryBlue`
- Animation: Border glow pulse

**Usage:**

```tsx
import { OutlineButton } from "@relique/ui/buttons";

<OutlineButton>
  Learn More
</OutlineButton>

// Icon button
<OutlineButton size="icon">
  <ChevronRight className="w-4 h-4" />
</OutlineButton>

// Sizes
<OutlineButton size="sm">Small</OutlineButton>
<OutlineButton size="lg">Large</OutlineButton>
```

---

### 6. GhostButton

Transparent button với minimal styling.

**Đặc điểm:**
- Background: transparent
- Hover: `bg-white/5`
- Minimal padding
- Animation: Subtle fade in background

**Usage:**

```tsx
import { GhostButton } from "@relique/ui/buttons";

<GhostButton>
  Skip
</GhostButton>

<GhostButton href="/cancel">
  Cancel
</GhostButton>
```

---

### 7. LinkButton

Link-style button với underline effect.

**Đặc điểm:**
- Variant: `link` từ shadcn
- Text: `#1C4D8D` (primaryBlue)
- Hover: underline effect
- Animation: Arrow icon slide (nếu có)

**Usage:**

```tsx
import { LinkButton } from "@relique/ui/buttons";

<LinkButton>
  View Details
</LinkButton>

// With arrow icon
<LinkButton showArrow href="/learn-more">
  Learn More
</LinkButton>
```

**Props:**
- `showArrow?`: boolean - Hiển thị arrow icon

---

### 8. LiquidButton

Button với liquid fill animation on hover.

**Đặc điểm:**
- Liquid fill animation từ bottom → top
- Customize colors với CSS variables
- Smooth animation với framer-motion

**Usage:**

```tsx
import { LiquidButton } from "@relique/ui/buttons";

// Basic
<LiquidButton>
  Hover Me
</LiquidButton>

// Custom fill color
<LiquidButton 
  style={{ 
    '--liquid-button-background-color': '#498BC4',
    '--liquid-button-color': 'white'
  } as React.CSSProperties}
>
  Custom Color
</LiquidButton>

// Custom animation
<LiquidButton 
  fillHeight="100%" 
  hoverScale={1.1}
  tapScale={0.9}
  delay="0.1s"
>
  Custom Animation
</LiquidButton>
```

**Props:**
- `delay?`: string - Delay của animation (default: "0s")
- `fillHeight?`: string - Chiều cao fill effect (default: "100%")
- `hoverScale?`: number - Scale khi hover (default: 1.05)
- `tapScale?`: number - Scale khi tap (default: 0.95)

**CSS Variables:**
- `--liquid-button-color`: Text color khi hover (default: white)
- `--liquid-button-background-color`: Fill color (default: #1C4D8D)

---

### 9. BaseButton

Base wrapper từ shadcn button với framer-motion.

**Khi nào dùng:** Khi bạn cần shadcn button variants gốc nhưng với animations.

**Usage:**

```tsx
import { BaseButton } from "@relique/ui/buttons";

<BaseButton variant="default">
  Default
</BaseButton>

<BaseButton variant="destructive" size="lg">
  Destructive Large
</BaseButton>

// Tắt animation
<BaseButton variant="outline" disableAnimation>
  No Animation
</BaseButton>
```

---

## 🎯 Khi nào dùng button nào?

| Button | Khi nào dùng |
|--------|-------------|
| **PrimaryButton** | CTA chính (Sign Up, Authenticate, Submit Form) |
| **SecondaryButton** | Actions phụ (Learn More, View Details) |
| **AlertButton** | Actions nguy hiểm (Delete, Remove, Cancel Subscription) |
| **NavyButton** | Brand actions (Start Consignment, View Collection) |
| **OutlineButton** | Navigation, filters, secondary CTAs |
| **GhostButton** | Minimal actions (Skip, Cancel, Close) |
| **LinkButton** | In-text links, "Read more", "View all" |
| **LiquidButton** | Special interactive elements, hero sections |
| **BaseButton** | Khi cần shadcn variants gốc + animation |

---

## 🚀 Migration Guide

### Từ shadcn Button cũ

**Trước:**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Submit</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

**Sau:**

```tsx
import { PrimaryButton, OutlineButton, AlertButton } from "@relique/ui/buttons";

<PrimaryButton>Submit</PrimaryButton>
<OutlineButton>Cancel</OutlineButton>
<AlertButton>Delete</AlertButton>
```

### Từ custom motion.div + Link

**Trước:**

```tsx
<motion.div whileHover={{ scale: 1.05 }}>
  <Link 
    href="/authenticate"
    className="px-12 py-5 bg-primaryBlue hover:bg-accentBlue text-white..."
  >
    Authenticate Now
  </Link>
</motion.div>
```

**Sau:**

```tsx
<PrimaryButton href="/authenticate">
  Authenticate Now
</PrimaryButton>
```

---

## 📏 Design Guidelines

### Colors

Buttons sử dụng RELIQUE design system colors:

- **Primary Blue**: `#1C4D8D` - Main CTA
- **Accent Blue**: `#498BC4` - Hover states
- **Navy**: `#0F2854` - Brand color
- **Highlight Ice**: `#BDE8F5` - Premium highlights

### Typography

- **Primary/Navy/Alert**: `font-black uppercase text-xs tracking-[0.2em]`
- **Secondary/Outline/Ghost**: `font-semibold text-sm tracking-wide`
- **Link**: `font-semibold text-sm` (không uppercase)

### Animations

Tất cả buttons đều có framer-motion animations:

- **Premium easing**: `[0.16, 1, 0.3, 1]` cho smooth transitions
- **Scale**: 1.05 on hover, 0.95 on tap
- **Duration**: 0.2s - 0.3s

### Accessibility

- ✅ Focus ring với `focus-visible:ring-2`
- ✅ Keyboard navigation support
- ✅ Disabled states với opacity 50%
- ✅ ARIA labels support (inherit từ HTML button)
- ✅ `disableAnimation` prop cho reduced motion preferences

---

## 🛠️ Development

### File Size Limit

**Quy tắc:** Mỗi button component < 200 lines

**Lý do:**
- Maintainability
- Single responsibility
- Easy to debug
- Follows workspace rules

### Architecture

```
packages/ui/src/buttons/
├── index.ts              # Export tất cả
├── base-button.tsx       # Base wrapper từ shadcn
├── primary-button.tsx    # Variant implementation
├── ...                   # Các variants khác
└── README.md            # Documentation này
```

**Wrapper Pattern:**
- Tất cả buttons wrapper shadcn button gốc
- KHÔNG fork code từ shadcn
- KHÔNG chỉnh sửa shadcn button gốc
- Dễ update khi shadcn có breaking changes

### Adding New Variants

1. Create new file `packages/ui/src/buttons/your-button.tsx`
2. Extend `BaseButtonProps` hoặc tạo props riêng
3. Wrapper shadcn button hoặc custom implementation
4. Add JSDoc comments
5. Export từ `buttons/index.ts`
6. Update README này

---

## 📚 Demo

Xem tất cả button variants hoạt động:

```bash
# Mở demo page
http://localhost:3000/demo-buttons
```

Demo page showcase:
- Tất cả 9 button variants
- Interactive states (hover, active, disabled, loading)
- Code examples cho mỗi variant
- Usage notes

---

## ❓ FAQ

**Q: Tại sao không dùng shadcn Button trực tiếp?**

A: Hệ thống này:
- Chuẩn hóa animations (consistent UX)
- Thêm features (loading, href, custom animations)
- Dễ maintain (centralized logic)
- Wrapper pattern → dễ update shadcn

**Q: Có thể customize animations không?**

A: Có! Dùng props `disableAnimation`, `hoverScale`, `tapScale`, hoặc extend component.

**Q: Buttons có responsive không?**

A: Có. Padding và sizing tự động responsive. Có thể override với `className`.

**Q: Performance impact của framer-motion?**

A: Minimal. Chỉ animate `transform` properties (GPU accelerated). Optional `disableAnimation` prop.

**Q: Có thể dùng với form libraries không?**

A: Có. Tất cả buttons extend HTMLButtonElement props → work với React Hook Form, Formik, etc.

---

## 🐛 Troubleshooting

### Import error: "Cannot find module '@relique/ui/buttons'"

**Giải pháp:** Check `packages/ui/src/index.ts` đã export buttons chưa:

```typescript
export * from "./buttons";
```

### Button không có animation

**Nguyên nhân:** `disableAnimation` prop hoặc `disabled` state.

**Giải pháp:** Remove `disableAnimation` prop.

### TypeScript errors

**Giải pháp:** Ensure types được export:

```typescript
export type { PrimaryButtonProps } from "./primary-button";
```

---

## 📝 Changelog

### v1.0.0 (Current)

- ✅ 9 button variants created
- ✅ Full TypeScript support
- ✅ Framer-motion animations
- ✅ Wrapper pattern (không touch shadcn)
- ✅ Demo page
- ✅ Documentation

### Future Enhancements

- [ ] Storybook stories
- [ ] Unit tests
- [ ] A11y audits
- [ ] More animation variants
- [ ] Dark/light mode variants

---

**Maintained by:** RELIQUE.co Development Team  
**Questions?** Check demo page tại `/demo-buttons`
