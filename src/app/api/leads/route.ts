import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const LeadSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.enum(["new", "contacted", "qualified", "unqualified"]).optional().default("new"),
  score: z.number().int().optional().default(0),
  last_contacted_at: z.string().optional().nullable(),
  owner_id: z.string().uuid().optional().nullable(),
  converted_customer_id: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status");
    const ownerId = searchParams.get("owner_id");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (ownerId) {
      query = query.eq("owner_id", ownerId);
    }

    if (q) {
      const like = `%${q}%`;
      query = query.or(
        [
          `full_name.ilike.${like}`,
          `email.ilike.${like}`,
          `phone.ilike.${like}`,
          `company.ilike.${like}`,
        ].join(",")
      );
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
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

    const validated = LeadSchema.parse(body);

    const { data, error } = await supabase
      .from("leads")
      .insert(validated as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      .insert({
        action: "CREATE",
        entity_type: "lead",
        entity_id: (data as any).id,
        metadata: { lead: data },
      } as never);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
