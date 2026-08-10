"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Flag, History } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/lib/auth-context";
import { getPayrollAuditTrail, payrollApi, type PayrollAuditEntry, type PayrollRun } from "@/lib/payroll-benefits-api";

const toneDot: Record<PayrollAuditEntry["tone"], string> = {
  primary: "bg-primary",
  amber: "bg-amber",
  maroon: "bg-maroon",
  neutral: "bg-ink-soft",
};

function relativeTime(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const statusTone: Record<PayrollRun["status"], string> = {
  Reconciled: "bg-primary/15 text-primary",
  "Needs review": "bg-amber-soft text-amber",
  Processing: "bg-cream-dim text-ink-soft",
};

function formatCurrency(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}

export default function PayrollAuditPage() {
  const { withAuth } = useAuth();
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [trail, setTrail] = useState<PayrollAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    try {
      const [runsResult, trailResult] = await withAuth((token) =>
        Promise.allSettled([payrollApi.list(token), getPayrollAuditTrail(token)])
      );
      const data = runsResult.status === "fulfilled" ? runsResult.value : [];
      setRuns(data);
      setNotesDraft(Object.fromEntries(data.map((r) => [r.id, r.audit_notes])));
      setTrail(trailResult.status === "fulfilled" ? trailResult.value : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleFlag(r: PayrollRun) {
    await withAuth((token) => payrollApi.update(token, r.id, { discrepancy_flagged: !r.discrepancy_flagged }));
    await load();
  }

  async function saveNotes(r: PayrollRun) {
    setSavingId(r.id);
    try {
      await withAuth((token) => payrollApi.update(token, r.id, { audit_notes: notesDraft[r.id] ?? "" }));
      await load();
    } finally {
      setSavingId(null);
    }
  }

  const flaggedCount = runs.filter((r) => r.discrepancy_flagged).length;
  const needsReviewCount = runs.filter((r) => r.status === "Needs review").length;
  const reconciledCount = runs.filter((r) => r.status === "Reconciled").length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Payroll Audit &amp; Reconciliation Reports</h1>
        <p className="mt-1 text-sm text-ink-soft">Flag discrepancies and keep reconciliation notes per run.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Discrepancies flagged" value={String(flaggedCount)} valueTone={flaggedCount > 0 ? "maroon" : "ink"} />
        <StatCard label="Runs needing review" value={String(needsReviewCount)} />
        <StatCard label="Reconciled runs" value={String(reconciledCount)} />
      </div>

      <div className="flex flex-col gap-4">
        {runs.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-ink">{r.period}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[r.status]}`}>
                  {r.status}
                </span>
                {r.discrepancy_flagged && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-maroon-soft px-2.5 py-1 text-[11px] font-semibold text-maroon">
                    <AlertTriangle className="h-3 w-3" /> Discrepancy flagged
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-ink">{formatCurrency(Number(r.amount), r.currency)}</div>
            </div>

            <div className="mt-3 flex items-start gap-3">
              <textarea
                rows={2}
                value={notesDraft[r.id] ?? ""}
                onChange={(e) => setNotesDraft({ ...notesDraft, [r.id]: e.target.value })}
                placeholder="Reconciliation notes…"
                className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
              />
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => toggleFlag(r)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap ${
                    r.discrepancy_flagged ? "bg-maroon-soft text-maroon" : "bg-cream-dim text-ink-soft hover:text-ink"
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" /> {r.discrepancy_flagged ? "Unflag" : "Flag"}
                </button>
                <button
                  onClick={() => saveNotes(r)}
                  disabled={savingId === r.id}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-cream hover:bg-primary-dark disabled:opacity-60"
                >
                  {savingId === r.id ? "Saving…" : "Save notes"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && runs.length === 0 && (
          <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
            No payroll runs to audit yet.
          </div>
        )}
        {loading && <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-1.5 font-display text-sm font-bold text-ink">
          <History className="h-4 w-4" /> Audit trail
        </h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          {trail.length === 0 ? (
            <div className="p-10 text-center text-sm text-ink-soft">
              No payroll activity logged yet — reconciling, flagging, or processing a run will show up here.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {trail.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot[entry.tone]}`} />
                  <span className="flex-1 text-sm text-ink">{entry.message}</span>
                  <span className="shrink-0 text-xs text-ink-soft">{relativeTime(entry.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
