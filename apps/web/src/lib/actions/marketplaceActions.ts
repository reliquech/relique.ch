import type { Action } from "./types";
import { Heart, ShoppingBag } from "lucide-react";
import { createDeepLink } from "@relique/shared";

export async function marketplaceActions(): Promise<Action[]> {
  const actions: Action[] = [
    {
      id: "marketplace-browse",
      label: "Browse Marketplace",
      keywords: ["marketplace", "browse", "items", "shop"],
      group: "Marketplace",
      icon: ShoppingBag,
      perform: () => {
        const url = createDeepLink("marketplace", { slug: "" });
        window.open(url.replace("/marketplace/", "/marketplace"), "_blank");
      },
    },
  ];


  return actions;
}

