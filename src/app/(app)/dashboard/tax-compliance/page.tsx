"use client";

import { Suspense, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import StatCard from "@/components/dashboard/StatCard";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import { employeesApi, type Employee } from "@/lib/people-api";
import {
  taxProfilesApi,
  taxProfilesCsv,
  type TaxProfile,
  type FilingStatus,
  type ComplianceStatus,
} from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

const TAX_PROFILE_REQUIRED_FIELDS = ["employee", "country"];

const filingOptions: FilingStatus[] = ["Single", "Married", "Head of Household", "Not Applicable"];
const complianceOptions: ComplianceStatus[] = ["Compliant", "Pending Review", "Action Required"];

const complianceTone: Record<ComplianceStatus, string> = {
  Compliant: "bg-primary/15 text-primary",
  "Pending Review": "bg-amber-soft text-amber",
  "Action Required": "bg-maroon-soft text-maroon",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  country: string;
  tax_id: string;
  filing_status: FilingStatus;
  compliance_status: ComplianceStatus;
  notes: string;
  last_reviewed: string;
}

const emptyForm: FormState = {
  employee: "",
  country: "",
  tax_id: "",
  filing_status: "Not Applicable",
  compliance_status: "Pending Review",
  notes: "",
  last_reviewed: "",
};

export default function TaxCompliancePageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <TaxCompliancePage />
    </Suspense>
  );
}

function TaxCompliancePage() {
  const { withAuth } = useAuth();
  const [profiles, setProfiles] = useState<TaxProfile[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<TaxProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [p, e] = await withAuth((token) => Promise.all([taxProfilesApi.list(token), employeesApi.list(token)]));
      setProfiles(p);
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
    setForm({ ...emptyForm, employee: employees[0] ? String(employees[0].id) : "" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(p: TaxProfile) {
    setEditing(p);
    setForm({
      employee: String(p.employee),
      country: p.country,
      tax_id: p.tax_id,
      filing_status: p.filing_status,
      compliance_status: p.compliance_status,
      notes: p.notes,
      last_reviewed: p.last_reviewed ?? "",
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
      country: form.country,
      tax_id: form.tax_id,
      filing_status: form.filing_status,
      compliance_status: form.compliance_status,
      notes: form.notes,
      last_reviewed: form.last_reviewed || null,
    };
    try {
      if (editing) {
        await withAuth((token) => taxProfilesApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => taxProfilesApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: TaxProfile) {
    if (!confirm(`Delete the tax profile for ${p.employee_detail.name}?`)) return;
    await withAuth((token) => taxProfilesApi.remove(token, p.id));
    await load();
  }

  const compliantCount = profiles.filter((p) => p.compliance_status === "Compliant").length;
  const pendingCount = profiles.filter((p) => p.compliance_status === "Pending Review").length;
  const actionRequiredCount = profiles.filter((p) => p.compliance_status === "Action Required").length;
  const countryCount = new Set(profiles.map((p) => p.country)).size;

  const searched = useTableSearch(profiles, (p) =>
    [p.employee_detail.name, p.country, p.tax_id, p.filing_status, p.compliance_status, p.notes].filter(Boolean).join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (p, key) => {
    switch (key) {
      case "employee":
        return p.employee_detail.name;
      case "country":
        return p.country;
      case "filing_status":
        return p.filing_status;
      case "compliance_status":
        return p.compliance_status;
      case "last_reviewed":
        return p.last_reviewed;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Multi-Country Tax Compliance</h1>
          <p className="mt-1 text-sm text-ink-soft">Stay compliant across every jurisdiction you employ people in.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={taxProfilesCsv}
            resourceLabel="tax profiles"
            requiredFields={TAX_PROFILE_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New tax profile
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Countries" value={String(countryCount)} />
        <StatCard label="Compliant" value={String(compliantCount)} />
        <StatCard label="Pending review" value={String(pendingCount)} />
        <StatCard label="Action required" value={String(actionRequiredCount)} valueTone={actionRequiredCount > 0 ? "maroon" : "ink"} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Employee" sortKeyName="employee" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Country" sortKeyName="country" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Filing status" sortKeyName="filing_status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Compliance" sortKeyName="compliance_status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Last reviewed" sortKeyName="last_reviewed" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr
                key={p.id}
                onClick={() => openEdit(p)}
                className="group cursor-pointer border-b border-line last:border-0 hover:bg-cream/60"
              >
                <td className="px-5 py-3.5 font-semibold text-ink" data-label="Employee" onClick={(e) => e.stopPropagation()}>
                  <EmployeeLink employee={p.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Country">{p.country}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Filing status">{p.filing_status}</td>
                <td className="px-5 py-3.5" data-label="Compliance">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${complianceTone[p.compliance_status]}`}
                  >
                    {p.compliance_status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Last reviewed">{p.last_reviewed ?? "—"}</td>
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(p)}
                      aria-label={`Edit tax profile for ${p.employee_detail.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      aria-label={`Delete tax profile for ${p.employee_detail.name}`}
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
          <div className="p-10 text-center text-sm text-ink-soft">No tax profiles yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {showForm && (
        <Modal title={editing ? "Edit tax profile" : "New tax profile"} onClose={() => setShowForm(false)}>
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
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Country</label>
                <input
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="United States"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tax ID</label>
                <input
                  value={form.tax_id}
                  onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Filing status</label>
                <select
                  value={form.filing_status}
                  onChange={(e) => setForm({ ...form, filing_status: e.target.value as FilingStatus })}
                  className={inputClass}
                >
                  {filingOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Compliance status</label>
                <select
                  value={form.compliance_status}
                  onChange={(e) => setForm({ ...form, compliance_status: e.target.value as ComplianceStatus })}
                  className={inputClass}
                >
                  {complianceOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Last reviewed</label>
              <input
                type="date"
                value={form.last_reviewed}
                onChange={(e) => setForm({ ...form, last_reviewed: e.target.value })}
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
              {saving ? "Saving…" : editing ? "Save changes" : "Add tax profile"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
