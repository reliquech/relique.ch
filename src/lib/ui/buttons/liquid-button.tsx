"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../cn";

/**
 * LiquidButton - Button với liquid fill animation on hover
 * 
 * Đặc điểm:
 * - Liquid fill animation từ bottom lên top
 * - CSS Variables để customize colors
 * - Smooth animation với framer-motion
 * 
 * CSS Variables:
 * - `--liquid-button-color`: Text color khi hover (default: white)
 * - `--liquid-button-background-color`: Fill color (default: #1C4D8D)
 * 
 * @example
 * <LiquidButton>
 *   Hover Me
 * </LiquidButton>
 * 
 * @example
 * <LiquidButton 
 *   fillHeight="100%" 
 *   hoverScale={1.1}
 *   style={{ 
 *     '--liquid-button-background-color': '#498BC4' 
 *   } as React.CSSProperties}
 * >
 *   Custom Liquid Button
 * </LiquidButton>
 */
export interface LiquidButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Nội dung button */
  children: React.ReactNode;
  /** Delay của animation */
  delay?: string;
  /** Chiều cao của fill effect */
  fillHeight?: string;
  /** Scale khi hover */
  hoverScale?: number;
  /** Scale khi tap */
  tapScale?: number;
  /** Custom className */
  className?: string;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      children,
      delay = "0s",
      fillHeight = "100%",
      hoverScale = 1.05,
      tapScale = 0.95,
      className,
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          "relative overflow-hidden px-8 py-3 inline-flex items-center justify-center gap-2",
          // Colors - sử dụng CSS variables
          "bg-transparent text-white",
          "border-2 border-[var(--liquid-button-background-color,#1C4D8D)]",
          // Typography
          "font-bold text-sm tracking-wide",
          // Transition
          "transition-colors duration-300",
          // Focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#498BC4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
          // Disabled
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={{
          "--liquid-button-color": "white",
          "--liquid-button-background-color": "#1C4D8D",
          ...style,
        } as React.CSSProperties}
        whileHover={disabled ? {} : { scale: hoverScale }}
        whileTap={disabled ? {} : { scale: tapScale }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        disabled={disabled}
        {...props}
      >
        {/* Liquid fill layer */}
        <motion.span
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: "var(--liquid-button-background-color, #1C4D8D)",
            originY: 1,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isHovered ? 1 : 0 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
            delay: parseFloat(delay),
          }}
        />

        {/* Content layer */}
        <span
          className="relative z-10 transition-colors duration-300"
          style={{
            color: isHovered
              ? "var(--liquid-button-color, white)"
              : "var(--liquid-button-background-color, #1C4D8D)",
          }}
        >
          {children}
        </span>
      </motion.button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";
