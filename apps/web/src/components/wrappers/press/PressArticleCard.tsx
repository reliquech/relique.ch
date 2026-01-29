"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, VIEWPORT_ONCE } from "@/lib/motion-variants";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type PressTone = "neutral" | "featured";

export interface PressArticleCardProps {
  href: string;
  publisher: string;
  title: string;
  excerpt?: string;
  dateLabel: string;
  readTime?: string;
  outletVerified?: boolean;
  logoSrc?: string;
  thumbnailSrc?: string;
  tone?: PressTone;
  className?: string;
  index?: number;
}

export function PressArticleCard({
  href,
  publisher,
  title,
  excerpt,
  dateLabel,
  readTime,
  outletVerified,
  logoSrc,
  thumbnailSrc,
  tone = "neutral",
  className,
  index = 0,
}: PressArticleCardProps) {
  const isFeatured = tone === "featured";

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className={cn("group", className)}
    >
      <Card
        className={cn(
          "rounded-none bg-cardDark border border-borderDark/60 overflow-hidden",
          "transition-colors focus-ring-primary",
          "group-hover:border-white/20"
        )}
      >
        <CardHeader className="p-0">
          <div className="relative">
            {thumbnailSrc ? (
              <div className="relative h-[180px] w-full overflow-hidden">
                <Image
                  src={thumbnailSrc}
                  alt={title}
                  fill
                  className={cn(
                    "object-cover transition-all duration-1000",
                    "group-hover:scale-110"
                  )}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  draggable={true}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-bgDark/90" />
              </div>
            ) : (
              <div className="h-[72px] bg-gradient-to-r from-bgDark to-cardDark border-b border-white/5" />
            )}

            <div className="absolute inset-x-0 top-0 p-4 sm:p-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-primaryBlue" />
                    <div className="w-1 h-4 bg-accentBlue" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primaryBlue">
                    {publisher}
                  </span>
                  {logoSrc && (
                    <div className="relative w-6 h-6 overflow-hidden">
                      <Image
                        src={logoSrc}
                        alt={`${publisher} logo`}
                        fill
                        className={cn("object-contain transition-all duration-700")}
                        sizes="24px"
                        draggable={false}
                      />
                    </div>
                  )}
                </div>
              </div>
              {isFeatured && (
                <Badge className="rounded-none bg-primaryBlue text-white border-0">Featured</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("p-6 sm:p-8", thumbnailSrc ? "pt-4 sm:pt-6" : "pt-6 sm:pt-8")}>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-highlightIce">
            {title}
          </h3>
          {excerpt && (
            <p className="mt-4 text-base leading-7 text-textSec line-clamp-3">{excerpt}</p>
          )}
          <div className="mt-6">
            <Separator className="bg-white/10" />
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
              <span className="text-white/60">{dateLabel}</span>
              {readTime && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-white/60">{readTime}</span>
                </>
              )}
              <span className="ml-auto text-white/40">Trusted coverage</span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <Button
              asChild
              variant="outline"
              className={cn(
                "rounded-none border-borderDark bg-transparent",
                "hover:bg-highlightIce hover:text-navy",
                "transition-all",
                "clip-path-slant"
              )}
            >
              <Link href={href} aria-label={`Open article: ${title}`}>
                View article
              </Link>
            </Button>

            <Link
              href={href}
              className={cn(
                "text-xs font-black uppercase tracking-[0.2em] text-white",
                "inline-flex items-center gap-2",
                "transition-transform group-hover:translate-x-1",
                "focus-ring-primary"
              )}
              aria-label={`Open article: ${title}`}
            >
              Read coverage <span className="text-primaryBlue">▶</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
