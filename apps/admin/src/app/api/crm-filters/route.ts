import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const FilterSchema = z.object({
  entity_type: z.enum(["customers", "leads", "deals", "messages"]),
  name: z.string().min(1),
  query: z.string().optional().nullable(),
  filters: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const entityType = request.nextUrl.searchParams.get("entity");
    const supabase = createServiceRoleClient();

    let query = supabase
      .from("crm_saved_filters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching CRM filters:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const body = await request.json();
    const validated = FilterSchema.parse(body);
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("crm_saved_filters")
      .insert({ ...validated, user_id: user.id } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating CRM filter:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
