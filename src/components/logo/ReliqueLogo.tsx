import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReliqueMark } from "./ReliqueMark";
import { ReliqueWordmark } from "./ReliqueWordmark";

export interface ReliqueLogoProps {
  markSize?: number;
  wordmarkSize?: "sm" | "md" | "lg" | "xl";
  gap?: number;
  className?: string;
  href?: string;
  animated?: boolean;
  text?: string;
}

/**
 * ReliqueLogo - Combined Mark + Wordmark component
 * 
 * @example
 * ```tsx
 * <ReliqueLogo href="/" animated />
 * <ReliqueLogo markSize={48} wordmarkSize="lg" gap={4} />
 * <ReliqueLogo wordmarkSize="xl" text="Relique.ch" />
 * ```
 */
export function ReliqueLogo({
  markSize = 40,
  wordmarkSize = "md",
  gap = 12,
  className,
  href,
  animated = false,
  text = "Relique",
}: ReliqueLogoProps) {
  const content = (
    <div 
      className={cn(
        "flex items-center",
        animated && "group transition-transform active:scale-95",
        className
      )}
      style={{ gap: `${gap}px` }}
    >
      <ReliqueMark 
        size={markSize} 
        animated={animated}
      />
      <ReliqueWordmark 
        size={wordmarkSize}
        text={text}
        animated={animated}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}
