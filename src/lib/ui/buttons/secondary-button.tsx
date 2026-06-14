"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../cn";

/**
 * SecondaryButton - Button phụ cho secondary actions
 * 
 * Đặc điểm:
 * - Background: secondary color từ design system
 * - Border: subtle border
 * - Hover: highlightIce với navy text
 * - Animation: Subtle lift effect
 * 
 * @example
 * <SecondaryButton>
 *   Learn More
 * </SecondaryButton>
 * 
 * @example
 * <SecondaryButton href="/docs">
 *   View Documentation
 * </SecondaryButton>
 */
export interface SecondaryButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
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

export const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
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
      "px-8 py-3 inline-flex items-center justify-center gap-2",
      // Colors - using secondary background
      "bg-secondary text-secondary-foreground",
      "border border-[#333333]",
      "hover:bg-[#BDE8F5] hover:text-[#0F2854]",
      // Typography
      "font-semibold text-sm tracking-wide",
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
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: premiumEasing }}
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
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: premiumEasing }}
        className={buttonClassName}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

SecondaryButton.displayName = "SecondaryButton";
