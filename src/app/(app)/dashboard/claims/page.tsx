"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, type Employee } from "@/lib/people-api";
import {
  benefitPlansApi,
  benefitClaimsApi,
  benefitClaimsCsv,
  type BenefitPlan,
  type BenefitClaim,
  type ClaimStatus,
} from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

const BENEFIT_CLAIM_REQUIRED_FIELDS = ["employee", "claim_type", "amount"];

const statusOptions: ClaimStatus[] = ["Submitted", "Under Review", "Approved", "Rejected", "Paid"];

const statusTone: Record<ClaimStatus, string> = {
  Submitted: "bg-cream-dim text-ink-soft",
  "Under Review": "bg-amber-soft text-amber",
  Approved: "bg-primary/15 text-primary",
  Rejected: "bg-maroon-soft text-maroon",
  Paid: "bg-primary/15 text-primary",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  plan: string;
  claim_type: string;
  amount: string;
  description: string;
}
const emptyForm: FormState = { employee: "", plan: "", claim_type: "", amount: "0", description: "" };

export default function ClaimsPage() {
  const { withAuth } = useAuth();
  const [claims, setClaims] = useState<BenefitClaim[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // allSettled — Department Head has no BenefitPlan access here (only
      // claims, read-only), so that one 403 shouldn't blank the page.
      const [cResult, eResult, pResult] = await withAuth((token) =>
        Promise.allSettled([benefitClaimsApi.list(token), employeesApi.list(token), benefitPlansApi.list(token)])
      );
      setClaims(cResult.status === "fulfilled" ? cResult.value : []);
      setEmployees(eResult.status === "fulfilled" ? eResult.value : []);
      setPlans(pResult.status === "fulfilled" ? pResult.value : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ ...emptyForm, employee: employees[0] ? String(employees[0].id) : "" });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        benefitClaimsApi.create(token, {
          employee: Number(form.employee),
          plan: form.plan ? Number(form.plan) : null,
          claim_type: form.claim_type,
          amount: form.amount,
          description: form.description,
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

  async function updateStatus(c: BenefitClaim, status: ClaimStatus) {
    await withAuth((token) => benefitClaimsApi.update(token, c.id, { status }));
    await load();
  }

  async function handleDelete(c: BenefitClaim) {
    if (!confirm(`Delete this claim for ${c.employee_detail.name}?`)) return;
    await withAuth((token) => benefitClaimsApi.remove(token, c.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Claims, Reimbursement &amp; Bonus Workflows</h1>
          <p className="mt-1 text-sm text-ink-soft">Submission and approval workflow, per claim — including employee bonuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={benefitClaimsCsv}
            resourceLabel="benefit claims"
            requiredFields={BENEFIT_CLAIM_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New claim
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Claim</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5 font-semibold text-ink" data-label="Employee">
                  <EmployeeLink employee={c.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Claim">{c.claim_type}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Plan">{c.plan_name || "—"}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Amount">${c.amount}</td>
                <td className="px-5 py-3.5" data-label="Status">
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c, e.target.value as ClaimStatus)}
                    className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold ${statusTone[c.status]}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(c)}
                      aria-label={`Delete claim for ${c.employee_detail.name}`}
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
        {!loading && claims.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No claims submitted yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title="New claim" onClose={() => setShowForm(false)}>
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
              <label className={labelClass}>Related plan (optional)</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Claim type</label>
              <input
                required
                value={form.claim_type}
                onChange={(e) => setForm({ ...form, claim_type: e.target.value })}
                placeholder="Specialist visit copay, or Bonus"
                className={inputClass}
                list="claim-types"
              />
              <datalist id="claim-types">
                <option value="Bonus" />
                <option value="Specialist visit copay" />
                <option value="Prescription reimbursement" />
                <option value="Dental cleaning" />
              </datalist>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Submitting…" : "Submit claim"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
