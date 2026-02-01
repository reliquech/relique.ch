"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReliqueMark } from "@/components/logo";

export function WhySection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-bgDark overflow-hidden relative border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 md:order-1"
          >
            <div className="inline-block px-3 sm:px-4 py-1 bg-primaryBlue/10 border border-primaryBlue/20 mb-4 sm:mb-6">
              <span className="text-primaryBlue font-black text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase">Relique.ch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-6 sm:mb-8">
              A standards-driven sports memorabilia platform built on{" "}
              <span className="text-highlightIce">trust, transparency, and long-term value.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/authenticate"
                  className="px-8 py-3 sm:px-10 sm:py-4 bg-primaryBlue text-white font-black uppercase text-[10px] sm:text-xs tracking-widest transition-colors shadow-2xl inline-block min-h-[44px] flex items-center justify-center"
                >
                  Authenticate Now
                </Link>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-textSec">In Partnership with</span>
                <span className="text-base sm:text-lg font-black italic text-highlightIce">St.B AI</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-1 md:order-2 flex justify-center"
          >
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square bg-cardDark border border-white/10 p-8 sm:p-10 md:p-12 flex items-center justify-center group">
              <div className="absolute inset-0 bg-primaryBlue/5 group-hover:bg-primaryBlue/10 transition-all" />
              <img 
                src="/mock-images/thewhyimage.png"
                alt="Lý do chọn Relique"
                className="object-cover w-full h-full absolute inset-0 z-10 transition-all"
              />
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-b-2 border-r-2 border-highlightIce pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
