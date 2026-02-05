"use client";

import { useEffect, useState } from "react";
import { QuickStats } from "@/features/dashboard/components/QuickStats";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { ContinueActions } from "@/features/dashboard/components/ContinueActions";
import { verifyService } from "@/lib/legacy/verifyService";
import { consignService } from "@/lib/legacy/consignService";
import { marketplaceService } from "@/lib/legacy/marketplaceService";
import { activityService } from "@/lib/legacy/activityService";

interface DashboardContentProps {
  displayName: string;
}

/**
 * Wraps dashboard content and shows a single empty-state card when no stats and no activity.
 */
export function DashboardContent({ displayName }: DashboardContentProps) {
  const [isEmpty, setIsEmpty] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const history = await verifyService.history.list();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentRuns = history.filter((h) => h.timestamp >= thirtyDaysAgo);
      const drafts = await consignService.drafts.list();
      const favorites = await marketplaceService.getFavorites();
      const log = activityService.getLog(5);

      const noStats =
        recentRuns.length === 0 && drafts.length === 0 && favorites.length === 0;
      const noActivity = log.length === 0;
      setIsEmpty(noStats && noActivity);
    };
    check();
  }, []);

  if (isEmpty === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your account
          </p>
        </div>
        <div className="border bg-card p-6 text-center text-muted-foreground">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your account
          </p>
        </div>
        <div className="border border-border bg-surface rounded-2xl p-12 text-center">
          <p className="text-muted-foreground mb-2">No data yet</p>
          <p className="text-sm text-gray-500">Connect data source when ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your account
        </p>
      </div>
      <QuickStats />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        <div className="border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <ContinueActions />
        </div>
      </div>
    </div>
  );
}
