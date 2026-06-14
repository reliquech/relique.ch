import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const FilterUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  query: z.string().optional().nullable(),
  filters: z.record(z.string(), z.unknown()).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;

    const body = await request.json();
    const validated = FilterUpdateSchema.parse(body);
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("crm_saved_filters")
      .update(validated as never)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating CRM filter:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("crm_saved_filters")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting CRM filter:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
