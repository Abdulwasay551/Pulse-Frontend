"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import { employeesApi, type Employee } from "@/lib/people-api";
import {
  assetsApi,
  supportTicketsApi,
  supportTicketsCsv,
  type Asset,
  type SupportTicket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/it-assets-api";
import { ApiError } from "@/lib/auth-api";

const SUPPORT_TICKET_REQUIRED_FIELDS = ["employee", "subject"];

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

const priorityRank: Record<TicketPriority, number> = { Low: 0, Medium: 1, High: 2 };

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

export default function ItSupportPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <ItSupportPage />
    </Suspense>
  );
}

function ItSupportPage() {
  const { withAuth } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"board" | "list">("board");

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

  const searched = useTableSearch(tickets, (t) =>
    [t.subject, t.employee_detail.name, t.category, t.priority, t.status, t.asset_tag].filter(Boolean).join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (t, key) => {
    switch (key) {
      case "subject":
        return t.subject;
      case "employee":
        return t.employee_detail.name;
      case "priority":
        return priorityRank[t.priority];
      case "status":
        return t.status;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Support Ticket Management</h1>
          <p className="mt-1 text-sm text-ink-soft">Device queries and repair requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-line bg-card p-1">
            <button
              onClick={() => setView("board")}
              aria-label="Board view"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                view === "board" ? "bg-primary text-cream" : "text-ink-soft hover:text-ink"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                view === "list" ? "bg-primary text-cream" : "text-ink-soft hover:text-ink"
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
          <CsvToolbar
            csv={supportTicketsCsv}
            resourceLabel="support tickets"
            requiredFields={SUPPORT_TICKET_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New ticket
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : searched.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">No support tickets yet.</div>
      ) : view === "board" ? (
        <TicketBoard tickets={searched} onMove={updateStatus} onDelete={handleDelete} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="eh-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
                <SortableTh label="Ticket" sortKeyName="subject" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTh label="Employee" sortKeyName="employee" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableTh label="Priority" sortKeyName="priority" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-5 py-3 font-medium">Resolution time</th>
                <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
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
                  <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Resolution time">{t.resolution_time ?? "—"}</td>
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
          <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
        </div>
      )}

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

/** Kanban-style ticket workflow — one column per status, cards move left/right
 * along `statusOptions` rather than free drag-and-drop, which keeps the
 * interaction accessible (keyboard/click-only) without pulling in a DnD
 * library for four fixed columns. */
function TicketBoard({
  tickets,
  onMove,
  onDelete,
}: {
  tickets: SupportTicket[];
  onMove: (t: SupportTicket, status: TicketStatus) => void;
  onDelete: (t: SupportTicket) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statusOptions.map((status) => {
        const columnTickets = tickets.filter((t) => t.status === status);
        return (
          <div key={status} className="rounded-2xl border border-line bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone[status]}`}>{status}</span>
              <span className="text-xs font-semibold text-ink-soft">{columnTickets.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {columnTickets.map((t) => {
                const idx = statusOptions.indexOf(status);
                return (
                  <div key={t.id} className="group rounded-xl border border-line bg-cream p-3.5">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{t.subject}</p>
                      <button
                        onClick={() => onDelete(t)}
                        aria-label={`Delete ticket ${t.subject}`}
                        className="shrink-0 rounded-md p-1 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mb-2">
                      <EmployeeLink employee={t.employee_detail} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className={`font-semibold ${priorityTone[t.priority]}`}>{t.priority}</span>
                      {t.asset_tag && <span className="text-ink-soft">{t.asset_tag}</span>}
                      {t.resolution_time && <span className="text-ink-soft">· {t.resolution_time}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => idx > 0 && onMove(t, statusOptions[idx - 1])}
                        disabled={idx === 0}
                        aria-label="Move to previous status"
                        className="rounded-md p-1 text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => idx < statusOptions.length - 1 && onMove(t, statusOptions[idx + 1])}
                        disabled={idx === statusOptions.length - 1}
                        aria-label="Move to next status"
                        className="rounded-md p-1 text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-30"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {columnTickets.length === 0 && <p className="py-4 text-center text-xs text-ink-soft">No tickets</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
