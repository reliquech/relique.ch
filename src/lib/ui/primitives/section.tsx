"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../cn";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClass: Record<NonNullable<SectionProps["size"]>, string> = {
  sm: "py-10 md:py-14",
  md: "py-14 md:py-20",
  lg: "py-16 md:py-24",
};

export function Section({ asChild, className, size = "lg", ...props }: SectionProps) {
  const Comp = asChild ? Slot : "section";
  return <Comp className={cn(sizeClass[size], className)} {...props} />;
}


