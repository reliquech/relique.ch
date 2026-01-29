"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PARTNERS, type Partner } from "@/data/partners.data";

const MIN_W_PX = 160;
const GAP_PX = 48;
const MARQUEE_LOOP_PX = PARTNERS.length * (MIN_W_PX + GAP_PX) - GAP_PX;

export function PartnerCarousel() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const displayPartners = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-24 bg-bgDark border-y border-white/5 relative overflow-hidden select-none">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primaryBlue to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primaryBlue to-transparent" />
      </div>

      <div className="container mx-auto px-6 mb-16 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primaryBlue font-black uppercase text-[10px] tracking-[0.5em] mb-4 block">
            Institutional Network
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
            Ecosystem <span className="text-primaryBlue">Backbone</span>
          </h2>
        </motion.div>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex gap-12 py-10"
          animate={{ x: [0, -MARQUEE_LOOP_PX] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          style={{ width: "fit-content" }}
        >
          {displayPartners.map((partner, idx) => (
            <PartnerNode
              key={`${partner.id}-${idx}`}
              partner={partner}
              isDimmed={hoveredId !== null && hoveredId !== partner.id}
              isHovered={hoveredId === partner.id}
              onHoverStart={() => setHoveredId(partner.id)}
              onHoverEnd={() => setHoveredId(null)}
            />
          ))}
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
          Forensic Node Verification: Active // Secured via St.B Protocol
        </p>
      </div>
    </section>
  );
}

interface PartnerNodeProps {
  partner: Partner;
  isDimmed: boolean;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function PartnerNode({
  partner,
  isDimmed,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: PartnerNodeProps) {
  return (
    <motion.div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      animate={{
        opacity: isDimmed ? 0.2 : 1,
        filter: isDimmed ? "blur(2px)" : "blur(0px)",
        scale: isHovered ? 1.1 : 1,
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center cursor-crosshair min-w-[160px]"
    >
      <div className="relative group/circle">
        <div
          className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full border-2 border-white/5 flex items-center justify-center p-6 transition-all duration-500 group-hover/circle:border-primaryBlue/50 shadow-[0_0_0_rgba(28,77,141,0)] group-hover/circle:shadow-[0_0_30px_rgba(28,77,141,0.2)] ${partner.overflow === "visible" ? "overflow-visible" : "overflow-hidden"}`}
          style={{ backgroundColor: partner.logoBg }}
        >
          <div
            className="relative w-full h-full min-w-0"
            style={{
              transform: `scale(${partner.logoZoom ?? 1})`,
              transformOrigin: "center",
            }}
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              fill
              className="object-contain brightness-125 transition-all duration-700"
              sizes="(max-width: 1024px) 96px, 128px"
            />
          </div>
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border border-primaryBlue/30 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
