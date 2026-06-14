"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProfileCardProps } from "./types";
import { ProfileChips } from "./ProfileChips";
import { ProfileDrawer } from "./ProfileDrawer";

/**
 * ProfileCard - Main team member card component
 * Displays card with tagline, opens full drawer on click
 */
export function ProfileCard({ member, className }: ProfileCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const displayTagline = member.tagline ?? "";
  const displayWatermark = member.watermark ?? "R";

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
          }
        }}
        whileHover={{ y: -10, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "bg-cardDark border border-borderDark/60",
          "p-6 sm:p-8 md:p-10",
          "group relative overflow-hidden",
          "transition-all duration-500",
          className
        )}
      >

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 tracking-tight group-hover:text-highlightIce transition-colors">
              {member.name}
            </h3>
            <p className="text-primaryBlue font-black text-[9px] sm:text-[10px] uppercase mb-2">
              {member.role}
            </p>
            {member.sub && (
              <p className="text-white/40 text-[8px] sm:text-[9px] uppercase font-bold tracking-tight leading-tight">
                {member.sub}
              </p>
            )}
          </div>

          {displayTagline && (
            <p className="text-textSec text-sm sm:text-base leading-relaxed mb-4">
              {displayTagline}
            </p>
          )}

          {/* Expertise Chips */}
          {false && member.expertiseChips && (member.expertiseChips?.length ?? 0) > 0 && (
            <div className="mb-6">
              <ProfileChips chips={member.expertiseChips ?? []} maxVisible={4} />
            </div>
          )}

          {/* Single CTA */}
          <motion.button
            onClick={() => setIsDrawerOpen(true)}
            onKeyDown={(e) => handleKeyDown(e, () => setIsDrawerOpen(true))}
            whileHover={{ gap: 16 }}
            className={cn(
              "inline-flex items-center gap-3",
              "text-sm font-medium",
              "text-primaryBlue hover:text-highlightIce",
              "transition-colors duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryBlue"
            )}
          >
            <span>View Profile</span>
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Profile Drawer */}
      <ProfileDrawer
        member={member}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
}
