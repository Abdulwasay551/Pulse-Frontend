"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import ModuleFeatureSections from "@/components/dashboard/ModuleFeatureSections";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules } from "@/lib/dashboard-modules";
import { getPeopleDashboardSummary, type PeopleDashboardSummary } from "@/lib/people-api";

const moduleDef = dashboardModules.find((m) => m.key === "people")!;

export default function PeopleManagementPage() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<PeopleDashboardSummary | null>(null);

  useEffect(() => {
    withAuth((token) => getPeopleDashboardSummary(token)).then(setSummary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <ModuleHeader icon={moduleDef.icon} title={moduleDef.label} description={moduleDef.description} />
        <Link
          href="/dashboard/employee-database"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New employee
        </Link>
      </div>

      {!summary ? (
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
              <h2 className="mb-5 font-display text-lg font-bold text-ink">Headcount by department</h2>
              {summary.department_breakdown.length === 0 ? (
                <p className="text-sm text-ink-soft">Add employees to see the breakdown.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {summary.department_breakdown.map((d) => (
                    <div key={d.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-ink">{d.label}</span>
                        <span className="text-ink-soft">{d.percent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${d.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-card p-6">
              <h2 className="mb-5 font-display text-lg font-bold text-ink">Employment status</h2>
              <div className="grid grid-cols-3 gap-3">
                {summary.status_breakdown.map((s) => (
                  <div key={s.label} className="rounded-xl border border-line bg-cream p-3.5 text-center">
                    <div className="text-2xl font-bold text-ink">{s.count}</div>
                    <div className="mt-1 text-[11px] text-ink-soft">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <ModuleFeatureSections moduleDef={moduleDef} />
    </div>
  );
}
