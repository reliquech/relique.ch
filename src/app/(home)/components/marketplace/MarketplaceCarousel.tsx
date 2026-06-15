"use client";

import { useDragCarousel } from "@/lib/hooks/useDragCarousel";
import { DraggableCarousel } from "@/components/primitives/DraggableCarousel";
import { MarketplaceJerseyCard } from "@/components/app/MarketplaceJerseyCard";
import { ScrollProgressBar } from "@/components/primitives/ScrollProgressBar";
import { listingToCardItem } from "@/lib/utils/marketplace";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

interface MarketplaceCarouselProps {
  items: MarketplaceListing[];
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
    modifyTarget,
  } = useDragCarousel(items);

  if (items.length <= 1) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full md:w-[calc((100%-32px)/2)] lg:w-[calc((100%-64px)/3)] xl:w-[calc((100%-96px)/4)]">
          {items[0] && (
            <MarketplaceJerseyCard
              item={listingToCardItem(items[0])}
              index={0}
              variant="carousel"
              isDragging={false}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative overflow-hidden w-full" ref={containerRef}>
        <DraggableCarousel
          constraints={constraints}
          x={x}
          isDragging={isDragging}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          modifyTarget={modifyTarget}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="w-full md:w-[calc((100%-32px)/2)] lg:w-[calc((100%-64px)/3)] xl:w-[calc((100%-96px)/4)] flex-none"
            >
              <MarketplaceJerseyCard
                item={listingToCardItem(item)}
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
