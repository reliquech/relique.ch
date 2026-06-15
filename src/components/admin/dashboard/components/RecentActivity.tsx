"use client";

import { useEffect, useState } from "react";
import { activityService } from "@/lib/legacy/activityService";
import { CheckCircle2, FileText, Heart, Clock } from "lucide-react";

type ActivityItem = {
  type: "verify" | "draft" | "favorite";
  message: string;
  timestamp: number;
  icon: React.ReactNode;
};

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const loadActivities = () => {
      const log = activityService.getLog(5);
      const items: ActivityItem[] = log.map((entry) => {
        let icon = <FileText className="h-4 w-4" />;
        let mappedType: "verify" | "draft" | "favorite" = "verify";
        
        if (entry.type === "verify_saved") {
          icon = <CheckCircle2 className="h-4 w-4" />;
          mappedType = "verify";
        } else if (entry.type === "favorite_added") {
          icon = <Heart className="h-4 w-4" />;
          mappedType = "favorite";
        } else if (entry.type === "draft_autosaved" || entry.type === "draft_submitted_mock") {
          icon = <FileText className="h-4 w-4" />;
          mappedType = "draft";
        }
        
        return {
          type: mappedType,
          message: entry.message,
          timestamp: entry.timestamp,
          icon,
        };
      });
      setActivities(items);
    };

    loadActivities();
    
    const handleStorageChange = () => {
      loadActivities();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (activities.length === 0) {
    return (
      <div className="border bg-card p-6 text-center text-muted-foreground">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <div className="divide-y">
        {activities.map((activity, index) => (
          <div key={index} className="p-4 flex items-start gap-3">
            <div className="mt-0.5">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(activity.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

