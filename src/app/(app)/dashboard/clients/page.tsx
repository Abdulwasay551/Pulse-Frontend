"use client";

import { useEffect, useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import { clientsApi, type Client, type ClientStatus } from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const statusTone: Record<ClientStatus, string> = {
  Active: "bg-primary/15 text-primary",
  Prospect: "bg-amber-soft text-amber",
  "At risk": "bg-maroon-soft text-maroon",
};

const statusOptions: ClientStatus[] = ["Active", "Prospect", "At risk"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  status: ClientStatus;
}

const emptyForm: FormState = { name: "", industry: "", contact_name: "", contact_email: "", status: "Prospect" };

export default function ClientsPage() {
  const { withAuth } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await withAuth((token) => clientsApi.list(token));
      setClients(data);
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

  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name,
      industry: c.industry,
      contact_name: c.contact_name,
      contact_email: c.contact_email,
      status: c.status,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await withAuth((token) => clientsApi.update(token, editing.id, form));
      } else {
        await withAuth((token) => clientsApi.create(token, form));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Client) {
    if (!confirm(`Remove ${c.name}? Their requisitions will also be removed.`)) return;
    await withAuth((token) => clientsApi.remove(token, c.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Clients</h1>
          <p className="mt-1 text-sm text-ink-soft">Every company your desk places candidates with.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New client
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          Loading…
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No clients yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <div key={c.id} className="group relative rounded-2xl border border-line bg-card p-5">
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(c)}
                  aria-label={`Edit ${c.name}`}
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  aria-label={`Delete ${c.name}`}
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mb-3 flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold whitespace-nowrap ${statusTone[c.status]}`}
                >
                  {c.status}
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-ink">{c.name}</h3>
              <p className="text-xs text-ink-soft">{c.industry || "—"}</p>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-ink-soft">Open roles</span>
                <span className="font-mono font-semibold text-ink">{c.open_roles}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-ink-soft">Contact</span>
                <span className="text-ink">{c.contact_name || "—"}</span>
              </div>
              {c.contact_email && (
                <a
                  href={`mailto:${c.contact_email}`}
                  className="mt-3 block font-mono text-[11px] text-primary hover:text-primary-dark"
                >
                  {c.contact_email}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit client" : "New client"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Industry</label>
              <input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Contact name</label>
                <input
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contact email</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
                className={inputClass}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add client"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
