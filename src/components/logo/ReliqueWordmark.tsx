import { cn } from "@/lib/utils";

export interface ReliqueWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  text?: string;
}

const SIZE_MAP = {
  sm: "text-base",      // 1rem
  md: "text-2xl",       // 1.5rem
  lg: "text-4xl",       // 2.25rem
  xl: "text-5xl",       // 3rem
} as const;

/**
 * ReliqueWordmark - Logo wordmark component với Zapf Renaissance font
 * 
 * @example
 * ```tsx
 * <ReliqueWordmark size="lg" animated />
 * <ReliqueWordmark size="sm" text="Relique.ch" />
 * ```
 */
export function ReliqueWordmark({ 
  size = "md", 
  className,
  animated = false,
  text = "Relique",
}: ReliqueWordmarkProps) {
  return (
    <span
      className={cn(
        "tracking-wide transition-colors",
        SIZE_MAP[size],
        animated && "hover:text-highlightIce",
        className
      )}
      style={{ fontFamily: 'var(--font-zapf-renaissance), serif' }}
    >
      {text}
    </span>
  );
}
