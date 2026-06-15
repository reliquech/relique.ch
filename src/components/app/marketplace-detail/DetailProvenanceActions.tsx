import Link from "next/link";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

interface DetailProvenanceActionsProps {
  listing: MarketplaceListing;
}

/** Certificate verification CTAs for authenticated listings. */
export function DetailProvenanceActions({ listing }: DetailProvenanceActionsProps) {
  const refs = listing.auth?.coa_refs?.filter(Boolean) ?? [];
  if (refs.length === 0) return null;

  return (
    <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
      {refs.map((ref) => (
        <Link
          key={ref}
          href={`/verify?code=${encodeURIComponent(ref)}`}
          className="inline-flex items-center justify-center border border-primaryBlue/40 bg-primaryBlue/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-highlightIce transition-colors hover:bg-primaryBlue/20 hover:border-primaryBlue/60"
        >
          Verify certificate {ref}
        </Link>
      ))}
    </div>
  );
}
