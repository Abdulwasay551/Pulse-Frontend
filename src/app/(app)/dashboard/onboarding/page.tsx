"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import {
  candidatesApi,
  onboardingsApi,
  onboardingTasksApi,
  type Candidate,
  type Onboarding,
  type OnboardingCategory,
  type OnboardingStatus,
  type TaskStatus,
} from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const CATEGORIES: OnboardingCategory[] = [
  "Pre-Joining Documents",
  "Orientation",
  "Training Plan",
  "Portal Access",
  "Probation Evaluation",
  "Device Assignment",
];

// The sidebar/hub use the functional spec's full phrasing ("Training Plan
// and Schedule", "Portal Access and Installations") while the backend's
// stored category value is the shorter enum key — this maps key -> the
// exact spec wording for display in the category cross-section view.
const CATEGORY_LABELS: Record<OnboardingCategory, string> = {
  "Pre-Joining Documents": "Pre-Joining Documents",
  Orientation: "Orientation",
  "Training Plan": "Training Plan and Schedule",
  "Portal Access": "Portal Access and Installations",
  "Probation Evaluation": "Probation Evaluation",
  "Device Assignment": "Device Assignment",
};

const onboardingStatusOptions: OnboardingStatus[] = ["Not Started", "In Progress", "Completed"];

const statusTone: Record<OnboardingStatus, string> = {
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
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

function isOnboardingCategory(value: string | null): value is OnboardingCategory {
  return !!value && (CATEGORIES as string[]).includes(value);
}

export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <OnboardingPage />
    </Suspense>
  );
}

