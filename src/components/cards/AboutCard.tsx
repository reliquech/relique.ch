"use client";

import { motion } from "framer-motion";
import type { AboutCard as AboutCardType } from "@/data/about-cards.data";

interface AboutCardProps {
  card: AboutCardType;
  index: number;
  onClick: (href: string) => void;
}

/**
 * Reusable about/feature card component
 * Displays clickable card with title, description, and hover effects
 */
export function AboutCard({ card, index, onClick }: AboutCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.8, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      onClick={() => onClick(card.href)}
      className={`${card.size} p-6 sm:p-8 md:p-10 border border-borderDark ${card.bg} group cursor-pointer relative overflow-hidden flex flex-col justify-center min-h-[240px] sm:min-h-[260px] md:min-h-[280px] transition-all hover:border-highlightIce/30 shadow-xl`}
    >
      <div className="relative pt-4 sm:pt-6 z-10 flex flex-col">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 sm:mb-4 leading-none group-hover:text-highlightIce transition-colors">
          {card.title}
        </h3>
        <p className="text-textSec mb-6 sm:mb-8 text-sm sm:text-base md:text-lg leading-tight max-w-sm">
          {card.sub}
        </p>
        <div className="inline-flex gap-3 sm:gap-4 text-highlightIce font-black uppercase text-[9px] sm:text-[10px] tracking-widest">
          Explore Insights <span>→</span>
        </div>
      </div>
    </motion.div>
  );
}
