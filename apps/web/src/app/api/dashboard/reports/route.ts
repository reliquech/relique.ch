import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const CreateReportSchema = z.object({
  name: z.string().min(1),
  filters: z.record(z.string(), z.unknown()).default({}),
  chart_options: z.record(z.string(), z.unknown()).default({}),
  is_default: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("dashboard_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("Dashboard reports list:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const body = await request.json();
    const validated = CreateReportSchema.parse(body);
    const supabase = createServiceRoleClient();
    if (validated.is_default) {
      await supabase
        .from("dashboard_reports")
        .update({ is_default: false } as never)
        .eq("user_id", user.id);
    }
    const { data, error } = await supabase
      .from("dashboard_reports")
      .insert({
        user_id: user.id,
        name: validated.name,
        filters: validated.filters,
        chart_options: validated.chart_options,
        is_default: validated.is_default,
      } as never)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 });
    }
    console.error("Dashboard report create:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
