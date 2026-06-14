"use client";

import * as React from "react";
import { cn } from "../cn";
import { BentoGrid, BentoTile } from "./bento-grid";

export type FeatureTile = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
};

export type FeatureTilesProps = {
  items: FeatureTile[];
  className?: string;
  columns?: 2 | 3 | 4;
};

export function FeatureTiles({ items, className, columns = 3 }: FeatureTilesProps) {
  const span = columns === 4 ? 3 : columns === 3 ? 4 : 6;

  return (
    <BentoGrid className={className}>
      {items.map((item, idx) => (
        <BentoTile
          key={idx}
          colSpan={span}
          className={cn(
            "group transition-colors",
            "hover:border-accent focus-within:border-accent"
          )}
        >
          <div className="space-y-3">
            {item.icon ? (
              <div className="text-accent" aria-hidden>
                {item.icon}
              </div>
            ) : null}
            <div className="space-y-1">
              <div className="font-semibold group-hover:underline">{item.title}</div>
              {item.description ? (
                <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
              ) : null}
            </div>
          </div>
        </BentoTile>
      ))}
    </BentoGrid>
  );
}


