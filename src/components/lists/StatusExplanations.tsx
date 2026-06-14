import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export function StatusExplanations() {
  return (
    <div className="space-y-4">
      <h3 className="text-h4">Status Explanations</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-lg">Qualified</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              This item has been authenticated and verified. All evidence supports
              the authenticity of the item.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle className="text-lg">Inconclusive</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Unable to determine authenticity with available evidence. Additional
              information or examination may be required.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle className="text-lg">Disqualified</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              This item does not appear to be authentic based on available evidence
              and analysis.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

