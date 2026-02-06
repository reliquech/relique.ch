import type { Database } from "@/lib/supabase/types";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

export type MarketplaceItemRow = Database["public"]["Tables"]["marketplace_items"]["Row"];

const DEFAULT_REFS = { content_id: null, media_album_id: null, proof_bundle_id: null };
const DEFAULT_MEDIA = { hero_id: null, gallery: [] };

function parseJson(value: unknown): Record<string, any> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, any>;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as Record<string, any>;
  return null;
}

export function mapRowToListing(row: MarketplaceItemRow): MarketplaceListing {
  const state = parseJson(row.state) ?? {};
  const listing = parseJson(row.listing) ?? {};
  const jersey = parseJson(row.jersey) ?? {};
  const signing = parseJson(row.signing) ?? {};
  const condition = parseJson(row.condition) ?? {};
  const auth = parseJson(row.auth) ?? {};
  const refs = parseJson(row.refs) ?? DEFAULT_REFS;
  const media = parseJson(row.media) ?? DEFAULT_MEDIA;

  return {
    entity_type: row.entity_type,
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    state: state as MarketplaceListing["state"],
    listing: listing as MarketplaceListing["listing"],
    jersey: jersey as MarketplaceListing["jersey"],
    signing: signing as MarketplaceListing["signing"],
    condition: condition as MarketplaceListing["condition"],
    auth: auth as MarketplaceListing["auth"],
    refs: refs as MarketplaceListing["refs"],
    media: media as MarketplaceListing["media"],
  };
}
