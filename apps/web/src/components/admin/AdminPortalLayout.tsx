"use client";

import React, { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PortalSidebar } from "@/components/admin/PortalSidebar";
import { routeToTabMap, tabNames } from "@/lib/utils/admin";
import { NotificationCenter } from "@/admin/notifications/components/NotificationCenter";
import { AlertScheduler } from "@/admin/automations/components/AlertScheduler";
import { useProfile } from "@/admin/users/hooks/useProfile";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, userEmail } = useProfile();

  const displayName =
    profile?.display_name ||
    (userEmail ? userEmail.split("@")[0] : null) ||
    "Admin";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getDisplayName = () => {
    const tabId =
      routeToTabMap[pathname] ??
      (pathname === "/admin"
        ? "dashboard"
        : pathname.replace("/admin/", "").split("/")[0]) ??
      "dashboard";
    return (tabId && tabNames[tabId]) || "Admin";
  };

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to logout:", err);
      router.push("/admin/login");
    }
  };

  return (
    <div className="flex h-screen text-white overflow-hidden selection:bg-primary/30 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/admin background.jpeg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative z-10 flex flex-1 min-h-0">
        <AlertScheduler />
        <Suspense fallback={<div className="w-64 bg-surface border-r border-border" />}>
          <PortalSidebar onLogout={handleLogout} />
        </Suspense>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(0,85,255,1)]"></span>
                {getDisplayName()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <div className="h-8 w-[1px] bg-border mx-2"></div>
              <div className="flex items-center gap-3 pl-2 group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">{displayName}</p>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] text-gray-500 hover:text-destructive uppercase font-bold tracking-widest block transition-colors mt-0.5"
                  >
                    Terminate Session
                  </button>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 cursor-pointer group-hover:scale-105 transition-transform">
                  {initials}
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-transparent to-black/30">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
