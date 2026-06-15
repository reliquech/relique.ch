"use client";

import React, { useEffect, useState } from "react";
import { MarketplaceEditorPage } from "@/components/admin/marketplace/editor/MarketplaceEditorPage";
import { useAdminHeader } from "@/components/admin/shell/AdminPortalLayout";

export default function NewMarketplacePage() {
  const [mounted, setMounted] = useState(false);

  useAdminHeader("Create New Item", ["Marketplace", "Items", "New"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20 text-stitch-on-surface-variant">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stitch-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MarketplaceEditorPage mode="create" />
  );
}
