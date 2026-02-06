"use client";

import { useDragCarousel } from "@/lib/hooks/useDragCarousel";
import { DraggableCarousel } from "@/components/primitives/DraggableCarousel";
import { MarketplaceJerseyCard } from "@/components/app/MarketplaceJerseyCard";
import { ScrollProgressBar } from "@/components/primitives/ScrollProgressBar";
import { toCardItem } from "@/lib/utils/marketplace";
import type { MarketplaceItem } from "@/data/marketplace.data";

interface MarketplaceCarouselProps {
  items: MarketplaceItem[];
  className?: string;
}

/**
 * Marketplace carousel wrapper for home section
 * Combines drag functionality, item cards, and progress indicator
 */
export function MarketplaceCarousel({ items, className = "" }: MarketplaceCarouselProps) {
  const {
    containerRef,
    constraints,
    isDragging,
    x,
    scrollProgress,
    onDragStart,
    onDragEnd,
  } = useDragCarousel();

  return (
    <div className={className}>
      <div className="relative overflow-visible" ref={containerRef}>
        <DraggableCarousel
          constraints={constraints}
          x={x}
          isDragging={isDragging}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {items.map((item, idx) => (
            <div key={item.id} className="flex-none w-[220px] sm:w-[240px] md:w-[280px] lg:w-[320px]">
              <MarketplaceJerseyCard
                item={toCardItem(item)}
                index={idx}
                variant="carousel"
                isDragging={isDragging}
              />
            </div>
          ))}
        </DraggableCarousel>
      </div>

      <ScrollProgressBar scrollProgress={scrollProgress} />
    </div>
  );
}
