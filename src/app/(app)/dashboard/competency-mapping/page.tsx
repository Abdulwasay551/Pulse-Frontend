"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import { competencyRatingsApi, competencyRatingsCsv, type CompetencyRating } from "@/lib/talent-api";
import { employeesApi, type Employee } from "@/lib/people-api";

const COMPETENCY_RATING_REQUIRED_FIELDS = ["employee", "competency"];

type ViewMode = "employees" | "skills";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

export default function CompetencyMappingPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <CompetencyMappingPage />
    </Suspense>
  );
}

function CompetencyMappingPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewMode>(searchParams.get("view") === "skills" ? "skills" : "employees");
  const { withAuth } = useAuth();
  const [ratings, setRatings] = useState<CompetencyRating[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", competency: "", level: "3", notes: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [r, e] = await withAuth((token) => Promise.all([competencyRatingsApi.list(token), employeesApi.list(token)]));
      setRatings(r);
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
    setForm({ employee: employees[0] ? String(employees[0].id) : "", competency: "", level: "3", notes: "" });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await withAuth((token) =>
        competencyRatingsApi.create(token, {
          employee: Number(form.employee),
          competency: form.competency,
          level: Number(form.level),
          notes: form.notes,
        })
      );
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: CompetencyRating) {
    if (!confirm(`Remove ${r.competency} rating for ${r.employee_detail.name}?`)) return;
    await withAuth((token) => competencyRatingsApi.remove(token, r.id));
    await load();
  }

  const groupedByEmployee = employees
    .map((emp) => ({ employee: emp, ratings: ratings.filter((r) => r.employee === emp.id) }))
    .filter((g) => g.ratings.length > 0);

  const skillNames = Array.from(new Set(ratings.map((r) => r.competency))).sort((a, b) => a.localeCompare(b));
  const groupedBySkill = skillNames.map((competency) => ({
    competency,
    ratings: ratings.filter((r) => r.competency === competency),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {view === "skills" ? "Skills & Competency Mapping" : "Competency Mapping of Employees"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {view === "skills" ? "A living map of who can do what." : "Map skills against role expectations, per employee."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={competencyRatingsCsv}
            resourceLabel="competency ratings"
            requiredFields={COMPETENCY_RATING_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New rating
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView("employees")}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${view === "employees" ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"}`}
        >
          By employee
        </button>
        <button
          onClick={() => setView("skills")}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${view === "skills" ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"}`}
        >
          By skill
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : view === "employees" ? (
        groupedByEmployee.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">No competency ratings yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedByEmployee.map(({ employee, ratings: empRatings }) => (
              <div key={employee.id} className="rounded-2xl border border-line bg-card p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                    {employee.initials}
                  </span>
                  <span className="font-semibold text-ink">{employee.name}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {empRatings.map((r) => (
                    <div key={r.id} className="group flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-sm text-ink">{r.competency}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-dim">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(r.level / 5) * 100}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-xs text-ink-soft">{r.level}/5</span>
                      <button
                        onClick={() => handleDelete(r)}
                        aria-label={`Remove ${r.competency} rating`}
                        className="shrink-0 rounded-lg p-1 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : groupedBySkill.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">No competency ratings yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedBySkill.map(({ competency, ratings: skillRatings }) => (
            <div key={competency} className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-3 font-display font-bold text-ink">{competency}</div>
              <div className="flex flex-col gap-2.5">
                {skillRatings.map((r) => {
                  const employee = employees.find((e) => e.id === r.employee);
                  return (
                    <div key={r.id} className="group flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                        {employee?.initials ?? "?"}
                      </span>
                      <span className="w-40 shrink-0 truncate text-sm text-ink">{employee?.name ?? "Unknown"}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-dim">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(r.level / 5) * 100}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-xs text-ink-soft">{r.level}/5</span>
                      <button
                        onClick={() => handleDelete(r)}
                        aria-label={`Remove ${r.competency} rating for ${employee?.name ?? "employee"}`}
                        className="shrink-0 rounded-lg p-1 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="New competency rating" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={labelClass}>Employee</label>
              <select required value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className={inputClass}>
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Competency</label>
              <input required value={form.competency} onChange={(e) => setForm({ ...form, competency: e.target.value })} placeholder="e.g. System Design" className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Level (1–5)</label>
              <input type="number" min="1" max="5" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Saving…" : "Add rating"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
