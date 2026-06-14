import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  getOperatorEmail,
  sendTransactionalEmail,
} from "@/lib/email/sendTransactional";

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ContactSchema.parse(body);

    if (validated.website) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        full_name: validated.name,
        email: validated.email,
        source: "contact",
        status: "new",
      } as never)
      .select("id")
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: leadError?.message ?? "Failed to create lead" },
        { status: 500 }
      );
    }

    const leadId = (lead as { id: string }).id;

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        name: validated.name,
        email: validated.email,
        message: validated.message,
        status: "new",
        source: "contact",
        lead_id: leadId,
      } as never)
      .select("id")
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: messageError?.message ?? "Failed to create message" },
        { status: 500 }
      );
    }

    const messageId = (message as { id: string }).id;

    const operatorEmail = getOperatorEmail();
    if (operatorEmail) {
      await sendTransactionalEmail({
        to: operatorEmail,
        subject: `New contact inquiry from ${validated.name}`,
        body: `New contact form submission.\n\nFrom: ${validated.name} <${validated.email}>\n\n${validated.message}\n\nMessage ID: ${messageId}`,
        entityType: "lead",
        entityId: leadId,
      });
    }

    await sendTransactionalEmail({
      to: validated.email,
      subject: "Relique — We received your message",
      body: `Hi ${validated.name},\n\nThank you for contacting Relique. We received your message and will respond within 24 hours.\n\n— Relique`,
      entityType: "lead",
      entityId: leadId,
    });

    return NextResponse.json({ id: messageId }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Contact submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
