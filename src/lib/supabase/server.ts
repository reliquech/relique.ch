import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  assertSupabaseUrlAndPublishableKey,
  assertSupabaseUrlAndSecretKey,
} from "./env";
import type { Database } from "./types";

export async function createClient() {
  const { url, publishableKey } = assertSupabaseUrlAndPublishableKey("createClient");

  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Create a Supabase client with secret key (bypasses RLS)
 * Use this ONLY in API routes and server actions
 */
export function createServiceRoleClient() {
  const { url, secretKey } = assertSupabaseUrlAndSecretKey("createServiceRoleClient");

  return createSupabaseClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Anonymous client for public read API routes (RLS-enforced).
 * Prefer over service-role for unauthenticated GET handlers.
 */
export function createAnonClient() {
  const { url, publishableKey } = assertSupabaseUrlAndPublishableKey("createAnonClient");

  return createSupabaseClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