function OnboardingPage() {
  const { withAuth } = useAuth();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const category = isOnboardingCategory(categoryParam) ? categoryParam : null;

  const [records, setRecords] = useState<Onboarding[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ candidate: "", start_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [o, c] = await withAuth((token) => Promise.all([onboardingsApi.list(token), candidatesApi.list(token)]));
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
    setForm({ candidate: "", start_date: new Date().toISOString().slice(0, 10) });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.candidate || !form.start_date) {
      setError("Choose a candidate and a start date.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await withAuth((token) =>
        onboardingsApi.create(token, { candidate: Number(form.candidate), start_date: form.start_date })
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

  async function handleDelete(o: Onboarding) {
    if (!confirm(`Remove onboarding for ${o.candidate_detail.name}?`)) return;
    await withAuth((token) => onboardingsApi.remove(token, o.id));
    if (activeId === o.id) setActiveId(null);
    await load();
  }

  async function updateOnboardingStatus(o: Onboarding, status: OnboardingStatus) {
    await withAuth((token) => onboardingsApi.update(token, o.id, { status }));
    await load();
  }

  if (category) {
    return <CategoryCrossSection category={category} records={records} loading={loading} onChanged={load} />;
  }

  if (active) {
    return (
      <OnboardingDetail
        onboarding={active}
        onBack={() => setActiveId(null)}
        onChanged={load}
        onStatusChange={(status) => updateOnboardingStatus(active, status)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Onboarding</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Pre-joining documents, orientation, training, portal access, probation, and device assignment.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Start onboarding
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No onboarding records yet.
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
                aria-label={`Remove onboarding for ${o.candidate_detail.name}`}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                  {o.candidate_detail.initials}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-bold text-ink">{o.candidate_detail.name}</h3>
                  <p className="truncate text-xs text-ink-soft">{o.candidate_detail.role}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap ${statusTone[o.status]}`}
              >
                {o.status}
              </span>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-soft">Progress</span>
                  <span className="text-ink">{o.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${o.progress}%` }} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-ink-soft">Start date</span>
                <span className="text-ink">{o.start_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Start onboarding" onClose={() => setShowForm(false)}>
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
            <div className="mb-6">
              <label className={labelClass}>Start date</label>
              <input
                required
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Starting…" : "Start onboarding"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/** A cross-candidate view for one onboarding category (a sub-sub-module in
 * the sidebar) — every task in that category across every onboarding
 * record, e.g. "every Orientation task, whoever it belongs to." */
function CategoryCrossSection({
  category,
  records,
  loading,
  onChanged,
}: {
  category: OnboardingCategory;
  records: Onboarding[];
  loading: boolean;
  onChanged: () => Promise<void>;
}) {
  const { withAuth } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ onboarding: "", title: "", due_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const rows = records
    .flatMap((o) => o.tasks.filter((t) => t.category === category).map((t) => ({ task: t, onboarding: o })))
    .sort((a, b) => a.onboarding.candidate_detail.name.localeCompare(b.onboarding.candidate_detail.name));

  function openCreate() {
    setForm({ onboarding: records[0] ? String(records[0].id) : "", title: "", due_date: "", notes: "" });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.onboarding || !form.title) return;
    setSaving(true);
    try {
      await withAuth((token) =>
        onboardingTasksApi.create(token, {
          onboarding: Number(form.onboarding),
          category,
          title: form.title,
          due_date: form.due_date || null,
          notes: form.notes,
        })
      );
      setShowForm(false);
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function cycleTaskStatus(taskId: number, current: TaskStatus) {
    const next: Record<TaskStatus, TaskStatus> = { Pending: "In Progress", "In Progress": "Done", Done: "Pending" };
    await withAuth((token) => onboardingTasksApi.update(token, taskId, { status: next[current] }));
    await onChanged();
  }

  async function removeTask(taskId: number) {
    await withAuth((token) => onboardingTasksApi.remove(token, taskId));
    await onChanged();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/dashboard/onboarding"
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All onboarding
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{CATEGORY_LABELS[category]}</h1>
          <p className="mt-1 text-sm text-ink-soft">Every {category.toLowerCase()} task, across every onboarding.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={records.length === 0}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> New task
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ task, onboarding }) => (
              <tr key={task.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10.5px] font-bold text-primary">
                      {onboarding.candidate_detail.initials}
                    </span>
                    <span className="font-semibold text-ink">{onboarding.candidate_detail.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink">{task.title}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft">{task.due_date ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => cycleTaskStatus(task.id, task.status)}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap ${taskStatusTone[task.status]}`}
                  >
                    {task.status}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => removeTask(task.id)}
                    aria-label={`Remove task ${task.title}`}
                    className="rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">
            No {category.toLowerCase()} tasks yet across any onboarding record.
          </div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={`New ${CATEGORY_LABELS[category]} task`} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={labelClass}>Candidate</label>
              <select
                required
                value={form.onboarding}
                onChange={(e) => setForm({ ...form, onboarding: e.target.value })}
                className={inputClass}
              >
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.candidate_detail.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Task</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Due date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
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
              {saving ? "Adding…" : "Add task"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function OnboardingDetail({
  onboarding,
  onBack,
  onChanged,
  onStatusChange,
}: {
  onboarding: Onboarding;
  onBack: () => void;
  onChanged: () => Promise<void>;
  onStatusChange: (status: OnboardingStatus) => void;
}) {
  const { withAuth } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState<OnboardingCategory | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", due_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  function openTaskForm(category: OnboardingCategory) {
    setTaskForm({ title: "", due_date: "", notes: "" });
    setShowTaskForm(category);
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!showTaskForm || !taskForm.title) return;
    setSaving(true);
    try {
      await withAuth((token) =>
        onboardingTasksApi.create(token, {
          onboarding: onboarding.id,
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
    await withAuth((token) => onboardingTasksApi.update(token, taskId, { status: next[current] }));
    await onChanged();
  }

  async function removeTask(taskId: number) {
    await withAuth((token) => onboardingTasksApi.remove(token, taskId));
    await onChanged();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All onboarding
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {onboarding.candidate_detail.initials}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">{onboarding.candidate_detail.name}</h1>
            <p className="text-xs text-ink-soft">
              {onboarding.candidate_detail.role} · Starts {onboarding.start_date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ink-soft">Progress</span>
              <span className="text-ink">{onboarding.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
              <div className="h-full rounded-full bg-primary" style={{ width: `${onboarding.progress}%` }} />
            </div>
          </div>
          <select
            value={onboarding.status}
            onChange={(e) => onStatusChange(e.target.value as OnboardingStatus)}
            className={`${inputClass} w-auto`}
          >
            {onboardingStatusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CATEGORIES.map((category) => {
          const tasks = onboarding.tasks.filter((t) => t.category === category);
          return (
            <div key={category} className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-ink">{CATEGORY_LABELS[category]}</h2>
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
                        {t.due_date && <p className="text-[11px] text-ink-soft">Due {t.due_date}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => cycleTaskStatus(t.id, t.status)}
                          className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap ${taskStatusTone[t.status]}`}
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
        <Modal title={`Add task · ${CATEGORY_LABELS[showTaskForm]}`} onClose={() => setShowTaskForm(null)}>
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
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add task"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
