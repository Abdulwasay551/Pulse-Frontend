"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/** Landing spot for Django Admin's "Impersonate" link (see backend
 * core/admin_impersonate_views.py) — that view's redirect here already
 * carries a fresh httpOnly refresh cookie for the target user, so
 * AuthProvider's own mount-time bootstrap (which always calls
 * /api/auth/refresh/ first) picks it up the same way a real login would.
 * This page just waits for that to resolve, then forwards into the
 * dashboard — no separate token handling needed here. */
export default function ImpersonateLandingPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      sessionStorage.setItem("Pulse_impersonating", "1");
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-ink-soft">
      Signing you in…
    </div>
  );
}
