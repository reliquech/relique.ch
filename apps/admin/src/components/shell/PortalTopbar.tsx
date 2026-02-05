"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { User, Settings, Search } from "lucide-react";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { useProfile } from "@/features/users/hooks/useProfile";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/admin": { title: "Overview", subtitle: "Home and quick access" },
  "/admin/dashboard": { title: "Dashboard", subtitle: "Analytics and insights" },
  "/admin/submissions": { title: "Submissions", subtitle: "Verify and Consign records" },
  "/admin/profile": { title: "Profile", subtitle: "Preferences and data tools" },
};

export function PortalTopbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { profile, userEmail, loading } = useProfile();

  const pageInfo = pageTitles[pathname] || { title: "Admin", subtitle: "" };
  const displayName =
    profile?.display_name ||
    (userEmail ? userEmail.split("@")[0] : null) ||
    "Collector";

  if (loading) {
    return (
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{pageInfo.title}</h1>
          {pageInfo.subtitle && (
            <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search portal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationCenter />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {getInitials(displayName)}
                </div>
                <span className="hidden md:inline">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
