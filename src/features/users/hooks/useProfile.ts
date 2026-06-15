"use client";

import { useCallback, useEffect, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type MeResponse = {
  user: { id: string; email: string | null };
  profile: ProfileRow;
};

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
      const response = await fetch("/api/auth/me");

      if (response.status === 401) {
        setError("Not authenticated");
        setProfile(null);
        setUserId(null);
        setUserEmail(null);
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Failed to load profile");
        setProfile(null);
        setUserId(null);
        setUserEmail(null);
        return;
      }

      const data = (await response.json()) as MeResponse;
      setUserId(data.user.id);
      setUserEmail(data.user.email);
      setProfile(data.profile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Cannot reach the server. Check your connection."
      );
      setProfile(null);
      setUserId(null);
      setUserEmail(null);
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
