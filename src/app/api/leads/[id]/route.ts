import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const LeadUpdateSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.enum(["new", "contacted", "qualified", "unqualified"]).optional(),
  score: z.number().int().optional(),
  last_contacted_at: z.string().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  converted_customer_id: z.string().uuid().optional().nullable(),
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
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching lead:", error);
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
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const validated = LeadUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from("leads")
      .update(validated as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      .insert({
        action: "UPDATE",
        entity_type: "lead",
        entity_id: id,
        metadata: { lead: data },
      } as never);

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating lead:", error);
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
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      .insert({
        action: "DELETE",
        entity_type: "lead",
        entity_id: id,
      } as never);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
