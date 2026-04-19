import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Documents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload EA form and receipts</CardTitle>
          <CardDescription>
            Module 1 — file upload and AI extraction will connect here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Placeholder page. Wire multipart upload to{" "}
            <code className="text-xs">POST /api/v1/documents/upload</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
