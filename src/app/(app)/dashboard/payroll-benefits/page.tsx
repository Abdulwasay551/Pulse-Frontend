"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import ModuleFeatureSections from "@/components/dashboard/ModuleFeatureSections";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules } from "@/lib/dashboard-modules";
import { getPayrollBenefitsDashboardSummary, type PayrollBenefitsDashboardSummary } from "@/lib/payroll-benefits-api";

const moduleDef = dashboardModules.find((m) => m.key === "payroll-benefits")!;

export default function PayrollBenefitsPage() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<PayrollBenefitsDashboardSummary | null>(null);

  useEffect(() => {
    withAuth((token) => getPayrollBenefitsDashboardSummary(token)).then(setSummary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader icon={moduleDef.icon} title={moduleDef.label} description={moduleDef.description} />

      {!summary ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summary.overview_stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} change={s.change} href={s.href} />
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">Compliance &amp; audit KPIs</h2>
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

      <ModuleFeatureSections moduleDef={moduleDef} />
    </div>
  );
}
