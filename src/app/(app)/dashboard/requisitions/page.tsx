"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import {
  clientsApi,
  requisitionsApi,
  requisitionsCsv,
  type Client,
  type EmploymentType,
  type Requisition,
  type RequisitionPriority,
  type RequisitionStatus,
} from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const REQUISITION_REQUIRED_FIELDS = ["client", "title"];

const statusTone: Record<RequisitionStatus, string> = {
  Open: "bg-cream-dim text-ink-soft",
  Interviewing: "bg-amber-soft text-amber",
  "Offer stage": "bg-primary-light/20 text-primary",
  "On hold": "bg-maroon-soft text-maroon",
  Filled: "bg-primary/15 text-primary",
};

const priorityTone: Record<RequisitionPriority, string> = {
  High: "text-maroon",
  Medium: "text-amber",
  Low: "text-ink-soft",
};

const priorityOptions: RequisitionPriority[] = ["High", "Medium", "Low"];
const statusOptions: RequisitionStatus[] = ["Open", "Interviewing", "Offer stage", "On hold", "Filled"];
const employmentTypeOptions: EmploymentType[] = ["Full-time", "Part-time", "Contract", "Temporary"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  title: string;
  client: string;
  recruiter: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  requirements: string;
  salary_min: string;
  salary_max: string;
  location: string;
  employment_type: EmploymentType;
  headcount: string;
  description: string;
  hiring_manager: string;
}

const emptyForm: FormState = {
  title: "",
  client: "",
  recruiter: "",
  priority: "Medium",
  status: "Open",
  requirements: "",
  salary_min: "",
  salary_max: "",
  location: "",
  employment_type: "Full-time",
  headcount: "1",
  description: "",
  hiring_manager: "",
};

function formToPayload(form: FormState) {
  return {
    title: form.title,
    client: Number(form.client),
    recruiter: form.recruiter,
    priority: form.priority,
    status: form.status,
    requirements: form.requirements,
    salary_min: form.salary_min ? Number(form.salary_min) : null,
    salary_max: form.salary_max ? Number(form.salary_max) : null,
    location: form.location,
    employment_type: form.employment_type,
    headcount: Number(form.headcount) || 1,
    description: form.description,
    hiring_manager: form.hiring_manager,
  };
}

export default function RequisitionsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <RequisitionsPage />
    </Suspense>
  );
}

