import { NextRequest, NextResponse } from "next/server";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";
import { requireUser } from "@/lib/supabase/requireUser";
import { assertSafeStoragePath, removeCrmObject } from "./_shared";

export async function DELETE(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const body = (await request.json().catch(() => null)) as { path?: string } | null;
    const path = assertSafeStoragePath(body?.path ?? "");
    if (!path) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const { error } = await removeCrmObject(path);
    if (error) {
      return NextResponse.json(
        { error: sanitizeErrorMessage(error.message) },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: sanitizeErrorMessage(
          error instanceof Error ? error.message : "Delete failed"
        ),
      },
      { status: 503 }
    );
  }
}
