import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const RoleUpdateSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({ userId: user.id, allow: ["admin"] });
    if (roleResponse) return roleResponse;

    const body = await request.json();
    const validated = RoleUpdateSchema.parse(body);
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({ role: validated.role } as never)
      .eq("id", id)
      .select("id, role")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs").insert({
      action: "UPDATE_ROLE",
      entity_type: "user",
      entity_id: id,
      metadata: { role: validated.role },
    } as never);

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
