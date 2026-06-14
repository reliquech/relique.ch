"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CardItemData } from "@/lib/utils/marketplace";
import { useCurrency } from "@/contexts/CurrencyContext";

interface MarketplaceJerseyCardProps {
  item: CardItemData;
  index?: number;
  variant: "grid" | "carousel";
  isDragging?: boolean;
  className?: string;
  /** When true (grid only), card is not wrapped in Link; parent handles click e.g. for preview overlay */
  preventNavigation?: boolean;
}

/** Remote image: use img to avoid Next/Image domain restrictions */
function CardImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className ?? "w-full h-full object-cover"}
      draggable={false}
    />
  );
}

/**
 * Jersey-style marketplace card (relique-marketplace design).
 * Grid: links to /marketplace/[slug]. Carousel: no link, same visual.
 */
export function MarketplaceJerseyCard({
  item,
  index = 0,
  variant,
  isDragging = false,
  className = "",
  preventNavigation = false,
}: MarketplaceJerseyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { formatPrice } = useCurrency();

  const title = item.title || item.name || "UNTITLED";
  const player = item.signedBy || item.athlete || "—";
  const subtitle = [item.category, player].filter(Boolean).join(" • ");
  const condition = item.condition || "UNSPECIFIED";
  const backImage = item.backImage;
  const watchCount = item.watchCount ?? 0;
  const price = item.price ?? 0;

  const content = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={variant === "grid" ? { borderColor: "rgba(255,255,255,0.2)" } : undefined}
      className={`group bg-cardDark border border-white/10 flex flex-col cursor-pointer relative overflow-hidden h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative overflow-hidden bg-white/5 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!isHovered || !backImage ? (
            <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full">
              <CardImage src={item.image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </motion.div>
          ) : (
            <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full">
              <CardImage src={backImage} alt={`${title} back`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 flex flex-col gap-4 flex-grow">
        <div className="space-y-2">
          <h3 className="text-base font-bold tracking-tight text-white group-hover:text-accentBlue transition-colors line-clamp-2 min-h-[48px]">
            {title}
          </h3>
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
            {subtitle}
          </p>
        </div>

        <div className="mt-auto pt-5 border-t border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <p className="text-xl font-black text-white">
              {formatPrice(price)}
            </p>
            {watchCount > 0 && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-[10px] font-bold text-white/30">{watchCount}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-white/5 border border-white/5 text-white/30">
              {condition}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (variant === "grid" && item.slug && !preventNavigation) {
    return (
      <Link href={`/marketplace/${item.slug}`} className="block h-full" prefetch>
        {content}
      </Link>
    );
  }

  return content;
}
