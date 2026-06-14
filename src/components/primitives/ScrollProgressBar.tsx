"use client";

import { motion, type MotionValue } from "framer-motion";

interface ScrollProgressBarProps {
  scrollProgress: MotionValue<string>;
  className?: string;
}

/**
 * Animated scroll progress bar component
 * Displays carousel scroll position with animated indicator
 */
export function ScrollProgressBar({ scrollProgress, className = "" }: ScrollProgressBarProps) {
  return (
    <div className={`container mx-auto px-6 mt-4 flex items-center gap-4 ${className}`}>
      <div className="h-[1px] flex-grow bg-white/10 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-primaryBlue w-1/4" 
          style={{ x: scrollProgress }} 
        />
      </div>
      <span className="text-[10px] font-black text-textSec uppercase tracking-widest">
        End of Collection
      </span>
    </div>
  );
}
