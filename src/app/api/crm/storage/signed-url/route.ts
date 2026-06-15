import { NextRequest, NextResponse } from "next/server";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";
import { requireUser } from "@/lib/supabase/requireUser";
import { assertSafeStoragePath, signedCrmUrl } from "../_shared";

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const path = assertSafeStoragePath(request.nextUrl.searchParams.get("path") ?? "");
    if (!path) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const expiresRaw = request.nextUrl.searchParams.get("expiresIn");
    const expiresIn = expiresRaw ? Number.parseInt(expiresRaw, 10) : 3600;
    const expiresInSeconds =
      Number.isFinite(expiresIn) && expiresIn > 0 && expiresIn <= 86_400
        ? expiresIn
        : 3600;

    const { data, error } = await signedCrmUrl(path, expiresInSeconds);
    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: sanitizeErrorMessage(error?.message ?? "Failed to create signed URL") },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error: sanitizeErrorMessage(
          error instanceof Error ? error.message : "Signed URL failed"
        ),
      },
      { status: 503 }
    );
  }
}
