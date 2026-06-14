import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

export function FormProgress({
  currentStep,
  totalSteps,
  steps,
  className,
}: FormProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={cn(
              "flex-1 flex items-center",
              idx < steps.length - 1 && "mr-2"
            )}
          >
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-none flex items-center justify-center text-sm font-medium border-2 transition-colors",
                  idx + 1 <= currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-muted"
                )}
              >
                {idx + 1}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center",
                  idx + 1 <= currentStep
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  idx + 1 < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

