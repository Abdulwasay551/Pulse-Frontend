"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import {
  employeesApi,
  surveyResponsesApi,
  surveysApi,
  type Employee,
  type Survey,
  type SurveyFrequency,
  type SurveyKind,
} from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";
const kindOptions: SurveyKind[] = ["Survey", "Pulse Check"];
const frequencyOptions: SurveyFrequency[] = ["Yearly", "Bi-yearly"];
const PULSE_MIN_QUESTIONS = 3;
const PULSE_MAX_QUESTIONS = 5;

export default function SurveysPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <SurveysPage />
    </Suspense>
  );
}

function SurveysPage() {
  const searchParams = useSearchParams();
  const kindParam = searchParams.get("kind");
  const activeKind: SurveyKind | null = kindParam === "Survey" || kindParam === "Pulse Check" ? kindParam : null;
  const { withAuth } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kind: (activeKind ?? "Survey") as SurveyKind,
    title: "",
    questions: [""] as string[],
    frequency: "" as SurveyFrequency | "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseForm, setResponseForm] = useState({ employee: "", rating: "5", response_text: "" });
  const [savingResponse, setSavingResponse] = useState(false);

  async function load() {
    try {
      const [s, e] = await withAuth((token) => Promise.all([surveysApi.list(token), employeesApi.list(token)]));
      setSurveys(s);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = surveys.find((s) => s.id === activeId) ?? null;
  const visible = activeKind ? surveys.filter((s) => s.kind === activeKind) : surveys;

  function openCreate() {
    setForm({ kind: activeKind ?? "Survey", title: "", questions: [""], frequency: "" });
    setError(null);
    setShowForm(true);
  }

  function updateQuestion(index: number, value: string) {
    setForm((f) => ({ ...f, questions: f.questions.map((q, i) => (i === index ? value : q)) }));
  }

  function addQuestion() {
    setForm((f) => (f.questions.length >= PULSE_MAX_QUESTIONS ? f : { ...f, questions: [...f.questions, ""] }));
  }

  function removeQuestion(index: number) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const questions = form.questions.map((q) => q.trim()).filter(Boolean);
    if (questions.length === 0) {
      setError("Add at least one question.");
      return;
    }
    if (form.kind === "Pulse Check" && (questions.length < PULSE_MIN_QUESTIONS || questions.length > PULSE_MAX_QUESTIONS)) {
      setError(`Pulse Checks need ${PULSE_MIN_QUESTIONS}–${PULSE_MAX_QUESTIONS} questions.`);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        surveysApi.create(token, {
          kind: form.kind,
          title: form.title,
          questions,
          frequency: form.kind === "Pulse Check" && form.frequency ? form.frequency : null,
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

  async function toggleOpen(s: Survey) {
    await withAuth((token) => surveysApi.update(token, s.id, { is_open: !s.is_open }));
    await load();
  }

  function openResponseForm() {
    setResponseForm({ employee: employees[0] ? String(employees[0].id) : "", rating: "5", response_text: "" });
    setShowResponseForm(true);
  }

  async function handleAddResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setSavingResponse(true);
    try {
      await withAuth((token) =>
        surveyResponsesApi.create(token, {
          survey: active.id,
          employee: Number(responseForm.employee),
          rating: responseForm.rating ? Number(responseForm.rating) : null,
          response_text: responseForm.response_text,
        })
      );
      setShowResponseForm(false);
      await load();
    } finally {
      setSavingResponse(false);
    }
  }

  if (active) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => setActiveId(null)}
          className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All surveys
        </button>

        <div className="mb-6 rounded-2xl border border-line bg-card p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-cream-dim px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap text-ink-soft">
              {active.kind}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap ${active.is_open ? "bg-primary/15 text-primary" : "bg-cream-dim text-ink-soft"}`}
            >
              {active.is_open ? "Open" : "Closed"}
            </span>
          </div>
          <h1 className="font-display text-xl font-bold text-ink">{active.title}</h1>
          {active.frequency && <p className="mt-1 text-xs text-ink-soft">Frequency: {active.frequency}</p>}
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-ink-soft">
            {active.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
          <div className="mt-4 flex items-center gap-4 text-xs text-ink-soft">
            <span>{active.response_count} response{active.response_count === 1 ? "" : "s"}</span>
            {active.average_rating !== null && <span>Average rating: {active.average_rating}/5</span>}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => toggleOpen(active)}
              className="rounded-lg border border-line bg-cream px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-cream-dim"
            >
              {active.is_open ? "Close survey" : "Reopen survey"}
            </button>
            <button
              onClick={openResponseForm}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-cream hover:bg-primary-dark"
            >
              Add response
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {active.responses.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-card p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{r.employee_detail.name}</span>
                {r.rating !== null && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {r.rating}/5
                  </span>
                )}
              </div>
              {r.response_text && <p className="text-sm text-ink-soft">{r.response_text}</p>}
            </div>
          ))}
          {active.responses.length === 0 && (
            <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-ink-soft">
              No responses yet.
            </div>
          )}
        </div>

        {showResponseForm && (
          <Modal title="Add response" onClose={() => setShowResponseForm(false)}>
            <form onSubmit={handleAddResponse}>
              <div className="mb-4">
                <label className={labelClass}>Employee</label>
                <select
                  required
                  value={responseForm.employee}
                  onChange={(e) => setResponseForm({ ...responseForm, employee: e.target.value })}
                  className={inputClass}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className={labelClass}>Rating (1–5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={responseForm.rating}
                  onChange={(e) => setResponseForm({ ...responseForm, rating: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="mb-6">
                <label className={labelClass}>Response</label>
                <textarea
                  rows={3}
                  value={responseForm.response_text}
                  onChange={(e) => setResponseForm({ ...responseForm, response_text: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={savingResponse}
                className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {savingResponse ? "Saving…" : "Add response"}
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {activeKind === "Pulse Check" ? "Pulse Checks" : activeKind === "Survey" ? "Surveys" : "Surveys & Pulse Checks"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {activeKind === "Pulse Check"
              ? "Lightweight, frequent sentiment checks."
              : activeKind === "Survey"
                ? "Read the room across every team."
                : "Read the room across every team."}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New {activeKind === "Pulse Check" ? "pulse check" : "survey"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          {activeKind ? `No ${activeKind === "Pulse Check" ? "pulse checks" : "surveys"} yet.` : "No surveys yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className="cursor-pointer rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-cream-dim px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap text-ink-soft">
                  {s.kind}
                </span>
                {!s.is_open && (
                  <span className="rounded-full bg-maroon-soft px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap text-maroon">
                    Closed
                  </span>
                )}
              </div>
              <h3 className="font-display text-base font-bold text-ink">{s.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{s.questions.join(" · ")}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-ink-soft">{s.response_count} responses</span>
                {s.average_rating !== null && <span className="font-semibold text-ink">{s.average_rating}/5</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="New survey" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Kind</label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as SurveyKind })}
                className={inputClass}
              >
                {kindOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>
            {form.kind === "Pulse Check" && (
              <div className="mb-4">
                <label className={labelClass}>Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as SurveyFrequency })}
                  className={inputClass}
                >
                  <option value="">Not set</option>
                  {frequencyOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label className={labelClass}>
                  Question{form.questions.length === 1 ? "" : "s"}
                  {form.kind === "Pulse Check" && (
                    <span className="ml-1 normal-case text-ink-soft/70">
                      ({PULSE_MIN_QUESTIONS}–{PULSE_MAX_QUESTIONS} required)
                    </span>
                  )}
                </label>
              </div>
              <div className="space-y-2">
                {form.questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <textarea
                      required
                      rows={2}
                      value={q}
                      onChange={(e) => updateQuestion(i, e.target.value)}
                      className={inputClass}
                    />
                    {form.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(i)}
                        aria-label={`Remove question ${i + 1}`}
                        className="shrink-0 rounded-lg p-2 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {form.questions.length < PULSE_MAX_QUESTIONS && (
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark"
                >
                  <Plus className="h-3.5 w-3.5" /> Add question
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create survey"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
