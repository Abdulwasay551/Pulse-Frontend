"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/lib/auth-context";
import { employeesApi, getPeopleDashboardSummary, type Employee, type PeopleDashboardSummary } from "@/lib/people-api";

type ViewMode = "forecast" | "kpis";

export default function WorkforceDashboardPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <WorkforceDashboardPage />
    </Suspense>
  );
}

function WorkforceDashboardPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewMode>(searchParams.get("view") === "kpis" ? "kpis" : "forecast");
  const { withAuth } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summary, setSummary] = useState<PeopleDashboardSummary | null>(null);

  useEffect(() => {
    withAuth((token) => Promise.all([employeesApi.list(token), getPeopleDashboardSummary(token)])).then(
      ([e, s]) => {
        setEmployees(e);
        setSummary(s);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Headcount-by-hire-month, last 6 months — a real, honest growth trend
  // computed from actual hire dates (not a modeled forecast; there's no
  // historical headcount snapshot to forecast from, so this shows the
  // trend that's actually driving the current numbers).
  const monthlyGrowth = useMemo(() => {
    const months: { key: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: d.toLocaleDateString(undefined, { month: "short" }), count: 0 });
    }
    for (const emp of employees) {
      const hire = new Date(emp.hire_date);
      const key = `${hire.getFullYear()}-${String(hire.getMonth() + 1).padStart(2, "0")}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.count += 1;
    }
    return months;
  }, [employees]);

  const attritionKpi = summary?.kpis.find((k) => k.label === "Attrition rate");
  const terminatedCount = summary?.status_breakdown.find((s) => s.label === "Terminated")?.count ?? 0;
  const maxMonthly = Math.max(1, ...monthlyGrowth.map((m) => m.count));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link
          href="/dashboard/people"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          People Management
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">Workforce Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Headcount trends and day-to-day workforce KPIs, powered by AI.</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView("forecast")}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${view === "forecast" ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"}`}
        >
          Headcount Forecasting &amp; Attrition Trends
        </button>
        <button
          onClick={() => setView("kpis")}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${view === "kpis" ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"}`}
        >
          Day-to-Day KPI Tracking
        </button>
      </div>

      {!summary ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : view === "forecast" ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Attrition rate" value={attritionKpi?.value ?? "—"} href="/dashboard/employee-database" />
            <StatCard label="Terminated to date" value={String(terminatedCount)} href="/dashboard/employee-database" />
          </div>
          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-1 font-display text-lg font-bold text-ink">Headcount growth — last 6 months</h2>
            <p className="mb-5 text-xs text-ink-soft">New hires by month, based on each employee&apos;s hire date.</p>
            <div className="flex h-40 items-end gap-3">
              {monthlyGrowth.map((m) => (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-primary"
                      style={{ height: `${(m.count / maxMonthly) * 100}%`, minHeight: m.count > 0 ? "4px" : "0" }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-ink">{m.count}</span>
                  <span className="text-[10px] text-ink-soft">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summary.overview_stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} change={s.change} href={s.href} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          <div className="mt-6 rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">Workforce KPIs</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        </>
      )}
    </div>
  );
}
