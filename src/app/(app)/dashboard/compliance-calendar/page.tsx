"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowLeftRight, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import {
  complianceEventsApi,
  complianceEventsCsv,
  payrollApi,
  exchangeRatesApi,
  convertCurrency,
  type ComplianceEvent,
  type ComplianceCategory,
  type CalendarStatus,
  type PayrollRun,
  type ExchangeRate,
  type CurrencyConversion,
} from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

function relativeTime(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 3600) return "just now";
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / (86400 * 30))}mo ago`;
}

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

export default function ComplianceCalendarPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <ComplianceCalendarPage />
    </Suspense>
  );
}

function ComplianceCalendarPage() {
  const { withAuth } = useAuth();
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<ComplianceEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showRateForm, setShowRateForm] = useState(false);
  const [rateForm, setRateForm] = useState({ currency: "", rate_to_usd: "1" });
  const [rateError, setRateError] = useState<string | null>(null);
  const [savingRate, setSavingRate] = useState(false);

  const [convertAmount, setConvertAmount] = useState("100");
  const [convertFrom, setConvertFrom] = useState("USD");
  const [convertTo, setConvertTo] = useState("USD");
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  async function load() {
    try {
      // allSettled — Finance Admin/HR both have PayrollRun access here, but
      // keep this resilient in case that ever narrows for another role.
      const [eResult, rResult, xResult] = await withAuth((token) =>
        Promise.allSettled([complianceEventsApi.list(token), payrollApi.list(token), exchangeRatesApi.list(token)])
      );
      setEvents(eResult.status === "fulfilled" ? eResult.value : []);
      setPayrollRuns(rResult.status === "fulfilled" ? rResult.value : []);
      setRates(xResult.status === "fulfilled" ? xResult.value : []);
    } finally {
      setLoading(false);
    }
  }

  const currencyOptions = Array.from(new Set(["USD", ...rates.map((r) => r.currency)]));

  function openAddRate() {
    setRateForm({ currency: "", rate_to_usd: "1" });
    setRateError(null);
    setShowRateForm(true);
  }

  async function handleRateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRateError(null);
    setSavingRate(true);
    try {
      const existing = rates.find((r) => r.currency === rateForm.currency.toUpperCase());
      if (existing) {
        await withAuth((token) => exchangeRatesApi.update(token, existing.id, { rate_to_usd: rateForm.rate_to_usd }));
      } else {
        await withAuth((token) =>
          exchangeRatesApi.create(token, { currency: rateForm.currency.toUpperCase(), rate_to_usd: rateForm.rate_to_usd })
        );
      }
      setShowRateForm(false);
      await load();
    } catch (err) {
      setRateError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSavingRate(false);
    }
  }

  async function handleDeleteRate(r: ExchangeRate) {
    if (!confirm(`Remove the ${r.currency} rate?`)) return;
    await withAuth((token) => exchangeRatesApi.remove(token, r.id));
    await load();
  }

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setConvertError(null);
    setConverting(true);
    try {
      const result = await withAuth((token) => convertCurrency(token, convertAmount, convertFrom, convertTo));
      setConversion(result);
    } catch (err) {
      setConversion(null);
      setConvertError(err instanceof ApiError ? err.message : "Couldn't convert that amount. Please try again.");
    } finally {
      setConverting(false);
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

  const searched = useTableSearch(events, (ev) =>
    [ev.title, ev.country, ev.category, ev.responsible_party, ev.linked_payroll_run_period, ev.notes]
      .filter(Boolean)
      .join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (ev, key) => {
    switch (key) {
      case "title":
        return ev.title;
      case "country":
        return ev.country;
      case "category":
        return ev.category;
      case "due_date":
        return ev.due_date;
      case "amount":
        return ev.amount ? Number(ev.amount) : null;
      case "calendar_status":
        return ev.calendar_status;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

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

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-1 flex items-center gap-1.5 font-display text-lg font-bold text-ink">
            <ArrowLeftRight className="h-4 w-4" /> Currency converter
          </h2>
          <p className="mb-4 text-xs text-ink-soft">Rates are HR/Finance Admin-maintained, not a live feed — check &quot;last updated&quot; below.</p>
          <form onSubmit={handleConvert} className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>From</label>
              <select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value)} className={inputClass}>
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>To</label>
              <select value={convertTo} onChange={(e) => setConvertTo(e.target.value)} className={inputClass}>
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={converting}
              className="rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {converting ? "Converting…" : "Convert"}
            </button>
          </form>
          {convertError && <p className="mt-3 text-sm text-maroon">{convertError}</p>}
          {conversion && (
            <p className="mt-4 text-lg font-semibold text-ink">
              {conversion.amount} {conversion.from} = <span className="text-primary">{conversion.result} {conversion.to}</span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Exchange rates</h2>
            <button
              onClick={openAddRate}
              className="flex items-center gap-1.5 rounded-lg bg-cream-dim px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream"
            >
              <Plus className="h-3.5 w-3.5" /> Add rate
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-line bg-cream/60 px-3.5 py-2.5 text-sm">
              <span className="font-semibold text-ink">USD</span>
              <span className="text-ink-soft">Base currency</span>
            </div>
            {rates.map((r) => (
              <div key={r.id} className="group flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5 text-sm">
                <span className="font-semibold text-ink">{r.currency}</span>
                <span className="text-ink-soft">1 {r.currency} = {r.rate_to_usd} USD</span>
                <span className="text-xs text-ink-soft">{relativeTime(r.updated_at)}</span>
                <button
                  onClick={() => handleDeleteRate(r)}
                  aria-label={`Remove ${r.currency} rate`}
                  className="rounded-lg p-1 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {rates.length === 0 && <p className="text-sm text-ink-soft">Add a rate to convert other currencies.</p>}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Event" sortKeyName="title" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Country" sortKeyName="country" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Category" sortKeyName="category" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Due date" sortKeyName="due_date" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Amount" sortKeyName="amount" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium">Responsible party</th>
              <th className="px-5 py-3 font-medium">Linked payroll run</th>
              <SortableTh label="Status" sortKeyName="calendar_status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((ev) => (
              <tr
                key={ev.id}
                onClick={() => openEdit(ev)}
                className="group cursor-pointer border-b border-line last:border-0 hover:bg-cream/60"
              >
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
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
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
        {!loading && visible.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No compliance events yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
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

      {showRateForm && (
        <Modal title="Add / update exchange rate" onClose={() => setShowRateForm(false)}>
          <form onSubmit={handleRateSubmit}>
            {rateError && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {rateError}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Currency code</label>
              <input
                required
                value={rateForm.currency}
                onChange={(e) => setRateForm({ ...rateForm, currency: e.target.value.toUpperCase() })}
                placeholder="EUR"
                maxLength={3}
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Rate to USD (1 unit = ? USD)</label>
              <input
                required
                type="number"
                min="0"
                step="0.000001"
                value={rateForm.rate_to_usd}
                onChange={(e) => setRateForm({ ...rateForm, rate_to_usd: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={savingRate}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {savingRate ? "Saving…" : "Save rate"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
