"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, type Employee } from "@/lib/people-api";
import {
  benefitPlansApi,
  benefitPlansCsv,
  benefitEnrollmentsApi,
  benefitEnrollmentsCsv,
  type BenefitPlan,
  type BenefitPlanType,
  type BenefitEnrollment,
  type CoverageLevel,
  type EnrollmentStatus,
} from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

const BENEFIT_PLAN_REQUIRED_FIELDS = ["name"];
const BENEFIT_ENROLLMENT_REQUIRED_FIELDS = ["employee", "plan"];

const planTypeOptions: BenefitPlanType[] = ["Health", "Dental", "Vision", "Retirement", "Life Insurance", "Other"];
const coverageOptions: CoverageLevel[] = ["Employee Only", "Employee + Spouse", "Employee + Children", "Family"];
const enrollmentStatusOptions: EnrollmentStatus[] = ["Enrolled", "Pending", "Waived", "Terminated"];

const enrollmentTone: Record<EnrollmentStatus, string> = {
  Enrolled: "bg-primary/15 text-primary",
  Pending: "bg-amber-soft text-amber",
  Waived: "bg-cream-dim text-ink-soft",
  Terminated: "bg-maroon-soft text-maroon",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface PlanFormState {
  name: string;
  plan_type: BenefitPlanType;
  provider: string;
  employee_cost: string;
  employer_cost: string;
  description: string;
}
const emptyPlanForm: PlanFormState = {
  name: "",
  plan_type: "Health",
  provider: "",
  employee_cost: "0",
  employer_cost: "0",
  description: "",
};

interface EnrollmentFormState {
  employee: string;
  plan: string;
  coverage_level: CoverageLevel;
  status: EnrollmentStatus;
}
const emptyEnrollmentForm: EnrollmentFormState = {
  employee: "",
  plan: "",
  coverage_level: "Employee Only",
  status: "Pending",
};

export default function BenefitsEnrollmentPage() {
  const { withAuth } = useAuth();
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [enrollments, setEnrollments] = useState<BenefitEnrollment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingPlan, setEditingPlan] = useState<BenefitPlan | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyPlanForm);

  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState<EnrollmentFormState>(emptyEnrollmentForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // allSettled — Department Head has no BenefitPlan access here (only
      // enrollments, read-only), so that one 403 shouldn't blank the page.
      const [pResult, enResult, eResult] = await withAuth((token) =>
        Promise.allSettled([benefitPlansApi.list(token), benefitEnrollmentsApi.list(token), employeesApi.list(token)])
      );
      setPlans(pResult.status === "fulfilled" ? pResult.value : []);
      setEnrollments(enResult.status === "fulfilled" ? enResult.value : []);
      setEmployees(eResult.status === "fulfilled" ? eResult.value : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreatePlan() {
    setEditingPlan(null);
    setPlanForm(emptyPlanForm);
    setError(null);
    setShowPlanForm(true);
  }

  function openEditPlan(p: BenefitPlan) {
    setEditingPlan(p);
    setPlanForm({
      name: p.name,
      plan_type: p.plan_type,
      provider: p.provider,
      employee_cost: p.employee_cost,
      employer_cost: p.employer_cost,
      description: p.description,
    });
    setError(null);
    setShowPlanForm(true);
  }

  async function handlePlanSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingPlan) {
        await withAuth((token) => benefitPlansApi.update(token, editingPlan.id, planForm));
      } else {
        await withAuth((token) => benefitPlansApi.create(token, planForm));
      }
      setShowPlanForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePlan(p: BenefitPlan) {
    if (!confirm(`Delete the "${p.name}" plan? This also removes its enrollments.`)) return;
    await withAuth((token) => benefitPlansApi.remove(token, p.id));
    await load();
  }

  function openCreateEnrollment() {
    setEnrollForm({
      employee: employees[0] ? String(employees[0].id) : "",
      plan: plans[0] ? String(plans[0].id) : "",
      coverage_level: "Employee Only",
      status: "Pending",
    });
    setError(null);
    setShowEnrollForm(true);
  }

  async function handleEnrollSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        benefitEnrollmentsApi.create(token, {
          employee: Number(enrollForm.employee),
          plan: Number(enrollForm.plan),
          coverage_level: enrollForm.coverage_level,
          status: enrollForm.status,
        })
      );
      setShowEnrollForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function updateEnrollmentStatus(en: BenefitEnrollment, status: EnrollmentStatus) {
    await withAuth((token) => benefitEnrollmentsApi.update(token, en.id, { status }));
    await load();
  }

  async function handleDeleteEnrollment(en: BenefitEnrollment) {
    if (!confirm(`Remove ${en.employee_detail.name}'s enrollment in ${en.plan_detail.name}?`)) return;
    await withAuth((token) => benefitEnrollmentsApi.remove(token, en.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Benefits Enrollment</h1>
        <p className="mt-1 text-sm text-ink-soft">Health insurance, retirement, and other yearly benefits.</p>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Plan catalog</h2>
          <div className="flex items-center gap-2">
            <CsvToolbar
              csv={benefitPlansCsv}
              resourceLabel="benefit plans"
              requiredFields={BENEFIT_PLAN_REQUIRED_FIELDS}
              onImported={load}
            />
            <button
              onClick={openCreatePlan}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" /> New plan
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className="group rounded-2xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-soft">{p.plan_type}</div>
                  <div className="mt-0.5 font-display font-bold text-ink">{p.name}</div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditPlan(p)}
                    aria-label={`Edit ${p.name}`}
                    className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(p)}
                    aria-label={`Delete ${p.name}`}
                    className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {p.provider && <div className="mt-1 text-xs text-ink-soft">{p.provider}</div>}
              <div className="mt-3 flex justify-between text-xs text-ink-soft">
                <span>Employee: ${p.employee_cost}/mo</span>
                <span>Employer: ${p.employer_cost}/mo</span>
              </div>
              <div className="mt-2 text-xs text-ink-soft">{p.enrolled_count} enrolled</div>
            </div>
          ))}
          {!loading && plans.length === 0 && (
            <div className="col-span-full rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
              No benefit plans yet.
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Enrollments</h2>
          <div className="flex items-center gap-2">
            <CsvToolbar
              csv={benefitEnrollmentsCsv}
              resourceLabel="benefit enrollments"
              requiredFields={BENEFIT_ENROLLMENT_REQUIRED_FIELDS}
              onImported={load}
            />
            <button
              onClick={openCreateEnrollment}
              disabled={plans.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> New enrollment
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="eh-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Coverage</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {enrollments.map((en) => (
                <tr key={en.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3.5 font-semibold text-ink" data-label="Employee">
                    <EmployeeLink employee={en.employee_detail} />
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft" data-label="Plan">{en.plan_detail.name}</td>
                  <td className="px-5 py-3.5 text-ink-soft" data-label="Coverage">{en.coverage_level}</td>
                  <td className="px-5 py-3.5" data-label="Status">
                    <select
                      value={en.status}
                      onChange={(ev) => updateEnrollmentStatus(en, ev.target.value as EnrollmentStatus)}
                      className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold ${enrollmentTone[en.status]}`}
                    >
                      {enrollmentStatusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="eh-row-actions flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleDeleteEnrollment(en)}
                        aria-label={`Delete enrollment for ${en.employee_detail.name}`}
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
          {!loading && enrollments.length === 0 && (
            <div className="p-10 text-center text-sm text-ink-soft">No enrollments yet.</div>
          )}
          {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        </div>
      </div>

      {showPlanForm && (
        <Modal title={editingPlan ? "Edit plan" : "New benefit plan"} onClose={() => setShowPlanForm(false)}>
          <form onSubmit={handlePlanSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Plan name</label>
              <input
                required
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={planForm.plan_type}
                  onChange={(e) => setPlanForm({ ...planForm, plan_type: e.target.value as BenefitPlanType })}
                  className={inputClass}
                >
                  {planTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Provider</label>
                <input
                  value={planForm.provider}
                  onChange={(e) => setPlanForm({ ...planForm, provider: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Employee cost / mo</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={planForm.employee_cost}
                  onChange={(e) => setPlanForm({ ...planForm, employee_cost: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Employer cost / mo</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={planForm.employer_cost}
                  onChange={(e) => setPlanForm({ ...planForm, employer_cost: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editingPlan ? "Save changes" : "Add plan"}
            </button>
          </form>
        </Modal>
      )}

      {showEnrollForm && (
        <Modal title="New enrollment" onClose={() => setShowEnrollForm(false)}>
          <form onSubmit={handleEnrollSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Employee</label>
              <select
                required
                value={enrollForm.employee}
                onChange={(e) => setEnrollForm({ ...enrollForm, employee: e.target.value })}
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
              <label className={labelClass}>Plan</label>
              <select
                required
                value={enrollForm.plan}
                onChange={(e) => setEnrollForm({ ...enrollForm, plan: e.target.value })}
                className={inputClass}
              >
                <option value="">Choose a plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Coverage level</label>
              <select
                value={enrollForm.coverage_level}
                onChange={(e) => setEnrollForm({ ...enrollForm, coverage_level: e.target.value as CoverageLevel })}
                className={inputClass}
              >
                {coverageOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Status</label>
              <select
                value={enrollForm.status}
                onChange={(e) => setEnrollForm({ ...enrollForm, status: e.target.value as EnrollmentStatus })}
                className={inputClass}
              >
                {enrollmentStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add enrollment"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
