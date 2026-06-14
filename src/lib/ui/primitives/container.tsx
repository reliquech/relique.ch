"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../cn";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  size?: "default" | "wide" | "narrow";
};

const sizeClass: Record<NonNullable<ContainerProps["size"]>, string> = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
};

export function Container({
  asChild,
  className,
  size = "default",
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClass[size],
        className
      )}
      {...props}
    />
  );
}


