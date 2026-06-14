"use client";

import * as React from "react";
import { cn } from "../cn";

export type BentoGridProps = React.HTMLAttributes<HTMLDivElement>;

export function BentoGrid({ className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn("grid grid-cols-12 gap-4 md:gap-6", className)}
      {...props}
    />
  );
}

export type BentoTileProps = React.HTMLAttributes<HTMLDivElement> & {
  colSpan?: number;
  rowSpan?: number;
};

export function BentoTile({ className, colSpan = 12, rowSpan = 1, style, ...props }: BentoTileProps) {
  const safeCol = Math.min(Math.max(colSpan, 1), 12);
  const safeRow = Math.min(Math.max(rowSpan, 1), 12);
  return (
    <div
      className={cn(
        "border rounded-none bg-background p-6",
        className
      )}
      style={{
        gridColumn: `span ${safeCol} / span ${safeCol}`,
        ...(safeRow > 1 ? { gridRow: `span ${safeRow} / span ${safeRow}` } : {}),
        ...(style ?? {}),
      }}
      {...props}
    />
  );
}


