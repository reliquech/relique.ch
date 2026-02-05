import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email(),
  display_name: z.string().optional(),
});

export async function GET() {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({ userId: user.id, allow: ["admin"] });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const { data: usersData, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = (usersData?.users ?? []).map((u) => u.id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, role")
      .in("id", userIds);

    type ProfileRow = { id: string; display_name?: string | null; role?: string | null };
    const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));

    type UserRow = { id: string; email?: string; created_at?: string };
    const result = (usersData?.users ?? []).map((u: UserRow) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        display_name: (profile as ProfileRow | undefined)?.display_name ?? null,
        role: (profile as ProfileRow | undefined)?.role ?? "viewer",
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({ userId: user.id, allow: ["admin"] });
    if (roleResponse) return roleResponse;

    const body = await request.json();
    const validated = InviteSchema.parse(body);
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(validated.email, {
      data: { display_name: validated.display_name ?? validated.email },
    });

    if (error || !data?.user) {
      return NextResponse.json({ error: error?.message || "Failed to invite user" }, { status: 500 });
    }

    await supabase
      .from("profiles")
      .upsert({ id: data.user.id, display_name: validated.display_name ?? validated.email, role: "viewer" } as never);

    await supabase.from("audit_logs").insert({
      action: "INVITE_USER",
      entity_type: "user",
      entity_id: data.user.id,
      metadata: { email: validated.email },
    } as never);

    return NextResponse.json({ id: data.user.id, email: data.user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error inviting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
