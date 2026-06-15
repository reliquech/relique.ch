import type { Metadata } from "next";
import { AuthenticateForm } from "./components/AuthenticateForm";

export const metadata: Metadata = {
  title: "Authenticate Your Items",
  description: "Submit your items to our expert panel for rigorous forensic analysis and digital twin certification.",
  openGraph: {
    title: "Authenticate Your Items - Relique",
    description: "Submit your items for authentication.",
    type: "website",
  },
};

/**
 * Authentication page - server component with client form
 * Refactored from AuthenticatePageContent.tsx to use composable components
 */
export default function AuthenticatePage() {
  return (
    <div className="pt-32 md:pt-48 pb-24 bg-bgDark min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div>
          <span className="text-primaryBlue font-black uppercase text-xs tracking-widest mb-4 block">
            Service Portal
          </span>
          <h1 className="text-4xl font-semibold tracking-tight mb-8">
            Get your items <span className="text-highlightIce">Authenticated </span> by filling this form out.
          </h1>
          <p className="text-textSec text-lg mb-12">
            Submit your items to our expert panel for rigorous forensic analysis and digital twin certification.
          </p>
        </div>

        <AuthenticateForm />
      </div>
    </div>
  );
}
