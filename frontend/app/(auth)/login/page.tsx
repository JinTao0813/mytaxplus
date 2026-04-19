"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();
  const { signInEmail, user, loading, devBypass } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signInEmail(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setPending(false);
    }
  }

  const firebaseReady = devBypass || isFirebaseConfigured();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your email and password.</CardDescription>
      </CardHeader>
      <CardContent>
        {!firebaseReady ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Firebase not configured</AlertTitle>
            <AlertDescription>
              Add{" "}
              <code className="text-xs">NEXT_PUBLIC_FIREBASE_*</code> to{" "}
              <code className="text-xs">frontend/.env.local</code>, or set{" "}
              <code className="text-xs">NEXT_PUBLIC_DEV_AUTH_BYPASS=true</code>{" "}
              for local UI-only development.
            </AlertDescription>
          </Alert>
        ) : null}
        <form onSubmit={(e) => void onSubmit(e)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={pending || !firebaseReady}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t">
        <p className="text-muted-foreground text-sm">
          No account?{" "}
          <Link href="/register" className="text-primary font-medium underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
