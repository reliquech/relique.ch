import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { formatSupabaseError } from "@/lib/supabase/formatSupabaseError";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";

export async function GET() {
  try {
    if (
      !getSupabaseUrl() ||
      !getSupabasePublishableKey() ||
      !getSupabaseSecretKey()
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("audit_logs").select("id").limit(1);
    if (error) {
      return NextResponse.json(
        { ok: false, error: formatSupabaseError(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, db: "ok" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: sanitizeErrorMessage(
          error instanceof Error ? error.message : "Unknown error"
        ),
      },
      { status: 500 }
    );
  }
}
