import type { Metadata } from "next";
import { ContactForm } from "./components/ContactForm";
import { ContactInfo } from "./components/ContactInfo";
import { CONTACT_EMAILS, RESPONSE_TIME } from "@/data/contact.data";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with Relique. Inquiry response time: ${RESPONSE_TIME}`,
  openGraph: {
    title: "Contact Relique",
    description: "Get in touch with Relique.",
    type: "website",
  },
};

/**
 * Contact page - server component with client children
 * Refactored from ContactPageContent.tsx to use composable components
 */
export default function ContactPage() {
  return (
    <div className="py-24 bg-bgDark min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primaryBlue/5 to-transparent opacity-30 pointer-events-none" />
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-semibold tracking-tight mb-4">
            Get In <span className="text-primaryBlue">Touch</span>
          </h1>
          <p className="text-textSec">Inquiry response time: {RESPONSE_TIME}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <ContactInfo emails={CONTACT_EMAILS} />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
