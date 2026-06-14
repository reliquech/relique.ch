/**
 * Motion Variants Library
 * 
 * Centralized animation variants for consistent motion across the app.
 * Use these instead of inline animation definitions to reduce duplication
 * and maintain consistency.
 * 
 * @example
 * ```tsx
 * import { fadeInUp, VIEWPORT_ONCE } from "@/lib/motion-variants";
 * 
 * <motion.div
 *   variants={fadeInUp}
 *   initial="hidden"
 *   whileInView="visible"
 *   viewport={VIEWPORT_ONCE}
 * >
 * ```
 */

import type { Variants, Transition } from "framer-motion";

// ============================================
// Easing Functions
// ============================================

/**
 * Premium easing for luxury, smooth feel
 * Use for: Major page transitions, scroll reveals, hero animations
 */
export const PREMIUM_EASING = [0.16, 1, 0.3, 1] as const;

/**
 * Sharp easing for quick interactions
 * Use for: Button hovers, toggles, micro-interactions
 */
export const SHARP_EASING = "easeInOut" as const;

/**
 * Linear easing for infinite loops
 * Use for: Rotating elements, infinite scrolls, continuous animations
 */
export const LINEAR_EASING = "linear" as const;

// ============================================
// Viewport Configurations
// ============================================

/**
 * Standard viewport config - triggers once when 50% visible
 */
export const VIEWPORT_ONCE = { once: true } as const;

/**
 * Early trigger - starts animation before element fully visible
 * Use for: Sections that should animate as user approaches
 */
export const VIEWPORT_EARLY = { once: true, margin: "-100px" } as const;

/**
 * Late trigger - waits until element almost centered
 * Use for: Dramatic reveals, hero sections
 */
export const VIEWPORT_LATE = { once: true, margin: "-50px" } as const;

// ============================================
// Basic Transitions
// ============================================

/**
 * Premium transition with luxury easing
 */
export const premiumTransition: Transition = {
  duration: 0.6,
  ease: PREMIUM_EASING,
};

/**
 * Quick transition for interactions
 */
export const quickTransition: Transition = {
  duration: 0.3,
  ease: SHARP_EASING,
};

/**
 * Slow transition for dramatic effects
 */
export const slowTransition: Transition = {
  duration: 1,
  ease: PREMIUM_EASING,
};

// ============================================
// Fade Animations
// ============================================

/**
 * Fade in from bottom with upward motion
 * Use for: Section reveals, card entrances, general content
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: premiumTransition,
  },
};

/**
 * Fade in with larger upward motion
 * Use for: Hero sections, major reveals
 */
export const fadeInUpLarge: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: PREMIUM_EASING },
  },
};

/**
 * Simple fade in (no motion)
 * Use for: Subtle reveals, overlays
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: quickTransition,
  },
};

// ============================================
// Slide Animations
// ============================================

/**
 * Slide in from left
 * Use for: Left-side content, sequential reveals
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: quickTransition,
  },
};

/**
 * Slide in from right
 * Use for: Right-side content, sequential reveals
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: quickTransition,
  },
};

/**
 * Slide in from left with premium easing
 * Use for: Major section reveals, hero blocks
 */
export const slideInLeftPremium: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: premiumTransition,
  },
};

/**
 * Slide in from right with premium easing
 * Use for: Major section reveals, hero blocks
 */
export const slideInRightPremium: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: premiumTransition,
  },
};

// ============================================
// Scale Animations
// ============================================

/**
 * Scale and fade in
 * Use for: Modals, popups, featured cards
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: premiumTransition,
  },
};

/**
 * Scale in with larger initial scale
 * Use for: Dramatic entrances
 */
export const scaleInLarge: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: PREMIUM_EASING },
  },
};

// ============================================
// Stagger Animations
// ============================================

/**
 * Container for staggered children
 * Use for: Grids, lists, card collections
 * 
 * @example
 * ```tsx
 * <motion.div variants={staggerContainer} initial="hidden" whileInView="visible">
 *   {items.map(item => (
 *     <motion.div key={item.id} variants={staggerItem}>
 *       {item.content}
 *     </motion.div>
 *   ))}
 * </motion.div>
 * ```
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Child item for stagger effect
 * Use with: staggerContainer
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/**
 * Faster stagger container
 * Use for: Quick lists, smaller items
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// ============================================
// Hover Animations
// ============================================

/**
 * Hover lift effect
 * Use for: Cards, buttons, interactive elements
 * 
 * @example
 * ```tsx
 * <motion.div
 *   initial="rest"
 *   whileHover="hover"
 *   variants={hoverLift}
 * >
 * ```
 */
export const hoverLift: Variants = {
  rest: { y: 0 },
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: SHARP_EASING },
  },
};

/**
 * Larger hover lift
 * Use for: Large cards, prominent elements
 */
export const hoverLiftLarge: Variants = {
  rest: { y: 0 },
  hover: {
    y: -12,
    transition: { duration: 0.3, ease: SHARP_EASING },
  },
};

/**
 * Hover scale
 * Use for: Buttons, small cards
 */
export const hoverScale: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3, ease: SHARP_EASING },
  },
};

/**
 * Combined lift and scale
 * Use for: Premium cards, featured items
 */
export const hoverLiftScale: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -12,
    scale: 1.02,
    transition: { duration: 0.3, ease: SHARP_EASING },
  },
};

// ============================================
// Specialized Animations
// ============================================

/**
 * Infinite pulse animation
 * Use for: Loading indicators, attention grabbers
 * 
 * @example
 * ```tsx
 * <motion.div
 *   animate="pulse"
 *   variants={infinitePulse}
 * >
 * ```
 */
export const infinitePulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.2, 0.4, 0.2],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: LINEAR_EASING,
    },
  },
};

/**
 * Infinite rotation
 * Use for: Loaders, decorative elements
 */
export const infiniteRotate: Variants = {
  rotate: {
    rotate: [0, 360],
    transition: {
      repeat: Infinity,
      duration: 20,
      ease: LINEAR_EASING,
    },
  },
};

/**
 * Shine effect (horizontal sweep)
 * Use for: Shimmer effects, loading states
 */
export const shineEffect: Variants = {
  shine: {
    x: ["-100%", "100%"],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: LINEAR_EASING,
    },
  },
};

// ============================================
// Utility Functions
// ============================================

/**
 * Create custom fade in up with custom distance
 */
export function createFadeInUp(distance: number): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: premiumTransition,
    },
  };
}

/**
 * Create custom stagger with custom timing
 */
export function createStaggerContainer(
  staggerDelay: number = 0.1,
  delayChildren: number = 0.2
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Create custom scale in with custom initial scale
 */
export function createScaleIn(initialScale: number = 0.9): Variants {
  return {
    hidden: { opacity: 0, scale: initialScale },
    visible: {
      opacity: 1,
      scale: 1,
      transition: premiumTransition,
    },
  };
}
