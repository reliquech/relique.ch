"use client";

import * as React from "react";
import { cn } from "../cn";

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "muted";
};

export function Surface({ className, tone = "default", ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "border rounded-none",
        tone === "muted" ? "bg-muted/20 border-border/80" : "bg-background border-border",
        className
      )}
      {...props}
    />
  );
}


