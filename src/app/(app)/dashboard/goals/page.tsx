"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { goalsApi, goalsCsv, type Goal, type GoalStatus } from "@/lib/talent-api";
import { employeesApi, type Employee } from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const GOAL_REQUIRED_FIELDS = ["employee", "title"];

const statusTone: Record<GoalStatus, string> = {
  "Not Started": "bg-cream-dim text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Completed: "bg-primary/15 text-primary",
};

const statusOptions: GoalStatus[] = ["Not Started", "In Progress", "Completed"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  title: string;
  description: string;
  target_date: string;
  status: GoalStatus;
  progress: string;
}

export default function GoalsPage() {
  const { withAuth } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ employee: "", title: "", description: "", target_date: "", status: "Not Started", progress: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [g, e] = await withAuth((token) => Promise.all([goalsApi.list(token), employeesApi.list(token)]));
      setGoals(g);
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
    setEditing(null);
    setForm({ employee: employees[0] ? String(employees[0].id) : "", title: "", description: "", target_date: "", status: "Not Started", progress: "0" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setForm({
      employee: String(g.employee),
      title: g.title,
      description: g.description,
      target_date: g.target_date ?? "",
      status: g.status,
      progress: String(g.progress),
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      employee: Number(form.employee),
      title: form.title,
      description: form.description,
      target_date: form.target_date || null,
      status: form.status,
      progress: Number(form.progress),
    };
    try {
      if (editing) {
        await withAuth((token) => goalsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => goalsApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(g: Goal) {
    if (!confirm(`Delete goal "${g.title}"?`)) return;
    await withAuth((token) => goalsApi.remove(token, g.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Goal Setting & KPIs</h1>
          <p className="mt-1 text-sm text-ink-soft">Set and track goals per employee.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar csv={goalsCsv} resourceLabel="goals" requiredFields={GOAL_REQUIRED_FIELDS} onImported={load} />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New goal
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Goal</th>
              <th className="px-5 py-3 font-medium">Target date</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={g.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink" data-label="Goal">{g.title}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Target date">{g.target_date ?? "—"}</td>
                <td className="px-5 py-3.5" data-label="Progress">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-cream-dim">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${g.progress}%` }} />
                    </div>
                    <span className="text-xs text-ink-soft">{g.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[g.status]}`}>
                    {g.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(g)} aria-label={`Edit ${g.title}`} className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(g)} aria-label={`Delete ${g.title}`} className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && goals.length === 0 && <div className="p-10 text-center text-sm text-ink-soft">No goals yet.</div>}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit goal" : "New goal"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Employee</label>
              <select required disabled={!!editing} value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className={`${inputClass} disabled:opacity-60`}>
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Target date</label>
                <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as GoalStatus })} className={inputClass}>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Progress (%)</label>
              <input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save changes" : "Add goal"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
