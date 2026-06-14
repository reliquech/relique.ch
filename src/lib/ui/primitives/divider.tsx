"use client";

import * as React from "react";
import { cn } from "../cn";

export type DividerProps = React.HTMLAttributes<HTMLHRElement> & {
  tone?: "default" | "subtle";
};

export function Divider({ className, tone = "default", ...props }: DividerProps) {
  return (
    <hr
      className={cn(
        "border-0 border-t",
        tone === "subtle" ? "border-border/60" : "border-border",
        className
      )}
      {...props}
    />
  );
}


