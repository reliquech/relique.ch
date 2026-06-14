import { Media } from "@/components/shared/Media";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SplitHeroProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  cta?: {
    label: string;
    href: string;
  };
  reverse?: boolean;
  className?: string;
}

export function SplitHero({
  title,
  description,
  image,
  imageAlt,
  cta,
  reverse = false,
  className,
}: SplitHeroProps) {
  return (
    <section
      className={cn(
        "container mx-auto px-4 py-8 md:py-16",
        className
      )}
    >
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center",
          reverse && "md:grid-flow-dense"
        )}
      >
        <div className={cn(
          "space-y-4 md:space-y-6 order-2 md:order-1",
          reverse && "md:col-start-2 md:order-2"
        )}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
          {cta && (
            <div className="pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href={cta.href}>{cta.label}</a>
              </Button>
            </div>
          )}
        </div>
        <div className={cn(
          "order-1 md:order-2 w-full",
          reverse && "md:col-start-1 md:order-1"
        )}>
          <Media
            src={image}
            alt={imageAlt || title}
            variant="hero"
            priority
            fill
            className="rounded-lg md:rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}

