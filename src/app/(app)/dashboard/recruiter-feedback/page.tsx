"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import { recruiterFeedbackApi, type RecruiterFeedback } from "@/lib/talent-api";
import { employeesApi, type Employee } from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

export default function RecruiterFeedbackPage() {
  const { withAuth } = useAuth();
  const [feedback, setFeedback] = useState<RecruiterFeedback[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", given_by: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [f, e] = await withAuth((token) => Promise.all([recruiterFeedbackApi.list(token), employeesApi.list(token)]));
      setFeedback(f);
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
    setForm({ employee: employees[0] ? String(employees[0].id) : "", given_by: "", message: "" });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        recruiterFeedbackApi.create(token, { employee: Number(form.employee), given_by: form.given_by, message: form.message })
      );
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Recruiter Feedback</h1>
          <p className="mt-1 text-sm text-ink-soft">Notes a recruiter leaves on a placed/hired employee — visible to HR.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Add feedback
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : feedback.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No feedback logged yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-2xl border border-line bg-card p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-bold text-ink">{f.employee_detail.name}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.message}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-soft">
                <span>{f.given_by ? `— ${f.given_by}` : ""}</span>
                <span>{new Date(f.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Add feedback" onClose={() => setShowForm(false)}>
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
              <label className={labelClass}>Given by</label>
              <input
                value={form.given_by}
                onChange={(e) => setForm({ ...form, given_by: e.target.value })}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Message</label>
              <textarea
                required
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add feedback"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
