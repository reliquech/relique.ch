"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceEditorPage } from "@/components/admin/marketplace/editor/MarketplaceEditorPage";
import { marketplaceAPIService } from "@/features/marketplace/services/marketplaceService";
import { useAdminHeader } from "@/components/admin/shell/AdminPortalLayout";
import { toast } from "sonner";

interface EditMarketplacePageProps {
  id: string;
}

export default function EditMarketplacePage({ id }: EditMarketplacePageProps) {
  const router = useRouter();
  const [item, setItem] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useAdminHeader("Edit Item", ["Marketplace", "Items", "Edit"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await marketplaceAPIService.getRawById(id);
        if (!data) {
          toast.error("Marketplace item not found");
          router.push("/admin/items");
          return;
        }
        setItem(data);
      } catch (err) {
        console.error("Failed to fetch marketplace item:", err);
        toast.error("Failed to load marketplace item");
      } finally {
        setLoading(false);
      }
    };

    if (mounted && id) {
      fetchItem();
    }
  }, [mounted, id, router]);

  const goToItems = () => router.push("/admin/items");

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stitch-on-surface-variant">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stitch-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stitch-on-surface">Item Not Found</h2>
        <p className="text-stitch-on-surface-variant">
          The item you are trying to edit does not exist or has been deleted.
        </p>
        <button
          onClick={goToItems}
          className="px-lg py-[10px] rounded-lg border border-stitch-outline-variant text-stitch-on-surface font-label-md text-label-md uppercase tracking-wider font-bold hover:bg-stitch-surface-container transition-colors"
        >
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <MarketplaceEditorPage mode="edit" itemId={id} initialItem={item} />
  );
}

/** Route wrapper that resolves async params for App Router pages. */
export function EditMarketplaceRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <EditMarketplacePage id={resolvedParams.id} />;
}
