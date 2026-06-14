import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const UpdateReportSchema = z.object({
  name: z.string().min(1).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  chart_options: z.record(z.string(), z.unknown()).optional(),
  is_default: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("dashboard_reports")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("Dashboard report get:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = await request.json();
    const validated = UpdateReportSchema.parse(body);
    const supabase = createServiceRoleClient();
    if (validated.is_default === true) {
      await supabase
        .from("dashboard_reports")
        .update({ is_default: false } as never)
        .eq("user_id", user.id);
    }
    const { data, error } = await supabase
      .from("dashboard_reports")
      .update(validated as never)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 });
    }
    console.error("Dashboard report update:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("dashboard_reports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Dashboard report delete:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
