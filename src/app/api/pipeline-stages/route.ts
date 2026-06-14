import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const StageSchema = z.object({
  name: z.string().min(1),
  position: z.number().int().min(1).optional().default(1),
  color: z.string().optional().nullable(),
  is_default: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get("sort") || "position";

    let query = supabase.from("pipeline_stages").select("*");

    if (sort === "name") {
      query = query.order("name", { ascending: true });
    } else {
      query = query.order("position", { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("Error fetching pipeline stages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin"],
    });
    if (roleResponse) return roleResponse;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const validated = StageSchema.parse(body);

    const { data, error } = await supabase
      .from("pipeline_stages")
      .insert(validated as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      .insert({
        action: "CREATE",
        entity_type: "pipeline_stage",
        entity_id: (data as any).id,
        metadata: { stage: data },
      } as never);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating pipeline stage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
