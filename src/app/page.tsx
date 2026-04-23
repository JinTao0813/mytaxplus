import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-muted/40 to-background px-4 py-16">
      <Card className="w-full max-w-lg border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            MyTax+
          </CardTitle>
          <CardDescription className="text-base">
            Upload documents, understand reliefs, and simulate filing — powered by AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            Create account
          </Link>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
            Open app
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
