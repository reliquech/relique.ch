"use client";

import { useEffect } from "react";
import { alertRulesService } from "@/features/automations/services/alertRulesService";
import { useProfile } from "@/features/users/hooks/useProfile";

export function AlertScheduler() {
  const { role, loading } = useProfile();

  useEffect(() => {
    if (loading) return;
    if (role !== "admin" && role !== "editor") return;

    const runRules = async () => {
      try {
        await alertRulesService.run();
        if (typeof window !== "undefined") {
          window.localStorage.setItem("automation_last_run", new Date().toISOString());
        }
      } catch (error) {
        console.error("Failed to run alert rules:", error);
      }
    };

    runRules();

    const interval = setInterval(() => {
      runRules();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [role, loading]);

  return null;
}
