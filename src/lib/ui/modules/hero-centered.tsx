"use client";

import * as React from "react";
import { Container } from "../primitives/container";
import { Section } from "../primitives/section";
import { Stack } from "../primitives/stack";
import { Media, type MediaProps } from "../media/media";
import { cn } from "../cn";

export type HeroCenteredProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  media?: Pick<MediaProps, "src" | "alt" | "ratio" | "fit" | "priority" | "overlay">;
  className?: string;
};

export function HeroCentered({ title, description, actions, media, className }: HeroCenteredProps) {
  return (
    <Section className={cn("border-b", className)}>
      <Container>
        <Stack align="center" className="text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-h1">{title}</h1>
            {description ? <p className="text-xl text-muted-foreground">{description}</p> : null}
            {actions ? <div className="flex flex-wrap justify-center gap-2 pt-2">{actions}</div> : null}
          </div>
          {media ? (
            <div className="w-full pt-8">
              <Media
                src={media.src}
                alt={media.alt}
                ratio={media.ratio ?? "16:9"}
                fit={media.fit ?? "cover"}
                priority={media.priority ?? false}
                overlay={media.overlay}
              />
            </div>
          ) : null}
        </Stack>
      </Container>
    </Section>
  );
}


