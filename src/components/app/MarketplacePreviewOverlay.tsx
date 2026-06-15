"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { VerificationStatusBadge } from "@/components/app/VerificationStatusBadge";
import { DetailAcquireFlow } from "@/components/app/marketplace-detail/DetailAcquireFlow";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  getListingAuthStatus,
  getListingCategory,
  getListingConditionLabel,
  getListingImages,
  getListingPriceAmount,
  getListingSignedBy,
  getListingTitle,
} from "@/lib/utils/marketplace";

interface MarketplacePreviewOverlayProps {
  listing: MarketplaceListing;
  onClose: () => void;
}

export function MarketplacePreviewOverlay({ listing, onClose }: MarketplacePreviewOverlayProps) {
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const images = getListingImages(listing);
  const heroImage = images[0];
  const priceFormatted = formatPrice(getListingPriceAmount(listing));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 24 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex w-full flex-col bg-cardDark border border-white/10 shadow-2xl sm:max-w-5xl h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[min(90dvh,900px)] sm:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-preview-title"
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-cardDark/95 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <VerificationStatusBadge status={getListingAuthStatus(listing)} />
            <span className="hidden truncate text-[10px] font-black uppercase tracking-[0.35em] text-white/30 sm:inline">
              Inspection Module // {listing.id}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/30 sm:hidden">
              Quick Preview
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 text-white/30 transition-all duration-300 hover:rotate-90 hover:text-white"
            aria-label="Close preview"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-4 border-b border-white/5 bg-gradient-to-br from-navy/10 to-transparent p-4 sm:space-y-6 sm:p-6 md:border-b-0 md:border-r md:p-8">
              <div className="relative flex aspect-[4/3] max-h-[min(42vh,320px)] items-center justify-center overflow-hidden border border-white/10 bg-white/5 text-xs uppercase tracking-[0.3em] text-white/40 sm:aspect-square sm:max-h-none">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={getListingTitle(listing)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "No Media"
                )}
              </div>
              {images.length > 1 ? (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {images.slice(0, 4).map((src, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden border border-white/10 bg-white/5"
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col p-4 sm:p-6 md:p-8">
              <div className="mb-6 sm:mb-8 md:mb-10">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.35em] text-accentBlue sm:mb-3 sm:tracking-[0.4em]">
                  {getListingCategory(listing) || "Curated Listing"}
                </span>
                <h2
                  id="marketplace-preview-title"
                  className="mb-3 text-balance text-xl font-black leading-tight tracking-tight text-white sm:mb-4 sm:text-2xl md:text-3xl"
                >
                  {getListingTitle(listing)}
                </h2>
                <p className="text-xl font-black text-white sm:text-2xl md:text-3xl">{priceFormatted}</p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:mb-8 sm:gap-x-8 sm:gap-y-6 md:mb-10 md:gap-x-12 md:gap-y-8">
                {[
                  { label: "Category", value: getListingCategory(listing) },
                  { label: "Condition", value: getListingConditionLabel(listing) || "—" },
                  { label: "Signed By", value: getListingSignedBy(listing) || "—" },
                ].map((item, i) => (
                  <div key={i} className="min-w-0">
                    <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.35em] text-white/30 sm:mb-2 sm:tracking-[0.4em]">
                      {item.label}
                    </p>
                    <p className="truncate text-sm font-bold text-white/90 sm:whitespace-normal sm:overflow-visible">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-4 sm:pb-0">
                <DetailAcquireFlow listing={listing} primaryLabel="Acquire Now" />
                <Link
                  href={`/marketplace/${listing.slug}`}
                  onClick={onClose}
                  className="block w-full border border-white/10 bg-transparent py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:border-white/30 sm:py-5 sm:text-xs sm:tracking-[0.4em]"
                >
                  Detailed Collection Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
