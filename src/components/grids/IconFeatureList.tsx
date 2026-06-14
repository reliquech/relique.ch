import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface IconFeatureListProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function IconFeatureList({
  features,
  columns = 3,
  className,
}: IconFeatureListProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6 sm:gap-8", gridCols[columns], className)}>
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <div key={idx} className="space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary/10">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}

