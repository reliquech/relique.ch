import { createServiceRoleClient } from "@/lib/supabase/server";

export type TransactionalEmailParams = {
  to: string;
  subject: string;
  body: string;
  entityType?: "customer" | "lead";
  entityId?: string;
  userId?: string | null;
};

export type TransactionalEmailResult =
  | { ok: true; id: string; providerMessageId: string | null }
  | { ok: false; error: string };

export function getOperatorEmail(): string | null {
  return process.env.OPERATOR_EMAIL ?? process.env.RESEND_OPERATOR_TO ?? null;
}

/**
 * Server-only Resend helper for public routes (no requireUser).
 */
export async function sendTransactionalEmail(
  params: TransactionalEmailParams
): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "support@relique.co";

  if (!apiKey) {
    return { ok: false, error: "Missing RESEND_API_KEY" };
  }

  const responseResend = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      text: params.body,
    }),
  });

  const responseJson = (await responseResend.json().catch(() => null)) as {
    id?: string;
    message?: string;
  } | null;

  if (!responseResend.ok) {
    return {
      ok: false,
      error: responseJson?.message || "Failed to send email",
    };
  }

  const providerMessageId = responseJson?.id ?? null;

  if (params.entityType && params.entityId) {
    try {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase
        .from("email_logs")
        .insert({
          user_id: params.userId ?? null,
          entity_type: params.entityType,
          entity_id: params.entityId,
          to_email: params.to,
          subject: params.subject,
          body: params.body,
          provider: "resend",
          provider_message_id: providerMessageId,
          status: "sent",
        } as never)
        .select("id")
        .single();

      if (error) {
        console.error("email_logs insert failed:", error.message);
        return {
          ok: true,
          id: providerMessageId ?? "sent",
          providerMessageId,
        };
      }

      return {
        ok: true,
        id: (data as { id: string }).id,
        providerMessageId,
      };
    } catch (err) {
      console.error("email_logs error:", err);
      return {
        ok: true,
        id: providerMessageId ?? "sent",
        providerMessageId,
      };
    }
  }

  return {
    ok: true,
    id: providerMessageId ?? "sent",
    providerMessageId,
  };
}