function RequisitionsPage() {
  const { withAuth } = useAuth();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [editing, setEditing] = useState<Requisition | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // allSettled — Department Head has read-only Client access here
      // (just enough to populate this page's client picker), so treat a
      // Client-list failure as "no clients" rather than blanking requisitions.
      const [rResult, cResult] = await withAuth((token) =>
        Promise.allSettled([requisitionsApi.list(token), clientsApi.list(token)])
      );
      setRequisitions(rResult.status === "fulfilled" ? rResult.value : []);
      setClients(cResult.status === "fulfilled" ? cResult.value : []);
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
    setForm({ ...emptyForm, client: clients[0] ? String(clients[0].id) : "" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(r: Requisition) {
    setEditing(r);
    setForm({
      title: r.title,
      client: String(r.client),
      recruiter: r.recruiter,
      priority: r.priority,
      status: r.status,
      requirements: r.requirements,
      salary_min: r.salary_min ?? "",
      salary_max: r.salary_max ?? "",
      location: r.location,
      employment_type: r.employment_type,
      headcount: String(r.headcount),
      description: r.description,
      hiring_manager: r.hiring_manager,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client) {
      setError("Add a client first before creating a requisition.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await withAuth((token) => requisitionsApi.update(token, editing.id, formToPayload(form)));
      } else {
        await withAuth((token) => requisitionsApi.create(token, formToPayload(form)));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: Requisition) {
    if (!confirm(`Delete requisition "${r.title}"?`)) return;
    await withAuth((token) => requisitionsApi.remove(token, r.id));
    if (activeId === r.id) setActiveId(null);
    await load();
  }

  async function updateStatus(r: Requisition, status: RequisitionStatus) {
    await withAuth((token) => requisitionsApi.update(token, r.id, { status }));
    await load();
  }

  const searched = useTableSearch(requisitions, (r) =>
    [r.title, r.client_name, r.recruiter, r.status, r.priority, r.location].filter(Boolean).join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (r, key) => {
    switch (key) {
      case "title":
        return r.title;
      case "recruiter":
        return r.recruiter;
      case "priority":
        return r.priority;
      case "status":
        return r.status;
      case "posted_at":
        return r.posted_at;
      case "days_open":
        return r.days_open;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  const active = requisitions.find((r) => r.id === activeId) ?? null;

  if (active) {
    return (
      <RequisitionDetail
        requisition={active}
        onBack={() => setActiveId(null)}
        onEdit={() => openEdit(active)}
        onStatusChange={(status) => updateStatus(active, status)}
        formModal={
          showForm && (
            <RequisitionFormModal
              editing={editing}
              form={form}
              setForm={setForm}
              clients={clients}
              error={error}
              saving={saving}
              onClose={() => setShowForm(false)}
              onSubmit={handleSubmit}
            />
          )
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Job Openings</h1>
          <p className="mt-1 text-sm text-ink-soft">Every open job order, across every client.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={requisitionsCsv}
            resourceLabel="job openings"
            requiredFields={REQUISITION_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New requisition
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Role" sortKeyName="title" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Recruiter" sortKeyName="recruiter" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium">Candidates</th>
              <SortableTh label="Priority" sortKeyName="priority" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Posted" sortKeyName="posted_at" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Days open" sortKeyName="days_open" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Role">
                  <button onClick={() => setActiveId(r.id)} className="text-left">
                    <div className="font-semibold text-ink hover:text-primary hover:underline">{r.title}</div>
                  </button>
                  <Link href="/dashboard/clients" className="text-xs text-ink-soft hover:text-primary hover:underline">
                    {r.client_name}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Recruiter">{r.recruiter || "—"}</td>
                <td className="px-5 py-3.5 text-ink" data-label="Candidates">
                  <Link href="/dashboard/candidates" className="hover:text-primary hover:underline">
                    {r.candidates_count}
                  </Link>
                </td>
                <td className={`px-5 py-3.5 text-xs font-semibold ${priorityTone[r.priority]}`} data-label="Priority">
                  {r.priority}
                </td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Posted">{r.posted_at}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Days open">{r.days_open}</td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(r)}
                      aria-label={`Edit ${r.title}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      aria-label={`Delete ${r.title}`}
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
          <div className="p-10 text-center text-sm text-ink-soft">No job openings yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {showForm && (
        <RequisitionFormModal
          editing={editing}
          form={form}
          setForm={setForm}
          clients={clients}
          error={error}
          saving={saving}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function RequisitionFormModal({
  editing,
  form,
  setForm,
  clients,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  editing: Requisition | null;
  form: FormState;
  setForm: (f: FormState) => void;
  clients: Client[];
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Modal title={editing ? "Edit requisition" : "New requisition"} onClose={onClose} wide>
      <form onSubmit={onSubmit}>
        {error && (
          <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
            {error}
          </div>
        )}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Client</label>
            <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className={inputClass}>
              {clients.length === 0 && <option value="">Add a client first</option>}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Recruiter</label>
            <input
              value={form.recruiter}
              onChange={(e) => setForm({ ...form, recruiter: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Hiring manager</label>
            <input
              value={form.hiring_manager}
              onChange={(e) => setForm({ ...form, hiring_manager: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as RequisitionPriority })}
              className={inputClass}
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as RequisitionStatus })}
              className={inputClass}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Salary min (USD)</label>
            <input
              type="number"
              min="0"
              value={form.salary_min}
              onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Salary max (USD)</label>
            <input
              type="number"
              min="0"
              value={form.salary_max}
              onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Remote, or a city"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={form.employment_type}
              onChange={(e) => setForm({ ...form, employment_type: e.target.value as EmploymentType })}
              className={inputClass}
            >
              {employmentTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Headcount</label>
            <input
              type="number"
              min="1"
              value={form.headcount}
              onChange={(e) => setForm({ ...form, headcount: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="mb-6">
          <label className={labelClass}>Requirements</label>
          <textarea
            rows={3}
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            placeholder="Key skills, keywords, and experience — used by AI resume screening to score candidates against this role."
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : editing ? "Save changes" : "Add requisition"}
        </button>
      </form>
    </Modal>
  );
}

function RequisitionDetail({
  requisition,
  onBack,
  onEdit,
  onStatusChange,
  formModal,
}: {
  requisition: Requisition;
  onBack: () => void;
  onEdit: () => void;
  onStatusChange: (status: RequisitionStatus) => void;
  formModal: React.ReactNode;
}) {
  const salaryRange =
    requisition.salary_min || requisition.salary_max
      ? `$${Number(requisition.salary_min ?? 0).toLocaleString()} – $${Number(requisition.salary_max ?? 0).toLocaleString()}`
      : "Not set";

  return (
    <div className="mx-auto max-w-6xl">
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All job openings
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-line bg-card p-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-ink">{requisition.title}</h1>
            <span className={`text-xs font-semibold ${priorityTone[requisition.priority]}`}>{requisition.priority}</span>
          </div>
          <p className="text-xs text-ink-soft">
            {requisition.client_name} · Posted {requisition.posted_at} · {requisition.days_open} days open
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink-soft hover:bg-cream-dim hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <select
            value={requisition.status}
            onChange={(e) => onStatusChange(e.target.value as RequisitionStatus)}
            className={`rounded-full border-0 px-3 py-2 text-xs font-semibold ${statusTone[requisition.status]}`}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-sm font-bold text-ink">Role details</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-ink-soft">Salary range</dt>
              <dd className="text-ink">{salaryRange}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Location</dt>
              <dd className="text-ink">{requisition.location || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Type / headcount</dt>
              <dd className="text-ink">
                {requisition.employment_type} · {requisition.headcount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Hiring manager</dt>
              <dd className="text-ink">{requisition.hiring_manager || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Recruiter</dt>
              <dd className="text-ink">{requisition.recruiter || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Candidates</dt>
              <dd className="text-ink">
                <Link href="/dashboard/candidates" className="text-primary hover:underline">
                  {requisition.candidates_count} in pipeline
                </Link>
              </dd>
            </div>
          </dl>
          {requisition.description && (
            <div className="mt-4 border-t border-line pt-4">
              <dt className="mb-1 text-xs text-ink-soft">Description</dt>
              <p className="whitespace-pre-line text-sm text-ink">{requisition.description}</p>
            </div>
          )}
          {requisition.requirements && (
            <div className="mt-4 border-t border-line pt-4">
              <dt className="mb-1 text-xs text-ink-soft">Requirements</dt>
              <p className="whitespace-pre-line text-sm text-ink">{requisition.requirements}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 font-display text-sm font-bold text-ink">Status</h2>
          <div className="flex flex-col gap-3">
            {statusOptions.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    s === requisition.status ? "bg-primary" : "bg-cream-dim"
                  }`}
                />
                <span className={`text-xs ${s === requisition.status ? "font-semibold text-ink" : "text-ink-soft"}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-line pt-4 text-xs text-ink-soft">
            Last updated {new Date(requisition.updated_at).toLocaleString()}
          </div>
        </div>
      </div>

      {formModal}
    </div>
  );
}
