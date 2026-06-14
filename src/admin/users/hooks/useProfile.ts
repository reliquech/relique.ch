"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export function useProfile() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setError(userError?.message || "Not authenticated");
        setProfile(null);
        setUserId(null);
        setUserEmail(null);
        return;
      }

      setUserId(userData.user.id);
      setUserEmail(userData.user.email ?? null);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    userId,
    userEmail,
    role: (profile?.role as "admin" | "editor" | "viewer" | undefined) ?? "viewer",
    loading,
    error,
    refresh: loadProfile,
  };
}
