import type { SupabaseClient } from "@supabase/supabase-js";

export const INQUIRY_NAME = "Marketplace Inquiry";
export const INQUIRY_SOURCE = "marketplace_inquiry";

export interface AcquireInterestRow {
  marketplace_item_id: string;
  listing_slug: string;
  listing_title: string;
  created_at: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function fetchInterestsByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<AcquireInterestRow[]> {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from("marketplace_acquire_interests")
    .select("marketplace_item_id, listing_slug, listing_title, created_at")
    .eq("email", normalized)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchInterestsByEmail:", error);
    return [];
  }

  return (data ?? []) as AcquireInterestRow[];
}

export async function upsertMarketplaceInquiryLead(
  supabase: SupabaseClient,
  email: string
): Promise<string> {
  const normalized = normalizeEmail(email);

  const { data: existing, error: findError } = await supabase
    .from("leads")
    .select("id")
    .eq("email", normalized)
    .eq("source", INQUIRY_SOURCE)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (existing) {
    const leadId = (existing as { id: string }).id;
    await supabase
      .from("leads")
      .update({ updated_at: new Date().toISOString() } as never)
      .eq("id", leadId);
    return leadId;
  }

  const { data: created, error: createError } = await supabase
    .from("leads")
    .insert({
      full_name: INQUIRY_NAME,
      email: normalized,
      source: INQUIRY_SOURCE,
      status: "new",
    } as never)
    .select("id")
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "Failed to create lead");
  }

  return (created as { id: string }).id;
}

export async function registerAcquireInterest(
  supabase: SupabaseClient,
  params: {
    leadId: string;
    email: string;
    listingId: string;
    listingSlug: string;
    listingTitle: string;
  }
): Promise<boolean> {
  const normalized = normalizeEmail(params.email);

  const { data: existing } = await supabase
    .from("marketplace_acquire_interests")
    .select("id")
    .eq("email", normalized)
    .eq("marketplace_item_id", params.listingId)
    .maybeSingle();

  if (existing) {
    return false;
  }

  const { error } = await supabase.from("marketplace_acquire_interests").insert({
    lead_id: params.leadId,
    email: normalized,
    marketplace_item_id: params.listingId,
    listing_slug: params.listingSlug,
    listing_title: params.listingTitle,
  });

  if (error) {
    if (error.code === "23505") {
      return false;
    }
    throw new Error(error.message);
  }

  return true;
}

export async function countInterestsByLeadIds(
  supabase: SupabaseClient,
  leadIds: string[]
): Promise<Record<string, number>> {
  if (leadIds.length === 0) return {};

  const { data, error } = await supabase
    .from("marketplace_acquire_interests")
    .select("lead_id")
    .in("lead_id", leadIds);

  if (error) {
    console.error("countInterestsByLeadIds:", error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as { lead_id: string }).lead_id;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export async function fetchInterestsByLeadId(
  supabase: SupabaseClient,
  leadId: string
): Promise<AcquireInterestRow[]> {
  const { data, error } = await supabase
    .from("marketplace_acquire_interests")
    .select("marketplace_item_id, listing_slug, listing_title, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AcquireInterestRow[];
}
