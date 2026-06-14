"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BaseButton, BaseButtonProps } from "./base-button";
import { cn } from "../cn";

/**
 * OutlineButton - Border button với primaryBlue accent
 * 
 * Đặc điểm:
 * - Variant: outline từ shadcn
 * - Border: 2px border-primaryBlue
 * - Hover: Fill với bg-primaryBlue
 * - Animation: Border glow pulse
 * 
 * @example
 * <OutlineButton>
 *   Learn More
 * </OutlineButton>
 * 
 * @example
 * <OutlineButton size="icon">
 *   <ChevronRight />
 * </OutlineButton>
 */
export interface OutlineButtonProps extends Omit<BaseButtonProps, 'variant'> {
  /** Nội dung button */
  children: React.ReactNode;
  /** Nếu có href, button sẽ render như Link */
  href?: string;
  /** Custom className */
  className?: string;
  /** Tắt animation */
  disableAnimation?: boolean;
}

export const OutlineButton = React.forwardRef<HTMLButtonElement, OutlineButtonProps>(
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
      // Base outline styles
      "border-2 border-[#1C4D8D] bg-transparent text-white",
      "hover:bg-[#1C4D8D] hover:text-white",
      // Glow effect
      "hover:shadow-[0_0_20px_rgba(28,77,141,0.4)]",
      // Transition
      "transition-all duration-300",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#498BC4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: premiumEasing }}
          className="inline-block"
        >
          <Link href={href} className={cn(buttonClassName, getSizeClass(size ?? undefined))}>
            {children}
          </Link>
        </motion.div>
      );
    }

    // Render sử dụng BaseButton với variant outline
    return (
      <BaseButton
        ref={ref}
        variant="outline"
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

OutlineButton.displayName = "OutlineButton";

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
