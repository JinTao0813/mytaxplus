import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReliefsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Reliefs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Relief detection</CardTitle>
          <CardDescription>
            Module 3 — claimed vs missed reliefs and optimization suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Placeholder. Backend:{" "}
            <code className="text-xs">POST /api/v1/reliefs/analyze</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
