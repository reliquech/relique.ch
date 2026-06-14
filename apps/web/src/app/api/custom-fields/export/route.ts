import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { z } from "zod";

const EntitySchema = z.enum(["customer", "lead", "deal", "message"]);

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const entity = request.nextUrl.searchParams.get("entity_type");
    const format = request.nextUrl.searchParams.get("format") ?? "json";

    const supabase = createServiceRoleClient();
    let query = supabase
      .from("crm_custom_fields")
      .select("entity_type, name, key, field_type, options, required, position, group, visibility_rules")
      .order("position", { ascending: true });

    if (entity) {
      const parsed = EntitySchema.safeParse(entity);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid entity_type" }, { status: 400 });
      }
      query = query.eq("entity_type", parsed.data);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type FieldRow = {
      entity_type: string;
      name: string;
      key: string;
      field_type: string;
      options?: unknown;
      required?: boolean;
      position?: number;
      group?: string | null;
      visibility_rules?: unknown;
    };
    const template = ((data ?? []) as FieldRow[]).map((row) => ({
      entity_type: row.entity_type,
      name: row.name,
      key: row.key,
      field_type: row.field_type,
      options: row.options ?? null,
      required: row.required ?? false,
      position: row.position,
      group: row.group ?? null,
      visibility_rules: row.visibility_rules ?? null,
    }));

    if (format === "csv") {
      const header = ["entity_type", "name", "key", "field_type", "required", "position", "group"];
      const lines = [
        header.join(","),
        ...template.map((r) =>
          header.map((h) => (r as Record<string, unknown>)[h] ?? "").join(",")
        ),
      ];
      return new NextResponse(lines.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=custom-fields-template.csv",
        },
      });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error exporting custom fields:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
