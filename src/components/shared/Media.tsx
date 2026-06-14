"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AssetEntry } from "@/lib/assets/manifest";

interface MediaProps {
  src: string;
  alt: string;
  variant?: "hero" | "card" | "banner" | "avatar" | "logo-strip";
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

const variantStyles = {
  hero: "w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]",
  card: "w-full h-64 md:h-80",
  banner: "w-full h-64 md:h-96",
  avatar: "w-12 h-12 md:w-16 md:h-16",
  "logo-strip": "w-full h-20 md:h-32",
};

const variantObjectFit = {
  hero: "cover" as const,
  card: "cover" as const,
  banner: "cover" as const,
  avatar: "cover" as const,
  "logo-strip": "contain" as const,
};

export function Media({
  src,
  alt,
  variant = "card",
  priority = false,
  className,
  width,
  height,
  fill = false,
  aspectRatio,
  objectFit,
  placeholder = "empty",
  blurDataURL,
}: MediaProps) {
  const fit = objectFit || variantObjectFit[variant];
  const containerClass = variantStyles[variant];

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", containerClass, className)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className={cn("object-cover", fit === "cover" ? "object-cover" : "object-contain")}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={
            variant === "hero"
              ? "100vw"
              : variant === "card"
                ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                : "100vw"
          }
        />
      </div>
    );
  }

  if (width && height) {
    return (
      <div className={cn("relative overflow-hidden", aspectRatio && `aspect-[${aspectRatio}]`, className)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={cn(
            "object-cover",
            fit === "cover" ? "object-cover" : fit === "contain" ? "object-contain" : ""
          )}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClass, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={cn("object-cover", fit === "cover" ? "object-cover" : "object-contain")}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={
          variant === "hero"
            ? "100vw"
            : variant === "card"
              ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              : "100vw"
        }
      />
    </div>
  );
}

interface MediaFromAssetProps {
  asset: AssetEntry;
  priority?: boolean;
  className?: string;
  fill?: boolean;
}

export function MediaFromAsset({ asset, priority = false, className, fill = true }: MediaFromAssetProps) {
  return (
    <Media
      src={asset.src}
      alt={asset.alt}
      variant={asset.variant || "card"}
      priority={priority}
      className={className}
      fill={fill}
      aspectRatio={asset.aspectRatio}
      placeholder="empty"
    />
  );
}

