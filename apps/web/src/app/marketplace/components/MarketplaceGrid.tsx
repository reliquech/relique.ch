"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { marketplaceService } from "@/lib/services/marketplaceService";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { MarketplaceJerseyCard } from "@/components/app/MarketplaceJerseyCard";
import { MarketplacePreviewOverlay } from "@/components/app/MarketplacePreviewOverlay";
import { listingToCardItem } from "@/lib/utils/marketplace";
import { MarketplaceToolbar } from "./MarketplaceToolbar";
import { MarketplaceSidebarFilters } from "./MarketplaceSidebarFilters";
import { MarketplaceGridSkeleton } from "./MarketplaceGridSkeleton";

export function MarketplaceGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketplaceListing[]>([]);
  const [search, setSearch] = useState("");
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "ALL SPORTS"
  );
  const [sortBy, setSortBy] = useState("price-desc");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const filters: { category?: string } = {};
        if (categoryFilter !== "ALL SPORTS") {
          filters.category = categoryFilter;
        }
        const result = await marketplaceService.list({
          filters,
          sort: sortBy as "newest" | "price-asc" | "price-desc",
          page: 1,
          pageSize: 100,
        });
        setItems(result.items);
      } catch (error) {
        console.error("Failed to load marketplace items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryFilter, sortBy]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.signedBy?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL SPORTS") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <>
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 pt-12 pb-6">
        <MarketplaceToolbar
          search={search}
          sortBy={sortBy}
          onSearchChange={setSearch}
          onSortChange={setSortBy}
        />
      </div>

      <main className="max-w-[1920px] mx-auto px-4 md:px-12 py-6 flex flex-col md:flex-row gap-12">
        <aside className="hidden md:block w-72 shrink-0 sticky top-12 h-fit pb-12">
          <MarketplaceSidebarFilters
            categoryFilter={categoryFilter}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        <div className="flex-grow">
          <div className="flex flex-wrap items-center justify-between mb-8 gap-6 pb-6 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 whitespace-nowrap">
              {filteredItems.length} {filteredItems.length === 1 ? "ASSET" : "ASSETS"} RETRIEVED
            </span>
          </div>

          {loading ? (
            <MarketplaceGridSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedListing(item)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedListing(item)}
                  className="cursor-pointer h-full"
                >
                  <MarketplaceJerseyCard
                    item={listingToCardItem(item)}
                    index={idx}
                    variant="grid"
                    preventNavigation
                  />
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {selectedListing && (
              <MarketplacePreviewOverlay
                listing={selectedListing}
                onClose={() => setSelectedListing(null)}
              />
            )}
          </AnimatePresence>

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-12 sm:py-16 md:py-20 text-white/60">
              <p className="text-lg sm:text-xl font-bold uppercase">No items found</p>
              <p className="text-xs sm:text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
