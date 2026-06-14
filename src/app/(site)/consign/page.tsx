import type { Metadata } from "next";
import { ConsignForm } from "./components/ConsignForm";

export const metadata: Metadata = {
  title: "Consign Your Items",
  description: "Partner with Relique to sell your authenticated collectibles. Submit your items for authentication and consignment.",
  openGraph: {
    title: "Consign Your Items - Relique",
    description: "Partner with Relique to sell your authenticated collectibles.",
    type: "website",
  },
};

/**
 * Consign page - server component with client form
 * Refactored from ConsignPageContent.tsx to use composable components
 */
export default function ConsignPage() {
  return (
    <div className="py-24 bg-bgDark min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Monetize Your <span className="text-primaryBlue">Collection</span>
          </h1>
          <p className="text-textSec">
            Reach our network of high-net-worth collectors. Contact{" "}
            <a href="mailto:customersupport@relique.ch" className="text-highlightIce hover:underline">
              customersupport@relique.ch
            </a>{" "}
            for direct inquiries.
          </p>
        </div>

        <ConsignForm />
      </div>
    </div>
  );
}
