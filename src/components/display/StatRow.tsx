import { cn } from "@/lib/utils";

interface Stat {
  value: string | number;
  label: string;
  description?: string;
}

interface StatRowProps {
  stats: Stat[];
  className?: string;
}

export function StatRow({ stats, className }: StatRowProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-12", className)}>
      {stats.map((stat, idx) => (
        <div key={idx} className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary">{stat.value}</div>
          <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </div>
          {stat.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

