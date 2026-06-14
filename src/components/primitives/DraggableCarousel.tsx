"use client";

import { motion, type MotionValue } from "framer-motion";

interface DraggableCarouselProps {
  children: React.ReactNode;
  constraints: { left: number; right: number };
  x: MotionValue<number>;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  className?: string;
}

/**
 * Generic draggable carousel container
 * Provides horizontal drag functionality with constraints
 * Reusable for any carousel implementation
 */
export function DraggableCarousel({
  children,
  constraints,
  x,
  isDragging,
  onDragStart,
  onDragEnd,
  className = "",
}: DraggableCarouselProps) {
  return (
    <motion.div
      drag="x"
      dragConstraints={constraints}
      dragElastic={0.08}
      dragTransition={{ power: 0.2, timeConstant: 200 }}
      style={{ x }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`flex gap-8 px-6 md:px-[calc((100vw-1280px)/2)] pb-12 cursor-grab active:cursor-grabbing touch-pan-y ${className}`}
    >
      {children}
    </motion.div>
  );
}
