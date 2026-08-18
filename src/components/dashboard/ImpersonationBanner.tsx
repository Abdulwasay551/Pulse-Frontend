"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/** A persistent, hard-to-miss strip shown across every dashboard page while
 * viewing the app as someone else — same purpose as django-hijack's top-bar
 * indicator. Impersonation itself only ever starts from Django Admin (see
 * core/admin.py's "Impersonate" column); the flag this reads is set once by
 * /impersonate-landing right after that redirect lands, and cleared on
 * "Return to my account" below or on logout — there's no server-side
 * "impersonating" concept to read back, just this tab's own marker. */
export default function ImpersonationBanner() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    setActive(sessionStorage.getItem("Pulse_impersonating") === "1");
  }, [user]);

  if (!active) return null;

  async function handleStop() {
    setStopping(true);
    try {
      sessionStorage.removeItem("Pulse_impersonating");
      await logout();
      router.push("/login");
    } finally {
      setStopping(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-amber px-4 py-2 text-xs font-semibold text-ink sm:px-6">
      <span className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 shrink-0" />
        Viewing as {user?.first_name || user?.username} ({user?.role}) — impersonated via Django Admin
      </span>
      <button
        onClick={handleStop}
        disabled={stopping}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink/10 px-3 py-1 transition-colors hover:bg-ink/20 disabled:opacity-60"
      >
        <LogOut className="h-3 w-3" />
        {stopping ? "Signing out…" : "End & log out"}
      </button>
    </div>
  );
}
