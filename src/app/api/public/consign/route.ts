import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PHOTOS = 10;
const MAX_BYTES = 10 * 1024 * 1024;

const PublicConsignFieldsSchema = z.object({
  contact_name: z.string().min(2),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  item_description: z.string().min(10),
  category: z.string().optional(),
  coa_issuer: z.string().optional(),
});

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    if (formData.get("website")) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const body = {
      contact_name: String(formData.get("contact_name") ?? ""),
      contact_email: String(formData.get("contact_email") ?? ""),
      contact_phone: formData.get("contact_phone")
        ? String(formData.get("contact_phone"))
        : undefined,
      item_description: String(formData.get("item_description") ?? ""),
      category: formData.get("category") ? String(formData.get("category")) : undefined,
      coa_issuer: formData.get("coa_issuer") ? String(formData.get("coa_issuer")) : undefined,
    };

    const validated = PublicConsignFieldsSchema.parse(body);
    const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);

    if (photos.length < 1) {
      return NextResponse.json({ error: "At least 1 photo required" }, { status: 400 });
    }
    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `Max ${MAX_PHOTOS} photos allowed` }, { status: 400 });
    }

    for (const photo of photos) {
      if (photo.size > MAX_BYTES) {
        return NextResponse.json({ error: "Each photo must be under 10MB" }, { status: 400 });
      }
      const mime = photo.type || "application/octet-stream";
      if (!ALLOWED_MIME.has(mime)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, and WebP images are allowed" },
          { status: 400 }
        );
      }
    }

    const supabase = createServiceRoleClient();

    const { data: submission, error: insertError } = await supabase
      .from("consigned_items")
      .insert({
        contact_name: validated.contact_name,
        contact_email: validated.contact_email,
        contact_phone: validated.contact_phone ?? null,
        item_description: validated.item_description,
        category: validated.category ?? null,
        coa_issuer: validated.coa_issuer ?? null,
        status: "submitted",
      } as never)
      .select("id")
      .single();

    if (insertError || !submission) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create submission" },
        { status: 500 }
      );
    }

    const submissionId = (submission as { id: string }).id;

    const { error: leadError } = await supabase.from("leads").insert({
      full_name: validated.contact_name,
      email: validated.contact_email,
      phone: validated.contact_phone ?? null,
      source: "consign",
      status: "new",
    } as never);

    if (leadError) {
      console.error("Lead insert failed:", leadError.message);
    }

    for (const photo of photos) {
      const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${submissionId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await photo.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("consign-submissions")
        .upload(path, buffer, {
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Photo upload failed:", uploadError.message);
        continue;
      }

      await supabase.from("attachments").insert({
        entity_type: "consigned_item",
        entity_id: submissionId,
        file_path: path,
        file_name: photo.name,
        content_type: photo.type,
        size_bytes: photo.size,
      } as never);
    }

    return NextResponse.json({ id: submissionId, status: "submitted" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Consign submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
