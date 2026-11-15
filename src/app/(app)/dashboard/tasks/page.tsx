"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import { tasksApi, employeesApi, type Task, type TaskStatus, type Employee } from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

const STATUS_OPTIONS: TaskStatus[] = ["Pending", "In Progress", "Completed"];

const toneForStatus: Record<TaskStatus, string> = {
  Pending: "bg-cream-dim text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Completed: "bg-primary/15 text-primary",
};

interface FormState {
  employee: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string;
}

function emptyForm(employees: Employee[]): FormState {
  return {
    employee: employees[0] ? String(employees[0].id) : "",
    title: "",
    description: "",
    status: "Pending",
    due_date: "",
  };
}

export default function TasksPage() {
  const { withAuth } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ employee: "", title: "", description: "", status: "Pending", due_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [t, e] = await withAuth((token) => Promise.all([tasksApi.list(token), employeesApi.list(token)]));
      setTasks(t);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searched = useTableSearch(tasks, (t) => [t.employee_detail.name, t.title, t.status, t.description].filter(Boolean).join(" "));
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (t, key) => {
    switch (key) {
      case "employee":
        return t.employee_detail.name;
      case "title":
        return t.title;
      case "status":
        return t.status;
      case "due_date":
        return t.due_date;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(employees));
    setError(null);
    setShowForm(true);
  }

  function openEdit(t: Task) {
    setEditing(t);
    setForm({
      employee: String(t.employee),
      title: t.title,
      description: t.description,
      status: t.status,
      due_date: t.due_date ?? "",
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
      status: form.status,
      due_date: form.due_date || null,
    };
    try {
      if (editing) {
        await withAuth((token) => tasksApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => tasksApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: Task) {
    if (!confirm(`Delete "${t.title}" for ${t.employee_detail.name}?`)) return;
    await withAuth((token) => tasksApi.remove(token, t.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Task Assignment</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Assign day-to-day tasks to your team and review what they mark done — employees see and complete their
            own from the clock-out prompt or their dashboard.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New task
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Employee" sortKeyName="employee" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Task" sortKeyName="title" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Due" sortKeyName="due_date" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium">Completion notes</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={t.employee_detail} />
                </td>
                <td className="px-5 py-3.5" data-label="Task">
                  <div className="font-medium text-ink">{t.title}</div>
                  {t.description && <div className="text-xs text-ink-soft">{t.description}</div>}
                </td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${toneForStatus[t.status]}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Due">{t.due_date ?? "—"}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Completion notes">{t.completion_notes || "—"}</td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(t)}
                      aria-label={`Edit task ${t.title}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      aria-label={`Delete task ${t.title}`}
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
        {!loading && visible.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No tasks assigned yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {showForm && (
        <Modal title={editing ? "Edit task" : "New task"} onClose={() => setShowForm(false)}>
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
                disabled={!!editing}
                value={form.employee}
                onChange={(e) => setForm({ ...form, employee: e.target.value })}
                className={`${inputClass} disabled:opacity-60`}
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
              <label className={labelClass}>Task</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="e.g. Follow up with finance on Q3 invoices"
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Due date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Assign task"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
