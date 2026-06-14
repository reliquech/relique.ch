"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../cn";

/**
 * PrimaryButton - Main CTA button cho actions quan trọng nhất
 * 
 * Đặc điểm:
 * - Background: primaryBlue (#1C4D8D)
 * - Hover: accentBlue (#498BC4) với glow effect
 * - Text: Uppercase, bold, wide tracking
 * - Animation: Scale + shadow glow
 * 
 * @example
 * <PrimaryButton href="/authenticate">
 *   Authenticate Now
 * </PrimaryButton>
 * 
 * @example
 * <PrimaryButton onClick={handleSubmit} loading={isSubmitting}>
 *   Submit Form
 * </PrimaryButton>
 */
export interface PrimaryButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
> {
  /** Nội dung button */
  children: React.ReactNode;
  /** Nếu có href, button sẽ render như Link */
  href?: string;
  /** Hiển thị loading spinner */
  loading?: boolean;
  /** Text hiển thị khi loading */
  loadingText?: string;
  /** Custom className */
  className?: string;
  /** Tắt animation */
  disableAnimation?: boolean;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ 
    children, 
    href, 
    loading = false, 
    loadingText,
    className, 
    disabled,
    disableAnimation = false,
    ...props 
  }, ref) => {
    const premiumEasing = [0.16, 1, 0.3, 1] as const;
    
    const buttonClassName = cn(
      // Base styles
      "px-12 py-5 inline-flex items-center justify-center gap-2",
      // Colors
      "bg-[#1C4D8D] hover:bg-[#498BC4] text-white",
      // Typography
      "font-black uppercase text-xs tracking-[0.2em]",
      // Shadow & Effects
      "shadow-[0_20px_40px_rgba(28,77,141,0.3)]",
      "transition-all duration-300",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#498BC4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
      // Disabled state
      disabled && "opacity-50 cursor-not-allowed",
      loading && "cursor-wait",
      className
    );

    const content = (
      <>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </>
    );

    // Nếu có href, render như Link
    if (href && !disabled && !loading) {
      if (disableAnimation) {
        return (
          <Link href={href} className={buttonClassName}>
            {content}
          </Link>
        );
      }

      return (
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(28, 77, 141, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, ease: premiumEasing }}
          className="inline-block"
        >
          <Link href={href} className={buttonClassName}>
            {content}
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
          disabled={disabled || loading}
          {...props}
        >
          {content}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(28, 77, 141, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease: premiumEasing }}
        className={buttonClassName}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </motion.button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";
