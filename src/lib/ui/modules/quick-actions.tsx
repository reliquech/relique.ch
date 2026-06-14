"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../cn";
import { BentoGrid, BentoTile } from "./bento-grid";

export type QuickAction = {
  title: React.ReactNode;
  description?: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
};

export type QuickActionsProps = {
  items: QuickAction[];
  className?: string;
};

export function QuickActions({ items, className }: QuickActionsProps) {
  const span = items.length >= 4 ? 3 : items.length === 3 ? 4 : 6;

  return (
    <BentoGrid className={className}>
      {items.map((item, idx) => (
        <BentoTile
          key={idx}
          colSpan={span}
          className={cn("p-0 overflow-hidden hover:border-accent transition-colors")}
        >
          <a
            href={item.href}
            className={cn(
              "block h-full p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            )}
            aria-label={typeof item.title === "string" ? String(item.title) : undefined}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.icon ? <span className="text-accent" aria-hidden>{item.icon}</span> : null}
                  <span className="font-semibold">{item.title}</span>
                </div>
                {item.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                ) : null}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
            </div>
          </a>
        </BentoTile>
      ))}
    </BentoGrid>
  );
}


