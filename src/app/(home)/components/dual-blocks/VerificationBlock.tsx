"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Verification block - left side of dual blocks section
 * Promotes item verification service
 */
export function VerificationBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex-1 bg-navy relative border-r border-borderDark group overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/mock-images/verify2.jpg"
          alt="Verification"
          fill
          className="object-cover"
          priority
        />
      </div>
      <Link href="/verify" className="absolute inset-0 z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 pointer-events-none z-[1]" />
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full p-8 sm:p-12 md:p-16 lg:p-24 flex flex-col justify-center relative z-10"
      >
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.3 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-highlightIce font-black text-4xl sm:text-5xl md:text-6xl absolute -top-6 sm:-top-8 md:-top-10 -left-6 sm:-left-8 md:-left-10 select-none"
          >
            01
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-none">
            Items <br /> Verification
          </h2>
          <motion.div 
            className="inline-flex items-center gap-3 sm:gap-4 text-highlightIce font-black uppercase text-xs sm:text-sm tracking-widest"
            whileHover={{ gap: 24 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            Verify Now <span>→</span>
          </motion.div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute -bottom-12 sm:-bottom-16 md:-bottom-20 -right-12 sm:-right-16 md:-right-20 w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 border-[30px] sm:border-[40px] border-white rounded-full pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
}
