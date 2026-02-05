import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  entity_type: z.enum(["customer", "lead"]),
  entity_id: z.string().uuid(),
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
    const validated = EmailSchema.parse(body);
    const supabase = createServiceRoleClient();

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "support@relique.co";
    if (!apiKey) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    const responseResend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: validated.to,
        subject: validated.subject,
        text: validated.body,
      }),
    });

    const responseJson = await responseResend.json().catch(() => null);
    if (!responseResend.ok) {
      return NextResponse.json(
        { error: responseJson?.message || "Failed to send email" },
        { status: 500 }
      );
    }

    const providerMessageId = responseJson?.id ?? null;

    const { data, error } = await supabase
      .from("email_logs")
      .insert({
        user_id: user.id,
        entity_type: validated.entity_type,
        entity_id: validated.entity_id,
        to_email: validated.to,
        subject: validated.subject,
        body: validated.body,
        provider: "resend",
        provider_message_id: providerMessageId,
        status: "sent",
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      action: "SEND_EMAIL",
      entity_type: validated.entity_type,
      entity_id: validated.entity_id,
      metadata: { to: validated.to, subject: validated.subject },
    } as never);

    return NextResponse.json({ success: true, id: (data as { id: string }).id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
