import { NextRequest, NextResponse } from "next/server";
import { createClient, createAnonClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";
import { mapRowToListing } from "./utils";
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

async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

async function adminGet(request: NextRequest) {
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
}

async function publicGet(request: NextRequest) {
  const supabase = createAnonClient();
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
}

// GET /api/marketplace — public published list OR authenticated admin list
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      return adminGet(request);
    }
    return publicGet(request);
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

// POST /api/marketplace — create item (authenticated)
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const body = await request.json();

    const listing = normalizeMarketplaceCreate(body, user.id);

    const { data, error } = await supabase
      .from("marketplace_items")
      .insert(buildMarketplaceInsertPayload(listing) as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from("audit_logs")
      .insert({
        action: "CREATE",
        entity_type: "marketplace_item",
        entity_id: (data as { id: string }).id,
        metadata: { item: data },
      } as never);

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
