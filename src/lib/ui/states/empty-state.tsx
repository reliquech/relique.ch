"use client";

import * as React from "react";
import { cn } from "../cn";

export type EmptyStateProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("border rounded-none p-8 text-center bg-background", className)}>
      {icon ? <div className="mx-auto mb-4 flex w-fit items-center justify-center">{icon}</div> : null}
      <h3 className="text-h4">{title}</h3>
      {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}


