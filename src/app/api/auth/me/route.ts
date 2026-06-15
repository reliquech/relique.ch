import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";

const PatchProfileSchema = z.object({
  display_name: z.string().trim().min(1, "Display name is required"),
  phone: z.string().trim().optional().nullable(),
});

/**
 * Current session user + profiles row via server Supabase client (cookie session).
 * Same-origin proxy — avoids browser direct fetch to Supabase tunnel URL.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: sanitizeErrorMessage(profileError.message) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile,
    });
  } catch (error) {
    const message = sanitizeErrorMessage(
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          message.includes("Supabase") || message.includes("Cloudflare")
            ? message
            : "Failed to load profile",
      },
      { status: 503 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    let body: z.infer<typeof PatchProfileSchema>;
    try {
      body = PatchProfileSchema.parse(await request.json());
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      // @ts-expect-error - Supabase inferred update type can be never when Table name is narrow
      .update({
        display_name: body.display_name,
        phone: body.phone?.trim() ? body.phone.trim() : null,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: sanitizeErrorMessage(profileError.message) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile,
    });
  } catch (error) {
    const message = sanitizeErrorMessage(
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          message.includes("Supabase") || message.includes("Cloudflare")
            ? message
            : "Failed to update profile",
      },
      { status: 503 }
    );
  }
}
