import { NextResponse } from "next/server";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";
import { createClient } from "@/lib/supabase/server";

/** Server-side sign-out; clears auth cookies via @supabase/ssr. */
export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: sanitizeErrorMessage(error.message) },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = sanitizeErrorMessage(
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
