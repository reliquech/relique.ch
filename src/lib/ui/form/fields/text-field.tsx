"use client";

import * as React from "react";
import { cn } from "../../cn";
import { FormControl } from "../form";

export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function TextField({ className, type = "text", ...props }: TextFieldProps) {
  return (
    <FormControl>
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm",
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


