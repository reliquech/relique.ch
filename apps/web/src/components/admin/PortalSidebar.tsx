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
  GitBranch,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { routeToTabMap, tabToRouteMap } from "@/lib/utils/admin";
import { useProfile } from "@/admin/users/hooks/useProfile";

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
  if (pathname === "/admin/submissions") {
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
        { id: "tasks", label: "Tasks", icon: FileText },
        { id: "automations", label: "Automations", icon: Settings },
        { id: "pipeline-stages", label: "Pipeline Stages", icon: GitBranch },
        ...(isAdmin
          ? [{ id: "custom-fields", label: "Custom Fields", icon: SlidersHorizontal }]
          : []),
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
    <div className="w-64 bg-surface border-r border-border h-full flex flex-col sticky top-0">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,85,255,0.4)]">
          <span className="text-white font-bold">R</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">RELIQUE</h1>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
            Admin Control
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-4 px-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const route = tabToRouteMap[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (route) {
                        router.push(route);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(0,85,255,0.05)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${isActive ? "text-primary" : "group-hover:text-accent"}`}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="ml-auto w-3 h-3 opacity-50" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-400 hover:text-destructive transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
