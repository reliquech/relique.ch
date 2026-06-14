import type { ContactEmail } from "@/data/contact.data";

interface ContactInfoProps {
  emails: ContactEmail[];
}

/**
 * Contact information display component
 * Shows email contacts with labels and descriptions
 */
export function ContactInfo({ emails }: ContactInfoProps) {
  return (
    <div className="space-y-12">
      {emails.map((contact) => (
        <div key={contact.email}>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-highlightIce mb-4">
            {contact.label}
          </h3>
          <a
            href={`mailto:${contact.email}`}
            className="text-2xl font-bold hover:text-highlightIce transition-colors"
          >
            {contact.email}
          </a>
        </div>
      ))}
    </div>
  );
}
