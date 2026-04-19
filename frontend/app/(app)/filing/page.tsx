import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FilingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Filing assistant</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filing simulation</CardTitle>
          <CardDescription>
            Module 5 — steps, checklist, and export (PDF/text later).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Placeholder. Backend:{" "}
            <code className="text-xs">GET /api/v1/filing/summary</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
