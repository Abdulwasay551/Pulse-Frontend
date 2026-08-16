"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  attendanceRecordsApi,
  attendanceRecordsCsv,
  employeesApi,
  type AttendanceRecord,
  type Employee,
} from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const ATTENDANCE_REQUIRED_FIELDS = ["employee"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  date: string;
  clock_in: string;
  clock_out: string;
  overtime_hours: string;
  notes: string;
}

function emptyForm(employees: Employee[]): FormState {
  return {
    employee: employees[0] ? String(employees[0].id) : "",
    date: new Date().toISOString().slice(0, 10),
    clock_in: "",
    clock_out: "",
    overtime_hours: "0",
    notes: "",
  };
}

export default function AttendancePageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <AttendancePage />
    </Suspense>
  );
}

function AttendancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOvertime = searchParams.get("view") === "overtime";
  const { withAuth } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ employee: "", date: "", clock_in: "", clock_out: "", overtime_hours: "0", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [r, e] = await withAuth((token) => Promise.all([attendanceRecordsApi.list(token), employeesApi.list(token)]));
      setRecords(r);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scoped = isOvertime ? records.filter((r) => Number(r.overtime_hours) > 0) : records;
  const searched = useTableSearch(scoped, (r) =>
    [r.employee_detail.name, r.date, r.clock_in, r.clock_out, r.notes].filter(Boolean).join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (r, key) => {
    switch (key) {
      case "employee":
        return r.employee_detail.name;
      case "date":
        return r.date;
      case "clock_in":
        return r.clock_in;
      case "clock_out":
        return r.clock_out;
      case "overtime_hours":
        return Number(r.overtime_hours);
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

  function openEdit(r: AttendanceRecord) {
    setEditing(r);
    setForm({
      employee: String(r.employee),
      date: r.date,
      clock_in: r.clock_in ?? "",
      clock_out: r.clock_out ?? "",
      overtime_hours: r.overtime_hours,
      notes: r.notes,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = isOvertime
      ? {
          employee: Number(form.employee),
          date: form.date,
          overtime_hours: form.overtime_hours || 0,
        }
      : {
          employee: Number(form.employee),
          date: form.date,
          clock_in: form.clock_in || null,
          clock_out: form.clock_out || null,
          notes: form.notes,
        };
    try {
      if (editing) {
        await withAuth((token) => attendanceRecordsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => attendanceRecordsApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: AttendanceRecord) {
    if (!confirm(`Delete this attendance record for ${r.employee_detail.name}?`)) return;
    await withAuth((token) => attendanceRecordsApi.remove(token, r.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {isOvertime ? "Overtime Tracking" : "Clock-in / Clock-out Tracking"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isOvertime
              ? "Flag and approve overtime hours across every employee."
              : "Daily clock-in and clock-out times per employee."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(isOvertime ? "/dashboard/attendance?view=clock" : "/dashboard/attendance?view=overtime")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              isOvertime ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"
            }`}
          >
            {isOvertime ? "Viewing overtime" : "View overtime"}
          </button>
          <CsvToolbar
            csv={attendanceRecordsCsv}
            resourceLabel="attendance records"
            requiredFields={ATTENDANCE_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New record
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Employee" sortKeyName="employee" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Date" sortKeyName="date" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              {isOvertime ? (
                <SortableTh
                  label="Overtime (Hours)"
                  sortKeyName="overtime_hours"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
              ) : (
                <>
                  <SortableTh label="Clock in" sortKeyName="clock_in" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Clock out" sortKeyName="clock_out" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-5 py-3 font-medium">Notes</th>
                </>
              )}
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={r.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Date">{r.date}</td>
                {isOvertime ? (
                  <td className="px-5 py-3.5" data-label="Overtime (Hours)">
                    {Number(r.overtime_hours) > 0 ? (
                      <span className="rounded-full bg-amber-soft px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-amber">
                        {r.overtime_hours}h
                      </span>
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </td>
                ) : (
                  <>
                    <td className="px-5 py-3.5 text-ink-soft" data-label="Clock in">{r.clock_in ?? "—"}</td>
                    <td className="px-5 py-3.5 text-ink-soft" data-label="Clock out">{r.clock_out ?? "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Notes">{r.notes || "—"}</td>
                  </>
                )}
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(r)}
                      aria-label={`Edit record for ${r.employee_detail.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      aria-label={`Delete record for ${r.employee_detail.name}`}
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
          <div className="p-10 text-center text-sm text-ink-soft">No attendance records yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {showForm && (
        <Modal
          title={editing ? "Edit attendance record" : isOvertime ? "New overtime record" : "New attendance record"}
          onClose={() => setShowForm(false)}
        >
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
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
              />
            </div>
            {isOvertime ? (
              <div className="mb-6">
                <label className={labelClass}>Overtime (Hours)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={form.overtime_hours}
                  onChange={(e) => setForm({ ...form, overtime_hours: e.target.value })}
                  className={inputClass}
                />
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Clock in</label>
                    <input
                      type="time"
                      value={form.clock_in}
                      onChange={(e) => setForm({ ...form, clock_in: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Clock out</label>
                    <input
                      type="time"
                      value={form.clock_out}
                      onChange={(e) => setForm({ ...form, clock_out: e.target.value })}
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
              </>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add record"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
