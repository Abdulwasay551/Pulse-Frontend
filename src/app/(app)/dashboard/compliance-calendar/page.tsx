"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import {
  complianceEventsApi,
  complianceEventsCsv,
  payrollApi,
  type ComplianceEvent,
  type ComplianceCategory,
  type CalendarStatus,
  type PayrollRun,
} from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

const COMPLIANCE_EVENT_REQUIRED_FIELDS = ["country", "title", "due_date"];

const categoryOptions: ComplianceCategory[] = ["Tax Filing", "Currency Update", "Regulatory"];

const statusTone: Record<CalendarStatus, string> = {
  Upcoming: "bg-cream-dim text-ink-soft",
  "Due soon": "bg-amber-soft text-amber",
  Overdue: "bg-maroon-soft text-maroon",
  Completed: "bg-primary/15 text-primary",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  country: string;
  title: string;
  category: ComplianceCategory;
  due_date: string;
  amount: string;
  currency: string;
  responsible_party: string;
  linked_payroll_run: string;
  notes: string;
}

const emptyForm: FormState = {
  country: "",
  title: "",
  category: "Tax Filing",
  due_date: "",
  amount: "",
  currency: "",
  responsible_party: "",
  linked_payroll_run: "",
  notes: "",
};

export default function ComplianceCalendarPage() {
  const { withAuth } = useAuth();
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<ComplianceEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // allSettled — Finance Admin/HR both have PayrollRun access here, but
      // keep this resilient in case that ever narrows for another role.
      const [eResult, rResult] = await withAuth((token) =>
        Promise.allSettled([complianceEventsApi.list(token), payrollApi.list(token)])
      );
      setEvents(eResult.status === "fulfilled" ? eResult.value : []);
      setPayrollRuns(rResult.status === "fulfilled" ? rResult.value : []);
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
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(ev: ComplianceEvent) {
    setEditing(ev);
    setForm({
      country: ev.country,
      title: ev.title,
      category: ev.category,
      due_date: ev.due_date,
      amount: ev.amount ?? "",
      currency: ev.currency,
      responsible_party: ev.responsible_party,
      linked_payroll_run: ev.linked_payroll_run ? String(ev.linked_payroll_run) : "",
      notes: ev.notes,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      country: form.country,
      title: form.title,
      category: form.category,
      due_date: form.due_date,
      amount: form.amount === "" ? null : form.amount,
      currency: form.currency,
      responsible_party: form.responsible_party,
      linked_payroll_run: form.linked_payroll_run ? Number(form.linked_payroll_run) : null,
      notes: form.notes,
    };
    try {
      if (editing) {
        await withAuth((token) => complianceEventsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => complianceEventsApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCompleted(ev: ComplianceEvent) {
    await withAuth((token) => complianceEventsApi.update(token, ev.id, { completed: !ev.completed }));
    await load();
  }

  async function handleDelete(ev: ComplianceEvent) {
    if (!confirm(`Delete "${ev.title}"?`)) return;
    await withAuth((token) => complianceEventsApi.remove(token, ev.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Multi-Currency Support &amp; Compliance Calendar</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Statutory filing and regulatory deadlines, per country — payroll itself supports any currency (see a run&apos;s
            currency field on the Payroll page).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={complianceEventsCsv}
            resourceLabel="compliance events"
            requiredFields={COMPLIANCE_EVENT_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New event
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Country</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Due date</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Responsible party</th>
              <th className="px-5 py-3 font-medium">Linked payroll run</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5 font-semibold text-ink" data-label="Event">{ev.title}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Country">{ev.country}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Category">{ev.category}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Due date">{ev.due_date}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Amount">
                  {ev.amount ? `${ev.currency} ${ev.amount}` : "—"}
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Responsible party">{ev.responsible_party || "—"}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Linked payroll run">{ev.linked_payroll_run_period || "—"}</td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[ev.calendar_status]}`}>
                    {ev.calendar_status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!ev.completed && (
                      <button
                        onClick={() => toggleCompleted(ev)}
                        aria-label={`Mark ${ev.title} completed`}
                        className="rounded-lg p-1.5 text-ink-soft hover:bg-primary/15 hover:text-primary"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(ev)}
                      aria-label={`Edit ${ev.title}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev)}
                      aria-label={`Delete ${ev.title}`}
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
        {!loading && events.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No compliance events yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit event" : "New compliance event"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Q3 payroll tax filing"
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Country</label>
                <input
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ComplianceCategory })}
                  className={inputClass}
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Due date</label>
              <input
                required
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Amount (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  placeholder="USD"
                  maxLength={3}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Responsible party</label>
              <input
                value={form.responsible_party}
                onChange={(e) => setForm({ ...form, responsible_party: e.target.value })}
                placeholder="e.g. Finance Admin"
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Linked payroll run (optional)</label>
              <select
                value={form.linked_payroll_run}
                onChange={(e) => setForm({ ...form, linked_payroll_run: e.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {payrollRuns.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.period}
                  </option>
                ))}
              </select>
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
              {saving ? "Saving…" : editing ? "Save changes" : "Add event"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
