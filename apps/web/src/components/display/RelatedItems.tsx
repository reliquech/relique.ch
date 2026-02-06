"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { marketplaceService } from "@/lib/services/marketplaceService";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  getListingCategory,
  getListingPriceAmount,
  getListingTitle,
  getListingHeroImage,
  getListingAuthStatus,
} from "@/lib/utils/marketplace";

interface RelatedItemsProps {
  currentListing: MarketplaceListing;
  limit?: number;
}

export function RelatedItems({ currentListing, limit = 4 }: RelatedItemsProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [related, setRelated] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const loadRelated = async () => {
      const result = await marketplaceService.list({
        filters: {
          category: currentListing.listing?.category,
        },
        page: 1,
        pageSize: 20,
      });
      const filtered = result.items
        .filter((item) => item.id !== currentListing.id)
        .slice(0, limit);
      setRelated(filtered);
    };
    loadRelated();
  }, [currentListing.id, currentListing.listing?.category, limit]);

  if (related.length === 0) return null;

  const visibleItems = related.slice(startIndex, startIndex + limit);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + limit < related.length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Related Items"
        description="Other items you might be interested in"
      />
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <Link href={`/marketplace/${item.slug}`}>
                <div className="relative w-full h-48">
                  <Image
                    src={getListingHeroImage(item)}
                    alt={getListingTitle(item)}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">{getListingTitle(item)}</CardTitle>
                  <CardDescription className="text-xs">{getListingCategory(item)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${getListingPriceAmount(item).toLocaleString()}</span>
                    {getListingAuthStatus(item) === "verified" && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        {related.length > limit && (
          <>
            {canGoPrev && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
                onClick={() => setStartIndex(Math.max(0, startIndex - limit))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {canGoNext && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
                onClick={() => setStartIndex(startIndex + limit)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
