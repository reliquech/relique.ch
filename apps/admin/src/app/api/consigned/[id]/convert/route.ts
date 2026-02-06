import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import type { Database } from "@/lib/supabase/types";

type ConsignedItem = Database["public"]["Tables"]["consigned_items"]["Row"];
type MarketplaceItem = Database["public"]["Tables"]["marketplace_items"]["Row"];

// POST /api/consigned/[id]/convert - Convert consigned item to marketplace item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const supabase = createServiceRoleClient();

    // Get consigned item
    const { data: consignedItemData, error: fetchError } = await supabase
      .from("consigned_items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !consignedItemData) {
      return NextResponse.json(
        { error: "Consigned item not found" },
        { status: 404 }
      );
    }

    const consignedItem = consignedItemData as ConsignedItem;

    // Create marketplace item from consigned item (schema: entity_type, slug, sku, state, listing, jersey, signing, condition, auth, refs, media)
    const slug = consignedItem.item_description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 50) + "-" + Date.now().toString(36);

    const now = new Date().toISOString();
    type MarketplaceItemInsert = Database["public"]["Tables"]["marketplace_items"]["Insert"];

    const insertData: MarketplaceItemInsert = {
      entity_type: "consigned",
      slug,
      sku: `consigned-${id}-${Date.now().toString(36)}`,
      state: {
        lifecycle: "draft",
        visibility: "private",
        featured: { is: false, order: null },
        publish_at: null,
        created_at: now,
        updated_at: now,
        created_by: consignedItem.created_by ?? null,
      },
      listing: {
        title: consignedItem.item_description.substring(0, 200),
        subtitle: null,
        short: consignedItem.item_description,
        price: {
          amount: consignedItem.estimated_value ?? 0,
          currency: "USD",
          compare_at: null,
        },
        category: consignedItem.category ?? "Other",
        tags: [],
      },
      jersey: null,
      signing: {
        type: "single",
        signers: [],
        count: 1,
        ink: { id: null, custom: null },
        placement: { id: null, custom: null },
        inscription_text: null,
        sig_condition: null,
      },
      condition: {
        grade: null,
        wear: null,
        notes: null,
      },
      auth: {
        status: "none",
        provider_id: consignedItem.coa_issuer ?? null,
        coa_refs: [],
      },
      refs: {
        content_id: null,
        media_album_id: null,
        proof_bundle_id: null,
      },
      media: { hero_id: null },
    };

    const { data: marketplaceItemData, error: createError } = await (supabase
      .from("marketplace_items")
      // @ts-expect-error - Supabase service role client types infer insert as never
      .insert(insertData)
      .select()
      .single());

    if (createError || !marketplaceItemData) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create marketplace item" },
        { status: 400 }
      );
    }

    const marketplaceItem = marketplaceItemData as MarketplaceItem;

    // Update consigned item to link to marketplace item
    await supabase
      .from("consigned_items")
      // @ts-expect-error - Supabase type inference issue with service role client
      .update({ 
        marketplace_item_id: marketplaceItem.id,
        status: "approved"
      })
      .eq("id", id);

    // Log audit
    await supabase.from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "CONVERT",
        entity_type: "consigned_item",
        entity_id: id,
        metadata: { 
          marketplace_item_id: marketplaceItem.id,
          consigned_item: consignedItem,
        },
      });

    return NextResponse.json({
      marketplace_item: marketplaceItem,
      consigned_item_id: id,
    });
  } catch (error) {
    console.error("Error converting consigned item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
