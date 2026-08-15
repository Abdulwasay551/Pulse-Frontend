"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useAiStatus } from "@/lib/ai-status-context";

/** Wraps any AI-touched page/section — shows the real content once an AI
 * provider is connected for `featureKey`, otherwise a blurred mock preview
 * plus a "Connect an AI provider" CTA. `children` should be the real UI;
 * `mockPreview` (optional) is what shows blurred behind the lock — falls
 * back to `children` itself if omitted, since most real UIs already look
 * like a plausible sample once blurred. */
export default function AiFeatureGate({
  featureKey,
  title,
  blurb,
  children,
  mockPreview,
}: {
  featureKey: string;
  title: string;
  blurb: string;
  children: React.ReactNode;
  mockPreview?: React.ReactNode;
}) {
  const { loading, isFeatureEnabled } = useAiStatus();

  if (loading) {
    return <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>;
  }

  if (isFeatureEnabled(featureKey)) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-card">
      <div className="pointer-events-none max-h-[480px] select-none overflow-hidden opacity-40 blur-[2px]">
        {mockPreview ?? children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream/80 p-8 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </span>
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
        <p className="max-w-xs text-xs text-ink-soft">{blurb}</p>
        <Link
          href="/dashboard/settings/ai"
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          Connect an AI provider
        </Link>
      </div>
    </div>
  );
}
