"use client";

import * as React from "react";
import { cn } from "../../cn";
import { FormControl } from "../form";

export type TextareaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaField({ className, ...props }: TextareaFieldProps) {
  return (
    <FormControl>
      <textarea
        className={cn(
          "min-h-[96px] w-full rounded-none border border-input bg-background px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </FormControl>
  );
}


