export interface ContactEmail {
  label: string;
  email: string;
  description?: string;
}

export const CONTACT_EMAILS: ContactEmail[] = [
  {
    label: "Direct Access",
    email: "customersupport@relique.ch",
    description: "General inquiries and customer support",
  },
  {
    label: "Strategic Partnerships",
    email: "partners@relique.ch",
    description: "Partnership and collaboration opportunities",
  },
];

export const RESPONSE_TIME = "< 24 hours";
