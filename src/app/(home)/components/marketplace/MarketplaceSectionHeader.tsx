"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface MarketplaceSectionHeaderProps {
  className?: string;
}


export function MarketplaceSectionHeader({ className = "" }: MarketplaceSectionHeaderProps) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 mb-8 sm:mb-10 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-primaryBlue font-black uppercase text-[10px] sm:text-xs tracking-widest mb-2 block">
          Curated Listings
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Consigned Marketplace
        </h2>
      </motion.div>
      <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
        <div className="flex gap-2 items-center mb-1">
          <div className="w-6 sm:w-8 h-[1px] bg-highlightIce/30" />
          <span className="text-[9px] sm:text-[10px] text-highlightIce/50 font-black uppercase tracking-widest">
            Swipe or Drag
          </span>
        </div>
        <Link
          href="/marketplace"
          className="px-5 py-2 sm:px-6 border border-borderDark hover:bg-highlightIce hover:text-navy text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all clip-path-slant inline-block w-full sm:w-auto text-center min-h-[44px] flex items-center justify-center"
        >
          Explore All
        </Link>
      </div>
    </div>
  );
}
