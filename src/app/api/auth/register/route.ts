import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2).max(80),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RegisterSchema.parse(body);

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        display_name: validated.username,
      },
    });

    if (error || !data?.user) {
      return NextResponse.json({ error: error?.message || "Failed to create user" }, { status: 400 });
    }

    await supabase
      .from("profiles")
      .upsert({ id: data.user.id, display_name: validated.username } as never);

    return NextResponse.json({ id: data.user.id, email: data.user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
