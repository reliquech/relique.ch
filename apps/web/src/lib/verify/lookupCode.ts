import type { SupabaseClient } from "@supabase/supabase-js";

type MarketplaceRow = Record<string, unknown>;

function parseJson(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return null;
}

/**
 * Lookup marketplace item by RLQ product_id or COA ref in auth.coa_refs.
 */
export async function lookupMarketplaceItemByCode(
  supabase: SupabaseClient,
  rawCode: string
): Promise<MarketplaceRow | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const { data: byProductId } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("product_id", code)
    .maybeSingle();

  if (byProductId) return byProductId as MarketplaceRow;

  const { data: rows } = await supabase.from("marketplace_items").select("*");

  if (!rows?.length) return null;

  for (const row of rows) {
    const auth = parseJson((row as MarketplaceRow).auth);
    const refs = auth?.coa_refs;
    if (!Array.isArray(refs)) continue;
    const normalizedRefs = refs.map((r) => String(r).trim().toUpperCase());
    if (normalizedRefs.includes(code)) {
      return row as MarketplaceRow;
    }
  }

  return null;
}
