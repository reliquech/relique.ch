"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AcquireInterest } from "@/lib/marketplace/acquireTypes";

interface MarketplaceInterestsPanelProps {
  leadId: string;
  leadEmail?: string | null;
}

/** Admin panel: marketplace listings a lead has expressed interest in. */
export function MarketplaceInterestsPanel({
  leadId,
  leadEmail,
}: MarketplaceInterestsPanelProps) {
  const [interests, setInterests] = useState<AcquireInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/leads/${leadId}/marketplace-interests`);
        const json = (await res.json()) as {
          interests?: AcquireInterest[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error ?? "Failed to load interests");
        }
        if (active) {
          setInterests(json.interests ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load interests");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [leadId]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://relique.ch";

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">Marketplace interests</h3>
        {leadEmail ? (
          <p className="text-xs text-gray-400 mt-1">
            Items requested by <span className="text-gray-300">{leadEmail}</span>
          </p>
        ) : null}
      </div>

      {loading ? (
        <p className="text-xs text-gray-500">Loading interests…</p>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : interests.length === 0 ? (
        <p className="text-xs text-gray-500">No marketplace acquisition requests yet.</p>
      ) : (
        <ul className="space-y-2">
          {interests.map((item) => (
            <li
              key={item.marketplace_item_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-white/5 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.listing_title}</p>
                <p className="text-xs text-gray-500">
                  {item.listing_slug} ·{" "}
                  {new Date(item.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>
              <Link
                href={`${siteUrl}/marketplace/${item.listing_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primaryBlue hover:underline shrink-0"
              >
                View listing
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
