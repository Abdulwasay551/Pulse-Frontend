"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Modal from "@/components/dashboard/Modal";
import { useAuth } from "@/lib/auth-context";
import { payrollApi, type PayrollRun, type PayrollStatus } from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

const statusTone: Record<PayrollStatus, string> = {
  Reconciled: "bg-primary/15 text-primary",
  "Needs review": "bg-amber-soft text-amber",
  Processing: "bg-cream-dim text-ink-soft",
};

const statusOptions: PayrollStatus[] = ["Reconciled", "Needs review", "Processing"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  period: string;
  contractors: string;
  amount: string;
  status: PayrollStatus;
}

const emptyForm: FormState = { period: "", contractors: "0", amount: "0", status: "Processing" };

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function PayrollPage() {
  const { withAuth } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<PayrollRun | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await withAuth((token) => payrollApi.list(token));
      setPayrollRuns(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalProcessed = payrollRuns.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalContractors = payrollRuns.reduce((sum, p) => sum + p.contractors, 0);
  const pendingRuns = payrollRuns.filter((p) => p.status !== "Reconciled").length;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(p: PayrollRun) {
    setEditing(p);
    setForm({ period: p.period, contractors: String(p.contractors), amount: p.amount, status: p.status });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      period: form.period,
      contractors: Number(form.contractors),
      amount: form.amount,
      status: form.status,
    };
    try {
      if (editing) {
        await withAuth((token) => payrollApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => payrollApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: PayrollRun) {
    if (!confirm(`Delete payroll run "${p.period}"?`)) return;
    await withAuth((token) => payrollApi.remove(token, p.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Payroll</h1>
          <p className="mt-1 text-sm text-ink-soft">Contractor and placement payouts, run by run.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Run payroll
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total processed" value={formatCurrency(totalProcessed)} href="/dashboard/analytics" />
        <StatCard label="Contractors paid" value={String(totalContractors)} href="/dashboard/candidates" />
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
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Run</th>
              <th className="px-5 py-3 font-medium">Contractors</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((p) => (
              <tr key={p.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5 font-semibold text-ink">{p.period}</td>
                <td className="px-5 py-3.5 text-ink-soft">{p.contractors}</td>
                <td className="px-5 py-3.5 font-semibold text-ink">{formatCurrency(Number(p.amount))}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.period}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      aria-label={`Delete ${p.period}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && payrollRuns.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No payroll runs yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit payroll run" : "New payroll run"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Period / label</label>
              <input
                required
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="August 2026, Run 1"
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Contractors</label>
                <input
                  type="number"
                  min="0"
                  value={form.contractors}
                  onChange={(e) => setForm({ ...form, contractors: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PayrollStatus })}
                className={inputClass}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add payroll run"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
