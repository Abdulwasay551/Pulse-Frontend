"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import ModuleFeatureSections from "@/components/dashboard/ModuleFeatureSections";
import PlacementsChart from "@/components/dashboard/PlacementsChart";
import DonutChart from "@/components/dashboard/DonutChart";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules } from "@/lib/dashboard-modules";
import { getPayrollBenefitsDashboardSummary, type PayrollBenefitsDashboardSummary } from "@/lib/payroll-benefits-api";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

const moduleDef = dashboardModules.find((m) => m.key === "payroll-benefits")!;

export default function PayrollBenefitsPage() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<PayrollBenefitsDashboardSummary | null>(null);
  const [summaryUnavailable, setSummaryUnavailable] = useState(false);

  useEffect(() => {
    withAuth((token) => getPayrollBenefitsDashboardSummary(token)).then(setSummary)
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
              <h2 className="mb-1 font-display text-lg font-bold text-ink">Payroll cost trend</h2>
              <p className="mb-5 text-xs text-ink-soft">Gross amount per run, most recent {summary.payroll_trend.length || 0} periods.</p>
              {summary.payroll_trend.length === 0 ? (
                <p className="text-sm text-ink-soft">Run payroll to see the trend build up here.</p>
              ) : (
                <>
                  <PlacementsChart data={summary.payroll_trend.map((p) => ({ month: p.label, value: p.value }))} />
                  <div className="mt-4 text-right text-xs text-ink-soft">
                    Latest: <span className="font-semibold text-ink">
                      {formatCurrency(summary.payroll_trend[summary.payroll_trend.length - 1].value)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-card p-6">
              <h2 className="mb-1 font-display text-lg font-bold text-ink">Benefit cost by type</h2>
              <p className="mb-5 text-xs text-ink-soft">Monthly employer cost, {formatCurrency(summary.total_monthly_benefit_cost)} total.</p>
              {summary.benefit_cost_by_type.length === 0 ? (
                <p className="text-sm text-ink-soft">Add benefit plans and enrollments to see this breakdown.</p>
              ) : (
                <DonutChart
                  data={summary.benefit_cost_by_type.map((b) => ({
                    label: b.label,
                    percent: summary.total_monthly_benefit_cost
                      ? Math.round((b.value / summary.total_monthly_benefit_cost) * 100)
                      : 0,
                  }))}
                />
              )}
            </div>
          </div>
        </>
      )}

      <ModuleFeatureSections moduleDef={moduleDef} />
    </div>
  );
}
