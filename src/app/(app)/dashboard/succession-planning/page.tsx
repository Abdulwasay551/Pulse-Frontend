"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { successionPlansApi, type NineBoxRating, type SuccessionPlan } from "@/lib/talent-api";
import { employeesApi, type Employee } from "@/lib/people-api";

const ratingOptions: NineBoxRating[] = ["Low", "Medium", "High"];
// Rendered top-to-bottom as High/Medium/Low potential (rows), left-to-right
// as Low/Medium/High performance (columns) — the conventional 9-box layout.
const potentialRows: NineBoxRating[] = ["High", "Medium", "Low"];
const performanceCols: NineBoxRating[] = ["Low", "Medium", "High"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

export default function SuccessionPlanningPage() {
  const { withAuth } = useAuth();
  const [plans, setPlans] = useState<SuccessionPlan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", potential_rating: "Medium" as NineBoxRating, performance_rating: "Medium" as NineBoxRating, successor_notes: "", ready_now: false });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [p, e] = await withAuth((token) => Promise.all([successionPlansApi.list(token), employeesApi.list(token)]));
      setPlans(p);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ employee: employees[0] ? String(employees[0].id) : "", potential_rating: "Medium", performance_rating: "Medium", successor_notes: "", ready_now: false });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await withAuth((token) =>
        successionPlansApi.create(token, {
          employee: Number(form.employee),
          potential_rating: form.potential_rating,
          performance_rating: form.performance_rating,
          successor_notes: form.successor_notes,
          ready_now: form.ready_now,
        })
      );
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: SuccessionPlan) {
    if (!confirm(`Remove ${p.employee_detail.name} from succession planning?`)) return;
    await withAuth((token) => successionPlansApi.remove(token, p.id));
    await load();
  }

  async function toggleReady(p: SuccessionPlan) {
    await withAuth((token) => successionPlansApi.update(token, p.id, { ready_now: !p.ready_now }));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Succession Planning / 9-Box Grid</h1>
          <p className="mt-1 text-sm text-ink-soft">Potential × performance, and succession candidates.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark">
          <Plus className="h-4 w-4" /> Add to grid
        </button>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-card p-6">
        <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-2">
          <div />
          {performanceCols.map((col) => (
            <div key={col} className="text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {col} performance
            </div>
          ))}
          {potentialRows.map((row) => (
            <div key={row} className="contents">
              <div className="flex items-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{row} potential</div>
              {performanceCols.map((col) => {
                const cellPlans = plans.filter((p) => p.potential_rating === row && p.performance_rating === col);
                return (
                  <div key={col} className="min-h-[90px] rounded-xl border border-line bg-cream p-2">
                    <div className="flex flex-col gap-1">
                      {cellPlans.map((p) => (
                        <span key={p.id} className="truncate rounded-full bg-card px-2 py-1 text-[11px] font-semibold text-ink">
                          {p.employee_detail.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Potential</th>
              <th className="px-5 py-3 font-medium">Performance</th>
              <th className="px-5 py-3 font-medium">Ready now</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={p.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Potential">{p.potential_rating}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Performance">{p.performance_rating}</td>
                <td className="px-5 py-3.5" data-label="Ready now">
                  <button
                    onClick={() => toggleReady(p)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${p.ready_now ? "bg-primary/15 text-primary" : "bg-cream-dim text-ink-soft"}`}
                  >
                    {p.ready_now ? "Ready now" : "Not yet"}
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => handleDelete(p)} aria-label={`Remove ${p.employee_detail.name}`} className="eh-row-actions rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && plans.length === 0 && <div className="p-10 text-center text-sm text-ink-soft">No one mapped yet.</div>}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title="Add to succession grid" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={labelClass}>Employee</label>
              <select required value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className={inputClass}>
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Potential</label>
                <select value={form.potential_rating} onChange={(e) => setForm({ ...form, potential_rating: e.target.value as NineBoxRating })} className={inputClass}>
                  {ratingOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Performance</label>
                <select value={form.performance_rating} onChange={(e) => setForm({ ...form, performance_rating: e.target.value as NineBoxRating })} className={inputClass}>
                  {ratingOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Successor notes</label>
              <textarea rows={3} value={form.successor_notes} onChange={(e) => setForm({ ...form, successor_notes: e.target.value })} className={inputClass} />
            </div>
            <label className="mb-6 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.ready_now} onChange={(e) => setForm({ ...form, ready_now: e.target.checked })} className="h-4 w-4 rounded border-line" />
              Ready for succession now
            </label>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Saving…" : "Add to grid"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
