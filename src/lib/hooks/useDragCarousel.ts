"use client";

import { useRef, useState, useEffect, type RefObject } from "react";
import { useMotionValue, useTransform, type MotionValue } from "framer-motion";

interface UseDragCarouselReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  constraints: { left: number; right: number };
  isDragging: boolean;
  x: MotionValue<number>;
  scrollProgress: MotionValue<string>;
  onDragStart: () => void;
  onDragEnd: () => void;
}

/**
 * Custom hook for drag carousel functionality
 * Handles constraints calculation, drag state, and scroll progress
 */
export function useDragCarousel(): UseDragCarouselReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const contentWidth = containerRef.current.scrollWidth;
        const viewWidth = containerRef.current.offsetWidth;
        const padding = window.innerWidth > 768 ? (window.innerWidth - 1280) / 2 : 24;
        setConstraints({
          left: -(contentWidth - viewWidth + padding),
          right: padding > 0 ? padding : 0,
        });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  const scrollProgress = useTransform(
    x,
    constraints.left ? [0, constraints.left] : [0, -1000],
    ["0%", "300%"]
  );

  const onDragStart = () => setIsDragging(true);
  const onDragEnd = () => setIsDragging(false);

  return {
    containerRef,
    constraints,
    isDragging,
    x,
    scrollProgress,
    onDragStart,
    onDragEnd,
  };
}
