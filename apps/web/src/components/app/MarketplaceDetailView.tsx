"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { VerificationStatusBadge } from "@/components/app/VerificationStatusBadge";
import { DetailMediaSection } from "@/components/app/marketplace-detail/DetailMediaSection";
import { DetailPurchasePanel } from "@/components/app/marketplace-detail/DetailPurchasePanel";
import { RelatedAssetsSection } from "@/components/app/marketplace-detail/RelatedAssetsSection";
import { DetailBackToTop } from "@/components/app/marketplace-detail/DetailBackToTop";

interface MarketplaceDetailViewProps {
  listing: MarketplaceListing;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function MarketplaceDetailView({ listing }: MarketplaceDetailViewProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [listing.id]);

  const category = listing.category || "CURATED LISTING";
  const hasProvenance = Boolean(listing.provenance);
  const hasCoa = Boolean(listing.coaIssuer);

  const anchorLinks = [
    { name: "Overview", href: "#overview" },
    hasProvenance && { name: "Provenance", href: "#provenance" },
  ].filter(Boolean) as { name: string; href: string }[];

  return (
    <div className="bg-bgDark text-white min-h-screen relative font-sans scroll-smooth">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/marketplace"
            className="flex items-center gap-3 group"
          >
            <svg className="w-5 h-5 text-white/30 group-hover:text-accentBlue transition-all duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">
              Return to Marketplace
            </span>
          </Link>
          <nav className="hidden md:flex gap-8">
            {anchorLinks.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all hover:tracking-[0.5em]"
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="lg:flex gap-20">
          <div className="flex-grow space-y-24">
            <motion.section id="overview" initial="hidden" animate="visible" variants={sectionVariants}>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accentBlue">
                  {category}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <VerificationStatusBadge status={listing.status} />
                {hasCoa && (
                  <div className="flex items-center gap-2 border border-green-500/20 bg-green-500/5 px-3 py-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-green-500">
                      COA Certified
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-10 max-w-4xl">
                {listing.title}
              </h1>
              <DetailMediaSection listing={listing} />
            </motion.section>

            {hasProvenance && (
              <motion.section
                id="provenance"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                className="pt-24 border-t border-white/5"
              >
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-12">
                  I. Provenance & Narrative
                </h2>
                <div className="max-w-3xl">
                  <p className="text-xl leading-relaxed text-white font-medium mb-16 italic opacity-90">
                    {listing.provenance}
                  </p>
                </div>
              </motion.section>
            )}

            <RelatedAssetsSection currentListing={listing} />
          </div>

          <aside className="lg:w-[380px] shrink-0 mt-20 lg:mt-0">
            <div className="lg:sticky lg:top-12 space-y-8">
              <DetailPurchasePanel listing={listing} />
            </div>
          </aside>
        </div>
      </div>

      <DetailBackToTop />
      <div className="h-40" />
    </div>
  );
}
