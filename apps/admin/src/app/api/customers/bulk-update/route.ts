import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const BulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
  patch: z.object({
    status: z.enum(["active", "inactive"]).optional(),
    owner_id: z.string().uuid().nullable().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const body = await request.json();
    const { ids, patch } = BulkUpdateSchema.parse(body);

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("customers")
      .update(patch as never)
      .in("id", ids)
      .select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      updated: Array.isArray(data) ? data.length : 0,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 });
    }
    console.error("Customers bulk-update:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
