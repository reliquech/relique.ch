"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";

interface DetailPurchasePanelProps {
  listing: MarketplaceListing;
}

export function DetailPurchasePanel({ listing }: DetailPurchasePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relique Archive | ${listing.title}`,
          text: `Explore this authenticated ${listing.category} - ${listing.title} on Relique.`,
          url: window.location.href,
        });
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

  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <div className="bg-cardDark border border-white/10 p-10 shadow-2xl relative overflow-hidden">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-3">
          Fixed Valuation
        </p>
        <p className="text-5xl font-black text-white tracking-tighter">{priceFormatted}</p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleShare}
          className="w-full bg-transparent border border-white/10 text-white font-black uppercase tracking-[0.4em] py-4 text-[9px] transition-all hover:bg-white/5 hover:border-white/30 flex items-center justify-center gap-3 relative overflow-hidden"
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
          <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Listing
        </button>

        {listing.certificate && (
          <Link
            href={`/verify?code=${encodeURIComponent(listing.certificate)}`}
            className="block w-full bg-transparent border border-white/10 text-white font-black uppercase tracking-[0.4em] py-4 text-[9px] text-center transition-all hover:bg-white/5 hover:border-white/30"
          >
            Verify this item
          </Link>
        )}

        <a
          href={`mailto:contact@relique.ch?subject=Inquiry about ${listing.title}`}
          className="block w-full bg-primaryBlue hover:bg-accentBlue text-white font-black uppercase tracking-[0.5em] py-6 text-xs transition-all duration-300 diagonal-clip shadow-[0_0_40px_rgba(28,77,141,0.2)] text-center"
        >
          Acquire Piece
        </a>
      </div>
    </div>
  );
}
