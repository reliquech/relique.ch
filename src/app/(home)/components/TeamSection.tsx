"use client";

import { motion, Variants } from "framer-motion";
import { teamMembers } from "@/data/team.data";
import { ProfileCard } from "@/components/cards/ProfileCard";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function TeamSection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-bgDark border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-primaryBlue font-black text-[10px] sm:text-xs tracking-widest uppercase mb-3 sm:mb-4 block">
            Advisory Board
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Meet the People Behind Relique
          </h2>
          <p className="text-textSec text-base sm:text-lg max-w-2xl mx-auto mt-4 sm:mt-6">
            Institutional expertise meets sports heritage excellence
          </p>
          <div className="h-1 w-16 sm:w-20 bg-highlightIce mx-auto mt-4 sm:mt-6" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {teamMembers.map((member) => (
            <ProfileCard key={member.id} member={member} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
