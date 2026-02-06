import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const MarketplaceItemSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  full_description: z.string().optional().nullable(),
  price_usd: z.number(),
  currency: z.string().optional().default("USD"),
  image: z.string(),
  images: z.array(z.string()).optional().nullable(),
  metadata: z.unknown().optional().nullable(),
  category: z.string(),
  status: z.enum(["draft", "pending", "published", "suspended", "unpublished", "archived"]).optional().default("draft"),
  authenticated: z.boolean().optional().default(false),
  certificate: z.string().optional().nullable(),
  authenticated_date: z.string().optional().nullable(),
  coa_issuer: z.string().optional().nullable(),
  signed_by: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  provenance: z.string().optional().nullable(),
  seller_name: z.string().optional().nullable(),
  seller_rating: z.number().optional().nullable(),
  seller_verified: z.boolean().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
  featured_order: z.number().optional().nullable(),
  commission_rate: z.number().optional().nullable(),
  created_by: z.string().optional().nullable(),
});

// GET /api/marketplace - List items
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const isFeatured = searchParams.get("is_featured");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("marketplace_items")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      query = query.eq("status", status);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (isFeatured !== null) {
      query = query.eq("is_featured", isFeatured === "true");
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const responseData = {
      items: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    
    // Return more descriptive error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Internal server error";
    
    // Check if it's a configuration error
    if (errorMessage.includes("Missing Supabase configuration")) {
      return NextResponse.json(
        { 
          error: errorMessage,
          details: "Please check your .env.local file and ensure all required Supabase environment variables are set."
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/marketplace - Create item
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const validated = MarketplaceItemSchema.parse(body);

    const { data, error } = await supabase
      .from("marketplace_items")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        ...validated,
        images: validated.images ? JSON.stringify(validated.images) : null,
        metadata: validated.metadata
          ? typeof validated.metadata === "string"
            ? validated.metadata
            : JSON.stringify(validated.metadata)
          : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log audit
    await supabase.from("audit_logs")
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
