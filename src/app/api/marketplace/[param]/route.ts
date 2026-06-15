import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";
import { getPublicListingBySlug } from "@/lib/marketplace/getPublicListingBySlug";
import {
  normalizeMarketplaceUpdate,
  buildMarketplaceInsertPayload,
} from "../marketplaceUtils";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

async function adminGetById(id: string) {
  const { user, response } = await requireUser();
  if (!user) return response;

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
}

async function publicGetBySlug(slug: string) {
  const listing = await getPublicListingBySlug(slug);
  if (!listing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json(listing);
}

// GET /api/marketplace/[param] — public by slug OR authenticated by UUID id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params;
    const sessionUser = await getSessionUser();
    const isPublicScope = request.nextUrl.searchParams.get("scope") === "public";

    if (sessionUser && isUuid(param) && !isPublicScope) {
      return adminGetById(param);
    }

    return publicGetBySlug(param);
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/marketplace/[param] — update item by id (authenticated)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { param: id } = await params;
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
      .update(buildMarketplaceInsertPayload(merged) as never)
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
      .insert({
        action: "UPDATE",
        entity_type: "marketplace_item",
        entity_id: id,
        metadata: { updates: body },
      } as never);

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

// DELETE /api/marketplace/[param] — delete item by id (authenticated)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const { param: id } = await params;
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("marketplace_items").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase
      .from("audit_logs")
      .insert({
        action: "DELETE",
        entity_type: "marketplace_item",
        entity_id: id,
      } as never);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting marketplace item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
