"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import ModuleFeatureSections from "@/components/dashboard/ModuleFeatureSections";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules } from "@/lib/dashboard-modules";
import { getTalentDashboardSummary, type TalentDashboardSummary, type NineBoxRating } from "@/lib/talent-api";

const moduleDef = dashboardModules.find((m) => m.key === "talent")!;

const RATINGS: NineBoxRating[] = ["High", "Medium", "Low"];

export default function TalentManagementPage() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<TalentDashboardSummary | null>(null);
  const [summaryUnavailable, setSummaryUnavailable] = useState(false);

  useEffect(() => {
    withAuth((token) => getTalentDashboardSummary(token)).then(setSummary)
      .catch(() => setSummaryUnavailable(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader icon={moduleDef.icon} title={moduleDef.label} description={moduleDef.description} />

      {summaryUnavailable ? null : !summary ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summary.overview_stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} change={s.change} href={s.href} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-card p-6">
              <h2 className="mb-5 font-display text-lg font-bold text-ink">Talent KPIs</h2>
              <div className="grid grid-cols-2 gap-4">
                {summary.kpis.map((k) => (
                  <Link
                    key={k.label}
                    href={k.href}
                    className="group rounded-xl border border-line bg-cream p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="text-2xl font-bold text-ink">{k.value}</div>
                    <div className="mt-1 text-xs text-ink-soft">{k.label}</div>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/dashboard/succession-planning"
              className="group rounded-2xl border border-line bg-card p-6 transition-colors hover:border-primary/40"
            >
              <h2 className="mb-5 font-display text-lg font-bold text-ink">Succession — 9-box grid</h2>
              <div className="grid grid-cols-3 gap-1.5">
                {RATINGS.map((potential) =>
                  RATINGS.map((performance) => {
                    const count = summary.nine_box[`${potential}_${performance}`] ?? 0;
                    return (
                      <div
                        key={`${potential}_${performance}`}
                        className="flex aspect-square flex-col items-center justify-center rounded-lg border border-line bg-cream"
                      >
                        <span className="text-lg font-bold text-ink">{count}</span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-3 flex justify-between text-[11px] text-ink-soft">
                <span>Performance →</span>
                <span className="text-primary group-hover:underline">View full grid</span>
              </div>
            </Link>
          </div>
        </>
      )}

      <ModuleFeatureSections moduleDef={moduleDef} />
    </div>
  );
}
