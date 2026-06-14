export interface PolicySection {
  id: string;
  title: string;
  content: Array<{
    type: 'paragraph' | 'subsection' | 'notice';
    text?: string;
    label?: string;
    items?: Array<{
      subtitle: string;
      description: string;
    }>;
  }>;
}

export const policySections: PolicySection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: [
      {
        type: 'paragraph',
        text: 'These Terms and Conditions ("Terms") govern the use of the Relique.ch platform ("Platform") for (i) the consignment, listing, and sale of memorabilia and collectibles, and (ii) the provision of authentication and verification services. By submitting items for consignment, requesting authentication services, or engaging in transactions through the Platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms.',
      },
      {
        type: 'notice',
        label: 'Notice of Facilitation',
        text: 'Relique.ch operates strictly as a facilitation and service platform. At no time does Relique.ch purchase, own, or take title to any consigned items or authenticated goods.',
      },
    ],
  },
  {
    id: 'nature',
    title: '2. Nature of the Platform',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '2.1 Facilitation Role:',
            description: 'Relique.ch operates solely as a facilitation service. We do not act as a buyer, seller, broker, or owner of any items listed or authenticated on the Platform.',
          },
          {
            subtitle: '2.2 Listing and Visibility:',
            description: 'The Platform provides visibility for consigned items by listing them and making them accessible to prospective buyers. All listings are created based on information supplied by the consignor.',
          },
          {
            subtitle: '2.3 No Ownership or Guarantee:',
            description: 'Relique.ch does not guarantee valuation, marketability, condition, authenticity, or quality of any item. Sellers remain solely responsible for the accuracy, condition, legality, and representations of their consigned items.',
          },
        ],
      },
    ],
  },
  {
    id: 'consignment',
    title: '3. Consignment Acceptance',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '3.1 Consignment Basis:',
            description: 'All items are accepted strictly on a consignment basis.',
          },
          {
            subtitle: '3.2 Right of Refusal:',
            description: 'Submission of an item does not guarantee acceptance, listing, or sale. Relique.ch reserves the right, at its sole discretion, to decline, suspend, or remove any item from consignment.',
          },
          {
            subtitle: '3.3 Seller Obligations:',
            description: 'Sellers must provide accurate descriptions, images, provenance information, and any supporting documentation requested. Any misrepresentation may result in immediate termination.',
          },
        ],
      },
    ],
  },
  {
    id: 'authentication',
    title: '4. Authentication Services',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '4.1 Nature of Authentication:',
            description: 'Authentication services provided through the Platform are analytical and probabilistic in nature. Any authentication result represents an assessment based on available data, reference materials, and analytical models at the time of review.',
          },
          {
            subtitle: '4.2 No Absolute Guarantee:',
            description: 'Authentication does not constitute a warranty, certification of absolute authenticity, or guarantee of value. Results should be understood as an opinion based on objective analysis, not a statement of fact.',
          },
          {
            subtitle: '4.3 Scope Limitation:',
            description: 'Relique.ch does not authenticate historical events, provenance narratives, or ownership claims beyond the scope of the submitted materials.',
          },
          {
            subtitle: '4.4 Use of Results:',
            description: 'Authentication results are intended for informational purposes only. Buyers and sellers acknowledge that such results should not be the sole basis for financial, investment, or legal decisions.',
          },
        ],
      },
    ],
  },
  {
    id: 'platform-services',
    title: '5. Platform Services',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '5.1 Presentation and Inquiry:',
            description: 'Relique.ch facilitates the presentation of items and enables prospective buyers to view listings and submit inquiries.',
          },
          {
            subtitle: '5.2 Logistics Coordination:',
            description: 'Relique.ch may coordinate logistics on behalf of the seller, including shipment arrangements and export processing where applicable.',
          },
          {
            subtitle: '5.3 Compliance Responsibility:',
            description: 'While guidance on packaging, shipping, customs, and duties may be provided, sellers remain solely responsible for compliance with all applicable local and international laws and regulations.',
          },
        ],
      },
    ],
  },
  {
    id: 'fees',
    title: '6. Fees and Payments',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '6.1 Service Fees:',
            description: 'All fees, commissions, or charges related to consignment or authentication services will be disclosed prior to acceptance.',
          },
          {
            subtitle: '6.2 Seller Payments:',
            description: 'Proceeds from sales will be remitted to sellers after completion of the transaction, less applicable fees, commissions, taxes, and agreed charges.',
          },
        ],
      },
    ],
  },
  {
    id: 'no-returns',
    title: '7. No Returns, No Warranty (Consigned Items)',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '7.1 Final Sale:',
            description: 'All consigned sales are final. No returns, exchanges, or refunds are permitted unless expressly required by applicable law.',
          },
          {
            subtitle: '7.2 No Warranty:',
            description: 'Relique.ch provides no warranty, express or implied, regarding the condition, authenticity, or fitness of consigned items.',
          },
        ],
      },
    ],
  },
  {
    id: 'liability',
    title: '8. Limitation of Liability',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '8.1 Transit and Handling:',
            description: 'Relique.ch is not responsible for loss, damage, theft, or delays occurring during shipping or transit.',
          },
          {
            subtitle: '8.2 Buyer-Seller Disputes:',
            description: 'Relique.ch is not liable for disputes between buyers and sellers, including claims of misrepresentation, non-payment, or dissatisfaction.',
          },
          {
            subtitle: '8.3 No Sales Guarantee:',
            description: 'The Platform does not guarantee any sale, sale price, or minimum valuation.',
          },
          {
            subtitle: '8.4 Authentication Liability:',
            description: 'Relique.ch shall not be liable for any reliance placed on authentication results, including financial loss, resale disputes, or third-party claims.',
          },
        ],
      },
    ],
  },
  {
    id: 'compliance',
    title: '9. Export and Legal Compliance',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '9.1 Seller Responsibility:',
            description: 'Sellers are responsible for ensuring compliance with all export, import, and trade regulations.',
          },
          {
            subtitle: '9.2 Duties and Taxes:',
            description: 'Where export duties, taxes, or customs fees apply, Relique.ch may assist with processing; however, financial responsibility remains with the seller unless otherwise agreed.',
          },
        ],
      },
    ],
  },
  {
    id: 'termination',
    title: '10. Termination and Withdrawal',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '10.1 Seller Withdrawal:',
            description: 'Sellers may withdraw items prior to sale, subject to any incurred fees, pending obligations, or logistical arrangements.',
          },
          {
            subtitle: '10.2 Platform Termination:',
            description: 'Relique.ch reserves the right to remove listings, suspend services, or terminate relationships if these Terms are breached or items are deemed unsuitable.',
          },
        ],
      },
    ],
  },
  {
    id: 'governing-law',
    title: '11. Governing Law and Dispute Resolution',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '11.1 Governing Law:',
            description: 'These Terms are governed by the laws of [Insert Jurisdiction].',
          },
          {
            subtitle: '11.2 Dispute Resolution:',
            description: 'Disputes shall first be addressed through good-faith mediation. If unresolved, disputes shall be submitted to the competent courts of [Insert Jurisdiction].',
          },
        ],
      },
    ],
  },
  {
    id: 'miscellaneous',
    title: '12. Miscellaneous',
    content: [
      {
        type: 'subsection',
        items: [
          {
            subtitle: '12.1 Amendments:',
            description: 'Relique.ch reserves the right to modify these Terms at any time. Updated versions will be posted on the Platform.',
          },
          {
            subtitle: '12.2 Acceptance:',
            description: 'Continued use of the Platform constitutes acceptance of any revised Terms.',
          },
          {
            subtitle: '12.3 Severability:',
            description: 'If any provision is held unenforceable, the remaining provisions shall remain in full force and effect.',
          },
        ],
      },
    ],
  },
];

export const tableOfContents = policySections.map(section => ({
  id: section.id,
  title: section.title,
}));
