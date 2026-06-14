"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "../cn";

/**
 * AlertButton - Destructive button cho actions nguy hiểm (delete, remove, etc.)
 * 
 * Đặc điểm:
 * - Background: Red (destructive)
 * - Hover: Darker red với shake effect
 * - Confirmation: Optional confirm dialog
 * - Animation: Shake on hover để nhấn mạnh sự nguy hiểm
 * 
 * @example
 * <AlertButton onClick={handleDelete}>
 *   Delete Item
 * </AlertButton>
 * 
 * @example
 * <AlertButton 
 *   requireConfirm
 *   confirmMessage="Are you sure you want to delete this?"
 *   onConfirm={handleDelete}
 * >
 *   Delete Permanently
 * </AlertButton>
 */
export interface AlertButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
> {
  /** Nội dung button */
  children: React.ReactNode;
  /** Yêu cầu xác nhận trước khi thực thi */
  requireConfirm?: boolean;
  /** Message cho confirm dialog */
  confirmMessage?: string;
  /** Callback khi confirm (chỉ dùng khi requireConfirm = true) */
  onConfirm?: () => void;
  /** Custom className */
  className?: string;
  /** Tắt animation */
  disableAnimation?: boolean;
  /** Hiển thị icon cảnh báo */
  showIcon?: boolean;
}

export const AlertButton = React.forwardRef<HTMLButtonElement, AlertButtonProps>(
  ({ 
    children, 
    requireConfirm = false,
    confirmMessage = "Are you sure you want to proceed?",
    onConfirm,
    className, 
    disabled,
    disableAnimation = false,
    showIcon = false,
    onClick,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (requireConfirm) {
        if (window.confirm(confirmMessage)) {
          onConfirm?.();
        }
      } else {
        onClick?.(e);
      }
    };

    const buttonClassName = cn(
      // Base styles
      "px-8 py-3 inline-flex items-center justify-center gap-2",
      // Colors - destructive red
      "bg-red-600 hover:bg-red-700 text-white",
      // Typography
      "font-bold text-sm tracking-wide",
      // Transition
      "transition-all duration-300",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
      // Disabled state
      disabled && "opacity-50 cursor-not-allowed",
      className
    );

    if (disableAnimation || disabled) {
      return (
        <button
          ref={ref}
          className={buttonClassName}
          disabled={disabled}
          onClick={handleClick}
          {...props}
        >
          {showIcon && <AlertTriangle className="w-4 h-4" />}
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ 
          scale: 1.02,
          x: [0, -2, 2, -2, 2, 0],
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ 
          scale: { duration: 0.2 },
          x: { duration: 0.4 }
        }}
        className={buttonClassName}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {showIcon && <AlertTriangle className="w-4 h-4" />}
        {children}
      </motion.button>
    );
  }
);

AlertButton.displayName = "AlertButton";
