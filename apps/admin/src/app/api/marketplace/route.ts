import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";
import {
  normalizeMarketplaceCreate,
  buildMarketplaceInsertPayload,
} from "./marketplaceUtils";

const MarketplaceListQuerySchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  is_featured: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

// GET /api/marketplace - List items
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;

    const parsed = MarketplaceListQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      is_featured: searchParams.get("is_featured") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    const page = parsed.page ? parseInt(parsed.page, 10) : 1;
    const pageSize = parsed.pageSize ? parseInt(parsed.pageSize, 10) : 100;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("marketplace_items")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (parsed.status) {
      query = query.eq("state_lifecycle", parsed.status);
    }
    if (parsed.category) {
      query = query.eq("listing_category", parsed.category);
    }
    if (parsed.is_featured !== undefined) {
      query = query.eq("featured_is", parsed.is_featured === "true");
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: data || [],
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

// POST /api/marketplace - Create item
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const listing = normalizeMarketplaceCreate(body, user.id);

    const { data, error } = await supabase
      .from("marketplace_items")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert(buildMarketplaceInsertPayload(listing))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "CREATE",
        entity_type: "marketplace_item",
        entity_id: (data as any).id,
        metadata: { item: data },
      });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
