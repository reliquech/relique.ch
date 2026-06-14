"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../cn";

export type ErrorStateProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("border rounded-none p-8 bg-background", className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-accent" aria-hidden />
        <div className="space-y-1">
          <h3 className="text-h4">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          {action ? <div className="pt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}


