import { Shield, Sparkles, ShoppingBag, FileText } from "lucide-react";
import { FeatureTiles, Section } from "@/lib/ui";

export function FeatureSection() {
  return (
    <Section size="md">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-h2">Why Relique</h2>
          <p className="text-muted-foreground">
            Trusted authentication powered by AI and expert analysis
          </p>
        </div>
        <FeatureTiles
          columns={4}
          items={[
            {
              icon: <Sparkles className="w-6 h-6" />,
              title: "AI Authentication",
              description: "Advanced machine learning analyzes patterns and authenticity markers",
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Trust Verification",
              description: "Probabilistic assessment with transparent, evidence-based results",
            },
            {
              icon: <ShoppingBag className="w-6 h-6" />,
              title: "Marketplace",
              description: "Browse authenticated collectibles from verified sellers",
            },
            {
              icon: <FileText className="w-6 h-6" />,
              title: "Consign",
              description: "Submit your items for professional authentication and consignment",
            },
          ]}
        />
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Our authentication uses probabilistic assessment.{" "}
            <a
              href="/about#artificial-intelligence"
              className="text-accent hover:underline"
            >
              Learn more about our AI process
            </a>
            {" "}or{" "}
            <a
              href="/about#who-we-are"
              className="text-accent hover:underline"
            >
              meet our team
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}

