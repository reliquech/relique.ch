"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type RemoteImageFillProps = {
  src: string;
  alt: string;
  fill: true;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

type RemoteImageSizedProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

type RemoteImageProps = RemoteImageFillProps | RemoteImageSizedProps;

/** Use native img for remote URLs (Supabase storage); next/image for local assets. */
export function RemoteImage(props: RemoteImageProps) {
  const { src, alt, className } = props;
  const isRemote = src.startsWith("http");

  if ("fill" in props && props.fill) {
    if (isRemote) {
      return (
        <img
          src={src}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", className)}
          draggable={false}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={props.sizes}
        priority={props.priority}
        className={className}
        draggable={false}
      />
    );
  }

  const { width, height } = props as RemoteImageSizedProps;
  if (isRemote) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        draggable={false}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={props.priority}
      className={className}
      draggable={false}
    />
  );
}
