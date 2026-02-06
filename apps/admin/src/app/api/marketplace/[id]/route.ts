import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const UpdateMarketplaceItemSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  full_description: z.string().optional().nullable(),
  price_usd: z.number().optional(),
  currency: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional().nullable(),
  metadata: z.unknown().optional().nullable(),
  category: z.string().optional(),
  status: z.enum(["draft", "pending", "published", "suspended", "unpublished", "archived"]).optional(),
  authenticated: z.boolean().optional(),
  certificate: z.string().optional().nullable(),
  authenticated_date: z.string().optional().nullable(),
  coa_issuer: z.string().optional().nullable(),
  signed_by: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  provenance: z.string().optional().nullable(),
  seller_name: z.string().optional().nullable(),
  seller_rating: z.number().optional().nullable(),
  seller_verified: z.boolean().optional().nullable(),
  is_featured: z.boolean().optional(),
  featured_order: z.number().optional().nullable(),
  commission_rate: z.number().optional().nullable(),
}).partial();

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
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const validated = UpdateMarketplaceItemSchema.parse(body);

    // Filter out undefined values and prepare update data
    const updateData: any = {};
    Object.keys(validated).forEach((key) => {
      const value = (validated as any)[key];
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    if (validated.images !== undefined) {
      updateData.images = validated.images ? JSON.stringify(validated.images) : null;
    }
    if (validated.metadata !== undefined) {
      updateData.metadata = validated.metadata
        ? typeof validated.metadata === "string"
          ? validated.metadata
          : JSON.stringify(validated.metadata)
        : null;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      // No updates, just return the existing item
      const { data: existingItem, error: fetchError } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        return NextResponse.json(
          { error: fetchError.message },
          { status: 400 }
        );
      }

      if (!existingItem) {
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(existingItem);
    }

    // First verify item exists
    const { data: existingItem, error: checkError } = await supabase
      .from("marketplace_items")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: checkError.message },
        { status: 400 }
      );
    }

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("marketplace_items")
      // @ts-expect-error - Supabase type inference issue with service role client
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      // If no data returned, fetch the item directly to verify it still exists
      const { data: fetchedItem, error: fetchError } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (fetchError || !fetchedItem) {
        return NextResponse.json(
          { error: "Item not found after update attempt" },
          { status: 404 }
        );
      }

      // Update may have succeeded but select didn't return data
      // Return the fetched item instead
      return NextResponse.json(fetchedItem);
    }

    // Log audit
    await supabase.from("audit_logs")
      // @ts-expect-error - Supabase type inference issue with service role client
      .insert({
        action: "UPDATE",
        entity_type: "marketplace_item",
        entity_id: id,
        metadata: { updates: validated },
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const { error } = await supabase
      .from("marketplace_items")
      .delete()
      .eq("id", id);

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
        action: "DELETE",
        entity_type: "marketplace_item",
        entity_id: id,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting marketplace item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
