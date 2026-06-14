import type { Action } from "./types";
import { FileText, UserPlus, User, DollarSign } from "lucide-react";
import { createDeepLink } from "@relique/shared";

export function createActions(): Action[] {
  const actions: Action[] = [
    {
      id: "create-consign",
      label: "New Consign Draft",
      keywords: ["consign", "draft", "new", "create"],
      group: "Create",
      icon: FileText,
      perform: () => {
        const url = createDeepLink("consign", {});
        window.open(url, "_blank");
      },
    },
    {
      id: "create-customer",
      label: "Create Customer",
      keywords: ["customer", "crm", "new", "create"],
      group: "Create",
      icon: UserPlus,
      perform: () => {
        window.location.assign("/admin/customers?create=1");
      },
    },
    {
      id: "create-lead",
      label: "Create Lead",
      keywords: ["lead", "crm", "new", "create"],
      group: "Create",
      icon: User,
      perform: () => {
        window.location.assign("/admin/leads?create=1");
      },
    },
    {
      id: "create-deal",
      label: "Create Deal",
      keywords: ["deal", "crm", "new", "create"],
      group: "Create",
      icon: DollarSign,
      perform: () => {
        window.location.assign("/admin/deals?create=1");
      },
    },
  ];

  return actions;
}

