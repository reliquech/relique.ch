const SUPABASE_DASHBOARD_URL =
  "https://supabase.com/dashboard/project/_/settings/api";

export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  );
}

export function getSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    ""
  );
}

export function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  );
}

export function assertSupabaseUrlAndPublishableKey(context: string): {
  url: string;
  publishableKey: string;
} {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    throw new Error(
      `Missing Supabase configuration for ${context}. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env.local file.\n` +
        `Legacy fallbacks NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_PUBLISHABLE_KEY are also supported.\n` +
        `See ${SUPABASE_DASHBOARD_URL} for your project credentials`
    );
  }

  return { url, publishableKey };
}

export function assertSupabaseUrlAndSecretKey(context: string): {
  url: string;
  secretKey: string;
} {
  const url = getSupabaseUrl();
  const secretKey = getSupabaseSecretKey();

  if (!url || !secretKey) {
    throw new Error(
      `Missing Supabase configuration for ${context}. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in your .env.local file.\n` +
        `Legacy fallback SUPABASE_SERVICE_ROLE_KEY is also supported.\n` +
        `See ${SUPABASE_DASHBOARD_URL} for your project credentials`
    );
  }

  return { url, secretKey };
}
