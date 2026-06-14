"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { Status } from "@/data/marketplace.data";
import { formatPrice, getStatusLabel } from "@/lib/utils/marketplace";
import type { CardItemData } from "@/lib/utils/marketplace";

/** Ảnh từ URL (Supabase): dùng <img> để tránh Next/Image chặn domain, luôn hiển thị được */
function CardImage({
  src,
  alt,
  fill,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
}) {
  const isRemote = src.startsWith("http");
  if (isRemote) {
    return (
      <img
        src={src}
        alt={alt}
        className={fill ? "absolute inset-0 w-full h-full object-cover" : className ?? "w-full h-full object-cover"}
        draggable={false}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : 800}
      height={fill ? undefined : 800}
      fill={fill}
      className={className}
      draggable={false}
    />
  );
}

interface MarketplaceCardProps {
  item: CardItemData;
  index: number;
  variant: "carousel" | "grid";
  isDragging?: boolean;
  className?: string;
}

/**
 * Unified marketplace card component
 * Combines HomeCarouselCard and ListingCard with variant-based rendering
 * - carousel: Used in home section carousel with drag support
 * - grid: Used in marketplace grid with links and pricing
 */
export function MarketplaceCard({
  item,
  index,
  variant,
  isDragging = false,
  className = "",
}: MarketplaceCardProps) {
  const isCarousel = variant === "carousel";
  const isGrid = variant === "grid";

  // Animation configs differ by variant
  const initial = { opacity: 0, y: 30 };
  const animate = isGrid ? { opacity: 1, y: 0 } : undefined;
  const whileInView = isCarousel ? { opacity: 1, y: 0 } : undefined;
  const viewport = isCarousel ? { once: true } : undefined;
  const transition = isCarousel
    ? { delay: index * 0.05 }
    : { delay: index * 0.1 };

  // Container classes differ by variant
  const containerClasses = isCarousel
    ? `flex-none w-[220px] sm:w-[240px] md:w-[280px] lg:w-[320px] bg-cardDark border border-borderDark/60 relative ${className}`
    : `bg-cardDark border border-white/5 overflow-hidden ${className}`;

  // Image container classes differ by variant
  const imageContainerClasses = isCarousel
    ? "relative aspect-square overflow-hidden"
    : "aspect-square overflow-hidden relative";

  const imageClasses = isCarousel
    ? "w-full h-full object-cover pointer-events-none"
    : "object-cover";

  return (
    <motion.div
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      className={containerClasses}
    >
      {/* Image Container */}
      <div className={imageContainerClasses}>
        {item.image ? (
          <CardImage
            src={item.image}
            alt={item.name || item.title || "Item"}
            fill={isGrid}
            className={imageClasses}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}

        {/* Carousel-specific gradient overlay */}
        {isCarousel && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-bgDark/90" />
        )}

        {/* Category Badge (top-left) */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
          <div className="bg-navy/80 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white">
            {item.category}
          </div>
        </div>

        {/* Status Badge (top-right) */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
          {isCarousel && item.status ? (
            <StatusBadge status={item.status as Status} />
          ) : (
            <div className="bg-primaryBlue px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
              {getStatusLabel(item.status)}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      {isCarousel ? (
        // Carousel Content
        <div className="p-4 sm:p-5 relative">
          <div className="absolute -top-10 sm:-top-12 left-0 w-full h-10 sm:h-12 bg-gradient-to-t from-cardDark to-transparent" />

          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primaryBlue mb-1">
                {item.athlete}
              </p>
              <h3 className="text-base sm:text-lg font-semibold leading-tight">
                {item.name}
              </h3>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-highlightIce/40">
              {item.year}
            </span>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-primaryBlue" />
              <div className="w-1 h-3 bg-accentBlue" />
            </div>
            <span className="text-white font-black text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase flex items-center gap-1">
              View History <span className="text-primaryBlue">▶</span>
            </span>
          </div>
        </div>
      ) : (
        // Grid Content
        <div className="p-3 sm:p-4">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primaryBlue mb-1">
            {item.signedBy || item.category}
          </p>
          <h3 className="text-sm sm:text-base font-semibold mb-3 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
            <span className="text-xs sm:text-sm font-black">
              {item.price ? formatPrice(item.price) : "$0"}
            </span>
            {item.slug && (
              <Link
                href={`/marketplace/${item.slug}`}
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-highlightIce border-b border-highlightIce"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
