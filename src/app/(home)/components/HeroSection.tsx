"use client";

import Link from "next/link";
import { motion } from "framer-motion";


export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-screen flex items-center overflow-hidden diagonal-bg"
      style={{
        minHeight: "100dvh",
        height: "100dvh",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-center relative z-10 h-full">
        <motion.div
          className="text-center max-w-full sm:max-w-4xl md:max-w-5xl w-full"
          style={{ fontFamily: 'var(--font-zapf-renaissance), serif' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg tracking-[0.3em] sm:tracking-[0.4em] uppercase">Relique Official Portal</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-[80px] lg:text-[120px] font-medium tracking-wide leading-[0.90] sm:leading-[0.85] mb-6 sm:mb-8"
            style={{ fontFamily: 'var(--font-zapf-renaissance), serif' }}
          >
            <span className="text-white">Relics</span>{" "}
            <span className="text-primaryBlue">you</span>
            <br />
            <span className="text-primaryBlue">can </span>
            <span className="text-white">rely</span>{" "}
            <span className="text-primaryBlue">on</span>
          </h1>

          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(28, 77, 141, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/authenticate"
                className="px-8 py-4 sm:px-10 sm:py-4 md:px-12 md:py-5 bg-primaryBlue hover:bg-accentBlue text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(28,77,141,0.3)] inline-block font-work-sans min-h-[44px] flex items-center justify-center"
                style={{ fontFamily: 'var(--font-work-sans), sans-serif' }}
              >
                Authenticate Now
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}