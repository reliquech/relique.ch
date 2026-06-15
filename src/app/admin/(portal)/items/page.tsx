import { Suspense } from "react";
import ItemsPage from "@/components/admin/marketplace/pages/ItemsPage";
import { MarketplaceItemsTableSkeleton } from "@/components/admin/marketplace/items/MarketplaceItemsTableSkeleton";

export default function MarketplaceItemsRoute() {
  return (
    <Suspense fallback={<MarketplaceItemsTableSkeleton />}>
      <ItemsPage />
    </Suspense>
  );
}
