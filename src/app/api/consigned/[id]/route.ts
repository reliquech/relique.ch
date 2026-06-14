import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const UpdateConsignedItemSchema = z.object({
  marketplace_item_id: z.string().uuid().optional().nullable(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional().nullable(),
  contact_address: z.string().optional().nullable(),
  item_description: z.string().optional(),
  category: z.string().optional().nullable(),
  estimated_value: z.number().optional().nullable(),
  appraisal_date: z.string().optional().nullable(),
  coa_issuer: z.string().optional().nullable(),
  verification_status: z.string().optional().nullable(),
  commission_rate: z.number().optional().nullable(),
  listing_fee: z.number().optional().nullable(),
  contract_date: z.string().optional().nullable(),
  status: z.enum(["draft", "submitted", "in_review", "approved", "rejected"]).optional(),
}).partial();

// GET /api/consigned/[id] - Get single item
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
      .from("consigned_items")
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
    console.error("Error fetching consigned item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/consigned/[id] - Update item
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

    const validated = UpdateConsignedItemSchema.parse(body);

    const { data, error } = await supabase
      .from("consigned_items")
      .update(validated as never)
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
      .insert({
        action: "UPDATE",
        entity_type: "consigned_item",
        entity_id: id,
        metadata: { updates: validated },
      } as never);

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating consigned item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/consigned/[id] - Delete item
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
      .from("consigned_items")
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
      .insert({
        action: "DELETE",
        entity_type: "consigned_item",
        entity_id: id,
      } as never);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting consigned item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
