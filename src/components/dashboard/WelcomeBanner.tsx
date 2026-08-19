"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Clock, MapPin, Pencil, ThermometerSun, UserRound, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getBannerInfo, updateBannerRegion, type BannerInfo } from "@/lib/role-api";
import type { UserRole } from "@/lib/auth-api";

function Chip({
  icon: Icon,
  children,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: "default" | "alert";
}) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
        tone === "alert" ? "border-amber bg-amber-soft text-amber" : "border-cream/25 bg-cream text-ink"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}

/** The dashboard home's top banner — one component shared by HR/Admin,
 * Employee, and every narrower role's home, so "welcome + who/where/when
 * am I" reads identically everywhere instead of each role home rolling its
 * own. Compact by design (a few lines, not a hero splash): name, role,
 * region, live weather, local timezone/time, and a flag-count "notification"
 * chip fed by whichever health score the caller already computed (Org
 * health for HR, My work health for Employee) — no separate notification
 * system, this just surfaces the same flags differently. */
export default function WelcomeBanner({
  name,
  role,
  description,
  notificationCount,
  notificationLabel,
}: {
  name: string;
  role: UserRole | undefined;
  description: string;
  notificationCount?: number;
  notificationLabel?: string;
}) {
  const { withAuth } = useAuth();
  const [info, setInfo] = useState<BannerInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    withAuth((token) => getBannerInfo(token)).then(setInfo).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function saveRegion() {
    setSaving(true);
    try {
      const updated = await withAuth((token) => updateBannerRegion(token, draft.trim()));
      setInfo(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace(/_/g, " ");
  const timeLabel = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div
      className="relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7"
      style={{
        backgroundImage: [
          "radial-gradient(circle at 15% 20%, rgba(115,182,196,0.35), transparent 45%)",
          "radial-gradient(circle at 85% 80%, rgba(185,134,31,0.18), transparent 45%)",
          "radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px)",
        ].join(", "),
        backgroundSize: "auto, auto, 22px 22px",
        backgroundColor: "var(--primary-dark)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-primary-light uppercase">
            The Pulse Suite
          </span>
          <h1 className="font-display text-xl font-bold text-cream sm:text-2xl">Welcome, {name}</h1>
          <p className="mt-0.5 text-sm text-cream/60">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role && <Chip icon={UserRound}>{role}</Chip>}

          {editing ? (
            <span className="flex items-center gap-1 rounded-full border border-cream/25 bg-cream py-1 pr-1.5 pl-3">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveRegion()}
                placeholder="City, Country"
                className="w-32 bg-transparent text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none"
              />
              <button
                onClick={saveRegion}
                disabled={saving}
                aria-label="Save region"
                className="rounded-full p-1 text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => setEditing(false)}
                aria-label="Cancel"
                className="rounded-full p-1 text-ink-soft hover:bg-cream-dim hover:text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : info?.region ? (
            <button onClick={() => info.can_edit_region && (setDraft(info.region), setEditing(true))}>
              <Chip icon={MapPin}>
                {info.region}
                {info.can_edit_region && <Pencil className="ml-0.5 h-2.5 w-2.5 opacity-60" />}
              </Chip>
            </button>
          ) : (
            info?.can_edit_region && (
              <button onClick={() => (setDraft(""), setEditing(true))}>
                <Chip icon={MapPin}>Set region</Chip>
              </button>
            )
          )}

          {info?.weather && (
            <Chip icon={ThermometerSun}>{Math.round(info.weather.temperature_f)}°F</Chip>
          )}

          <Chip icon={Clock}>
            {timeLabel}
            {timezone ? ` · ${timezone}` : ""}
          </Chip>

          {!!notificationCount && (
            <Chip icon={Bell} tone="alert">
              {notificationCount} {notificationLabel ?? "flag"}
              {notificationCount === 1 ? "" : "s"}
            </Chip>
          )}
        </div>
      </div>
    </div>
  );
}
