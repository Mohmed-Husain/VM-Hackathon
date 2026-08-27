"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { StoredSession } from "@/types/auth";
import { getSession } from "@/lib/session";

export function ProtectedPage({
  children,
  fallback,
}: Readonly<{
  children: (session: StoredSession) => React.ReactNode;
  fallback?: React.ReactNode;
}>) {
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null | undefined>(undefined);

  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.replace("/login");
      setSession(null);
      return;
    }

    setSession(storedSession);
  }, [router]);

  if (session === undefined) {
    return (
      fallback ?? (
        <main className="app-shell">
          <div className="center-state">
            <p className="subtle">Checking your session...</p>
          </div>
        </main>
      )
    );
  }

  if (session === null) {
    return null;
  }

  return <>{children(session)}</>;
}
