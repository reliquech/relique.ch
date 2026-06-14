"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfileChipsProps {
  chips: string[];
  maxVisible?: number;
  className?: string;
}

export function ProfileChips({ 
  chips, 
  maxVisible = 4, 
  className 
}: ProfileChipsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!chips || chips.length === 0) return null;

  // Logic để xác định chips hiển thị
  const visibleChips = isExpanded ? chips : chips.slice(0, maxVisible);
  const remainingCount = chips.length - maxVisible;
  const hasMore = remainingCount > 0;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <AnimatePresence mode="popLayout">
        {visibleChips.map((chip, index) => (
          <motion.span
            key={`${chip}-${index}`}
            layout
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ 
              delay: isExpanded && index >= maxVisible ? (index - maxVisible) * 0.05 : index * 0.05,
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1], // premium easing
              layout: { duration: 0.3 }
            }}
            whileHover={{ 
              borderColor: "rgba(28, 77, 141, 0.4)",
              scale: 1.02
            }}
            className={cn(
              "border border-white/10 text-white/70",
              "text-[11px] uppercase tracking-wide",
              "px-3 py-1",
              "transition-colors duration-300",
              "hover:text-white/90"
            )}
          >
            {chip}
          </motion.span>
        ))}
      </AnimatePresence>
      
      {hasMore && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ 
            borderColor: "rgba(28, 77, 141, 0.6)",
            scale: 1.05,
            backgroundColor: "rgba(255, 255, 255, 0.05)"
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "border border-white/10 text-primaryBlue",
            "text-[11px] uppercase tracking-wide font-medium",
            "px-3 py-1",
            "transition-all duration-300",
            "hover:text-highlightIce hover:border-white/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryBlue"
          )}
          aria-label={isExpanded ? "Show less" : `Show ${remainingCount} more`}
        >
          {isExpanded ? "−" : `+${remainingCount}`}
        </motion.button>
      )}
    </div>
  );
}
