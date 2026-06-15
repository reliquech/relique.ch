"use client";

import { useRef, useState } from "react";
import { AnimatePresence, type PanInfo } from "framer-motion";
import { useDragCarousel } from "@/lib/hooks/useDragCarousel";
import { DraggableCarousel } from "@/components/primitives/DraggableCarousel";
import { MarketplaceJerseyCard } from "@/components/app/MarketplaceJerseyCard";
import { MarketplacePreviewOverlay } from "@/components/app/MarketplacePreviewOverlay";
import { ScrollProgressBar } from "@/components/primitives/ScrollProgressBar";
import { listingToCardItem, getListingTitle } from "@/lib/utils/marketplace";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

interface MarketplaceCarouselProps {
  items: MarketplaceListing[];
  className?: string;
}

const DRAG_CLICK_THRESHOLD_PX = 8;

function CarouselCardSlot({
  item,
  index,
  isDragging,
  onSelect,
  canOpenPreview,
}: {
  item: MarketplaceListing;
  index: number;
  isDragging: boolean;
  onSelect: (listing: MarketplaceListing) => void;
  canOpenPreview: () => boolean;
}) {
  const openPreview = () => {
    if (!canOpenPreview()) return;
    onSelect(item);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPreview}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPreview();
        }
      }}
      className="w-full md:w-[calc((100%-32px)/2)] lg:w-[calc((100%-64px)/3)] xl:w-[calc((100%-96px)/4)] flex-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primaryBlue"
      aria-label={`Preview ${getListingTitle(item)}`}
    >
      <MarketplaceJerseyCard
        item={listingToCardItem(item)}
        index={index}
        variant="carousel"
        isDragging={isDragging}
      />
    </div>
  );
}

/**
 * Marketplace carousel wrapper for home section
 * Combines drag functionality, item cards, and progress indicator
 */
export function MarketplaceCarousel({ items, className = "" }: MarketplaceCarouselProps) {
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const draggedRef = useRef(false);

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

  const handleDragStart = () => {
    draggedRef.current = false;
    onDragStart();
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > DRAG_CLICK_THRESHOLD_PX) {
      draggedRef.current = true;
    }
  };

  const handleDragEnd = () => {
    onDragEnd();
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  };

  const canOpenPreview = () => !draggedRef.current && !isDragging;

  if (items.length <= 1) {
    const single = items[0];
    return (
      <div className={`w-full ${className}`}>
        {single ? (
          <CarouselCardSlot
            item={single}
            index={0}
            isDragging={false}
            onSelect={setSelectedListing}
            canOpenPreview={canOpenPreview}
          />
        ) : null}

        <AnimatePresence>
          {selectedListing ? (
            <MarketplacePreviewOverlay
              listing={selectedListing}
              onClose={() => setSelectedListing(null)}
            />
          ) : null}
        </AnimatePresence>
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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrag={handleDrag}
          modifyTarget={modifyTarget}
        >
          {items.map((item, idx) => (
            <CarouselCardSlot
              key={item.id}
              item={item}
              index={idx}
              isDragging={isDragging}
              onSelect={setSelectedListing}
              canOpenPreview={canOpenPreview}
            />
          ))}
        </DraggableCarousel>
      </div>

      <ScrollProgressBar scrollProgress={scrollProgress} />

      <AnimatePresence>
        {selectedListing ? (
          <MarketplacePreviewOverlay
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
