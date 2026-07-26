"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import {
  candidatesApi,
  offboardingsApi,
  offboardingTasksApi,
  type Candidate,
  type Offboarding,
  type OffboardingCategory,
  type OffboardingStatus,
  type TaskStatus,
} from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const CATEGORIES: OffboardingCategory[] = ["Documents Checklist", "Access Status", "Hardware Clearance"];

const offboardingStatusOptions: OffboardingStatus[] = ["Not Started", "In Progress", "Completed"];

const statusTone: Record<OffboardingStatus, string> = {
  "Not Started": "bg-cream-dim text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Completed: "bg-primary/15 text-primary",
};

const taskStatusTone: Record<TaskStatus, string> = {
  Pending: "bg-cream-dim text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Done: "bg-primary/15 text-primary",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft";

export default function OffboardingPage() {
  const { withAuth } = useAuth();
  const [records, setRecords] = useState<Offboarding[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ candidate: "", last_working_day: "", reason: "", rehire_eligible: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [o, c] = await withAuth((token) => Promise.all([offboardingsApi.list(token), candidatesApi.list(token)]));
      setRecords(o);
      setCandidates(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = records.find((r) => r.id === activeId) ?? null;

  function openCreate() {
    setForm({ candidate: "", last_working_day: new Date().toISOString().slice(0, 10), reason: "", rehire_eligible: true });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.candidate || !form.last_working_day) {
      setError("Choose a candidate and a last working day.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await withAuth((token) =>
        offboardingsApi.create(token, {
          candidate: Number(form.candidate),
          last_working_day: form.last_working_day,
          reason: form.reason,
          rehire_eligible: form.rehire_eligible,
        })
      );
      setShowForm(false);
      await load();
      setActiveId(created.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(o: Offboarding) {
    if (!confirm(`Remove offboarding for ${o.candidate_detail.name}?`)) return;
    await withAuth((token) => offboardingsApi.remove(token, o.id));
    if (activeId === o.id) setActiveId(null);
    await load();
  }

  async function updateOffboardingStatus(o: Offboarding, status: OffboardingStatus) {
    await withAuth((token) => offboardingsApi.update(token, o.id, { status }));
    await load();
  }

  async function updateRehireEligible(o: Offboarding, rehire_eligible: boolean) {
    await withAuth((token) => offboardingsApi.update(token, o.id, { rehire_eligible }));
    await load();
  }

  if (active) {
    return (
      <OffboardingDetail
        offboarding={active}
        onBack={() => setActiveId(null)}
        onChanged={load}
        onStatusChange={(status) => updateOffboardingStatus(active, status)}
        onRehireChange={(v) => updateRehireEligible(active, v)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Offboarding</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Documents checklist, access revocation, and hardware clearance — and rehire eligibility for later.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Start offboarding
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No offboarding records yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((o) => (
            <div
              key={o.id}
              className="group relative cursor-pointer rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              onClick={() => setActiveId(o.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(o);
                }}
                aria-label={`Remove offboarding for ${o.candidate_detail.name}`}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-xs font-bold text-primary">
                  {o.candidate_detail.initials}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-bold text-ink">{o.candidate_detail.name}</h3>
                  <p className="truncate text-xs text-ink-soft">{o.candidate_detail.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold whitespace-nowrap ${statusTone[o.status]}`}
                >
                  {o.status}
                </span>
                {o.rehire_eligible && (
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10.5px] font-semibold whitespace-nowrap text-primary">
                    Rehire eligible
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-soft">Progress</span>
                  <span className="font-mono text-ink">{o.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${o.progress}%` }} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-ink-soft">Last working day</span>
                <span className="font-mono text-ink">{o.last_working_day}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Start offboarding" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Candidate</label>
              <select
                required
                value={form.candidate}
                onChange={(e) => setForm({ ...form, candidate: e.target.value })}
                className={inputClass}
              >
                <option value="">Choose a candidate</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Last working day</label>
              <input
                required
                type="date"
                value={form.last_working_day}
                onChange={(e) => setForm({ ...form, last_working_day: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Reason</label>
              <input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Resignation, end of contract"
                className={inputClass}
              />
            </div>
            <label className="mb-6 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.rehire_eligible}
                onChange={(e) => setForm({ ...form, rehire_eligible: e.target.checked })}
                className="h-4 w-4 rounded border-line"
              />
              Eligible for rehire
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Starting…" : "Start offboarding"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function OffboardingDetail({
  offboarding,
  onBack,
  onChanged,
  onStatusChange,
  onRehireChange,
}: {
  offboarding: Offboarding;
  onBack: () => void;
  onChanged: () => Promise<void>;
  onStatusChange: (status: OffboardingStatus) => void;
  onRehireChange: (v: boolean) => void;
}) {
  const { withAuth } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState<OffboardingCategory | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", due_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  function openTaskForm(category: OffboardingCategory) {
    setTaskForm({ title: "", due_date: "", notes: "" });
    setShowTaskForm(category);
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!showTaskForm || !taskForm.title) return;
    setSaving(true);
    try {
      await withAuth((token) =>
        offboardingTasksApi.create(token, {
          offboarding: offboarding.id,
          category: showTaskForm,
          title: taskForm.title,
          due_date: taskForm.due_date || null,
          notes: taskForm.notes,
        })
      );
      setShowTaskForm(null);
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function cycleTaskStatus(taskId: number, current: TaskStatus) {
    const next: Record<TaskStatus, TaskStatus> = { Pending: "In Progress", "In Progress": "Done", Done: "Pending" };
    await withAuth((token) => offboardingTasksApi.update(token, taskId, { status: next[current] }));
    await onChanged();
  }

  async function removeTask(taskId: number) {
    await withAuth((token) => offboardingTasksApi.remove(token, taskId));
    await onChanged();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All offboarding
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
            {offboarding.candidate_detail.initials}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">{offboarding.candidate_detail.name}</h1>
            <p className="text-xs text-ink-soft">
              {offboarding.candidate_detail.role} · Last day {offboarding.last_working_day}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={offboarding.rehire_eligible}
              onChange={(e) => onRehireChange(e.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            Rehire eligible
          </label>
          <div className="w-32">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ink-soft">Progress</span>
              <span className="font-mono text-ink">{offboarding.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
              <div className="h-full rounded-full bg-primary" style={{ width: `${offboarding.progress}%` }} />
            </div>
          </div>
          <select
            value={offboarding.status}
            onChange={(e) => onStatusChange(e.target.value as OffboardingStatus)}
            className={`${inputClass} w-auto`}
          >
            {offboardingStatusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const tasks = offboarding.tasks.filter((t) => t.category === category);
          return (
            <div key={category} className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-ink">{category}</h2>
                <button
                  onClick={() => openTaskForm(category)}
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                  aria-label={`Add task to ${category}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {tasks.length === 0 ? (
                <p className="text-xs text-ink-soft">No tasks yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink">{t.title}</p>
                        {t.due_date && <p className="font-mono text-[11px] text-ink-soft">Due {t.due_date}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => cycleTaskStatus(t.id, t.status)}
                          className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold whitespace-nowrap ${taskStatusTone[t.status]}`}
                        >
                          {t.status}
                        </button>
                        <button
                          onClick={() => removeTask(t.id)}
                          aria-label={`Remove task ${t.title}`}
                          className="rounded-lg p-1 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showTaskForm && (
        <Modal title={`Add task · ${showTaskForm}`} onClose={() => setShowTaskForm(null)}>
          <form onSubmit={handleAddTask}>
            <div className="mb-4">
              <label className={labelClass}>Task</label>
              <input
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Due date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Notes</label>
              <textarea
                rows={2}
                value={taskForm.notes}
                onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add task"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
