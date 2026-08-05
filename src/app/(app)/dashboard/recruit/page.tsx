"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PlacementsChart from "@/components/dashboard/PlacementsChart";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import ModuleFeatureSections from "@/components/dashboard/ModuleFeatureSections";
import { PipelineWidget } from "@/components/site/widgets";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules } from "@/lib/dashboard-modules";
import { getDashboardSummary, type DashboardSummary } from "@/lib/recruit-api";

const toneDot: Record<string, string> = {
  primary: "bg-primary",
  amber: "bg-amber",
  maroon: "bg-maroon",
  neutral: "bg-ink-soft",
};

const moduleDef = dashboardModules.find((m) => m.key === "recruit")!;

export default function RecruitPage() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryUnavailable, setSummaryUnavailable] = useState(false);

  useEffect(() => {
    withAuth((token) => getDashboardSummary(token)).then(setSummary)
      .catch(() => setSummaryUnavailable(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <ModuleHeader icon={moduleDef.icon} title={moduleDef.label} description={moduleDef.description} />
        <Link
          href="/dashboard/requisitions"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New requisition
        </Link>
      </div>

      {summaryUnavailable ? null : !summary ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          Loading…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summary.overview_stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} change={s.change} href={s.href} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-line bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-ink">Placements · last 6 months</h2>
                  <Link
                    href="/dashboard/analytics"
                    className="text-xs font-semibold text-primary hover:text-primary-dark"
                  >
                    View analytics →
                  </Link>
                </div>
                <PlacementsChart data={summary.placements_trend} />
              </div>

              <ModuleFeatureSections moduleDef={moduleDef} />
            </div>

            {/* A persistent right rail — "at a glance" widgets stay visible
                while the main column (and the sub-module tiles below) is
                what you scroll through. */}
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-6 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-line bg-card p-6">
                  <h2 className="mb-5 font-display text-lg font-bold text-ink">Pipeline</h2>
                  <PipelineWidget stages={summary.pipeline_stages} />
                  {summary.source_breakdown.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-ink-soft">Candidate sources</h3>
                      <div className="flex flex-col gap-2.5">
                        {summary.source_breakdown.map((s) => (
                          <div key={s.label}>
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-ink">{s.label}</span>
                              <span className="text-ink-soft">{s.percent}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${s.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-line bg-card p-6">
                  <h2 className="mb-4 font-display text-lg font-bold text-ink">Recent activity</h2>
                  {summary.recent_activity.length === 0 ? (
                    <p className="text-sm text-ink-soft">Nothing yet — activity shows up here as you work your desk.</p>
                  ) : (
                    <div className="flex max-h-[420px] flex-col overflow-y-auto">
                      {summary.recent_activity.map((a) => (
                        <div key={a.id} className="flex items-start gap-2.5 border-b border-line py-3 last:border-0">
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${toneDot[a.tone]}`} />
                          <p className="flex-1 text-sm text-ink">{a.message}</p>
                          <span className="shrink-0 text-xs text-ink-soft">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
