import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const MessageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  message: z.string().min(1),
  status: z.enum(["new", "open", "pending", "closed"]).optional().default("new"),
  source: z.string().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  created_by: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (q) {
      const like = `%${q}%`;
      query = query.or(
        [
          `name.ilike.${like}`,
          `email.ilike.${like}`,
          `subject.ilike.${like}`,
          `message.ilike.${like}`,
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
    console.error("Error fetching messages:", error);
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

    const validated = MessageSchema.parse(body);

    const { data, error } = await supabase
      .from("messages")
      .insert(validated as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("audit_logs")
      .insert({
        action: "CREATE",
        entity_type: "message",
        entity_id: (data as any).id,
        metadata: { message: data },
      } as never);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
