import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { mapRowToListing } from "../utils";

// GET /api/marketplace/[slug] - Get single published marketplace item by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createServiceRoleClient();

    const { data: itemData, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("slug", slug)
      .eq("state_lifecycle", "published")
      .in("state_visibility", ["public", "unlisted"])
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!itemData) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = mapRowToListing(itemData);

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
