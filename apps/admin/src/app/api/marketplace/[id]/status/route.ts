import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const StatusUpdateSchema = z.object({
  status: z.enum(["draft", "pending", "published", "suspended", "unpublished", "archived"]),
});

// PATCH /api/marketplace/[id]/status - Update status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const validated = StatusUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from("marketplace_items")
      // @ts-expect-error - Supabase type inference issue with service role client
      .update({ status: validated.status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log audit
    await supabase.from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "STATUS_CHANGE",
        entity_type: "marketplace_item",
        entity_id: id,
        metadata: { 
          old_status: (data as any).status, 
          new_status: validated.status 
        },
      });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating marketplace item status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
