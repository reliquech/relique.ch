import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { buildMarketplaceInsertPayload } from "../../marketplaceUtils";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/marketplace/[param]/duplicate
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const { param: id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: existing, error: fetchError } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const row = existing as Record<string, unknown>;
    const now = new Date().toISOString();
    const baseSlug = String(row.slug ?? "item");
    const slug = `${baseSlug}-copy-${Date.now()}`;
    const state = {
      ...(row.state as Record<string, unknown>),
      lifecycle: "draft",
      visibility: "private",
      created_at: now,
      updated_at: now,
      created_by: user.id,
    };

    const duplicate = {
      entity_type: row.entity_type,
      slug,
      sku: `${String(row.sku ?? "sku")}-copy-${Date.now()}`,
      state,
      listing: row.listing,
      jersey: row.jersey,
      signing: row.signing,
      condition: row.condition,
      auth: row.auth,
      refs: row.refs,
      media: row.media,
    };

    const { data, error } = await supabase
      .from("marketplace_items")
      .insert(buildMarketplaceInsertPayload(duplicate) as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs").insert({
      action: "DUPLICATE",
      entity_type: "marketplace_item",
      entity_id: (data as { id: string }).id,
      metadata: { source_id: id },
    } as never);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Duplicate marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
