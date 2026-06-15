import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, SlidersHorizontal, AlertCircle, WifiOff } from "lucide-react";
import { marketplaceService } from "@/lib/services/marketplaceService";
import type { MarketplaceListing, SortOption } from "@/lib/schemas/marketplace";
import { MarketplaceJerseyCard } from "@/components/app/MarketplaceJerseyCard";
import { MarketplacePreviewOverlay } from "@/components/app/MarketplacePreviewOverlay";
import { listingToCardItem } from "@/lib/utils/marketplace";
import { MarketplaceToolbar } from "./MarketplaceToolbar";
import { MarketplaceSidebarFilters } from "./MarketplaceSidebarFilters";

export function MarketplaceGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load URL-state parameters
  const category = searchParams.get("category") || "ALL";
  const sort = searchParams.get("sort") || "price-desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const q = searchParams.get("q") || "";
  const view = (searchParams.get("view") as "grid" | "table") || "grid";
  const priceMin = searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined;
  const priceMax = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined;

  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MarketplaceListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(q);
  const [online, setOnline] = useState(true);

  // Sync state to URL helper
  const updateUrl = useCallback((updates: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    // Reset page to 1 if any filter or search changes (unless page is what changed)
    if (!("page" in updates) && Object.keys(updates).some((k) => k !== "view" && k !== "sort")) {
      params.delete("page");
    }
    router.replace(`/marketplace?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Monitor online status
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Keep local search input in sync with URL
  useEffect(() => {
    setLocalSearch(q);
  }, [q]);

  // Debounce search query update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== q) {
        updateUrl({ q: localSearch });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, q, updateUrl]);

  // Fetch data on search parameters change
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters: { category?: string; priceMin?: number; priceMax?: number } = {};
        if (category !== "ALL") {
          filters.category = category;
        }
        if (priceMin !== undefined) {
          filters.priceMin = priceMin;
        }
        if (priceMax !== undefined) {
          filters.priceMax = priceMax;
        }

        const result = await marketplaceService.list({
          q,
          filters,
          sort: sort as SortOption,
          page,
          pageSize: 12, // Grid-divisible by 1, 2, 3, 4 columns
        });

        if (active) {
          setItems(result.items);
          setTotalCount(result.pageInfo?.total ?? 0);
        }
      } catch (err) {
        console.error("Failed to load marketplace items:", err);
        if (active) {
          setError("Unable to load memorabilia listings. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [category, sort, page, q, priceMin, priceMax]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];
    if (category !== "ALL") {
      chips.push({
        id: "category",
        label: `Category: ${category}`,
        onRemove: () => updateUrl({ category: undefined }),
      });
    }
    if (q) {
      chips.push({
        id: "search",
        label: `Search: "${q}"`,
        onRemove: () => {
          setLocalSearch("");
          updateUrl({ q: undefined });
        },
      });
    }
    if (priceMin !== undefined || priceMax !== undefined) {
      let label = "Price: ";
      if (priceMin !== undefined && priceMax !== undefined) {
        label += `$${priceMin} - $${priceMax}`;
      } else if (priceMin !== undefined) {
        label += `>= $${priceMin}`;
      } else {
        label += `<= $${priceMax}`;
      }
      chips.push({
        id: "price",
        label,
        onRemove: () => updateUrl({ priceMin: undefined, priceMax: undefined }),
      });
    }
    return chips;
  }, [category, q, priceMin, priceMax, updateUrl]);

  const resetAllFilters = () => {
    setLocalSearch("");
    updateUrl({
      category: undefined,
      q: undefined,
      priceMin: undefined,
      priceMax: undefined,
      page: undefined,
    });
  };

  const handlePriceFilterChange = (min?: number, max?: number) => {
    updateUrl({ priceMin: min, priceMax: max });
  };

  return (
    <>
      {/* Offline Alert */}
      {!online && (
        <div className="bg-destructive text-white px-4 py-2 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You are currently offline. Displaying cached results.
        </div>
      )}

      {/* Public Browse Toolbar */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 pt-12 pb-2">
        <MarketplaceToolbar
          search={localSearch}
          sortBy={sort}
          view={view}
          onSearchChange={setLocalSearch}
          onSortChange={(val) => updateUrl({ sort: val })}
          onViewChange={(val) => updateUrl({ view: val })}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
        />

        {/* Active Chips Bar */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 mt-4 p-4 bg-white/5 border border-white/5 rounded-sm animate-in fade-in duration-200">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mr-1.5">
              Active Filters:
            </span>
            {activeChips.map((chip) => (
              <div
                key={chip.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white transition-colors rounded-sm"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[9px] font-black uppercase tracking-widest text-accentBlue hover:text-highlightIce transition-colors ml-auto px-2"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      <main className="max-w-[1920px] mx-auto px-4 md:px-12 py-6 flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-72 shrink-0 sticky top-12 h-fit pb-12">
          <MarketplaceSidebarFilters
            categoryFilter={category}
            priceMin={priceMin}
            priceMax={priceMax}
            onCategoryChange={(val) => updateUrl({ category: val })}
            onPriceChange={handlePriceFilterChange}
            onReset={resetAllFilters}
          />
        </aside>

        {/* Results Pane */}
        <div className="flex-grow">
          {/* Result Count Banner */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-6 pb-6 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 whitespace-nowrap">
              {loading
                ? "SEARCHING ARCHIVE..."
                : `${totalCount} ${totalCount === 1 ? "ASSET" : "ASSETS"} RETRIEVED`}
            </span>
          </div>

          {/* Skeletons, Error, and Empty States */}
          {error ? (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-8 rounded-lg flex flex-col items-center justify-center gap-4 text-center max-w-lg mx-auto my-12 animate-in fade-in duration-300">
              <AlertCircle className="w-12 h-12 opacity-80" />
              <div>
                <p className="font-bold text-lg uppercase tracking-wider">Failed to Load Listings</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all min-h-[40px]"
              >
                Retry Request
              </button>
            </div>
          ) : loading ? (
            <MarketplaceGridSkeleton view={view} />
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-white/40 max-w-md mx-auto animate-in fade-in duration-300">
              <SlidersHorizontal className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold uppercase tracking-wider text-white">No items found</p>
              <p className="text-xs mt-2">Try adjusting your filters, searching for a different signer, or clear search queries to browse all catalog items.</p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-6 bg-white/5 border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : view === "table" ? (
            /* Premium Table View */
            <div className="overflow-x-auto w-full border border-white/5 bg-cardDark shadow-xl rounded-sm">
              <table className="w-full border-collapse text-left text-xs uppercase tracking-wider text-white">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-black text-white/50 text-[10px] tracking-[0.3em]">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Condition</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Updated Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {items.map((item) => {
                    const cardItem = listingToCardItem(item);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedListing(item)}
                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="w-12 h-16 relative bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                            {cardItem.image ? (
                              <img
                                src={cardItem.image}
                                alt={cardItem.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-white/20 text-[10px] font-bold">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-white normal-case group-hover:text-primaryBlue transition-colors">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm line-clamp-1">{cardItem.title}</span>
                            {cardItem.signedBy && (
                              <span className="text-[10px] font-bold tracking-widest text-primaryBlue mt-0.5 uppercase">
                                {cardItem.signedBy}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-white/60 text-[10px] tracking-widest">{cardItem.category}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/80 font-bold text-[10px] rounded-sm">
                            {item.condition?.grade || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-black text-primaryBlue text-sm">
                          {cardItem.price}
                        </td>
                        <td className="py-4 px-6 text-white/40 font-mono text-[10px]">
                          {item.state?.updated_at
                            ? new Date(item.state.updated_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Premium Grid View (1 Mobile, 2 Tablet, 3-4 Desktop columns) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedListing(item)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedListing(item)}
                  className="cursor-pointer h-full outline-none focus-visible:ring-2 focus-visible:ring-primaryBlue"
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

          {/* Accessible URL-State Pagination controls */}
          {!loading && !error && totalCount > 12 && (
            <nav
              aria-label="Marketplace browse pagination"
              className="flex items-center justify-center gap-3 mt-12 pb-12"
            >
              <button
                onClick={() => updateUrl({ page: page - 1 })}
                disabled={page <= 1}
                className="px-5 py-3 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white transition-colors min-h-[44px] min-w-[80px]"
                aria-label="Go to previous page"
              >
                PREV
              </button>
              <span className="text-xs font-bold text-white/60 px-4" aria-live="polite">
                PAGE {page} OF {Math.ceil(totalCount / 12)}
              </span>
              <button
                onClick={() => updateUrl({ page: page + 1 })}
                disabled={page >= Math.ceil(totalCount / 12)}
                className="px-5 py-3 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white transition-colors min-h-[44px] min-w-[80px]"
                aria-label="Go to next page"
              >
                NEXT
              </button>
            </nav>
          )}

          {/* Quick View Overlay */}
          <AnimatePresence>
            {selectedListing && (
              <MarketplacePreviewOverlay
                listing={selectedListing}
                onClose={() => setSelectedListing(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Filters Drawer Overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-full h-full bg-bgDark border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Filters"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Filters</span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                    aria-label="Close filters drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <MarketplaceSidebarFilters
                  categoryFilter={category}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  onCategoryChange={(val) => {
                    updateUrl({ category: val });
                    setMobileFiltersOpen(false);
                  }}
                  onPriceChange={(min, max) => {
                    handlePriceFilterChange(min, max);
                    setMobileFiltersOpen(false);
                  }}
                  onReset={() => {
                    resetAllFilters();
                    setMobileFiltersOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Local Skeleton Component supporting Grid/Table layout options */
function MarketplaceGridSkeleton({ view }: { view: "grid" | "table" }) {
  if (view === "table") {
    return (
      <div className="w-full border border-white/5 bg-cardDark rounded-sm p-6 animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 py-4 border-b border-white/5">
            <div className="w-12 h-16 bg-white/5 shrink-0" />
            <div className="flex-grow space-y-2">
              <div className="h-4 w-1/3 bg-white/5" />
              <div className="h-3 w-1/4 bg-white/5" />
            </div>
            <div className="h-4 w-16 bg-white/5" />
            <div className="h-4 w-20 bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-cardDark border border-white/10 p-6 animate-pulse space-y-6 h-[460px] flex flex-col justify-between"
        >
          <div className="aspect-square bg-white/5 w-full" />
          <div className="space-y-3">
            <div className="h-3 w-1/3 bg-white/5" />
            <div className="h-4 w-3/4 bg-white/5" />
          </div>
          <div className="h-8 w-full bg-white/5 mt-auto" />
        </div>
      ))}
    </div>
  );
}
