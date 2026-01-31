"use client";

import { useState } from "react";
import Image from "next/image";
import {
  WHO_WE_WORK_WITH_PARTNERS,
  TRUSTED_SUPPLIERS_PARTNERS,
  type Partner,
} from "@/data/partners.data";

const GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-8 gap-y-10 sm:gap-x-10 sm:gap-y-12";

export function PartnersSection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-bgDark border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white uppercase mb-3">
            Who We Work With
          </h2>
          <div className="h-[2px] w-12 sm:w-16 bg-primaryBlue" aria-hidden />
        </div>
        <div className="mb-12 sm:mb-14">
          <div className={GRID_CLASS}>
            {WHO_WE_WORK_WITH_PARTNERS.map((partner) => (
              <PartnerLogoCell key={partner.id} partner={partner} />
            ))}
          </div>
        </div>

        <div
          className="border-t border-white/5 mx-0 sm:mx-2 md:mx-4 mb-12 sm:mb-14"
          aria-hidden
        />

        <div className="mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white uppercase mb-3">
            Our Trusted Suppliers
          </h2>
          <div className="h-[2px] w-12 sm:w-16 bg-primaryBlue" aria-hidden />
        </div>
        <div className={GRID_CLASS}>
          {TRUSTED_SUPPLIERS_PARTNERS.map((partner) => (
            <PartnerLogoCell key={partner.id} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerLogoCell({ partner }: { partner: Partner }) {
  const [imgError, setImgError] = useState(false);
  const bg = partner.logoBg ?? "#1a1a1a";
  const zoom = partner.logoZoom ?? 1;

  if (imgError) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border border-borderDark"
          style={{ backgroundColor: bg }}
        >
          <span className="text-center text-textSec text-[10px] sm:text-xs font-medium px-2">
            {partner.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-borderDark"
        style={{ backgroundColor: bg }}
      >
        <div className="absolute inset-2 sm:inset-3 flex items-center justify-center">
          <div
            className="relative w-full h-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center",
            }}
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              fill
              className="object-contain"
              sizes="96px"
              unoptimized
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
