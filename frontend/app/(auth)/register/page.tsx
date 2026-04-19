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

export default function RegisterPage() {
  const router = useRouter();
  const { signUpEmail, user, loading, devBypass } = useAuth();
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
      await signUpEmail(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setPending(false);
    }
  }

  const firebaseReady = devBypass || isFirebaseConfigured();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Register with email and password.</CardDescription>
      </CardHeader>
      <CardContent>
        {!firebaseReady ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Firebase not configured</AlertTitle>
            <AlertDescription>
              Add Firebase env vars to <code className="text-xs">.env.local</code>{" "}
              or enable{" "}
              <code className="text-xs">NEXT_PUBLIC_DEV_AUTH_BYPASS=true</code>.
            </AlertDescription>
          </Alert>
        ) : null}
        <form onSubmit={(e) => void onSubmit(e)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={pending || !firebaseReady}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
