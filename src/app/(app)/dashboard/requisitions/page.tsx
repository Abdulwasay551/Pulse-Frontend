import { requisitions, type RequisitionStatus } from "@/lib/dashboard-data";

const statusTone: Record<RequisitionStatus, string> = {
  Open: "bg-cream-dim text-ink-soft",
  Interviewing: "bg-amber-soft text-amber",
  "Offer stage": "bg-primary-light/20 text-primary",
  "On hold": "bg-maroon-soft text-maroon",
  Filled: "bg-primary/15 text-primary",
};

const priorityTone: Record<string, string> = {
  High: "text-maroon",
  Medium: "text-amber",
  Low: "text-ink-soft",
};

export default function RequisitionsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Requisitions</h1>
          <p className="mt-1 text-sm text-ink-soft">Every open job order, across every client.</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark">
          + New requisition
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Recruiter</th>
              <th className="px-5 py-3 font-medium">Candidates</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Posted</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink">{r.title}</div>
                  <div className="text-xs text-ink-soft">{r.client}</div>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{r.recruiter}</td>
                <td className="px-5 py-3.5 font-mono text-ink">{r.candidates}</td>
                <td className={`px-5 py-3.5 font-mono text-xs font-semibold ${priorityTone[r.priority]}`}>
                  {r.priority}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${statusTone[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{r.posted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
