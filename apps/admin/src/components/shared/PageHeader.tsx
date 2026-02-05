"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

/**
 * Shared page header: title + optional actions slot (right-aligned).
 * Keeps CRM pages consistent (spacing, heading style).
 */
export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex justify-between items-center py-2 bg-background/95 backdrop-blur border-b border-border -mx-2 px-2 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none md:border-0 md:py-0">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white truncate">{title}</h2>
      {children ? <div className="flex flex-wrap gap-2 md:gap-3 shrink-0">{children}</div> : null}
    </div>
  );
}
