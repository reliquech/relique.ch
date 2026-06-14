"use client";

import * as React from "react";
import { cn } from "../cn";
import { BentoGrid, BentoTile } from "./bento-grid";
import { Media } from "../media/media";

export type TeamMember = {
  name: string;
  role?: string;
  bio?: string;
  imageSrc?: string;
};

export type TeamGridProps = {
  title?: React.ReactNode;
  members: TeamMember[];
  className?: string;
};

export function TeamGrid({ title = "Team", members, className }: TeamGridProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <h3 className="text-h3">{title}</h3>
      </div>
      <BentoGrid>
        {members.map((m) => (
          <BentoTile key={m.name} colSpan={4} className="p-0 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                {m.imageSrc ? (
                  <div className="w-12">
                    <Media src={m.imageSrc} alt={m.name} ratio="1:1" fit="cover" />
                  </div>
                ) : (
                  <div className="h-12 w-12 border border-border bg-muted/20 rounded-none" aria-hidden />
                )}
                <div className="min-w-0">
                  <div className="font-semibold truncate">{m.name}</div>
                  {m.role ? <div className="text-sm text-muted-foreground truncate">{m.role}</div> : null}
                </div>
              </div>
              {m.bio ? <p className="text-sm text-muted-foreground line-clamp-3">{m.bio}</p> : null}
            </div>
          </BentoTile>
        ))}
      </BentoGrid>
    </div>
  );
}


