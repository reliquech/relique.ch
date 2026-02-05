import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const StageUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().int().min(1).optional(),
  color: z.string().optional().nullable(),
  is_default: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pipeline stage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin"],
    });
    if (roleResponse) return roleResponse;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const validated = StageUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from("pipeline_stages")
      // @ts-expect-error - Supabase type inference issue with service role client
      .update(validated)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "UPDATE",
        entity_type: "pipeline_stage",
        entity_id: id,
        metadata: { stage: data },
      });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating pipeline stage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin"],
    });
    if (roleResponse) return roleResponse;
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("pipeline_stages")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "DELETE",
        entity_type: "pipeline_stage",
        entity_id: id,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pipeline stage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
