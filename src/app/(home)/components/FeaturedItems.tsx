"use client";

import { OutlineButton } from "@/lib/ui/buttons";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FeaturedItemCard } from "@/components/cards/FeaturedItemCard";
import { marketplaceService } from "@/lib/services/marketplaceService";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export function FeaturedItems() {
  const [startIndex, setStartIndex] = useState(0);
  const [items, setItems] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      const result = await marketplaceService.list({ page: 1, pageSize: 10 });
      setItems(result.items.slice(0, 6));
    };
    loadItems();
  }, []);

  const visibleItems = items.slice(startIndex, startIndex + 3);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + 3 < items.length;

  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Featured Items"
        description="Authenticated collectibles from our marketplace"
        cta={{
          label: "View All",
          href: "/marketplace",
        }}
      />
      <div className="relative">
        <div className="grid md:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <FeaturedItemCard key={item.id} item={item} />
          ))}
        </div>
        {items.length > 3 && (
          <>
            {canGoPrev && (
              <OutlineButton
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
                onClick={() => setStartIndex(Math.max(0, startIndex - 3))}
              >
                <ChevronLeft className="w-4 h-4" />
              </OutlineButton>
            )}
            {canGoNext && (
              <OutlineButton
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
                onClick={() => setStartIndex(startIndex + 3)}
              >
                <ChevronRight className="w-4 h-4" />
              </OutlineButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}

