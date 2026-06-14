"use client";

import { motion } from "framer-motion";
import type { Testimonial } from "@/data/testimonials.data";

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

/**
 * Reusable testimonial card component
 * Displays customer review with rating, quote, and verified badge
 */
export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.8 }}
      whileHover={{ y: -8, borderColor: "rgba(28, 77, 141, 0.5)" }}
      className="bg-cardDark border border-white/5 p-6 sm:p-8 md:p-10 relative group transition-all"
    >
      <div className="flex gap-1 mb-4 sm:mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <span key={i} className="text-primaryBlue text-xs">
            ★
          </span>
        ))}
      </div>
      <p className="text-base sm:text-lg font-medium text-textSec mb-6 sm:mb-8 leading-relaxed italic">
        &quot;{testimonial.quote}&quot;
      </p>
      <div className="pt-6 sm:pt-8 border-t border-white/5 flex items-center justify-between">
        <div>
          <h4 className="font-black uppercase text-[10px] sm:text-xs text-white mb-1">
            {testimonial.name}
          </h4>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40">
            {testimonial.role}
          </p>
        </div>
        {testimonial.verified && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primaryBlue/10 flex items-center justify-center border border-primaryBlue/20">
            <span className="text-[8px] font-black text-primaryBlue">V</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
