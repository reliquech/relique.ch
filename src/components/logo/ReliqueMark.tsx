import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ReliqueMarkProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

const SIZE_MAP = {
  sm: 24,
  md: 40,
  lg: 64,
  xl: 96,
} as const;

/**
 * ReliqueMark - Logo icon component (R. mark)
 * 
 * @example
 * ```tsx
 * <ReliqueMark size="md" animated />
 * <ReliqueMark size={48} className="my-custom-class" />
 * ```
 */
export function ReliqueMark({ 
  size = "md", 
  className,
  animated = false,
}: ReliqueMarkProps) {
  const numericSize = typeof size === "number" ? size : SIZE_MAP[size];
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center transition-all duration-500",
        animated && "hover:scale-110",
        className
      )}
      style={{ width: numericSize, height: numericSize }}
    >
      <Image
        src="/brand/relique-logo.svg"
        alt="Relique Mark"
        width={numericSize}
        height={numericSize}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
