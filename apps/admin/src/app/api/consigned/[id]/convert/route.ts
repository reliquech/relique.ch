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

    // Create marketplace item from consigned item
    const slug = consignedItem.item_description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 50) + "-" + Date.now().toString(36);

    type MarketplaceItemInsert = Database["public"]["Tables"]["marketplace_items"]["Insert"];
    
    const insertData: MarketplaceItemInsert = {
      slug,
      title: consignedItem.item_description.substring(0, 200),
      description: consignedItem.item_description,
      price_usd: consignedItem.estimated_value || 0,
      currency: "USD",
      image: "", // Should be uploaded separately
      category: consignedItem.category || "Other",
      status: "draft",
      coa_issuer: consignedItem.coa_issuer,
      commission_rate: consignedItem.commission_rate,
      created_by: consignedItem.created_by,
    };

    const { data: marketplaceItemData, error: createError } = await (supabase
      .from("marketplace_items")
      .insert(insertData as any)
      .select()
      .single() as any);

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
