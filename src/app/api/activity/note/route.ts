import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const BodySchema = z.object({
  entity_type: z.string().min(1),
  entity_id: z.string().uuid(),
  body: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({ userId: user.id, allow: ["admin", "editor"] });
    if (roleResponse) return roleResponse;

    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const { entity_type, entity_id, body: noteBody } = parsed.data;
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        action: "note",
        entity_type,
        entity_id,
        actor_id: user.id,
        metadata: { body: noteBody },
      } as never)
      .select("id, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data as { id: string; created_at: string };
    return NextResponse.json({ id: result.id, created_at: result.created_at });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
