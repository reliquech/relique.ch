import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const EntityTypeSchema = z.enum(["customer", "lead", "deal", "message"]);
const FieldTypeSchema = z.enum(["text", "number", "date", "select", "multiselect", "boolean", "textarea", "url"]);

const CustomFieldSchema = z
  .object({
    entity_type: EntityTypeSchema,
    name: z.string().min(1),
    key: z.string().min(1).regex(/^[a-z][a-z0-9_]*$/),
    field_type: FieldTypeSchema,
    options: z.array(z.string().min(1)).optional().nullable(),
    required: z.boolean().optional().default(false),
    position: z.number().int().min(1).optional(),
    group: z.string().optional().nullable(),
    visibility_rules: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if ((data.field_type === "select" || data.field_type === "multiselect") && (!data.options || data.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options are required for select fields",
        path: ["options"],
      });
    }
  });

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const supabase = createServiceRoleClient();
    const entityType = request.nextUrl.searchParams.get("entity_type");

    let query = supabase.from("crm_custom_fields").select("*").order("position", { ascending: true });
    if (entityType) {
      const parsed = EntityTypeSchema.safeParse(entityType);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid entity_type" }, { status: 400 });
      }
      query = query.eq("entity_type", parsed.data);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const body = await request.json();
    const validated = CustomFieldSchema.parse(body);
    const options = validated.options
      ? Array.from(new Set(validated.options.map((opt) => opt.trim()).filter(Boolean)))
      : null;

    let position = validated.position;
    if (!position) {
      const { data: last } = await supabase
        .from("crm_custom_fields")
        .select("position")
        .eq("entity_type", validated.entity_type)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      position = ((last as { position?: number } | null)?.position ?? 0) + 1;
    }

    const { data, error } = await supabase
      .from("crm_custom_fields")
      .insert({
        ...validated,
        position,
        created_by: user.id,
        options,
        group: validated.group ?? null,
        visibility_rules: validated.visibility_rules ?? null,
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating custom field:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
