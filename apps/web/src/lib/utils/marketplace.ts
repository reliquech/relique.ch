/**
 * Marketplace utility functions
 * Reusable helpers for marketplace components
 */

import type { MarketplaceItem } from "@/data/marketplace.data";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

/**
 * Format price for display
 * Converts large numbers to K/M notation
 */
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}k`;
  }
  return `$${price.toLocaleString()}`;
}

/**
 * Get formatted status label
 * Converts status to uppercase display format
 */
export function getStatusLabel(status?: string): string {
  if (!status) return "QUALIFIED";
  return status.toUpperCase();
}

/**
 * Sort options for marketplace
 */
export const SORT_OPTIONS = [
  { value: "price-desc", label: "PRICE: HIGH TO LOW" },
  { value: "price-asc", label: "PRICE: LOW TO HIGH" },
] as const;

/**
 * Category options for marketplace
 */
export const CATEGORY_OPTIONS = [
  "ALL SPORTS",
  "Basketball",
  "Football",
  "Baseball",
  "Tennis",
  "F1",
  "Cricket",
] as const;

/**
 * Common interface cho cả 2 data types (MarketplaceItem và MarketplaceListing)
 * Được sử dụng bởi MarketplaceCard component
 */
export interface CardItemData {
  id: string;
  image: string;
  category: string;
  status?: string;
  // For carousel mode (from MarketplaceItem)
  name?: string;
  athlete?: string;
  year?: string;
  // For grid mode (from MarketplaceListing)
  title?: string;
  price?: number;
  slug?: string;
  signedBy?: string;
  backImage?: string;
  condition?: string;
  watchCount?: number;
}

/**
 * Adapter: MarketplaceItem -> CardItemData
 * Converts MarketplaceItem to common CardItemData format
 */
export function toCardItem(item: MarketplaceItem): CardItemData {
  return {
    id: item.id,
    image: item.image,
    category: item.category,
    status: item.status,
    name: item.name,
    athlete: item.athlete,
    year: item.year,
  };
}

/**
 * Adapter: MarketplaceListing -> CardItemData
 * Converts MarketplaceListing to common CardItemData format
 */
export function listingToCardItem(listing: MarketplaceListing): CardItemData {
  return {
    id: listing.id,
    image: listing.image,
    category: listing.category,
    status: listing.status,
    title: listing.title,
    price: listing.price,
    slug: listing.slug,
    signedBy: listing.signedBy,
    backImage: listing.images?.[1],
    condition: listing.condition,
  };
}
