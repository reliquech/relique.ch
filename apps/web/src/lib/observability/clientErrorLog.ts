export interface ClientErrorLogParams {
  path?: string;
  method?: string;
  status_code?: number;
  message?: string;
  details?: Record<string, unknown> | null;
}

export function logClientError(params: ClientErrorLogParams): void {
  try {
    fetch("/api/error-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "client", ...params }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}
