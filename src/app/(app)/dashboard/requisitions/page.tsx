"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import {
  clientsApi,
  requisitionsApi,
  type Client,
  type Requisition,
  type RequisitionPriority,
  type RequisitionStatus,
} from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

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

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  title: string;
  client: string;
  recruiter: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
}

const emptyForm: FormState = { title: "", client: "", recruiter: "", priority: "Medium", status: "Open" };

export default function RequisitionsPage() {
  const { withAuth } = useAuth();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Requisition | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [r, c] = await withAuth((token) => Promise.all([requisitionsApi.list(token), clientsApi.list(token)]));
      setRequisitions(r);
      setClients(c);
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
    const payload = {
      title: form.title,
      client: Number(form.client),
      recruiter: form.recruiter,
      priority: form.priority,
      status: form.status,
    };
    try {
      if (editing) {
        await withAuth((token) => requisitionsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => requisitionsApi.create(token, payload));
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
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Requisitions</h1>
          <p className="mt-1 text-sm text-ink-soft">Every open job order, across every client.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New requisition
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Recruiter</th>
              <th className="px-5 py-3 font-medium">Candidates</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Posted</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {requisitions.map((r) => (
              <tr key={r.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink">{r.title}</div>
                  <div className="text-xs text-ink-soft">{r.client_name}</div>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{r.recruiter || "—"}</td>
                <td className="px-5 py-3.5 font-mono text-ink">{r.candidates_count}</td>
                <td className={`px-5 py-3.5 font-mono text-xs font-semibold ${priorityTone[r.priority]}`}>
                  {r.priority}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${statusTone[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{r.posted_at}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
        {!loading && requisitions.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No requisitions yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit requisition" : "New requisition"} onClose={() => setShowForm(false)}>
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
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Client</label>
              <select
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className={inputClass}
              >
                {clients.length === 0 && <option value="">Add a client first</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Recruiter</label>
              <input
                value={form.recruiter}
                onChange={(e) => setForm({ ...form, recruiter: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3">
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
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add requisition"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
