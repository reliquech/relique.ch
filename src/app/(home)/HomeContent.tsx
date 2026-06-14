import type { Metadata } from "next";
import { HeroSection } from "./components/HeroSection";
import { WhySection } from "./components/WhySection";
import { MarketplaceSection } from "./components/MarketplaceSection";
import { DualBlocks } from "./components/DualBlocks";
import { TheWaySection } from "./components/TheWaySection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { PartnersSection } from "./components/PartnersSection";
import { StrategicPartnerSection } from "./components/StrategicPartnerSection";
import { TeamSection } from "./components/TeamSection";
import { PressCoverageSection } from "./components/PressCoverageSection";
import { PRESS_ARTICLES } from "@/data/press.data";

export const metadata: Metadata = {
  title: "Relique - Relics you can rely on",
  description:
    "Trusted authentication for memorabilia and collectibles. Verify, browse, and consign authenticated items.",
  openGraph: {
    title: "Relique - Relics you can rely on",
    description: "Relics you can rely on",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhySection />
      <MarketplaceSection />
      <DualBlocks />
      <TheWaySection />
      <PartnersSection />
      <StrategicPartnerSection />
      <TeamSection />
      <PressCoverageSection items={PRESS_ARTICLES} />
    </>
  );
}
