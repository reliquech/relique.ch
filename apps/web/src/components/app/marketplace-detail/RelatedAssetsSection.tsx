"use client";

import { useState, useEffect } from "react";
import { marketplaceService } from "@/lib/services/marketplaceService";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { MarketplaceJerseyCard } from "@/components/app/MarketplaceJerseyCard";
import { listingToCardItem } from "@/lib/utils/marketplace";

interface RelatedAssetsSectionProps {
  currentListing: MarketplaceListing;
  limit?: number;
}

export function RelatedAssetsSection({ currentListing, limit = 4 }: RelatedAssetsSectionProps) {
  const [related, setRelated] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const load = async () => {
      const result = await marketplaceService.list({
        filters: { category: currentListing.listing?.category },
        page: 1,
        pageSize: 20,
      });
      const filtered = result.items
        .filter((item) => item.id !== currentListing.id)
        .slice(0, limit);
      setRelated(filtered);
    };
    load();
  }, [currentListing.id, currentListing.listing?.category, limit]);

  if (related.length === 0) return null;

  return (
    <section className="pt-24 border-t border-white/5">
      <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-12">
        IV. Related Assets
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {related.map((item) => (
          <MarketplaceJerseyCard
            key={item.id}
            item={listingToCardItem(item)}
            variant="grid"
          />
        ))}
      </div>
    </section>
  );
}
