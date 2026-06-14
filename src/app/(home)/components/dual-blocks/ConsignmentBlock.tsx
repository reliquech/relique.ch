"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Consignment block - right side of dual blocks section
 * Promotes asset consignment service
 */
export function ConsignmentBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex-1 bg-primaryBlue relative group overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/mock-images/consign.jpg"
          alt="Consignment"
          fill
          className="object-cover"
          priority
        />
      </div>
      <Link href="/consign" className="absolute inset-0 z-10" />
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
            className="text-white font-black text-4xl sm:text-5xl md:text-6xl absolute -top-6 sm:-top-8 md:-top-10 -left-6 sm:-left-8 md:-left-10 select-none"
          >
            02
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-none">
            Asset <br /> Consignment
          </h2>
          <motion.div 
            className="inline-flex items-center gap-3 sm:gap-4 text-white font-black uppercase text-xs sm:text-sm tracking-widest"
            whileHover={{ gap: 24 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            Consign Now <span>→</span>
          </motion.div>
        </div>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -bottom-6 sm:-bottom-8 md:-bottom-10 -right-6 sm:-right-8 md:-right-10 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-highlightIce/20 pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
}
