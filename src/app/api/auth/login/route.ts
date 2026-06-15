import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";
import { createClient } from "@/lib/supabase/server";

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Server-side sign-in so the browser never calls Supabase directly.
 * Avoids browser "Failed to fetch" when the tunnel/CORS blocks client → Supabase.
 * Session cookies are set via @supabase/ssr createServerClient.
 */
export async function POST(request: NextRequest) {
  let body: z.infer<typeof LoginBodySchema>;

  try {
    body = LoginBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = sanitizeErrorMessage(
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          message.includes("Supabase") || message.includes("Cloudflare")
            ? message
            : "Authentication service unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}
