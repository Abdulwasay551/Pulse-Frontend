"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { usePagination } from "@/lib/use-pagination";
import {
  getPayrollBenefitsDashboardSummary,
  benefitPlansApi,
  type PayrollBenefitsDashboardSummary,
  type BenefitPlan,
} from "@/lib/payroll-benefits-api";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function CostBreakdownCard({
  title,
  rows,
  emptyHint,
}: {
  title: string;
  rows: { label: string; value: number }[];
  emptyHint?: string;
}) {
  const maxCost = Math.max(1, ...rows.map((b) => b.value));
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-5 font-display text-lg font-bold text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-soft">{emptyHint ?? "Add benefit plans and enrollments to see a breakdown."}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((b) => (
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
  );
}

export default function BenefitCostAnalysisPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <BenefitCostAnalysisPage />
    </Suspense>
  );
}

function BenefitCostAnalysisPage() {
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

  const searched = useTableSearch(plans, (p) => p.name);
  const { pageItems: visiblePlans, page, setPage, totalPages, total, pageSize } = usePagination(searched);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Benefit Cost Analysis</h1>
        <p className="mt-1 text-sm text-ink-soft">What benefits actually cost — by type, department, location, employee, and plan.</p>
      </div>

      {!summary ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-line bg-card p-6">
            <div className="text-[11px] uppercase tracking-wide text-ink-soft">Total monthly employer cost</div>
            <div className="mt-2 text-3xl font-bold text-ink">{formatCurrency(summary.total_monthly_benefit_cost)}</div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CostBreakdownCard title="Employer cost by plan type" rows={summary.benefit_cost_by_type} />
            <CostBreakdownCard title="Employer cost by department" rows={summary.benefit_cost_by_department} />
            <CostBreakdownCard
              title="Employer cost by location"
              rows={summary.benefit_cost_by_location}
              emptyHint="Set a Location on each employee's Employment tab to see this breakdown."
            />
            <CostBreakdownCard title="Top employees by employer cost" rows={summary.benefit_cost_by_employee} />
          </div>

          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">Per-plan detail</h2>
            <div className="overflow-x-auto">
              <table className="eh-table w-full text-left text-sm">
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
                  {visiblePlans.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-4 font-semibold text-ink" data-label="Plan">
                        <Link href="/dashboard/benefits-enrollment" className="hover:text-primary hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-ink-soft" data-label="Enrolled">{p.enrolled_count}</td>
                      <td className="py-2.5 pr-4 text-ink-soft" data-label="Employee cost / mo">${p.employee_cost}</td>
                      <td className="py-2.5 pr-4 text-ink-soft" data-label="Employer cost / mo">${p.employer_cost}</td>
                      <td className="py-2.5 font-semibold text-ink" data-label="Total employer cost / mo">
                        {formatCurrency(Number(p.employer_cost) * p.enrolled_count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visiblePlans.length === 0 && (
                <p className="py-6 text-center text-sm text-ink-soft">
                  {plans.length === 0 ? "No benefit plans yet." : "No plans match your search."}
                </p>
              )}
            </div>
            <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
