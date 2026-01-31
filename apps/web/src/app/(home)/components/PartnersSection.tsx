"use client";

import { PartnerCarousel } from "./PartnerCarousel";
import { PartnerGridSection } from "./PartnerGridSection";

export function PartnersSection() {
  return (
    <section className="bg-bgDark border-y border-white/5">
      <PartnerCarousel />
      <div
        className="border-t border-white/5 mx-4 sm:mx-6 md:mx-8"
        aria-hidden
      />
      <PartnerGridSection />
    </section>
  );
}
