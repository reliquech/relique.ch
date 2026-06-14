import { BentoFeatureGrid } from "@/components/grids/BentoFeatureGrid";

export function QuickActions() {
  const actions = [
    {
      title: "Verify",
      description: "Authenticate your collectibles with our AI-powered verification system",
      cta: {
        label: "Verify Now",
        href: "/verify",
      },
    },
    {
      title: "Marketplace",
      description: "Browse authenticated collectibles and memorabilia",
      cta: {
        label: "Browse",
        href: "/marketplace",
      },
    },
    {
      title: "Consign",
      description: "Submit your items for authentication and consignment",
      cta: {
        label: "Consign",
        href: "/consign",
      },
    },
    {
      title: "Learn More",
      description: "Discover how our authentication process works",
      cta: {
        label: "About Us",
        href: "/about",
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-h2">Quick Actions</h2>
        <p className="text-muted-foreground">Get started with Relique</p>
      </div>
      <BentoFeatureGrid items={actions} />
    </div>
  );
}
