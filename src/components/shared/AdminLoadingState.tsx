"use client";

import React from "react";

interface LoadingStateProps {
  label?: string;
}

export function AdminLoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="border border-border bg-surface rounded-xl p-12 text-center text-muted-foreground">
      {label}
    </div>
  );
}
