"use client";

import { motion, type MotionValue } from "framer-motion";

interface DraggableCarouselProps {
  children: React.ReactNode;
  constraints: { left: number; right: number };
  x: MotionValue<number>;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  modifyTarget?: (target: number) => number;
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
  onDragStart,
  onDragEnd,
  modifyTarget,
  className = "",
}: DraggableCarouselProps) {
  return (
    <motion.div
      drag="x"
      dragConstraints={constraints}
      dragElastic={0.08}
      dragTransition={{ power: 0.2, timeConstant: 200, modifyTarget }}
      style={{ x }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`flex gap-8 pb-12 cursor-grab active:cursor-grabbing touch-pan-y w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
