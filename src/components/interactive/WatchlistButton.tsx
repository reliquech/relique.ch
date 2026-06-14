"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WATCHLIST_STORAGE_KEY = "relique.v1.marketplace.watchlist";

export interface WatchlistItem {
  itemId: string;
  addedAt: number;
  notifyPriceChange: boolean;
  notifyStatusChange: boolean;
}

function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setWatchlist(watchlist: WatchlistItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
}

interface WatchlistButtonProps {
  itemId: string;
  itemTitle?: string;
  variant?: "icon" | "button";
  className?: string;
}

export function WatchlistButton({
  itemId,
  itemTitle = "item",
  variant = "icon",
  className,
}: WatchlistButtonProps) {
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    const watchlist = getWatchlist();
    setIsWatching(watchlist.some((w) => w.itemId === itemId));
  }, [itemId]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const watchlist = getWatchlist();
      const exists = watchlist.find((w) => w.itemId === itemId);

      if (exists) {
        const updated = watchlist.filter((w) => w.itemId !== itemId);
        setWatchlist(updated);
        setIsWatching(false);
        toast.success(`Removed "${itemTitle}" from watchlist`);
      } else {
        const newItem: WatchlistItem = {
          itemId,
          addedAt: Date.now(),
          notifyPriceChange: true,
          notifyStatusChange: true,
        };
        setWatchlist([...watchlist, newItem]);
        setIsWatching(true);
        toast.success(`Added "${itemTitle}" to watchlist`, {
          description: "You'll be notified of price changes",
        });

        // Trigger mock notification for demo
        triggerMockWatchlistAlert(itemId, itemTitle);
      }
    },
    [itemId, itemTitle]
  );

  if (variant === "button") {
    return (
      <Button
        variant={isWatching ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        className={className}
      >
        {isWatching ? (
          <>
            <BellRing className="w-4 h-4 mr-2" />
            Watching
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 mr-2" />
            Watch
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        "h-8 w-8",
        isWatching && "text-primary",
        className
      )}
      title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isWatching ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
    </Button>
  );
}

/**
 * Mock function to simulate watchlist alerts for demo purposes.
 * In production, this would be replaced by a backend push notification system.
 */
function triggerMockWatchlistAlert(itemId: string, itemTitle: string) {
  // Schedule a mock "price changed" notification after 10-30 seconds
  const delay = Math.floor(Math.random() * 20000) + 10000;

  setTimeout(() => {
    const notifications = JSON.parse(
      localStorage.getItem("relique.v1.portal.notifications") || "[]"
    );

    const mockNotification = {
      id: `notif-${Date.now()}`,
      type: "watchlist_price_change",
      title: "Price Changed",
      message: `The price for "${itemTitle}" has changed.`,
      itemId,
      read: false,
      createdAt: Date.now(),
    };

    notifications.unshift(mockNotification);
    localStorage.setItem(
      "relique.v1.portal.notifications",
      JSON.stringify(notifications.slice(0, 50))
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("relique:notification", { detail: mockNotification }));
  }, delay);
}

