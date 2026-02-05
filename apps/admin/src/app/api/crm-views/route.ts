import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const ViewSchema = z.object({
  entity_type: z.enum(["customers", "leads", "deals", "messages"]),
  name: z.string().min(1),
  state: z.record(z.string(), z.unknown()),
});

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const entityType = request.nextUrl.searchParams.get("entity");
    const supabase = createServiceRoleClient();

    // Own views + shared views from others
    let ownQuery = supabase
      .from("crm_saved_views")
      .select("*")
      .eq("user_id", user.id);
    if (entityType) ownQuery = ownQuery.eq("entity_type", entityType);
    const { data: ownData, error: ownError } = await ownQuery.order("is_default", { ascending: false }).order("created_at", { ascending: false });

    if (ownError) {
      return NextResponse.json({ error: ownError.message }, { status: 500 });
    }

    let sharedQuery = supabase
      .from("crm_saved_views")
      .select("*")
      .eq("shared", true)
      .neq("user_id", user.id);
    if (entityType) sharedQuery = sharedQuery.eq("entity_type", entityType);
    const { data: shared } = await sharedQuery.order("created_at", { ascending: false });
    const sharedData = shared ?? [];
    type ViewRow = { is_default?: boolean; created_at: string };
    const combined = [...((ownData ?? []) as ViewRow[]), ...(sharedData as ViewRow[])];
    const data = combined.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching CRM views:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const body = await request.json();
    const validated = ViewSchema.parse(body);
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("crm_saved_views")
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
    console.error("Error creating CRM view:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
