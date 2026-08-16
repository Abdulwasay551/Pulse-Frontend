"use client";

import { Suspense, useEffect, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
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
  employeesApi,
  promotionRequestsApi,
  promotionRequestsCsv,
  type Employee,
  type PromotionRequest,
  type PromotionStatus,
} from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const PROMOTION_REQUEST_REQUIRED_FIELDS = ["employee"];

const statusTone: Record<PromotionStatus, string> = {
  Pending: "bg-amber-soft text-amber",
  Approved: "bg-primary/15 text-primary",
  Rejected: "bg-maroon-soft text-maroon",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

export default function PromotionsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <PromotionsPage />
    </Suspense>
  );
}

function PromotionsPage() {
  const { withAuth } = useAuth();
  const [requests, setRequests] = useState<PromotionRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee: "",
    from_title: "",
    to_title: "",
    from_department: "",
    to_department: "",
    effective_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [r, e] = await withAuth((token) => Promise.all([promotionRequestsApi.list(token), employeesApi.list(token)]));
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

  const searched = useTableSearch(requests, (r) =>
    [r.employee_detail.name, r.from_title, r.to_title, r.from_department, r.to_department, r.status]
      .filter(Boolean)
      .join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (r, key) => {
    switch (key) {
      case "employee":
        return r.employee_detail.name;
      case "from":
        return r.from_title;
      case "to":
        return r.to_title;
      case "effective_date":
        return r.effective_date;
      case "status":
        return r.status;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  function openCreate() {
    const first = employees[0];
    setForm({
      employee: first ? String(first.id) : "",
      from_title: first?.job_title ?? "",
      to_title: "",
      from_department: first?.department ?? "",
      to_department: "",
      effective_date: "",
      notes: "",
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
        promotionRequestsApi.create(token, {
          employee: Number(form.employee),
          from_title: form.from_title,
          to_title: form.to_title,
          from_department: form.from_department,
          to_department: form.to_department,
          effective_date: form.effective_date || null,
          notes: form.notes,
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

  async function updateStatus(r: PromotionRequest, status: PromotionStatus) {
    await withAuth((token) => promotionRequestsApi.update(token, r.id, { status }));
    await load();
  }

  async function handleDelete(r: PromotionRequest) {
    if (!confirm(`Delete this promotion request for ${r.employee_detail.name}?`)) return;
    await withAuth((token) => promotionRequestsApi.remove(token, r.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Promotion & Transfer Workflows</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Structured internal moves — approving updates the employee&apos;s title/department automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={promotionRequestsCsv}
            resourceLabel="promotion requests"
            requiredFields={PROMOTION_REQUEST_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New request
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Employee" sortKeyName="employee" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="From" sortKeyName="from" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="To" sortKeyName="to" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh
                label="Effective"
                sortKeyName="effective_date"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={r.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="From">
                  {r.from_title || "—"}
                  {r.from_department && <div className="text-xs">{r.from_department}</div>}
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="To">
                  {r.to_title || "—"}
                  {r.to_department && <div className="text-xs">{r.to_department}</div>}
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Effective">{r.effective_date ?? "—"}</td>
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
                          aria-label={`Approve promotion for ${r.employee_detail.name}`}
                          className="rounded-lg p-1.5 text-ink-soft hover:bg-primary/15 hover:text-primary"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => updateStatus(r, "Rejected")}
                          aria-label={`Reject promotion for ${r.employee_detail.name}`}
                          className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(r)}
                      aria-label={`Delete promotion request for ${r.employee_detail.name}`}
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
        {!loading && visible.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No promotion or transfer requests yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {showForm && (
        <Modal title="New promotion / transfer request" onClose={() => setShowForm(false)} wide>
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
                onChange={(e) => {
                  const emp = employees.find((x) => String(x.id) === e.target.value);
                  setForm({
                    ...form,
                    employee: e.target.value,
                    from_title: emp?.job_title ?? "",
                    from_department: emp?.department ?? "",
                  });
                }}
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
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>From title</label>
                <input
                  value={form.from_title}
                  onChange={(e) => setForm({ ...form, from_title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>To title</label>
                <input
                  value={form.to_title}
                  onChange={(e) => setForm({ ...form, to_title: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>From department</label>
                <input
                  value={form.from_department}
                  onChange={(e) => setForm({ ...form, from_department: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>To department</label>
                <input
                  value={form.to_department}
                  onChange={(e) => setForm({ ...form, to_department: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Effective date</label>
              <input
                type="date"
                value={form.effective_date}
                onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                className={inputClass}
              />
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
              {saving ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
