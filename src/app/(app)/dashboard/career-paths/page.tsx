"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import { careerPathsApi, careerPathsCsv, type CareerPath } from "@/lib/talent-api";
import { employeesApi, type Employee } from "@/lib/people-api";

const CAREER_PATH_REQUIRED_FIELDS = ["employee"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  current_role: string;
  target_role: string;
  department: string;
  milestones: string;
  target_date: string;
}

const emptyForm: FormState = { employee: "", current_role: "", target_role: "", department: "", milestones: "", target_date: "" };

export default function CareerPathsPage() {
  const { withAuth } = useAuth();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<CareerPath | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [p, e] = await withAuth((token) => Promise.all([careerPathsApi.list(token), employeesApi.list(token)]));
      setPaths(p);
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
    const first = employees[0];
    setForm({ ...emptyForm, employee: first ? String(first.id) : "", current_role: first?.job_title ?? "", department: first?.department ?? "" });
    setShowForm(true);
  }

  function openEdit(p: CareerPath) {
    setEditing(p);
    setForm({
      employee: String(p.employee),
      current_role: p.current_role,
      target_role: p.target_role,
      department: p.department,
      milestones: p.milestones,
      target_date: p.target_date ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      employee: Number(form.employee),
      current_role: form.current_role,
      target_role: form.target_role,
      department: form.department,
      milestones: form.milestones,
      target_date: form.target_date || null,
    };
    try {
      if (editing) {
        await withAuth((token) => careerPathsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => careerPathsApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: CareerPath) {
    if (!confirm(`Delete this career path for ${p.employee_detail.name}?`)) return;
    await withAuth((token) => careerPathsApi.remove(token, p.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Career Development Paths</h1>
          <p className="mt-1 text-sm text-ink-soft">Mapped per department hierarchy.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={careerPathsCsv}
            resourceLabel="career paths"
            requiredFields={CAREER_PATH_REQUIRED_FIELDS}
            onImported={load}
          />
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark">
            <Plus className="h-4 w-4" /> New path
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : paths.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">No career paths mapped yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((p) => (
            <div
              key={p.id}
              onClick={() => openEdit(p)}
              className="group relative cursor-pointer rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(p)} aria-label={`Edit path for ${p.employee_detail.name}`} className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(p)} aria-label={`Delete path for ${p.employee_detail.name}`} className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                  {p.employee_detail.initials}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-bold text-ink">{p.employee_detail.name}</h3>
                  <p className="truncate text-xs text-ink-soft">{p.department || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink">
                <span>{p.current_role || "—"}</span>
                <span className="text-ink-soft">→</span>
                <span className="font-semibold">{p.target_role || "—"}</span>
              </div>
              {p.milestones && <p className="mt-2 line-clamp-3 text-xs text-ink-soft">{p.milestones}</p>}
              {p.target_date && <p className="mt-3 border-t border-line pt-2 text-xs text-ink-soft">Target: {p.target_date}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit career path" : "New career path"} onClose={() => setShowForm(false)} wide>
          <form onSubmit={handleSubmit}>
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
                <label className={labelClass}>Current role</label>
                <input value={form.current_role} onChange={(e) => setForm({ ...form, current_role: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Target role</label>
                <input value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Department</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Target date</label>
                <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Milestones</label>
              <textarea rows={3} value={form.milestones} onChange={(e) => setForm({ ...form, milestones: e.target.value })} className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save changes" : "Add path"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
