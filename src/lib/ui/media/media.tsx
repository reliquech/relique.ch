"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "../cn";
import { Skeleton } from "../states/skeletons";

export type MediaRatio = "16:9" | "4:3" | "1:1" | "portrait";
export type MediaFit = "cover" | "contain";

export type MediaProps = {
  src: string;
  alt: string;
  ratio?: MediaRatio;
  fit?: MediaFit;
  priority?: boolean;
  overlay?: React.ReactNode;
  caption?: React.ReactNode;
  credit?: React.ReactNode;
  className?: string;
  sizes?: string;
};

const ratioClass: Record<MediaRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  portrait: "aspect-[3/4]",
};

export function Media({
  src,
  alt,
  ratio = "16:9",
  fit = "cover",
  priority = false,
  overlay,
  caption,
  credit,
  className,
  sizes,
}: MediaProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  return (
    <figure className={cn("space-y-2", className)}>
      <div className={cn("relative overflow-hidden border border-border rounded-none", ratioClass[ratio])}>
        {!loaded && !failed ? <Skeleton className="absolute inset-0" /> : null}
        {failed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ImageOff className="h-4 w-4" aria-hidden />
              <span>{alt || "Media unavailable"}</span>
            </div>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes ?? "100vw"}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "select-none",
              fit === "cover" ? "object-cover" : "object-contain"
            )}
          />
        )}
        {overlay ? <div className="absolute inset-0 pointer-events-none">{overlay}</div> : null}
      </div>
      {(caption || credit) ? (
        <figcaption className="text-xs text-muted-foreground flex items-start justify-between gap-4">
          <span>{caption}</span>
          {credit ? <span className="shrink-0">{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}


