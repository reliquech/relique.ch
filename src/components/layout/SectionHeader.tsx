import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  cta,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {eyebrow && (
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {eyebrow}
        </p>
      )}
      <h2 className="text-h2">{title}</h2>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
      )}
      {cta && (
        <div>
          <Button asChild variant="outline">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

