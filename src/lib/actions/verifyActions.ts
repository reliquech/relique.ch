import type { Action } from "./types";
import { Search, CheckCircle2 } from "lucide-react";
import { createDeepLink } from "@/lib/shared";

export async function verifyActions(): Promise<Action[]> {
  const history: Array<{ productId: string; result: string }> = [];
  
  const actions: Action[] = [
    {
      id: "verify-search",
      label: "Search Verify History",
      keywords: ["verify", "search", "history", "product"],
      group: "Verify",
      icon: Search,
      perform: (context) => {
        context?.router?.push("/admin/submissions?tab=verifications");
      },
    },
  ];

  history.slice(0, 5).forEach((entry) => {
    actions.push({
      id: `verify-${entry.productId}`,
      label: `Open Verify: ${entry.productId}`,
      keywords: [entry.productId, "verify", entry.result],
      group: "Verify",
      icon: CheckCircle2,
      perform: () => {
        const url = createDeepLink("verify", { code: entry.productId });
        window.open(url, "_blank");
      },
    });
  });

  return actions;
}

