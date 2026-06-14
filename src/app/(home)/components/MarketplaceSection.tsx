import { MarketplaceSectionHeader } from "./marketplace/MarketplaceSectionHeader";
import { MarketplaceCarousel } from "./marketplace/MarketplaceCarousel";
import { MOCK_ITEMS } from "@/data/marketplace.data";

/**
 * Marketplace section for home page
 * Displays a draggable carousel of curated marketplace items
 * Refactored from 245 lines to use composable components
 */
export function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-24 bg-bgDark overflow-hidden select-none">
      <MarketplaceSectionHeader />
      <MarketplaceCarousel items={MOCK_ITEMS} />
    </section>
  );
}

