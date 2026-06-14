import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const FieldTypeSchema = z.enum(["text", "number", "date", "select", "multiselect", "boolean", "textarea", "url"]);

const CustomFieldUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    key: z.string().min(1).regex(/^[a-z][a-z0-9_]*$/).optional(),
    field_type: FieldTypeSchema.optional(),
    options: z.array(z.string().min(1)).optional().nullable(),
    required: z.boolean().optional(),
    position: z.number().int().min(1).optional(),
    group: z.string().optional().nullable(),
    visibility_rules: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.field_type && (data.field_type === "select" || data.field_type === "multiselect") && data.options && data.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options are required for select fields",
        path: ["options"],
      });
    }
  });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({ userId: user.id, allow: ["admin", "editor"] });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const body = await request.json();
    const validated = CustomFieldUpdateSchema.parse(body);
    const options = validated.options
      ? Array.from(new Set(validated.options.map((opt) => opt.trim()).filter(Boolean)))
      : validated.options ?? undefined;

    const { data, error } = await supabase
      .from("crm_custom_fields")
      .update({
        ...validated,
        options,
      } as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating custom field:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({ userId: user.id, allow: ["admin", "editor"] });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("crm_custom_fields").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom field:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
