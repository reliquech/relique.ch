import { NextRequest, NextResponse } from "next/server";
import { sanitizeErrorMessage } from "@/lib/api/errorMessage";
import { requireUser } from "@/lib/supabase/requireUser";
import { assertSafeStoragePath, uploadCrmObject } from "../_shared";

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const formData = await request.formData();
    const file = formData.get("file");
    const pathRaw = formData.get("path");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (typeof pathRaw !== "string") {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const path = assertSafeStoragePath(pathRaw);
    if (!path) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await uploadCrmObject(path, buffer, file.type || "application/octet-stream");

    if (error || !data) {
      return NextResponse.json(
        { error: sanitizeErrorMessage(error?.message ?? "Failed to upload file") },
        { status: 500 }
      );
    }

    return NextResponse.json({ path: data.path });
  } catch (error) {
    return NextResponse.json(
      {
        error: sanitizeErrorMessage(
          error instanceof Error ? error.message : "Upload failed"
        ),
      },
      { status: 503 }
    );
  }
}
