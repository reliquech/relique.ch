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
  if (!status) return "UNVERIFIED";
  const normalized = status.toLowerCase();
  const labels: Record<string, string> = {
    verified: "VERIFIED",
    pending: "PENDING",
    rejected: "REJECTED",
    none: "UNVERIFIED",
  };
  return labels[normalized] ?? status.toUpperCase();
}

export function getListingTitle(listing: MarketplaceListing): string {
  return listing.listing?.title ?? "Untitled";
}

export function getListingCategory(listing: MarketplaceListing): string {
  return listing.listing?.category ?? "collector";
}

export function getListingPriceAmount(listing: MarketplaceListing): number {
  return listing.listing?.price?.amount ?? 0;
}

export function getListingPriceCurrency(listing: MarketplaceListing): string {
  return listing.listing?.price?.currency ?? "USD";
}

export function getListingHeroImage(listing: MarketplaceListing): string {
  return listing.media?.hero_id || listing.media?.gallery?.[0] || "/og-logo.png";
}

export function getListingImages(listing: MarketplaceListing): string[] {
  const gallery = listing.media?.gallery ?? [];
  const hero = listing.media?.hero_id ? [listing.media.hero_id] : [];
  return hero.concat(gallery).filter(Boolean);
}

export function getListingSignedBy(listing: MarketplaceListing): string | undefined {
  return listing.signing?.signers?.[0];
}

export function getListingConditionLabel(listing: MarketplaceListing): string | undefined {
  const grade = listing.condition?.grade;
  const wear = listing.condition?.wear;
  if (grade && grade !== "unknown") return grade;
  return wear ?? undefined;
}

export function getListingAuthStatus(listing: MarketplaceListing): string | undefined {
  return listing.auth?.status;
}

export function getListingCoaRef(listing: MarketplaceListing): string | undefined {
  return listing.auth?.coa_refs?.[0];
}

export function getListingShortDescription(listing: MarketplaceListing): string {
  return listing.listing?.short ?? "";
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
  "ALL",
  "premium",
  "sport",
  "collector",
  "story",
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
    image: getListingHeroImage(listing),
    category: getListingCategory(listing),
    status: getListingAuthStatus(listing),
    title: getListingTitle(listing),
    price: getListingPriceAmount(listing),
    slug: listing.slug,
    signedBy: getListingSignedBy(listing),
    backImage: getListingImages(listing)[1],
    condition: getListingConditionLabel(listing),
  };
}
