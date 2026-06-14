import type { Action } from "./types";
import {
  LayoutDashboard,
  FileText,
  User,
  Home,
} from "lucide-react";

export function navigationActions(currentPath?: string): Action[] {
  const actions: Action[] = [
    {
      id: "nav-overview",
      label: "Go to Overview",
      keywords: ["overview", "home", "main"],
      group: "Navigate",
      icon: Home,
      perform: (context) => {
        context?.router?.push("/admin");
      },
      contextAware: currentPath === "/admin",
    },
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      keywords: ["dashboard", "analytics", "insights"],
      group: "Navigate",
      icon: LayoutDashboard,
      perform: (context) => {
        context?.router?.push("/admin/dashboard");
      },
      contextAware: currentPath === "/admin/dashboard",
    },
    {
      id: "nav-submissions",
      label: "Go to Submissions",
      keywords: ["submissions", "verify", "consign", "records"],
      group: "Navigate",
      icon: FileText,
      perform: (context) => {
        context?.router?.push("/admin/submissions");
      },
      contextAware: currentPath?.startsWith("/admin/submissions"),
    },
    {
      id: "nav-profile",
      label: "Go to Profile",
      keywords: ["profile", "settings", "preferences"],
      group: "Navigate",
      icon: User,
      perform: (context) => {
        context?.router?.push("/admin/profile");
      },
      contextAware: currentPath?.startsWith("/admin/profile"),
    },
  ];

  return actions;
}

