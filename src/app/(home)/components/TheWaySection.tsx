"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AboutCard } from "@/components/cards/AboutCard";
import { ABOUT_CARDS } from "@/data/about-cards.data";

/**
 * The Way section - displays about/mission cards
 * Refactored from 92 lines to use composable components
 */
export function TheWaySection() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    const [path, hash] = href.split("#");
    router.push(path || "/");
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView();
      }, 100);
    }
  };

  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 bg-bgDark border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-16"
        >
          <span className="text-primaryBlue font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-4 block">
            Foundational Core
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-3 sm:mb-4 leading-none">
            The Way <span className="text-primaryBlue">of Relique.ch</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {ABOUT_CARDS.map((card, idx) => (
            <AboutCard 
              key={card.title} 
              card={card} 
              index={idx}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
