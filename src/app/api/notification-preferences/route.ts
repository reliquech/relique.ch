import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const PreferencesSchema = z.object({
  in_app_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  type_preferences: z.record(z.string(), z.boolean()).optional().nullable(),
});

export async function GET() {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      return NextResponse.json(data);
    }

    const { data: created, error } = await supabase
      .from("notification_preferences")
      .insert({ user_id: user.id } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const body = await request.json();
    const validated = PreferencesSchema.parse(body);

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...validated } as never, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating notification preferences:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
