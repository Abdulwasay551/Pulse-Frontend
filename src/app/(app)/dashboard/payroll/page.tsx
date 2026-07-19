import StatCard from "@/components/dashboard/StatCard";
import { payrollRuns } from "@/lib/dashboard-data";

const statusTone: Record<string, string> = {
  Reconciled: "bg-primary/15 text-primary",
  "Needs review": "bg-amber-soft text-amber",
  Processing: "bg-cream-dim text-ink-soft",
};

export default function PayrollPage() {
  const totalThisMonth = "$186,400";
  const pendingRuns = payrollRuns.filter((p) => p.status !== "Reconciled").length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Payroll</h1>
          <p className="mt-1 text-sm text-ink-soft">Contractor and placement payouts, run by run.</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark">
          Run payroll
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Processed this month" value={totalThisMonth} href="/dashboard/analytics" />
        <StatCard label="Contractors paid" value="42" href="/dashboard/candidates" />
        <StatCard
          label="Runs pending review"
          value={String(pendingRuns)}
          valueTone="maroon"
          href="/dashboard/requisitions"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Run</th>
              <th className="px-5 py-3 font-medium">Contractors</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5 font-semibold text-ink">{p.period}</td>
                <td className="px-5 py-3.5 font-mono text-ink-soft">{p.contractors}</td>
                <td className="px-5 py-3.5 font-mono font-semibold text-ink">{p.amount}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${statusTone[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
