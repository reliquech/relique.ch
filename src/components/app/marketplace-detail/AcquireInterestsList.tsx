import Link from "next/link";
import type { AcquireInterest } from "@/lib/marketplace/acquireTypes";

interface AcquireInterestsListProps {
  interests: AcquireInterest[];
  highlightListingId?: string | null;
}

/** Lists marketplace pieces the visitor has expressed acquisition interest in. */
export function AcquireInterestsList({
  interests,
  highlightListingId,
}: AcquireInterestsListProps) {
  if (interests.length === 0) return null;

  return (
    <ul className="space-y-2 mt-4">
      {interests.map((item) => {
        const isHighlight = highlightListingId === item.marketplace_item_id;
        return (
          <li key={item.marketplace_item_id}>
            <Link
              href={`/marketplace/${item.listing_slug}`}
              className={`block border px-4 py-3 transition-colors ${
                isHighlight
                  ? "border-primaryBlue/50 bg-primaryBlue/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold text-white/90">{item.listing_title}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">
                {new Date(item.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
