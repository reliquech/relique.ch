"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function StrategicPartnerSection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-navy/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
              Strategic Partner
            </h2>
            <p className="text-textSec text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8">
              We are backed by <span className="text-white font-semibold">St.B</span>, providing unparalleled
              infrastructure and compliance for high-value physical assets. Together, we ensure every piece in our
              marketplace is secured, insured, and verified to institutional standards.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="h-[2px] w-8 sm:w-12 bg-primaryBlue" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Excellence Defined</span>
            </div>
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-bgDark border-2 border-accentBlue rotate-3 flex items-center justify-center group overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
              />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 transition-transform group-hover:scale-110">
                <Image
                  src="/brand/stb-logo.svg"
                  alt="St.B Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

