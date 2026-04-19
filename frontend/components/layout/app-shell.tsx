"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/profile", label: "Profile" },
  { href: "/reliefs", label: "Reliefs" },
  { href: "/summary", label: "Tax summary" },
  { href: "/filing", label: "Filing" },
  { href: "/chat", label: "Assistant" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, devBypass } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user && !devBypass) router.replace("/login");
  }, [user, loading, devBypass, router]);

  if (loading && !devBypass) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[60vh] w-full max-w-3xl" />
      </div>
    );
  }

  if (!user && !devBypass) return null;

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-border bg-muted/30 w-full shrink-0 border-b md:w-52 md:border-r md:border-b-0">
        <div className="flex flex-col gap-1 p-4">
          <Link
            href="/dashboard"
            className="text-foreground mb-3 font-semibold tracking-tight"
          >
            MyTax+
          </Link>
          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="border-border flex h-14 items-center justify-end border-b px-4">
          <UserMenu />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
