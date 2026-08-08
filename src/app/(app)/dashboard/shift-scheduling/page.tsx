"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, shiftsApi, shiftsCsv, type Employee, type Shift } from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const SHIFT_REQUIRED_FIELDS = ["employee", "start_time", "end_time"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
}

export default function ShiftSchedulingPage() {
  const { withAuth } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [editing, setEditing] = useState<Shift | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({
    employee: "",
    date: new Date().toISOString().slice(0, 10),
    start_time: "09:00",
    end_time: "17:00",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [s, e] = await withAuth((token) => Promise.all([shiftsApi.list(token), employeesApi.list(token)]));
      setShifts(s);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = ["All", ...Array.from(new Set(employees.map((e) => e.department).filter(Boolean)))];
  const visible =
    departmentFilter === "All" ? shifts : shifts.filter((s) => s.employee_detail.department === departmentFilter);

  function openCreate() {
    setEditing(null);
    setForm({
      employee: employees[0] ? String(employees[0].id) : "",
      date: new Date().toISOString().slice(0, 10),
      start_time: "09:00",
      end_time: "17:00",
      notes: "",
    });
    setError(null);
    setShowForm(true);
  }

  function openEdit(s: Shift) {
    setEditing(s);
    setForm({ employee: String(s.employee), date: s.date, start_time: s.start_time, end_time: s.end_time, notes: s.notes });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      employee: Number(form.employee),
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      notes: form.notes,
    };
    try {
      if (editing) {
        await withAuth((token) => shiftsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => shiftsApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s: Shift) {
    if (!confirm(`Delete this shift for ${s.employee_detail.name}?`)) return;
    await withAuth((token) => shiftsApi.remove(token, s.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Shift Scheduling per Department</h1>
          <p className="mt-1 text-sm text-ink-soft">Plan and track shifts, filterable by department.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar csv={shiftsCsv} resourceLabel="shifts" requiredFields={SHIFT_REQUIRED_FIELDS} onImported={load} />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New shift
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDepartmentFilter(d)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              departmentFilter === d ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Shift</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={s.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Department">{s.employee_detail.department || "—"}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Date">{s.date}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Shift">
                  {s.start_time}–{s.end_time}
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(s)}
                      aria-label={`Edit shift for ${s.employee_detail.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      aria-label={`Delete shift for ${s.employee_detail.name}`}
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
        {!loading && visible.length === 0 && <div className="p-10 text-center text-sm text-ink-soft">No shifts yet.</div>}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit shift" : "New shift"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Employee</label>
              <select
                required
                value={form.employee}
                onChange={(e) => setForm({ ...form, employee: e.target.value })}
                className={inputClass}
              >
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>End</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add shift"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
