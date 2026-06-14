"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../cn";

/**
 * NavyButton - Button với navy background theo RELIQUE design system
 * 
 * Đặc điểm:
 * - Background: Navy (#0F2854)
 * - Border: Subtle white border
 * - Hover: Gradient overlay với primaryBlue
 * - Text: Uppercase tracking-wide
 * - Animation: Gradient slide effect
 * 
 * @example
 * <NavyButton>
 *   View Collection
 * </NavyButton>
 * 
 * @example
 * <NavyButton href="/consign">
 *   Start Consignment
 * </NavyButton>
 */
export interface NavyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
> {
  /** Nội dung button */
  children: React.ReactNode;
  /** Nếu có href, button sẽ render như Link */
  href?: string;
  /** Custom className */
  className?: string;
  /** Tắt animation */
  disableAnimation?: boolean;
}

export const NavyButton = React.forwardRef<HTMLButtonElement, NavyButtonProps>(
  ({ 
    children, 
    href, 
    className, 
    disabled,
    disableAnimation = false,
    ...props 
  }, ref) => {
    const premiumEasing = [0.16, 1, 0.3, 1] as const;
    
    const buttonClassName = cn(
      // Base styles
      "px-10 py-4 inline-flex items-center justify-center gap-2 relative overflow-hidden",
      // Colors - navy background
      "bg-[#0F2854] text-white",
      "border border-white/10",
      // Hover gradient overlay
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#1C4D8D] before:to-[#498BC4]",
      "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
      // Typography
      "font-black uppercase text-xs tracking-[0.3em] relative z-10",
      // Transition
      "transition-all duration-300",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#498BC4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
      // Disabled state
      disabled && "opacity-50 cursor-not-allowed",
      className
    );

    // Nếu có href, render như Link
    if (href && !disabled) {
      if (disableAnimation) {
        return (
          <Link href={href} className={buttonClassName}>
            {children}
          </Link>
        );
      }

      return (
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.3, ease: premiumEasing }}
          className="inline-block"
        >
          <Link href={href} className={buttonClassName}>
            {children}
          </Link>
        </motion.div>
      );
    }

    // Render như button thông thường
    if (disableAnimation || disabled) {
      return (
        <button
          ref={ref}
          className={buttonClassName}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3, ease: premiumEasing }}
        className={buttonClassName}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

NavyButton.displayName = "NavyButton";
