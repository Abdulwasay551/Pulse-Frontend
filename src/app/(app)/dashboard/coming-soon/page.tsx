"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { dashboardModules } from "@/lib/dashboard-modules";

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const moduleLabel = searchParams.get("module") ?? "EvoHR";
  const sectionLabel = searchParams.get("section");
  const featureLabel = searchParams.get("feature") ?? "This feature";
  const description = searchParams.get("description");

  const moduleDef = dashboardModules.find((m) => m.label === moduleLabel);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </span>
      <span className="mb-4 rounded-full bg-cream-dim px-3 py-1  text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        Coming soon
      </span>
      <h1 className="font-display text-2xl font-bold text-ink">{featureLabel}</h1>
      <p className="mt-2  text-xs text-ink-soft">
        {moduleLabel}
        {sectionLabel ? ` · ${sectionLabel}` : ""}
      </p>
      {description && <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">{description}</p>}
      <p className="mt-6 max-w-md text-sm text-ink-soft">
        This is on our roadmap and isn&apos;t built yet — everything else already live in {moduleLabel} is ready to
        use today.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {moduleDef && (
          <Link
            href={moduleDef.overviewHref}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5  text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {moduleLabel}
          </Link>
        )}
        <Link
          href="/dashboard"
          className="rounded-lg border border-line bg-card px-4 py-2.5  text-[13px] font-semibold text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink"
        >
          All modules
        </Link>
      </div>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
    >
      <ComingSoonContent />
    </Suspense>
  );
}
