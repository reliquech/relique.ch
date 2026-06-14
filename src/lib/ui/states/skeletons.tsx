"use client";

import * as React from "react";
import { cn } from "../cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  rounded?: false;
};

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-muted/40 rounded-none", className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}


