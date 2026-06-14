import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const EntityTypeSchema = z.enum(["customer", "lead", "deal", "message"]);

const ValuesSchema = z.object({
  entity_type: EntityTypeSchema,
  entity_id: z.string().uuid(),
  values: z.record(z.string(), z.unknown()),
});

function isEmptyValue(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const entityType = request.nextUrl.searchParams.get("entity_type");
    const entityId = request.nextUrl.searchParams.get("entity_id");
    if (!entityType || !entityId) {
      return NextResponse.json({ error: "Missing entity_type or entity_id" }, { status: 400 });
    }

    const parsed = EntityTypeSchema.safeParse(entityType);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid entity_type" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("crm_custom_field_values")
      .select("*")
      .eq("entity_type", parsed.data)
      .eq("entity_id", entityId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("Error fetching custom field values:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({ userId: user.id, allow: ["admin", "editor"] });
    if (roleResponse) return roleResponse;

    const body = await request.json();
    const validated = ValuesSchema.parse(body);
    const supabase = createServiceRoleClient();

    const { data: fields, error: fieldsError } = await supabase
      .from("crm_custom_fields")
      .select("id")
      .eq("entity_type", validated.entity_type);

    if (fieldsError) {
      return NextResponse.json({ error: fieldsError.message }, { status: 500 });
    }

    const validFieldIds = new Set(((fields ?? []) as { id: string }[]).map((field) => field.id));
    const toUpsert: Array<{ field_id: string; entity_type: string; entity_id: string; value_json: unknown }> = [];
    const toDelete: string[] = [];

    Object.entries(validated.values).forEach(([fieldId, value]) => {
      if (!validFieldIds.has(fieldId)) return;
      if (isEmptyValue(value)) {
        toDelete.push(fieldId);
        return;
      }
      toUpsert.push({
        field_id: fieldId,
        entity_type: validated.entity_type,
        entity_id: validated.entity_id,
        value_json: value,
      });
    });

    if (toDelete.length) {
      const { error: deleteError } = await supabase
        .from("crm_custom_field_values")
        .delete()
        .eq("entity_type", validated.entity_type)
        .eq("entity_id", validated.entity_id)
        .in("field_id", toDelete);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    if (toUpsert.length) {
      const { error: upsertError } = await supabase
        .from("crm_custom_field_values")
        .upsert(toUpsert as never, { onConflict: "field_id,entity_id" });

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    const { data, error } = await supabase
      .from("crm_custom_field_values")
      .select("*")
      .eq("entity_type", validated.entity_type)
      .eq("entity_id", validated.entity_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error saving custom field values:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
