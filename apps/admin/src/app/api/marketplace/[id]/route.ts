import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";
import { normalizeMarketplaceUpdate, buildMarketplaceInsertPayload } from "../marketplaceUtils";

// GET /api/marketplace/[id] - Get single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/marketplace/[id] - Update item
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

    const { data: existingItem, error: fetchError } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const merged = normalizeMarketplaceUpdate(body, existingItem, user.id);

    const { data, error } = await supabase
      .from("marketplace_items")
      // @ts-expect-error - Supabase type inference issue with service role client
      .update(buildMarketplaceInsertPayload(merged))
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Item not found after update attempt" }, { status: 404 });
    }

    await supabase
      .from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "UPDATE",
        entity_type: "marketplace_item",
        entity_id: id,
        metadata: { updates: body },
      });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/marketplace/[id] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { id } = await params;
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("marketplace_items").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "DELETE",
        entity_type: "marketplace_item",
        entity_id: id,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
