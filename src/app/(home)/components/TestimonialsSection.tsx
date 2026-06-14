"use client";

import { motion } from "framer-motion";
import { TestimonialsGrid } from "./testimonials/TestimonialsGrid";
import { TESTIMONIALS } from "@/data/testimonials.data";

/**
 * Testimonials section - displays customer reviews
 * Refactored from 87 lines to use composable components
 */
export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-bgDark relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 md:mb-20 text-center"
        >
          <span className="text-primaryBlue font-black text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-3 sm:mb-4 block">
            Market Sentiment
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3 sm:mb-4 leading-none">
            Voices of <span className="text-primaryBlue">Authenticity</span>
          </h2>
          <div className="h-1 w-16 sm:w-20 bg-highlightIce mx-auto mt-6 sm:mt-8 shadow-[0_0_20px_rgba(189,232,245,0.3)]" />
        </motion.div>

        <TestimonialsGrid testimonials={TESTIMONIALS} />
      </div>
    </section>
  );
}

