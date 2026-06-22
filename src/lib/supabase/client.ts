"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseUrlAndPublishableKey } from "./env";
import type { Database } from "./types";

export function createClient() {
  const { url, publishableKey } = assertSupabaseUrlAndPublishableKey("createClient");

  return createBrowserClient<Database>(url, publishableKey);
}
