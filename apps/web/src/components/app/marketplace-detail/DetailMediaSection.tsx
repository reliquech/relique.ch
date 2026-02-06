"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

interface DetailMediaSectionProps {
  listing: MarketplaceListing;
}

export function DetailMediaSection({ listing }: DetailMediaSectionProps) {
  const images = listing.images?.length ? listing.images : [listing.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const currentImage = images[activeIndex];

  return (
    <div className="space-y-8">
      <div className="aspect-square bg-white/5 relative overflow-hidden border border-white/10">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt={listing.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`shrink-0 aspect-square w-20 border transition-all duration-300 ${
              activeIndex === i
                ? "border-primaryBlue scale-110 shadow-[0_0_20px_rgba(28,77,141,0.3)]"
                : "border-white/5 opacity-50 hover:opacity-100"
            }`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
