export interface EmailSendInput {
  to: string;
  subject: string;
  body: string;
  entity_type: "customer" | "lead";
  entity_id: string;
}

async function parseError(response: Response, prefix: string): Promise<never> {
  let message = response.statusText;
  try {
    const data = await response.json();
    if (data.error) message = data.error;
  } catch {
    // ignore
  }
  throw new Error(`${prefix}: ${message}`);
}

class EmailAPIService {
  private baseUrl = "/api/email/send";

  async send(payload: EmailSendInput): Promise<{ success: true; id: string }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to send email");
    return response.json();
  }
}

export const emailService = new EmailAPIService();
