import { NextResponse } from "next/server";
import { createServiceRoleClient } from "./server";

type Role = "admin" | "editor" | "viewer";

interface RequireRoleParams {
  userId: string;
  allow: Role[];
}

async function countAdmins(supabase: ReturnType<typeof createServiceRoleClient>) {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) {
    return { count: null, error };
  }

  return { count: count ?? 0, error: null };
}

async function promoteToAdmin(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string
) {
  const { error } = await (supabase.from("profiles") as any).update({ role: "admin" }).eq("id", userId);
  return error;
}

export async function requireRole({ userId, allow }: RequireRoleParams) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    return {
      role: null,
      response: NextResponse.json({ error: error.message }, { status: 500 }),
    };
  }

  let role = ((data as { role?: string } | null)?.role as Role) ?? "viewer";

  if (!allow.includes(role)) {
    const { count: adminCount, error: countError } = await countAdmins(supabase);

    // Fresh install: no admin yet — promote the authenticated user once.
    if (!countError && adminCount === 0) {
      const promoteError = await promoteToAdmin(supabase, userId);
      if (!promoteError) {
        role = "admin";
        if (allow.includes(role)) {
          return { role, response: null };
        }
      }
    }

    return {
      role,
      response: NextResponse.json(
        {
          error: "Forbidden",
          details: `Your role is "${role}". This action requires ${allow.join(" or ")}.`,
        },
        { status: 403 }
      ),
    };
  }

  return { role, response: null };
}
