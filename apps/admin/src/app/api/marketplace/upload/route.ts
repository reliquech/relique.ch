import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { MARKETPLACE_UPLOAD_BUCKET } from "@/features/marketplace/constants";
import {
  createTempUploadPath,
  isMarketplaceTempPath,
} from "@/features/marketplace/utils/uploadPaths";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    const sessionIdRaw = formData.get("sessionId");
    const sessionId =
      typeof sessionIdRaw === "string" && sessionIdRaw.trim().length > 0
        ? sessionIdRaw
        : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const requestedPath = formData.get("path");
    const fileName =
      typeof requestedPath === "string" && isMarketplaceTempPath(requestedPath)
        ? requestedPath
        : createTempUploadPath(sessionId, file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Bucket phải trùng với migration 008_storage_marketplace.sql (marketplace-images)
    const BUCKET = MARKETPLACE_UPLOAD_BUCKET;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json(
        { error: "Failed to upload file to storage", details: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

    return NextResponse.json(
      { url: publicUrl, path: data.path, temporary: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
