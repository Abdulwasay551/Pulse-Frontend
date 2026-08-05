"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, type Employee } from "@/lib/people-api";
import { assetsApi, supportTicketsApi, type Asset, type SupportTicket, type TicketCategory, type TicketPriority, type TicketStatus } from "@/lib/it-assets-api";
import { ApiError } from "@/lib/auth-api";

const categoryOptions: TicketCategory[] = ["Repair Request", "Device Query", "Access Request", "Other"];
const priorityOptions: TicketPriority[] = ["Low", "Medium", "High"];
const statusOptions: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

const statusTone: Record<TicketStatus, string> = {
  Open: "bg-cream-dim text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Resolved: "bg-primary/15 text-primary",
  Closed: "bg-primary/15 text-primary",
};

const priorityTone: Record<TicketPriority, string> = {
  Low: "text-ink-soft",
  Medium: "text-amber",
  High: "text-maroon",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  asset: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}
const emptyForm: FormState = { employee: "", asset: "", subject: "", description: "", category: "Device Query", priority: "Medium" };

export default function ItSupportPage() {
  const { withAuth } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // allSettled — Department Head has no Asset access here (only
      // support tickets, create-only), so that one 403 shouldn't blank the page.
      const [tResult, eResult, aResult] = await withAuth((token) =>
        Promise.allSettled([supportTicketsApi.list(token), employeesApi.list(token), assetsApi.list(token)])
      );
      setTickets(tResult.status === "fulfilled" ? tResult.value : []);
      setEmployees(eResult.status === "fulfilled" ? eResult.value : []);
      setAssets(aResult.status === "fulfilled" ? aResult.value : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ ...emptyForm, employee: employees[0] ? String(employees[0].id) : "" });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        supportTicketsApi.create(token, {
          employee: Number(form.employee),
          asset: form.asset ? Number(form.asset) : null,
          subject: form.subject,
          description: form.description,
          category: form.category,
          priority: form.priority,
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

  async function updateStatus(t: SupportTicket, status: TicketStatus) {
    await withAuth((token) => supportTicketsApi.update(token, t.id, { status }));
    await load();
  }

  async function handleDelete(t: SupportTicket) {
    if (!confirm(`Delete ticket "${t.subject}"?`)) return;
    await withAuth((token) => supportTicketsApi.remove(token, t.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">IT Support Requests Management</h1>
          <p className="mt-1 text-sm text-ink-soft">Device queries and repair requests.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New ticket
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Ticket</th>
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Ticket">
                  <div className="font-semibold text-ink">{t.subject}</div>
                  <div className="text-xs text-ink-soft">
                    {t.category}
                    {t.asset_tag && (
                      <>
                        {" · "}
                        <Link href={`/dashboard/asset-inventory?asset=${t.asset}`} className="hover:text-primary hover:underline">
                          {t.asset_tag}
                        </Link>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Employee">
                  <EmployeeLink employee={t.employee_detail} />
                </td>
                <td className={`px-5 py-3.5 text-xs font-semibold ${priorityTone[t.priority]}`} data-label="Priority">{t.priority}</td>
                <td className="px-5 py-3.5" data-label="Status">
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t, e.target.value as TicketStatus)}
                    className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold ${statusTone[t.status]}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(t)}
                      aria-label={`Delete ticket ${t.subject}`}
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
        {!loading && tickets.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No support tickets yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title="New support ticket" onClose={() => setShowForm(false)}>
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
              <label className={labelClass}>Related asset (optional)</label>
              <select value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} className={inputClass}>
                <option value="">None</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.asset_tag})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Subject</label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}
                  className={inputClass}
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}
                  className={inputClass}
                >
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Submitting…" : "Submit ticket"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
