"use client";

import { Suspense, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import { goalsApi, goalsCsv, type Goal, type GoalStatus } from "@/lib/talent-api";
import { employeesApi, type Employee, type EmployeeLite } from "@/lib/people-api";
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
  section: string;
  description: string;
  target_date: string;
  status: GoalStatus;
  progress: string;
}

export default function GoalsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <GoalsPage />
    </Suspense>
  );
}

function GoalsPage() {
  const { withAuth } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState("All");

  const [editing, setEditing] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ employee: "", title: "", section: "", description: "", target_date: "", status: "Not Started", progress: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeLite | null>(null);

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

  const sections = ["All", ...Array.from(new Set(goals.map((g) => g.section).filter(Boolean)))];
  const visibleGoals = sectionFilter === "All" ? goals : goals.filter((g) => g.section === sectionFilter);
  const searchedGoals = useTableSearch(visibleGoals, (g) =>
    [g.employee_detail.name, g.title, g.section, g.status].filter(Boolean).join(" ")
  );
  const { sorted: sortedGoals, sortKey, sortDir, toggleSort } = useSortableList(searchedGoals, (g, key) => {
    switch (key) {
      case "employee":
        return g.employee_detail.name;
      case "goal":
        return g.title;
      case "section":
        return g.section;
      case "target_date":
        return g.target_date;
      case "progress":
        return g.progress;
      case "status":
        return g.status;
      default:
        return null;
    }
  });
  const { pageItems: pagedGoals, page, setPage, totalPages, total, pageSize } = usePagination(sortedGoals);

  const employeeGoals = employeeDetail ? goals.filter((g) => g.employee === employeeDetail.id) : [];
  const employeeCompleted = employeeGoals.filter((g) => g.status === "Completed").length;
  const employeeInProgress = employeeGoals.filter((g) => g.status === "In Progress").length;
  const employeeAvgProgress = employeeGoals.length
    ? Math.round(employeeGoals.reduce((sum, g) => sum + g.progress, 0) / employeeGoals.length)
    : 0;

  function openEmployeeDetail(g: Goal) {
    setEmployeeDetail(g.employee_detail);
  }

  function openCreate() {
    setEditing(null);
    setForm({ employee: employees[0] ? String(employees[0].id) : "", title: "", section: "", description: "", target_date: "", status: "Not Started", progress: "0" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setForm({
      employee: String(g.employee),
      title: g.title,
      section: g.section,
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
      section: form.section,
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

      {sections.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSectionFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                sectionFilter === s ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Employee" sortKeyName="employee" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Goal" sortKeyName="goal" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Section" sortKeyName="section" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Target date" sortKeyName="target_date" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Progress" sortKeyName="progress" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {pagedGoals.map((g) => (
              <tr
                key={g.id}
                onClick={() => openEmployeeDetail(g)}
                className="group cursor-pointer border-b border-line last:border-0 hover:bg-cream/60"
              >
                <td className="px-5 py-3.5" data-label="Employee" onClick={(e) => e.stopPropagation()}>
                  <EmployeeLink employee={g.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink" data-label="Goal">{g.title}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Section">{g.section || "—"}</td>
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
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
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
        {!loading && pagedGoals.length === 0 && <div className="p-10 text-center text-sm text-ink-soft">No goals yet.</div>}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
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
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Section</label>
                <input
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  placeholder="e.g. Q3 OKRs"
                  className={inputClass}
                  list="goal-sections"
                />
                <datalist id="goal-sections">
                  {sections.filter((s) => s !== "All").map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
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

      {employeeDetail && (
        <Modal title={employeeDetail.name} onClose={() => setEmployeeDetail(null)}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {employeeDetail.initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{employeeDetail.job_title || "—"}</div>
              <div className="text-xs text-ink-soft">{employeeDetail.department || "—"}</div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-line bg-cream/60 p-3 text-center">
              <div className="text-lg font-bold text-ink">{employeeGoals.length}</div>
              <div className="text-[11px] uppercase tracking-wide text-ink-soft">Goals</div>
            </div>
            <div className="rounded-lg border border-line bg-cream/60 p-3 text-center">
              <div className="text-lg font-bold text-primary">{employeeCompleted}</div>
              <div className="text-[11px] uppercase tracking-wide text-ink-soft">Completed</div>
            </div>
            <div className="rounded-lg border border-line bg-cream/60 p-3 text-center">
              <div className="text-lg font-bold text-ink">{employeeAvgProgress}%</div>
              <div className="text-[11px] uppercase tracking-wide text-ink-soft">Avg progress</div>
            </div>
          </div>

          <div className="mb-2 text-xs uppercase tracking-wide text-ink-soft">
            {employeeInProgress} in progress
          </div>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {employeeGoals.map((g) => (
              <div key={g.id} className="rounded-lg border border-line p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{g.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[g.status]}`}>
                    {g.status}
                  </span>
                </div>
                <div className="mb-2 flex items-center gap-3 text-xs text-ink-soft">
                  <span>{g.section || "No section"}</span>
                  <span>Target: {g.target_date ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${g.progress}%` }} />
                  </div>
                  <span className="shrink-0 text-xs text-ink-soft">{g.progress}%</span>
                </div>
              </div>
            ))}
            {employeeGoals.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-soft">No goals for this employee yet.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
