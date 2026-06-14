"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BaseButton, BaseButtonProps } from "./base-button";
import { cn } from "../cn";

/**
 * GhostButton - Transparent button với minimal styling
 * 
 * Đặc điểm:
 * - Background: transparent
 * - Hover: subtle white/5 background
 * - Minimal padding
 * - Animation: Subtle fade in background
 * 
 * @example
 * <GhostButton>
 *   Skip
 * </GhostButton>
 * 
 * @example
 * <GhostButton href="/cancel">
 *   Cancel
 * </GhostButton>
 */
export interface GhostButtonProps extends Omit<BaseButtonProps, 'variant'> {
  /** Nội dung button */
  children: React.ReactNode;
  /** Nếu có href, button sẽ render như Link */
  href?: string;
  /** Custom className */
  className?: string;
  /** Tắt animation */
  disableAnimation?: boolean;
}

export const GhostButton = React.forwardRef<HTMLButtonElement, GhostButtonProps>(
  ({ 
    children, 
    href, 
    className, 
    disabled,
    disableAnimation = false,
    size,
    ...props 
  }, ref) => {
    const premiumEasing = [0.16, 1, 0.3, 1] as const;
    
    const buttonClassName = cn(
      // Ghost styles
      "bg-transparent text-white",
      "hover:bg-white/5 hover:text-white",
      // Transition
      "transition-all duration-300",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
      className
    );

    // Nếu có href, render như Link
    if (href && !disabled) {
      if (disableAnimation) {
        return (
          <Link href={href} className={cn(buttonClassName, getSizeClass(size ?? undefined))}>
            {children}
          </Link>
        );
      }

      return (
        <motion.div
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: premiumEasing }}
          className="inline-block"
        >
          <Link href={href} className={cn(buttonClassName, getSizeClass(size ?? undefined))}>
            {children}
          </Link>
        </motion.div>
      );
    }

    // Render sử dụng BaseButton với variant ghost
    return (
      <BaseButton
        ref={ref}
        variant="ghost"
        size={size}
        className={buttonClassName}
        disabled={disabled}
        disableAnimation={disableAnimation}
        {...props}
      >
        {children}
      </BaseButton>
    );
  }
);

GhostButton.displayName = "GhostButton";

// Helper function cho size classes
function getSizeClass(size?: "default" | "sm" | "lg" | "icon") {
  switch (size) {
    case "sm":
      return "h-9 px-3";
    case "lg":
      return "h-11 px-8";
    case "icon":
      return "h-10 w-10";
    default:
      return "h-10 px-4 py-2";
  }
}
