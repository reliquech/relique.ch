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
  modifyTarget: (target: number) => number;
}

/**
 * Custom hook for drag carousel functionality
 * Handles constraints calculation, drag state, snap points, and scroll progress
 */
export function useDragCarousel(items: unknown[]): UseDragCarouselReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const [snapPoints, setSnapPoints] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);

  // Clean up stale translateX values on data refresh or unmount
  useEffect(() => {
    x.set(0);
  }, [items, x]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const container = containerRef.current;
    const dragElement = container.firstElementChild as HTMLElement;
    if (!dragElement) return;

    const updateConstraints = () => {
      const contentWidth = dragElement.scrollWidth;
      const viewWidth = container.offsetWidth;
      const maxDrag = contentWidth - viewWidth;
      const leftConstraint = maxDrag > 0 ? -maxDrag : 0;

      setConstraints({
        left: leftConstraint,
        right: 0,
      });

      // Calculate snap points from children offsetLeft coordinates
      const children = Array.from(dragElement.children) as HTMLElement[];
      const points = children.map(child => -child.offsetLeft);

      // Clamp points within boundaries
      const validPoints = points.filter(p => p > leftConstraint && p <= 0);
      if (leftConstraint < 0) {
        validPoints.push(leftConstraint);
      }

      // Sort snap points descending (closest to 0 first)
      validPoints.sort((a, b) => b - a);
      setSnapPoints(validPoints);
    };

    // Initial run
    updateConstraints();

    // Use ResizeObserver for accurate sizing updates (handles image load, resize, layout shift)
    const observer = new ResizeObserver(() => {
      updateConstraints();
      x.set(0); // Clean up stale translateX values on resize
    });

    observer.observe(container);
    observer.observe(dragElement);

    return () => {
      observer.disconnect();
    };
  }, [items, x]);

  const scrollProgress = useTransform(
    x,
    constraints.left ? [0, constraints.left] : [0, -1000],
    ["0%", "300%"]
  );

  const onDragStart = () => setIsDragging(true);
  const onDragEnd = () => setIsDragging(false);

  const modifyTarget = (target: number) => {
    if (snapPoints.length === 0) return target;
    return snapPoints.reduce((prev, curr) => {
      return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
    }, snapPoints[0] || 0);
  };

  return {
    containerRef,
    constraints,
    isDragging,
    x,
    scrollProgress,
    onDragStart,
    onDragEnd,
    modifyTarget,
  };
}
