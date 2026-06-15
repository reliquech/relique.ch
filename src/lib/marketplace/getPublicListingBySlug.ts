import { mapRowToListing } from "@/app/api/marketplace/utils";
import { createAnonClient } from "@/lib/supabase/server";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

/** Server-side lookup for published public marketplace items by slug (no HTTP roundtrip). */
export async function getPublicListingBySlug(
  slug: string
): Promise<MarketplaceListing | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("slug", slug)
    .eq("state_lifecycle", "published")
    .eq("state_visibility", "public")
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("getPublicListingBySlug:", error);
    }
    return null;
  }

  if (!data) return null;

  return mapRowToListing(data);
}
