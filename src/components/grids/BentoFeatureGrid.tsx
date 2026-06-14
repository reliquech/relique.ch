import { BentoCard } from "@/components/cards/BentoCard";
import { cn } from "@/lib/utils";

interface FeatureItem {
  image?: string;
  imageAlt?: string;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
}

interface BentoFeatureGridProps {
  title?: string;
  subtitle?: string;
  items: FeatureItem[];
  className?: string;
}

export function BentoFeatureGrid({
  title,
  subtitle,
  items,
  className,
}: BentoFeatureGridProps) {
  if (items.length === 0) return null;

  const bigItem = items[0];
  const smallItems = items.slice(1, 3);

  return (
    <section className={cn("space-y-6 sm:space-y-8", className)}>
      {(title || subtitle) && (
        <div className="text-center space-y-1 sm:space-y-2">
          {title && <h2 className="text-h2">{title}</h2>}
          {subtitle && <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {bigItem && (
          <div className="md:col-span-2">
            <BentoCard {...bigItem} />
          </div>
        )}
        <div className="space-y-4 sm:space-y-6">
          {smallItems.map((item, index) => (
            <BentoCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

