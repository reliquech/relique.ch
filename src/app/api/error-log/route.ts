import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const BodySchema = z.object({
  source: z.literal("client"),
  path: z.string().optional(),
  method: z.string().optional(),
  status_code: z.number().optional(),
  message: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    await supabase.from("error_logs").insert({
      source: "client",
      path: parsed.data.path ?? null,
      method: parsed.data.method ?? null,
      status_code: parsed.data.status_code ?? null,
      message: parsed.data.message ?? null,
      details: parsed.data.details ?? null,
      user_id: user?.id ?? null,
    } as never);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error logging client error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
