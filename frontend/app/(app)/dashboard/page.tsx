import Link from "next/link";

import { ApiStatus } from "@/components/tax/api-status";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Start your tax flow: upload documents, review your profile, then run
          reliefs and tax comparison.
        </p>
      </div>
      <ApiStatus />
      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <CardDescription>Follow the MVP journey from the PRD.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/upload" className={buttonVariants({ variant: "default" })}>
            Upload documents
          </Link>
          <Link href="/profile" className={buttonVariants({ variant: "secondary" })}>
            Tax profile
          </Link>
          <Link href="/reliefs" className={buttonVariants({ variant: "outline" })}>
            Relief optimization
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
