import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const AttachmentSchema = z.object({
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  file_path: z.string().min(1),
  file_name: z.string().min(1),
  content_type: z.string().optional().nullable(),
  size_bytes: z.number().int().optional().nullable(),
  uploaded_by: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;

    const entityType = searchParams.get("entity_type");
    const entityId = searchParams.get("entity_id");

    let query = supabase
      .from("attachments")
      .select("*")
      .order("created_at", { ascending: false });

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    if (entityId) {
      query = query.eq("entity_id", entityId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const validated = AttachmentSchema.parse(body);

    const { data, error } = await supabase
      .from("attachments")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert(validated)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "CREATE",
        entity_type: "attachment",
        entity_id: (data as any).id,
        metadata: { attachment: data },
      });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating attachment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
