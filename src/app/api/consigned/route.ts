import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const ConsignedItemSchema = z.object({
  marketplace_item_id: z.string().uuid().optional().nullable(),
  contact_name: z.string(),
  contact_email: z.string().email(),
  contact_phone: z.string().optional().nullable(),
  contact_address: z.string().optional().nullable(),
  item_description: z.string(),
  category: z.string().optional().nullable(),
  estimated_value: z.number().optional().nullable(),
  appraisal_date: z.string().optional().nullable(),
  coa_issuer: z.string().optional().nullable(),
  verification_status: z.string().optional().nullable(),
  commission_rate: z.number().optional().nullable(),
  listing_fee: z.number().optional().nullable(),
  contract_date: z.string().optional().nullable(),
  status: z.enum(["draft", "submitted", "in_review", "approved", "rejected"]).optional().default("draft"),
  created_by: z.string().optional().nullable(),
});

// GET /api/consigned - List items
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("consigned_items")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Error fetching consigned items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/consigned - Create item
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const validated = ConsignedItemSchema.parse(body);

    const { data, error } = await supabase
      .from("consigned_items")
      .insert(validated as never)
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
      .insert({
        action: "CREATE",
        entity_type: "consigned_item",
        entity_id: (data as any).id,
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
    console.error("Error creating consigned item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
