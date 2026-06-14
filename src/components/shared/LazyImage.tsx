"use client";

import { Media } from "./Media";

interface LazyImageProps {
  src: string;
  alt: string;
  variant?: "hero" | "card" | "banner" | "avatar" | "logo-strip";
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  aspectRatio?: string;
}

export function LazyImage({
  src,
  alt,
  variant = "card",
  className,
  width,
  height,
  fill = true,
  aspectRatio,
}: LazyImageProps) {
  return (
    <Media
      src={src}
      alt={alt}
      variant={variant}
      priority={false}
      className={className}
      width={width}
      height={height}
      fill={fill}
      aspectRatio={aspectRatio}
    />
  );
}

