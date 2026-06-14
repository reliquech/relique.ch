"use client";

import { Suspense } from "react";
import { MarketplaceGrid } from "./components/MarketplaceGrid";
import { LoadingState } from "@/components/shared/LoadingState";

/**
 * Marketplace listing page
 * Refactored from 175 lines to use composable components
 * 
 * Architecture:
 * - Reusable components in src/components/marketplace/
 * - Data wrapper in app/marketplace/components/MarketplaceGrid
 */
function MarketplacePageContent() {
  return (
    <div className="min-h-screen bg-bgDark text-white font-sans selection:bg-primaryBlue selection:text-white py-24">
      <MarketplaceGrid />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MarketplacePageContent />
    </Suspense>
  );
}
