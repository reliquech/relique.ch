"use client";

import * as React from "react";
import { cn } from "../cn";
import { BentoGrid, BentoTile } from "./bento-grid";
import { Media } from "../media/media";

export type Partner = {
  name: string;
  logoSrc?: string;
  href?: string;
};

export type PartnerStripProps = {
  title?: React.ReactNode;
  partners: Partner[];
  className?: string;
};

export function PartnerStrip({ title = "Trusted Partners", partners, className }: PartnerStripProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <h3 className="text-h3">{title}</h3>
      </div>
      <BentoGrid>
        {partners.map((p) => (
          <BentoTile key={p.name} colSpan={3} className="p-0 overflow-hidden">
            <a
              href={p.href ?? "#"}
              className={cn(
                "flex h-full items-center justify-center p-6",
                "hover:border-accent border border-transparent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              )}
              aria-label={`Partner: ${p.name}`}
            >
              {p.logoSrc ? (
                <div className="w-36">
                  <Media src={p.logoSrc} alt={p.name} ratio="4:3" fit="contain" />
                </div>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{p.name}</span>
              )}
            </a>
          </BentoTile>
        ))}
      </BentoGrid>
    </div>
  );
}


