import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const UploadUrlSchema = z.object({
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  file_name: z.string().min(1),
  content_type: z.string().optional().nullable(),
  size_bytes: z.number().int().optional().nullable(),
});

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const body = await request.json();
    const validated = UploadUrlSchema.parse(body);

    const prefix =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    const safeName = sanitizeFileName(validated.file_name);
    const file_path = `${validated.entity_type}/${validated.entity_id}/${prefix}_${safeName}`;

    const insertPayload = {
      entity_type: validated.entity_type,
      entity_id: validated.entity_id,
      file_path,
      file_name: validated.file_name,
      content_type: validated.content_type ?? null,
      size_bytes: validated.size_bytes ?? null,
      uploaded_by: user.id,
    };

    const { data, error } = await supabase
      .from("attachments")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert(insertPayload)
      .select("id, file_path")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      attachment_id: (data as { id: string }).id,
      file_path: (data as { file_path: string }).file_path,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating upload URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
