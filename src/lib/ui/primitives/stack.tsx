"use client";

import * as React from "react";
import { cn } from "../cn";

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: "none" | "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
};

const gapClass: Record<NonNullable<StackProps["gap"]>, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-10",
};

const alignClass: Record<NonNullable<StackProps["align"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function Stack({
  className,
  gap = "md",
  align = "stretch",
  ...props
}: StackProps) {
  return (
    <div className={cn("flex flex-col", gapClass[gap], alignClass[align], className)} {...props} />
  );
}


