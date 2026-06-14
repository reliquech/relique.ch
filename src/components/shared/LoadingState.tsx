import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "inline";
  message?: string;
  className?: string;
}

export function LoadingState({
  variant = "skeleton",
  message,
  className,
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent" />
        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent" />
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        {message && (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}

