"use client";

import * as React from "react";
import { cn } from "../cn";

export type KbdProps = React.HTMLAttributes<HTMLElement> & {
  keys?: string;
};

export function Kbd({ className, keys, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-none border border-border bg-background px-2 py-1 text-xs font-medium text-foreground/90",
        className
      )}
      {...props}
    >
      {children ?? keys}
    </kbd>
  );
}


