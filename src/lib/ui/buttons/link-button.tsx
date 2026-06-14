"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BaseButton, BaseButtonProps } from "./base-button";
import { cn } from "../cn";

/**
 * LinkButton - Link-style button với underline effect
 * 
 * Đặc điểm:
 * - Variant: link từ shadcn
 * - Text: primaryBlue với underline-offset
 * - Hover: underline effect
 * - Animation: Arrow icon slide
 * 
 * @example
 * <LinkButton>
 *   View Details
 * </LinkButton>
 * 
 * @example
 * <LinkButton href="/learn-more" showArrow>
 *   Learn More
 * </LinkButton>
 */
export interface LinkButtonProps extends Omit<BaseButtonProps, 'variant'> {
  /** Nội dung button */
  children: React.ReactNode;
  /** Nếu có href, button sẽ render như Link */
  href?: string;
  /** Custom className */
  className?: string;
  /** Tắt animation */
  disableAnimation?: boolean;
  /** Hiển thị arrow icon */
  showArrow?: boolean;
}

export const LinkButton = React.forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ 
    children, 
    href, 
    className, 
    disabled,
    disableAnimation = false,
    showArrow = false,
    size,
    ...props 
  }, ref) => {
    const premiumEasing = [0.16, 1, 0.3, 1] as const;
    
    const buttonClassName = cn(
      // Link styles
      "text-[#1C4D8D] hover:text-[#498BC4]",
      "underline-offset-4 hover:underline",
      "font-semibold text-sm",
      // Transition
      "transition-all duration-300",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#498BC4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
      className
    );

    const content = (
      <>
        {children}
        {showArrow && <ArrowRight className="w-4 h-4" />}
      </>
    );

    // Nếu có href, render như Link
    if (href && !disabled) {
      if (disableAnimation) {
        return (
          <Link href={href} className={cn(buttonClassName, "inline-flex items-center gap-2")}>
            {content}
          </Link>
        );
      }

      return (
        <motion.div
          whileHover={{ x: showArrow ? 5 : 0 }}
          transition={{ duration: 0.2, ease: premiumEasing }}
          className="inline-block"
        >
          <Link href={href} className={cn(buttonClassName, "inline-flex items-center gap-2")}>
            {content}
          </Link>
        </motion.div>
      );
    }

    // Render sử dụng BaseButton với variant link
    if (disableAnimation || disabled) {
      return (
        <BaseButton
          ref={ref}
          variant="link"
          size={size}
          className={buttonClassName}
          disabled={disabled}
          disableAnimation
          {...props}
        >
          {content}
        </BaseButton>
      );
    }

    return (
      <motion.div
        whileHover={{ x: showArrow ? 5 : 0 }}
        transition={{ duration: 0.2, ease: premiumEasing }}
        className="inline-block"
      >
        <BaseButton
          ref={ref}
          variant="link"
          size={size}
          className={buttonClassName}
          disabled={disabled}
          disableAnimation
          {...props}
        >
          {content}
        </BaseButton>
      </motion.div>
    );
  }
);

LinkButton.displayName = "LinkButton";
