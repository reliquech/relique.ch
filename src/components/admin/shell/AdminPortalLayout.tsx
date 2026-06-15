"use client";

import React, { Suspense, createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PortalSidebar } from "@/components/admin/shell/PortalSidebar";
import { routeToTabMap, tabNames } from "@/lib/utils/admin";
import { NotificationCenter } from "@/components/admin/notifications/components/NotificationCenter";
import { CommandPalette } from "@/components/command/CommandPalette";
import { useProfile } from "@/features/users/hooks/useProfile";
import { Sun, Moon, ArrowLeft } from "lucide-react";

// Shared Header Context
const AdminHeaderContext = createContext<{
  title: string;
  setTitle: (title: string) => void;
  breadcrumbs: string[] | null;
  setBreadcrumbs: (crumbs: string[] | null) => void;
} | null>(null);

/**
 * Custom hook for pages to register their header title and breadcrumbs.
 */
export function useAdminHeader(title: string, breadcrumbs?: string[]) {
  const context = useContext(AdminHeaderContext);
  const setTitle = context?.setTitle;
  const setBreadcrumbs = context?.setBreadcrumbs;
  const breadcrumbsKey = breadcrumbs?.join("\u0000") ?? "";
  const breadcrumbsRef = useRef(breadcrumbs);
  breadcrumbsRef.current = breadcrumbs;

  useEffect(() => {
    if (!setTitle || !setBreadcrumbs) return;
    setTitle(title);
    setBreadcrumbs(breadcrumbsRef.current ?? null);
  }, [title, breadcrumbsKey, setTitle, setBreadcrumbs]);
}

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, userEmail } = useProfile();
  
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerBreadcrumbs, setHeaderBreadcrumbs] = useState<string[] | null>(null);

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

  // Generate dynamic fallback breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const segmentNames: Record<string, string> = {
    admin: "Admin",
    marketplace: "Marketplace",
    items: "Items",
    new: "New",
    featured: "Featured",
    verify: "Verify",
    logs: "Logs",
    settings: "Settings",
    customers: "Customers",
    leads: "Leads",
    deals: "Deals",
    submissions: "Submissions",
    users: "Users",
  };

  const showBackButton = segments.length > 1;

  const headerContextValue = useMemo(
    () => ({
      title: headerTitle,
      setTitle: setHeaderTitle,
      breadcrumbs: headerBreadcrumbs,
      setBreadcrumbs: setHeaderBreadcrumbs,
    }),
    [headerTitle, headerBreadcrumbs]
  );

  return (
    <AdminHeaderContext.Provider value={headerContextValue}>
      <div className="flex h-screen bg-stitch-background text-stitch-on-surface overflow-hidden selection:bg-stitch-primary/30 relative">
        <div className="relative z-10 flex flex-1 min-h-0 w-full">
          <Suspense fallback={<div className="w-64 bg-stitch-surface border-r border-stitch-outline-variant" />}>
            <PortalSidebar onLogout={handleLogout} />
          </Suspense>
          
          <main className="flex-1 flex flex-col min-w-0 bg-stitch-surface-container-lowest overflow-hidden">
            {/* Stitch Header */}
            <header className="flex justify-between items-center py-2 px-8 bg-stitch-surface dark:bg-stitch-surface-container-low border-b border-stitch-outline-variant flex-shrink-0 min-h-[72px] sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                {showBackButton && (
                  <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full border border-stitch-outline-variant flex items-center justify-center text-stitch-on-surface-variant hover:bg-stitch-surface-container hover:text-stitch-primary transition-colors flex-shrink-0 mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex flex-col">
                  {/* Breadcrumbs (Custom or fallback) */}
                  <nav className="flex items-center gap-1 text-[11px] font-semibold text-stitch-on-surface-variant mb-1">
                    {headerBreadcrumbs ? (
                      headerBreadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb}>
                          {idx > 0 && <span className="opacity-50">/</span>}
                          {idx === headerBreadcrumbs.length - 1 ? (
                            <span className="text-stitch-on-surface font-bold">{crumb}</span>
                          ) : (
                            <span className="hover:text-stitch-primary transition-colors cursor-default">{crumb}</span>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      segments.map((seg, idx) => {
                        const name = segmentNames[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
                        const isLast = idx === segments.length - 1;
                        return (
                          <React.Fragment key={seg}>
                            {idx > 0 && <span className="opacity-50">/</span>}
                            {isLast ? (
                              <span className="text-stitch-on-surface font-bold">{name}</span>
                            ) : (
                              <span className="hover:text-stitch-primary transition-colors cursor-default">{name}</span>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </nav>
                  
                  {/* Title (Custom or fallback) */}
                  <h1 className="text-lg md:text-xl text-stitch-on-surface font-bold leading-none">
                    {headerTitle || getDisplayName()}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <NotificationCenter />
                
                {/* Theme Toggle Icon (To be implemented fully in plan) */}
                <button 
                  className="text-stitch-on-surface-variant hover:text-stitch-primary transition-colors duration-150 relative w-6 h-6 flex items-center justify-center" 
                  id="theme-toggle"
                  onClick={() => {
                    // Basic toggle for development before full implementation plan execution
                    const isDark = document.documentElement.classList.contains("dark");
                    if (isDark) {
                      document.documentElement.classList.remove("dark");
                      localStorage.setItem("theme", "light");
                    } else {
                      document.documentElement.classList.add("dark");
                      localStorage.setItem("theme", "dark");
                    }
                  }}
                >
                  <Sun className="w-5 h-5 absolute transition-opacity duration-300 dark:opacity-0" />
                  <Moon className="w-5 h-5 absolute transition-opacity duration-300 opacity-0 dark:opacity-100" />
                </button>

                <div className="h-8 w-[1px] bg-stitch-outline-variant"></div>

                {/* User Dropdown */}
                <div className="relative group cursor-pointer flex items-center h-full py-2">
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-stitch-surface-container-highest border border-stitch-outline-variant hover:border-stitch-primary transition-all duration-150">
                    <div className="w-6 h-6 rounded-full bg-stitch-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-stitch-primary">{initials}</span>
                    </div>
                    <span className="text-xs font-semibold text-stitch-on-surface select-none max-w-[120px] truncate">{displayName}</span>
                  </div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-stitch-surface border border-stitch-outline-variant rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1 origin-top-right">
                    <div className="px-4 py-2 border-b border-stitch-outline-variant">
                      <p className="text-xs text-stitch-on-surface-variant font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-stitch-on-surface truncate">{displayName}</p>
                    </div>
                    <button
                      onClick={() => router.push("/admin/settings")}
                      className="w-full text-left block px-4 py-2 text-sm text-stitch-on-surface hover:bg-stitch-surface-container-high transition-colors"
                    >
                      Settings
                    </button>
                    <div className="border-t border-stitch-outline-variant my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content scroll canvas */}
            <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-transparent to-black/5 dark:to-black/35">
              {children}
            </div>
          </main>
        </div>
      </div>
      <CommandPalette />
    </AdminHeaderContext.Provider>
  );
}
