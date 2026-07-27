"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getPayrollBenefitsDashboardSummary,
  benefitPlansApi,
  type PayrollBenefitsDashboardSummary,
  type BenefitPlan,
} from "@/lib/payroll-benefits-api";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export default function BenefitCostAnalysisPage() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<PayrollBenefitsDashboardSummary | null>(null);
  const [plans, setPlans] = useState<BenefitPlan[]>([]);

  useEffect(() => {
    withAuth((token) => Promise.all([getPayrollBenefitsDashboardSummary(token), benefitPlansApi.list(token)])).then(
      ([s, p]) => {
        setSummary(s);
        setPlans(p);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxCost = summary ? Math.max(1, ...summary.benefit_cost_by_type.map((b) => b.value)) : 1;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Benefit Cost Analysis</h1>
        <p className="mt-1 text-sm text-ink-soft">What benefits actually cost, by type and by plan.</p>
      </div>

      {!summary ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-line bg-card p-6">
            <div className="text-[11px] uppercase tracking-wide text-ink-soft">Total monthly employer cost</div>
            <div className="mt-2 text-3xl font-bold text-ink">{formatCurrency(summary.total_monthly_benefit_cost)}</div>
          </div>

          <div className="mb-6 rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">Employer cost by plan type</h2>
            {summary.benefit_cost_by_type.length === 0 ? (
              <p className="text-sm text-ink-soft">Add benefit plans and enrollments to see a breakdown.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {summary.benefit_cost_by_type.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-ink">{b.label}</span>
                      <span className="text-ink-soft">{formatCurrency(b.value)}/mo</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dim">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(b.value / maxCost) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">Per-plan detail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-4 font-medium">Plan</th>
                    <th className="py-2 pr-4 font-medium">Enrolled</th>
                    <th className="py-2 pr-4 font-medium">Employee cost / mo</th>
                    <th className="py-2 pr-4 font-medium">Employer cost / mo</th>
                    <th className="py-2 font-medium">Total employer cost / mo</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-4 font-semibold text-ink">{p.name}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">{p.enrolled_count}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">${p.employee_cost}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">${p.employer_cost}</td>
                      <td className="py-2.5 font-semibold text-ink">
                        {formatCurrency(Number(p.employer_cost) * p.enrolled_count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {plans.length === 0 && <p className="py-6 text-center text-sm text-ink-soft">No benefit plans yet.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
