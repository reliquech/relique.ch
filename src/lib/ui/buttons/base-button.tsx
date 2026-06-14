"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "../shadcn/ui/button";
import { cn } from "../cn";

/**
 * BaseButton - Wrapper cơ bản từ shadcn button với framer-motion animations
 * 
 * Component này wrap shadcn Button gốc và thêm các animation mặc định:
 * - Scale 1.05 khi hover
 * - Scale 0.95 khi tap/click
 * - Smooth transition với premium easing
 * 
 * @example
 * <BaseButton variant="default">
 *   Click me
 * </BaseButton>
 * 
 * @example
 * <BaseButton variant="outline" size="lg" disabled>
 *   Disabled Button
 * </BaseButton>
 */
export interface BaseButtonProps extends ButtonProps {
  /** Tắt animation nếu true (useful cho reduced motion preferences) */
  disableAnimation?: boolean;
}

export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ className, children, disableAnimation = false, disabled, ...props }, ref) => {
    // Premium easing function từ design system
    const premiumEasing = [0.16, 1, 0.3, 1] as const;

    // Nếu disabled hoặc disableAnimation, không áp dụng motion effects
    if (disabled || disableAnimation) {
      return (
        <Button
          ref={ref}
          className={className}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      );
    }

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: premiumEasing }}
        className="inline-block"
      >
        <Button
          ref={ref}
          className={cn(className)}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

BaseButton.displayName = "BaseButton";
