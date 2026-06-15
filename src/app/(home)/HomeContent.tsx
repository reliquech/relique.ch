import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { HeroSection } from "./components/HeroSection";
import { WhySection } from "./components/WhySection";
import { MarketplaceSection } from "./components/MarketplaceSection";
import { DualBlocks } from "./components/DualBlocks";
import { PRESS_ARTICLES } from "@/data/press.data";

const sectionFallback = () => <div className="min-h-[120px]" aria-hidden />;

const TheWaySection = dynamic(
  () => import("./components/TheWaySection").then((m) => ({ default: m.TheWaySection })),
  { loading: sectionFallback }
);
const PartnersSection = dynamic(
  () => import("./components/PartnersSection").then((m) => ({ default: m.PartnersSection })),
  { loading: sectionFallback }
);
const StrategicPartnerSection = dynamic(
  () => import("./components/StrategicPartnerSection").then((m) => ({ default: m.StrategicPartnerSection })),
  { loading: sectionFallback }
);
const TeamSection = dynamic(
  () => import("./components/TeamSection").then((m) => ({ default: m.TeamSection })),
  { loading: sectionFallback }
);
const PressCoverageSection = dynamic(
  () => import("./components/PressCoverageSection").then((m) => ({ default: m.PressCoverageSection })),
  { loading: sectionFallback }
);

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
