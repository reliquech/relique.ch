import { NextResponse } from "next/server";
import { createServiceRoleClient } from "./server";

type Role = "admin" | "editor" | "viewer";

interface RequireRoleParams {
  userId: string;
  allow: Role[];
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

  const role = ((data as { role?: string } | null)?.role as Role) ?? "viewer";
  if (!allow.includes(role)) {
    return {
      role,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { role, response: null };
}
