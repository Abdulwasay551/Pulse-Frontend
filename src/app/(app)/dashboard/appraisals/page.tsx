"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { appraisalsApi, appraisalsCsv, getEmployeeScore, type Appraisal, type AppraisalStatus } from "@/lib/talent-api";
import { employeesApi, type Employee } from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const APPRAISAL_REQUIRED_FIELDS = ["employee", "period", "overall_rating"];

type ViewMode = "appraisals" | "scores";

interface ScoreRow {
  employee: Employee;
  score: number | null;
  notes: string;
}

const statusTone: Record<AppraisalStatus, string> = {
  Draft: "bg-cream-dim text-ink-soft",
  Submitted: "bg-amber-soft text-amber",
  Finalized: "bg-primary/15 text-primary",
};

const statusOptions: AppraisalStatus[] = ["Draft", "Submitted", "Finalized"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  period: string;
  reviewer: string;
  overall_rating: string;
  strengths: string;
  areas_for_improvement: string;
  status: AppraisalStatus;
}

export default function AppraisalsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <AppraisalsPage />
    </Suspense>
  );
}

function AppraisalsPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewMode>(searchParams.get("view") === "scores" ? "scores" : "appraisals");
  const { withAuth } = useAuth();
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Appraisal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ employee: "", period: "", reviewer: "", overall_rating: "3", strengths: "", areas_for_improvement: "", status: "Draft" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scoreInfo, setScoreInfo] = useState<{ name: string; score: number | null; notes: string } | null>(null);
  const [scoreRows, setScoreRows] = useState<ScoreRow[] | null>(null);
  const [scoresLoading, setScoresLoading] = useState(false);

  async function loadScoresFor(emps: Employee[]) {
    if (emps.length === 0) return;
    setScoresLoading(true);
    try {
      const rows = await withAuth((token) =>
        Promise.all(
          emps.map(async (employee) => {
            const result = await getEmployeeScore(token, employee.id);
            return { employee, score: result.score, notes: result.notes };
          })
        )
      );
      rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      setScoreRows(rows);
    } finally {
      setScoresLoading(false);
    }
  }

  async function load() {
    try {
      const [a, e] = await withAuth((token) => Promise.all([appraisalsApi.list(token), employeesApi.list(token)]));
      setAppraisals(a);
      setEmployees(e);
      if (view === "scores") await loadScoresFor(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchView(next: ViewMode) {
    setView(next);
    if (next === "scores" && scoreRows === null) loadScoresFor(employees);
  }

  function openCreate() {
    setEditing(null);
    setForm({ employee: employees[0] ? String(employees[0].id) : "", period: "", reviewer: "", overall_rating: "3", strengths: "", areas_for_improvement: "", status: "Draft" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(a: Appraisal) {
    setEditing(a);
    setForm({
      employee: String(a.employee),
      period: a.period,
      reviewer: a.reviewer,
      overall_rating: String(a.overall_rating),
      strengths: a.strengths,
      areas_for_improvement: a.areas_for_improvement,
      status: a.status,
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
      period: form.period,
      reviewer: form.reviewer,
      overall_rating: Number(form.overall_rating),
      strengths: form.strengths,
      areas_for_improvement: form.areas_for_improvement,
      status: form.status,
    };
    try {
      if (editing) {
        await withAuth((token) => appraisalsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => appraisalsApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: Appraisal) {
    if (!confirm(`Delete this appraisal for ${a.employee_detail.name}?`)) return;
    await withAuth((token) => appraisalsApi.remove(token, a.id));
    await load();
  }

  async function handleViewScore(a: Appraisal) {
    const result = await withAuth((token) => getEmployeeScore(token, a.employee));
    setScoreInfo({ name: a.employee_detail.name, score: result.score, notes: result.notes });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {view === "scores" ? "Value-Addition / Performance Scoring" : "Performance Appraisals"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {view === "scores" ? "Powered by EVO-AI — every employee, ranked." : "Based on yearly 360° feedback."}
          </p>
        </div>
        {view === "appraisals" && (
          <div className="flex items-center gap-2">
            <CsvToolbar
              csv={appraisalsCsv}
              resourceLabel="appraisals"
              requiredFields={APPRAISAL_REQUIRED_FIELDS}
              onImported={load}
            />
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" /> New appraisal
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => switchView("appraisals")}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${view === "appraisals" ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"}`}
        >
          Appraisals
        </button>
        <button
          onClick={() => switchView("scores")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${view === "scores" ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"}`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Value-Addition Scoring
        </button>
      </div>

      {view === "scores" ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="eh-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(scoreRows ?? []).map((row) => (
                <tr key={row.employee.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3.5" data-label="Employee">
                    <EmployeeLink employee={row.employee} />
                  </td>
                  <td className="px-5 py-3.5" data-label="Score">
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {row.score !== null ? `${row.score}%` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Notes">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!scoresLoading && (scoreRows ?? []).length === 0 && (
            <div className="p-10 text-center text-sm text-ink-soft">Add employees to see their scores here.</div>
          )}
          {scoresLoading && <div className="p-10 text-center text-sm text-ink-soft">Computing scores…</div>}
        </div>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Period</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {appraisals.map((a) => (
              <tr key={a.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={a.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Period">{a.period}</td>
                <td className="px-5 py-3.5" data-label="Rating">
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">{a.overall_rating}/5</span>
                </td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[a.status]}`}>{a.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleViewScore(a)}
                      aria-label={`View performance score for ${a.employee_detail.name}`}
                      title="Value-addition score"
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-primary/15 hover:text-primary"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => openEdit(a)} aria-label={`Edit appraisal for ${a.employee_detail.name}`} className="eh-row-actions rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-cream-dim hover:text-ink group-hover:opacity-100">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(a)} aria-label={`Delete appraisal for ${a.employee_detail.name}`} className="eh-row-actions rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && appraisals.length === 0 && <div className="p-10 text-center text-sm text-ink-soft">No appraisals yet.</div>}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit appraisal" : "New appraisal"} onClose={() => setShowForm(false)} wide>
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</div>}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Employee</label>
                <select required disabled={!!editing} value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className={`${inputClass} disabled:opacity-60`}>
                  <option value="">Choose an employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Period</label>
                <input required value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="2026 Annual Review" className={inputClass} />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Reviewer</label>
                <input value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Overall rating (1–5)</label>
                <input type="number" min="1" max="5" value={form.overall_rating} onChange={(e) => setForm({ ...form, overall_rating: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Strengths</label>
              <textarea rows={2} value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Areas for improvement</label>
              <textarea rows={2} value={form.areas_for_improvement} onChange={(e) => setForm({ ...form, areas_for_improvement: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppraisalStatus })} className={inputClass}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save changes" : "Add appraisal"}
            </button>
          </form>
        </Modal>
      )}

      {scoreInfo && (
        <Modal title={`Performance score · ${scoreInfo.name}`} onClose={() => setScoreInfo(null)}>
          <div className="rounded-xl border border-line bg-cream p-5 text-center">
            <div className="text-4xl font-bold text-primary">{scoreInfo.score !== null ? `${scoreInfo.score}%` : "—"}</div>
            <p className="mt-3 text-sm text-ink-soft">{scoreInfo.notes}</p>
          </div>
          <p className="mt-4 text-xs text-ink-soft">
            Value-addition score powered by EVO-AI — blends goal completion with appraisal ratings.
          </p>
        </Modal>
      )}
    </div>
  );
}
