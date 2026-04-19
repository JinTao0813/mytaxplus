import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Tax profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile builder</CardTitle>
          <CardDescription>
            Module 2 — aggregate income and expenses; edit extracted values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Placeholder. Backend: <code className="text-xs">GET/PUT /api/v1/profile</code>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
