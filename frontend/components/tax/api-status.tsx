"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api";

export function ApiStatus() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch<{ status: string }>("/health");
        if (!cancelled && res.status === "ok") setStatus("ok");
        else if (!cancelled) {
          setStatus("err");
          setDetail("Unexpected response");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("err");
          setDetail(e instanceof Error ? e.message : "Request failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "idle") {
    return (
      <p className="text-muted-foreground text-sm">Checking API…</p>
    );
  }

  if (status === "ok") {
    return (
      <Alert>
        <AlertTitle>API reachable</AlertTitle>
        <AlertDescription>
          FastAPI health check succeeded at{" "}
          <code className="text-xs">{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}</code>
          .
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>API unreachable</AlertTitle>
      <AlertDescription>
        {detail}. Ensure the backend is running (e.g.{" "}
        <code className="text-xs">make up</code>).
      </AlertDescription>
    </Alert>
  );
}
