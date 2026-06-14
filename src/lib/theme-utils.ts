/**
 * Theme Utilities
 * 
 * Centralized utility functions for theme-related logic like
 * status colors, badges, and other design system helpers.
 * 
 * This ensures consistency across the app and provides a
 * single source of truth for theme-related logic.
 */

import type { ReactNode } from "react";

// ============================================
// Types
// ============================================

export type Status = "qualified" | "inconclusive" | "disqualified";
export type EventType = "created" | "authenticated" | "listed" | "verified" | "updated";

// ============================================
// Status Utilities
// ============================================

/**
 * Get CSS classes for status badges
 * 
 * @param status - The status value
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```tsx
 * <Badge className={getStatusClasses("qualified")}>Qualified</Badge>
 * ```
 */
export function getStatusClasses(status: Status | string): string {
  const statusMap: Record<Status, string> = {
    qualified: "bg-green-600 text-white border-0",
    inconclusive: "bg-amber-600 text-white border-0",
    disqualified: "bg-red-600 text-white border-0",
  };

  return statusMap[status as Status] || "bg-muted text-muted-foreground border-0";
}

/**
 * Get status badge configuration (className + label)
 * 
 * @param status - The status value
 * @returns Object with className and label
 * 
 * @example
 * ```tsx
 * const badge = getStatusBadge(item.status);
 * <Badge className={badge.className}>{badge.label}</Badge>
 * ```
 */
export function getStatusBadge(status: Status | string) {
  const labels: Record<Status, string> = {
    qualified: "Qualified",
    inconclusive: "Inconclusive",
    disqualified: "Disqualified",
  };

  return {
    className: getStatusClasses(status),
    label: labels[status as Status] || status,
  };
}

/**
 * Get status color for timeline dots and indicators
 * 
 * @param status - The status value
 * @returns Tailwind CSS classes for border and background
 * 
 * @example
 * ```tsx
 * <div className={`w-4 h-4 rounded-full ${getStatusColor("qualified")}`} />
 * ```
 */
export function getStatusColor(status: Status | string): string {
  const colorMap: Record<Status, string> = {
    qualified: "border-green-500 bg-green-500",
    inconclusive: "border-amber-500 bg-amber-500",
    disqualified: "border-red-500 bg-red-500",
  };

  return colorMap[status as Status] || "border-muted bg-muted";
}

/**
 * Get status explanation text
 * 
 * @param status - The status value
 * @returns Human-readable explanation
 * 
 * @example
 * ```tsx
 * <p className="text-muted-foreground">{getStatusExplanation(item.status)}</p>
 * ```
 */
export function getStatusExplanation(status: Status | string): string {
  const explanations: Record<Status, string> = {
    qualified:
      "This item has been verified with high confidence. Our AI analysis indicates strong authenticity markers.",
    inconclusive:
      "This item requires additional verification. Some authenticity markers are present but more information is needed.",
    disqualified:
      "This item did not pass our authentication process. Authenticity markers were not sufficient.",
  };

  return explanations[status as Status] || "Status unknown.";
}

/**
 * Get status text color (for non-badge use)
 * 
 * @param status - The status value
 * @returns Tailwind CSS text color class
 */
export function getStatusTextColor(status: Status | string): string {
  const colorMap: Record<Status, string> = {
    qualified: "text-green-400",
    inconclusive: "text-amber-400",
    disqualified: "text-red-400",
  };

  return colorMap[status as Status] || "text-muted-foreground";
}

/**
 * Get status background color (for subtle backgrounds)
 * 
 * @param status - The status value
 * @returns Tailwind CSS background color class
 */
export function getStatusBgColor(status: Status | string): string {
  const colorMap: Record<Status, string> = {
    qualified: "bg-green-400/10",
    inconclusive: "bg-amber-400/10",
    disqualified: "bg-red-400/10",
  };

  return colorMap[status as Status] || "bg-muted/10";
}

// ============================================
// Event Type Utilities (for Timelines)
// ============================================

/**
 * Get color classes for timeline event dots
 * 
 * @param type - The event type
 * @returns Tailwind CSS classes for border and background
 */
export function getEventTypeColor(type: EventType | string): string {
  const colorMap: Record<EventType, string> = {
    created: "border-muted-foreground bg-muted-foreground",
    authenticated: "border-green-500 bg-green-500",
    verified: "border-blue-500 bg-blue-500",
    listed: "border-primary bg-primary",
    updated: "border-amber-500 bg-amber-500",
  };

  return colorMap[type as EventType] || "border-muted bg-muted";
}

