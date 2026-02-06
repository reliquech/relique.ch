"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { VerificationStatusBadge } from "@/components/app/VerificationStatusBadge";
import { useCurrency } from "@/contexts/CurrencyContext";

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

  const images = listing.images?.length ? listing.images : [listing.image];
  const priceFormatted = formatPrice(listing.price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 60 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-cardDark border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-cardDark/80 border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <VerificationStatusBadge status={listing.status} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
              Inspection Module // {listing.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/30 hover:text-white transition-all hover:rotate-90 duration-300"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 space-y-6 border-r border-white/5 bg-gradient-to-br from-navy/10 to-transparent">
            <div className="aspect-square bg-white/5 relative border border-white/10 overflow-hidden">
              <img
                src={images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((src, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white/5 border border-white/10 overflow-hidden"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 flex flex-col">
            <div className="mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accentBlue block mb-3">
                {listing.category || "Curated Listing"}
              </span>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-white mb-4">
                {listing.title}
              </h2>
              <p className="text-3xl font-black text-white">{priceFormatted}</p>
            </div>

            <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-10">
              {[
                { label: "Category", value: listing.category },
                { label: "Condition", value: listing.condition || "—" },
                { label: "Signed By", value: listing.signedBy || "—" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-white/90">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <a
                href={`mailto:contact@relique.ch?subject=Inquiry about ${listing.title}`}
                className="block w-full bg-primaryBlue hover:bg-accentBlue text-white font-black uppercase tracking-[0.4em] py-5 text-xs text-center transition-colors shadow-xl"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)" }}
              >
                Acquire Now
              </a>
              <Link
                href={`/marketplace/${listing.slug}`}
                onClick={onClose}
                className="block w-full bg-transparent border border-white/10 hover:border-white/30 text-white font-black uppercase tracking-[0.4em] py-5 text-xs text-center transition-all"
              >
                Detailed Collection Report
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
