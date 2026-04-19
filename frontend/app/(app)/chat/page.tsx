import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Assistant</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tax Q&amp;A</CardTitle>
          <CardDescription>
            Module 6 — grounded chat with your profile context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Placeholder. Backend: <code className="text-xs">POST /api/v1/chat</code>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
