"use client";

import { useEffect, useState } from "react";
import { verifyService } from "@/lib/legacy/verifyService";
import { consignService } from "@/lib/legacy/consignService";
import { marketplaceService } from "@/lib/legacy/marketplaceService";
import { FileText, CheckCircle2, Heart } from "lucide-react";

export function QuickStats() {
  const [stats, setStats] = useState({
    verifyRuns: 0,
    drafts: 0,
    savedItems: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const history = await verifyService.history.list();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentRuns = history.filter((h) => h.timestamp >= thirtyDaysAgo);

      const drafts = await consignService.drafts.list();
      const favorites = await marketplaceService.getFavorites();

      setStats({
        verifyRuns: recentRuns.length,
        drafts: drafts.length,
        savedItems: favorites.length,
      });
    };

    loadStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Verify Runs</p>
            <p className="text-2xl font-bold">{stats.verifyRuns}</p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <div className="border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold">{stats.drafts}</p>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </div>
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <div className="border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Saved Items</p>
            <p className="text-2xl font-bold">{stats.savedItems}</p>
            <p className="text-xs text-muted-foreground mt-1">Favorites</p>
          </div>
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

