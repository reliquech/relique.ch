"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MarketplaceListing } from "@/lib/schemas/marketplace";
import { VerificationStatusBadge } from "@/components/app/VerificationStatusBadge";
import { DetailMediaSection } from "@/components/app/marketplace-detail/DetailMediaSection";
import { DetailPurchasePanel } from "@/components/app/marketplace-detail/DetailPurchasePanel";
import { RelatedAssetsSection } from "@/components/app/marketplace-detail/RelatedAssetsSection";
import { DetailBackToTop } from "@/components/app/marketplace-detail/DetailBackToTop";
import { DetailQuickFacts } from "@/components/app/marketplace-detail/DetailQuickFacts";
import { DetailInfoSection } from "@/components/app/marketplace-detail/DetailInfoSection";
import { DetailProvenanceActions } from "@/components/app/marketplace-detail/DetailProvenanceActions";
import {
  getListingCategory,
  getListingTitle,
  getListingAuthStatus,
} from "@/lib/utils/marketplace";
import {
  buildConditionSpecRows,
  buildJerseySpecRows,
  buildProvenanceSpecRows,
  buildQuickFacts,
  buildSigningSpecRows,
  getListingDescriptions,
} from "@/lib/utils/marketplaceDetail";

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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [listing.id, reduceMotion]);

  const category = getListingCategory(listing) || "CURATED LISTING";
  const { subtitle, short } = getListingDescriptions(listing);
  const showDescription = Boolean(short && short !== subtitle);
  const quickFacts = buildQuickFacts(listing);
  const jerseyRows = buildJerseySpecRows(listing);
  const signingRows = buildSigningSpecRows(listing);
  const conditionRows = buildConditionSpecRows(listing);
  const provenanceRows = buildProvenanceSpecRows(listing);
  const hasCoa = Boolean(listing.auth?.coa_refs?.length);
  const tags = listing.listing?.tags?.filter(Boolean) ?? [];

  return (
    <div className="bg-bgDark text-white min-h-screen relative font-sans scroll-smooth pt-32 md:pt-48 pb-24">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="lg:flex gap-16 xl:gap-20">
          <div className="flex-grow space-y-4">
            <motion.section
              id="overview"
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? undefined : "visible"}
              variants={sectionVariants}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-accentBlue">
                  {category}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" aria-hidden />
                <VerificationStatusBadge status={getListingAuthStatus(listing)} />
                {hasCoa ? (
                  <span className="border border-green-500/25 bg-green-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-green-400">
                    COA on file
                  </span>
                ) : null}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6 max-w-4xl text-balance">
                {getListingTitle(listing)}
              </h1>

              {listing.listing?.subtitle ? (
                <p className="max-w-3xl text-lg md:text-xl text-white/75 font-medium mb-8 leading-relaxed">
                  {listing.listing.subtitle}
                </p>
              ) : null}

              <DetailQuickFacts facts={quickFacts} />
              <DetailMediaSection listing={listing} />

              {tags.length > 0 ? (
                <div className="mt-10 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 border border-white/10 text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.section>

            {showDescription && short ? (
              <DetailInfoSection
                id="description"
                title="Item description"
                description={short}
                rows={[]}
                variants={sectionVariants}
                reduceMotion={!!reduceMotion}
              />
            ) : null}

            <DetailInfoSection
              id="jersey"
              title="Jersey specifications"
              rows={jerseyRows}
              variants={sectionVariants}
              reduceMotion={!!reduceMotion}
            />

            <DetailInfoSection
              id="signing"
              title="Signature details"
              rows={signingRows}
              variants={sectionVariants}
              reduceMotion={!!reduceMotion}
            />

            <DetailInfoSection
              id="condition"
              title="Condition report"
              rows={conditionRows}
              variants={sectionVariants}
              reduceMotion={!!reduceMotion}
            />

            <DetailInfoSection
              id="provenance"
              title="Authentication & provenance"
              rows={provenanceRows}
              variants={sectionVariants}
              reduceMotion={!!reduceMotion}
            >
              <DetailProvenanceActions listing={listing} />
            </DetailInfoSection>

            <div id="related">
              <RelatedAssetsSection currentListing={listing} />
            </div>
          </div>

          <aside className="lg:w-[380px] shrink-0 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              <DetailPurchasePanel listing={listing} />
            </div>
          </aside>
        </div>
      </div>

      <DetailBackToTop />
    </div>
  );
}
