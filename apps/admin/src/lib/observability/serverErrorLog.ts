import { createServiceRoleClient } from "@/lib/supabase/server";

export interface ServerErrorLogParams {
  path: string;
  method: string;
  status_code: number;
  message: string;
  details?: Record<string, unknown> | null;
  user_id?: string | null;
}

export async function logServerError(params: ServerErrorLogParams): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("error_logs").insert({
      source: "server",
      path: params.path,
      method: params.method,
      status_code: params.status_code,
      message: params.message,
      details: params.details ?? null,
      user_id: params.user_id ?? null,
    } as never);
  } catch (e) {
    console.error("Failed to write error_log:", e);
  }
}
