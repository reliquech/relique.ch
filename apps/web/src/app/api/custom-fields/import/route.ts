import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const EntitySchema = z.enum(["customer", "lead", "deal", "message"]);
const FieldTypeSchema = z.enum([
  "text", "number", "date", "select", "multiselect", "boolean", "textarea", "url",
]);

const ImportFieldSchema = z.object({
  entity_type: EntitySchema,
  name: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z][a-z0-9_]*$/),
  field_type: FieldTypeSchema,
  options: z.array(z.string()).optional().nullable(),
  required: z.boolean().optional().default(false),
  position: z.number().int().min(1).optional(),
  group: z.string().optional().nullable(),
  visibility_rules: z.record(z.string(), z.unknown()).optional().nullable(),
});

const ImportBodySchema = z.object({
  mode: z.enum(["merge", "overwrite"]),
  entity_type: EntitySchema.optional(),
  fields: z.array(ImportFieldSchema),
});

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
    const { mode, entity_type: filterEntity, fields } = ImportBodySchema.parse(body);

    if (mode === "overwrite" && !filterEntity) {
      return NextResponse.json(
        { error: "entity_type is required when mode is overwrite" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    if (mode === "overwrite" && filterEntity) {
      const { error: delError } = await supabase
        .from("crm_custom_fields")
        .delete()
        .eq("entity_type", filterEntity);
      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 400 });
      }
    }

    let position = 0;
    const toInsert = fields
      .filter((f) => !filterEntity || f.entity_type === filterEntity)
      .map((f) => {
        position += 1;
        return {
          entity_type: f.entity_type,
          name: f.name,
          key: f.key,
          field_type: f.field_type,
          options: f.options ?? null,
          required: f.required ?? false,
          position: f.position ?? position,
          group: f.group ?? null,
          visibility_rules: f.visibility_rules ?? null,
          created_by: user.id,
        };
      });

    if (toInsert.length === 0) {
      return NextResponse.json({ imported: 0, message: "No fields to import" });
    }

    if (mode === "overwrite" && toInsert.length > 0) {
      const { data, error } = await supabase
        .from("crm_custom_fields")
        // @ts-expect-error - Supabase type inference
        .insert(toInsert)
        .select("id");
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({
        imported: Array.isArray(data) ? data.length : 1,
        message: "Import completed",
      });
    }

    const { data, error } = await supabase
      .from("crm_custom_fields")
      // @ts-expect-error - Supabase type inference
      .upsert(toInsert, { onConflict: "entity_type,key" })
      .select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      imported: Array.isArray(data) ? data.length : 1,
      message: "Import completed",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error importing custom fields:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
