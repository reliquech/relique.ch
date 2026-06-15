"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ShieldCheck,
  Inbox,
  FileText,
  Image as ImageIcon,
  History,
  Settings,
  Users,
  UserRoundSearch,
  HandCoins,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { routeToTabMap, tabToRouteMap } from "@/lib/utils/admin";
import { useProfile } from "@/features/users/hooks/useProfile";

interface SidebarProps {
  onLogout?: () => void;
}

export function PortalSidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role } = useProfile();
  const isAdmin = role === "admin";

  let activeTab = routeToTabMap[pathname] || "dashboard";
  if (pathname.startsWith("/admin/items")) {
    activeTab = "items";
  } else if (pathname === "/admin/submissions") {
    const tab = searchParams.get("tab");
    activeTab = tab === "consignments" ? "subs-consign" : "subs-auth";
  }

  const menuGroups = [
    {
      title: "Overview",
      items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Marketplace",
      items: [
        { id: "items", label: "Items", icon: ShoppingBag },
        { id: "featured", label: "Carousel", icon: ImageIcon },
      ],
    },
    {
      title: "Verification",
      items: [{ id: "verify", label: "Records", icon: ShieldCheck }],
    },
    {
      title: "CRM",
      items: [
        { id: "customers", label: "Customers", icon: Users },
        { id: "leads", label: "Leads", icon: UserRoundSearch },
        { id: "deals", label: "Deals", icon: HandCoins },
      ],
    },
    {
      title: "Submissions",
      items: [
        { id: "subs-auth", label: "Authenticate", icon: Inbox },
        { id: "subs-consign", label: "Consign", icon: Inbox },
        { id: "messages", label: "Contact", icon: FileText },
      ],
    },
    {
      title: "System",
      items: [
        ...(isAdmin ? [{ id: "users", label: "Users", icon: Users }] : []),
        { id: "logs", label: "Audit Logs", icon: History },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <nav className="hidden md:flex flex-col h-full py-6 px-4 w-64 border-r border-stitch-outline-variant bg-stitch-surface dark:bg-stitch-surface-container flex-shrink-0 sticky top-0">
      {/* Brand Section */}
      <div className="mb-8 flex items-center gap-2 px-2 flex-shrink-0">
        <div className="w-8 h-8 bg-stitch-primary rounded flex items-center justify-center text-stitch-on-primary font-bold shadow-[0_0_15px_rgba(173,198,255,0.4)]">
          R
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-base font-bold text-stitch-on-surface leading-tight tracking-tight">RELIQUE</span>
          <span className="text-[10px] text-stitch-on-surface-variant uppercase tracking-wider font-semibold">ADMIN CONTROL</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <span className="text-[11px] font-semibold text-stitch-on-surface-variant uppercase tracking-wider mb-2 block px-2">
              {group.title}
            </span>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const route = tabToRouteMap[item.id];
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        if (route) {
                          router.push(route);
                        }
                      }}
                      className={`w-full flex items-center gap-4 px-2 py-2 rounded-lg hover:bg-stitch-surface-container-high dark:hover:bg-stitch-surface-container-highest transition-all duration-150 group text-left ${
                        isActive
                          ? "bg-stitch-primary-container/10 text-stitch-primary font-bold"
                          : "text-stitch-on-surface-variant"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? "text-stitch-primary"
                            : "text-stitch-on-surface-variant group-hover:text-stitch-on-surface"
                        }`}
                      />
                      <span
                        className={`text-sm flex-1 transition-colors ${
                          isActive
                            ? "text-stitch-primary font-bold"
                            : "font-medium text-stitch-on-surface-variant group-hover:text-stitch-on-surface"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-stitch-primary opacity-50" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {onLogout && (
        <div className="mt-auto pt-4 border-t border-stitch-outline-variant flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-2 py-2 rounded-lg hover:bg-stitch-surface-container-high dark:hover:bg-stitch-surface-container-highest transition-all duration-150 group text-left text-stitch-on-surface-variant hover:text-red-500 text-sm font-medium min-h-[40px]"
          >
            <LogOut className="w-5 h-5 text-stitch-on-surface-variant group-hover:text-red-500 transition-colors" />
            <span className="group-hover:text-red-500 transition-colors">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
