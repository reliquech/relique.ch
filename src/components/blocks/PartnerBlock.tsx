import { Card, CardContent } from "@/components/ui/card";

export function PartnerBlock() {
  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-accent-foreground uppercase tracking-wide">
            Strategic Partnership
          </p>
          <h3 className="text-xl font-bold">
            Meet our strategic partner: ST.B
          </h3>
          <p className="text-muted-foreground">
            We're proud to partner with ST.B to bring you the most advanced authentication
            technology and expertise in the collectibles industry.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

