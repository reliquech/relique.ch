import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const ViewUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  state: z.record(z.string(), z.unknown()).optional(),
  is_default: z.boolean().optional(),
  shared: z.boolean().optional(),
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
    const validated = ViewUpdateSchema.parse(body);
    const supabase = createServiceRoleClient();

    if (validated.is_default === true) {
      const viewRow = await supabase.from("crm_saved_views").select("entity_type").eq("id", id).eq("user_id", user.id).single();
      const viewData = viewRow.data as { entity_type?: string } | null;
      if (viewData?.entity_type) {
        await supabase
          .from("crm_saved_views")
          .update({ is_default: false } as never)
          .eq("user_id", user.id)
          .eq("entity_type", viewData.entity_type)
          .neq("id", id);
      }
    }

    const { data, error } = await supabase
      .from("crm_saved_views")
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
    console.error("Error updating CRM view:", error);
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
      .from("crm_saved_views")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting CRM view:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
