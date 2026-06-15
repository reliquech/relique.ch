"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DetailAcquireFlow } from "@/components/app/marketplace-detail/DetailAcquireFlow";
import Link from "next/link";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import {
  getListingCategory,
  getListingCoaRef,
  getListingPriceAmount,
  getListingPriceCurrency,
  getListingTitle,
} from "@/lib/utils/marketplace";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DetailPurchasePanelProps {
  listing: MarketplaceListing;
}

export function DetailPurchasePanel({ listing }: DetailPurchasePanelProps) {
  const [copied, setCopied] = useState(false);
  const { formatPrice } = useCurrency();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relique Archive | ${getListingTitle(listing)}`,
          text: `Explore this authenticated ${getListingCategory(listing)} - ${getListingTitle(listing)} on Relique.`,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback to copy
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const amount = getListingPriceAmount(listing);
  const currency = getListingPriceCurrency(listing);
  const compareAt = listing.listing?.price?.compare_at;
  const priceFormatted = formatPrice(amount);
  const compareFormatted =
    compareAt && compareAt > amount ? formatPrice(compareAt) : null;
  const certificate = getListingCoaRef(listing);

  return (
    <div className="bg-cardDark border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="mb-8 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/45">
          Fixed valuation
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {priceFormatted}
          </p>
          {compareFormatted ? (
            <p className="text-lg font-semibold text-white/40 line-through pb-1">
              {compareFormatted}
            </p>
          ) : null}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
          {currency} · All-inquire pricing
        </p>
      </div>

      <dl className="mb-8 space-y-4 border-t border-white/10 pt-6">
        <div className="flex justify-between gap-4 text-xs">
          <dt className="font-black uppercase tracking-[0.25em] text-white/40">SKU</dt>
          <dd className="font-semibold text-white/80 text-right">{listing.sku}</dd>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <dt className="font-black uppercase tracking-[0.25em] text-white/40">Slug</dt>
          <dd className="font-semibold text-white/80 text-right break-all">{listing.slug}</dd>
        </div>
      </dl>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleShare}
          className="w-full bg-transparent border border-white/10 text-white font-black uppercase tracking-[0.35em] py-4 text-[9px] transition-all hover:bg-white/5 hover:border-white/30 flex items-center justify-center gap-3 relative overflow-hidden min-h-[48px]"
        >
          <AnimatePresence>
            {copied && (
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-primaryBlue text-[8px]"
              >
                COPIED TO CLIPBOARD
              </motion.span>
            )}
          </AnimatePresence>
          <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share listing
        </button>

        {certificate ? (
          <Link
            href={`/verify?code=${encodeURIComponent(certificate)}`}
            className="block w-full bg-transparent border border-white/10 text-white font-black uppercase tracking-[0.35em] py-4 text-[9px] text-center transition-all hover:bg-white/5 hover:border-white/30 min-h-[48px] leading-[48px]"
          >
            Verify this item
          </Link>
        ) : null}

        <DetailAcquireFlow listing={listing} />
      </div>
    </div>
  );
}
