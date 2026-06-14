import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const SearchSchema = z.object({
  entity_type: z.enum(["customers", "leads", "deals", "messages"]),
  query: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const entityType = request.nextUrl.searchParams.get("entity");
    const supabase = createServiceRoleClient();

    let query = supabase
      .from("crm_recent_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching recent searches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const body = await request.json();
    const validated = SearchSchema.parse(body);
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("crm_recent_searches")
      .insert({ ...validated, user_id: user.id } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: overflow } = await supabase
      .from("crm_recent_searches")
      .select("id")
      .eq("user_id", user.id)
      .eq("entity_type", validated.entity_type)
      .order("created_at", { ascending: false })
      .range(10, 100);

    const overflowRows = (overflow ?? []) as { id: string }[];
    if (overflowRows.length > 0) {
      const ids = overflowRows.map((row) => row.id);
      await supabase
        .from("crm_recent_searches")
        .delete()
        .in("id", ids);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error saving recent search:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
