import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const BulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(["publish", "archive", "restore", "delete"]),
});

const ACTION_TO_LIFECYCLE: Record<string, string> = {
  publish: "published",
  archive: "archived",
  restore: "draft",
};

async function updateLifecycle(
  supabase: ReturnType<typeof createServiceRoleClient>,
  id: string,
  lifecycle: string
) {
  const { data: existingItem, error: fetchError } = await supabase
    .from("marketplace_items")
    .select("state")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return { id, error: fetchError.message };
  if (!existingItem) return { id, error: "Item not found" };

  const nextState: Record<string, unknown> = {
    ...(existingItem as { state?: Record<string, unknown> }).state,
    lifecycle,
  };
  if (lifecycle === "published") {
    nextState.visibility = "public";
  } else if (lifecycle === "archived" || lifecycle === "draft") {
    nextState.visibility = "private";
  }

  const { error } = await supabase
    .from("marketplace_items")
    .update({ state: nextState } as never)
    .eq("id", id);

  if (error) return { id, error: error.message };
  return { id, error: null };
}

// POST /api/marketplace/bulk
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const body = await request.json();
    const { ids, action } = BulkSchema.parse(body);
    const supabase = createServiceRoleClient();

    const failed: Array<{ id: string; error: string }> = [];
    let updated = 0;

    if (action === "delete") {
      for (const id of ids) {
        const { error } = await supabase.from("marketplace_items").delete().eq("id", id);
        if (error) failed.push({ id, error: error.message });
        else updated += 1;
      }
    } else {
      const lifecycle = ACTION_TO_LIFECYCLE[action];
      if (!lifecycle) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
      for (const id of ids) {
        const result = await updateLifecycle(supabase, id, lifecycle);
        if (result.error) failed.push({ id, error: result.error });
        else updated += 1;
      }
    }

    return NextResponse.json({ updated, failed, total: ids.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Bulk marketplace action:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
