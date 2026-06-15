import { MarketplaceSectionHeader } from "./marketplace/MarketplaceSectionHeader";
import { MarketplaceCarousel } from "./marketplace/MarketplaceCarousel";
import { createAnonClient } from "@/lib/supabase/server";
import { mapRowToListing } from "@/app/api/marketplace/utils";

/**
 * Marketplace section for home page.
 * Shows Carousel Manager picks (featured_is + featured_order), with a published fallback when none are set.
 */
const PUBLISHED_PUBLIC_FILTER = {
  state_lifecycle: "published" as const,
  state_visibility: "public" as const,
};

export async function MarketplaceSection() {
  const supabase = createAnonClient();

  const { data: featuredRows } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("state_lifecycle", PUBLISHED_PUBLIC_FILTER.state_lifecycle)
    .eq("state_visibility", PUBLISHED_PUBLIC_FILTER.state_visibility)
    .eq("featured_is", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .limit(8);

  let rows = featuredRows ?? [];

  if (rows.length === 0) {
    const { data: fallbackRows } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("state_lifecycle", PUBLISHED_PUBLIC_FILTER.state_lifecycle)
      .eq("state_visibility", PUBLISHED_PUBLIC_FILTER.state_visibility)
      .order("created_at", { ascending: false })
      .limit(10);
    rows = fallbackRows ?? [];
  }

  const items = rows.map(mapRowToListing);

  return (
    <section id="marketplace" className="py-24 bg-bgDark overflow-hidden select-none">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full flex flex-col gap-8">
        <MarketplaceSectionHeader itemsCount={items.length} />
        <MarketplaceCarousel items={items} />
      </div>
    </section>
  );
}

