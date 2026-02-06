import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { mapRowToListing } from "./utils";

// GET /api/marketplace - List published marketplace items
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "price-desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "100", 10);
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("marketplace_items")
      .select("*", { count: "exact" })
      .eq("state_lifecycle", "published")
      .eq("state_visibility", "public")
      .range(offset, offset + pageSize - 1);

    if (category && category !== "ALL") {
      query = query.eq("listing_category", category);
    }

    switch (sort) {
      case "price-asc":
        query = query.order("price_amount", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price_amount", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("price_amount", { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || []).map(mapRowToListing);

    return NextResponse.json({
      items,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Error fetching marketplace items:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    if (errorMessage.includes("Missing Supabase configuration")) {
      return NextResponse.json(
        {
          error: errorMessage,
          details:
            "Please check your .env.local file and ensure all required Supabase environment variables are set.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
