"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, leaveRequestsApi, type Employee, type LeaveRequest, type LeaveStatus, type LeaveType } from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const statusTone: Record<LeaveStatus, string> = {
  Pending: "bg-amber-soft text-amber",
  Approved: "bg-primary/15 text-primary",
  Rejected: "bg-maroon-soft text-maroon",
};

const typeOptions: LeaveType[] = ["Vacation", "Sick", "Personal", "Unpaid", "Other"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

export default function LeaveRequestsPage() {
  const { withAuth } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", leave_type: "Vacation" as LeaveType, start_date: "", end_date: "", hours: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [r, e] = await withAuth((token) => Promise.all([leaveRequestsApi.list(token), employeesApi.list(token)]));
      setRequests(r);
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
    setForm({
      employee: employees[0] ? String(employees[0].id) : "",
      leave_type: "Vacation",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      hours: "",
      reason: "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        leaveRequestsApi.create(token, {
          employee: Number(form.employee),
          leave_type: form.leave_type,
          start_date: form.start_date,
          end_date: form.end_date,
          hours: form.hours === "" ? null : form.hours,
          reason: form.reason,
        })
      );
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(r: LeaveRequest, status: LeaveStatus) {
    await withAuth((token) => leaveRequestsApi.update(token, r.id, { status }));
    await load();
  }

  async function handleDelete(r: LeaveRequest) {
    if (!confirm(`Delete this leave request for ${r.employee_detail.name}?`)) return;
    await withAuth((token) => leaveRequestsApi.remove(token, r.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Time Off</h1>
          <p className="mt-1 text-sm text-ink-soft">Requests, approvals, and balances.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New request
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Dates</th>
              <th className="px-5 py-3 font-medium">Hours</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={r.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Type">{r.leave_type}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Dates">
                  {r.start_date} → {r.end_date}
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Hours">{r.hours ?? "—"}</td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    {r.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(r, "Approved")}
                          aria-label={`Approve leave for ${r.employee_detail.name}`}
                          className="rounded-lg p-1.5 text-ink-soft hover:bg-primary/15 hover:text-primary"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => updateStatus(r, "Rejected")}
                          aria-label={`Reject leave for ${r.employee_detail.name}`}
                          className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(r)}
                      aria-label={`Delete leave request for ${r.employee_detail.name}`}
                      className="eh-row-actions rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && requests.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No leave requests yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title="New leave request" onClose={() => setShowForm(false)}>
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
              <label className={labelClass}>Type</label>
              <select
                value={form.leave_type}
                onChange={(e) => setForm({ ...form, leave_type: e.target.value as LeaveType })}
                className={inputClass}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start date</label>
                <input
                  required
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>End date</label>
                <input
                  required
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Hours</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                placeholder="Not known"
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Reason</label>
              <textarea
                rows={2}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