// ============================================
// Typography Helpers
// ============================================

/**
 * Get metadata label classes (category tags, timestamps)
 * 
 * @param color - Optional color variant (primary, ice, white)
 * @returns Tailwind CSS classes
 */
export function getMetadataClasses(
  color: "primary" | "ice" | "white" | "default" = "default"
): string {
  const baseClasses = "text-[10px] font-black uppercase tracking-[0.4em]";

  const colorMap = {
    primary: `${baseClasses} text-primaryBlue`,
    ice: `${baseClasses} text-highlightIce`,
    white: `${baseClasses} text-white`,
    default: `${baseClasses} text-white/60`,
  };

  return colorMap[color];
}

/**
 * Get link arrow classes (interactive arrow links)
 * 
 * @param color - Optional color variant
 * @returns Tailwind CSS classes
 */
export function getLinkArrowClasses(
  color: "primary" | "ice" | "white" = "white"
): string {
  const baseClasses = "text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2";

  const colorMap = {
    primary: `${baseClasses} text-primaryBlue`,
    ice: `${baseClasses} text-highlightIce`,
    white: `${baseClasses} text-white`,
  };

  return colorMap[color];
}

// ============================================
// Card Helpers
// ============================================

/**
 * Get standard card classes
 * 
 * @param variant - Card style variant
 * @returns Tailwind CSS classes
 */
export function getCardClasses(variant: "default" | "elevated" | "interactive" = "default"): string {
  const baseClasses = "bg-cardDark border border-borderDark";

  const variantMap = {
    default: baseClasses,
    elevated: `${baseClasses} shadow-lg`,
    interactive: `${baseClasses} cursor-pointer hover:border-primaryBlue/30 transition-colors`,
  };

  return variantMap[variant];
}

// ============================================
// Button Helpers
// ============================================

/**
 * Get button classes based on variant and size
 * 
 * @param variant - Button style variant
 * @param size - Button size
 * @returns Tailwind CSS classes
 */
export function getButtonClasses(
  variant: "primary" | "secondary" | "ghost" = "primary",
  size: "sm" | "md" | "lg" = "md"
): string {
  const baseClasses = "font-black uppercase tracking-widest transition-all inline-block";

  const variantMap = {
    primary: "bg-primaryBlue hover:bg-accentBlue text-white shadow-[0_20px_40px_rgba(28,77,141,0.3)]",
    secondary: "border border-borderDark hover:bg-highlightIce hover:text-navy",
    ghost: "hover:bg-white/5",
  };

  const sizeMap = {
    sm: "px-6 py-2 text-xs",
    md: "px-10 py-4 text-xs",
    lg: "px-12 py-5 text-xs",
  };

  return `${baseClasses} ${variantMap[variant]} ${sizeMap[size]}`;
}

// ============================================
// Gradient Helpers
// ============================================

/**
 * Get gradient overlay classes (for images)
 * 
 * @param variant - Gradient style
 * @returns Tailwind CSS classes
 */
export function getGradientOverlay(
  variant: "dark" | "darker" | "bottom" = "dark"
): string {
  const gradientMap = {
    dark: "bg-gradient-to-br from-black/60 to-black/40",
    darker: "bg-gradient-to-br from-black/80 to-black/60",
    bottom: "bg-gradient-to-b from-transparent via-transparent to-bgDark/90",
  };

  return `absolute inset-0 ${gradientMap[variant]}`;
}

// ============================================
// Utility Type Guards
// ============================================

/**
 * Check if status is qualified
 */
export function isQualified(status: string): boolean {
  return status === "qualified";
}

/**
 * Check if status is inconclusive
 */
export function isInconclusive(status: string): boolean {
  return status === "inconclusive";
}

/**
 * Check if status is disqualified
 */
export function isDisqualified(status: string): boolean {
  return status === "disqualified";
}

/**
 * Check if status is positive (qualified)
 */
export function isPositiveStatus(status: string): boolean {
  return isQualified(status);
}

/**
 * Check if status is negative (disqualified)
 */
export function isNegativeStatus(status: string): boolean {
  return isDisqualified(status);
}

// ============================================
// Formatting Helpers
// ============================================

/**
 * Format price with currency.
 * Use when not inside CurrencyProvider; otherwise prefer useCurrency().formatPrice.
 *
 * @param price - Price value
 * @param showCents - Whether to show cents
 * @param currency - Currency code (default USD)
 * @returns Formatted price string
 */
export function formatPrice(
  price: number,
  showCents: boolean = false,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(price);
}

/**
 * Format date in Relique style
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 * 
 * @param date - Date to compare
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}
