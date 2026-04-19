import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SummaryPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Tax summary</h1>
      <Card>
        <CardHeader>
          <CardTitle>Before vs after optimization</CardTitle>
          <CardDescription>
            Module 4 — chargeable income and tax payable comparison.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Placeholder. Backend:{" "}
            <code className="text-xs">POST /api/v1/tax/compare</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
