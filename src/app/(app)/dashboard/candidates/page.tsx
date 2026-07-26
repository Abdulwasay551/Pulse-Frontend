"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import {
  candidatesApi,
  candidatesCsv,
  clientsApi,
  requisitionsApi,
  type Candidate,
  type CandidateStage,
  type CandidateSource,
  type Client,
  type Requisition,
} from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const CANDIDATE_REQUIRED_FIELDS = ["name", "role"];

const stageTone: Record<CandidateStage, string> = {
  Sourced: "bg-cream-dim text-ink-soft",
  Interview: "bg-amber-soft text-amber",
  Offer: "bg-primary-light/20 text-primary",
  Placed: "bg-primary/15 text-primary",
  Rejected: "bg-maroon-soft text-maroon",
};

const stages: (CandidateStage | "All")[] = ["All", "Sourced", "Interview", "Offer", "Placed", "Rejected"];
const stageOptions: CandidateStage[] = ["Sourced", "Interview", "Offer", "Placed", "Rejected"];
const sourceOptions: CandidateSource[] = ["LinkedIn", "Referral", "Job Board", "Sourced", "Other"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  name: string;
  role: string;
  client: string;
  requisition: string;
  stage: CandidateStage;
  source: CandidateSource;
}

const emptyForm: FormState = {
  name: "",
  role: "",
  client: "",
  requisition: "",
  stage: "Sourced",
  source: "Sourced",
};

export default function CandidatesPage() {
  const { withAuth } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof stages)[number]>("All");

  const [editing, setEditing] = useState<Candidate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [c, cl, r] = await withAuth((token) =>
        Promise.all([candidatesApi.list(token), clientsApi.list(token), requisitionsApi.list(token)])
      );
      setCandidates(c);
      setClients(cl);
      setRequisitions(r);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = filter === "All" ? candidates : candidates.filter((c) => c.stage === filter);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Candidate) {
    setEditing(c);
    setForm({
      name: c.name,
      role: c.role,
      client: c.client ? String(c.client) : "",
      requisition: c.requisition ? String(c.requisition) : "",
      stage: c.stage,
      source: c.source,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      name: form.name,
      role: form.role,
      client: form.client ? Number(form.client) : null,
      requisition: form.requisition ? Number(form.requisition) : null,
      stage: form.stage,
      source: form.source,
    };
    try {
      if (editing) {
        await withAuth((token) => candidatesApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => candidatesApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Candidate) {
    if (!confirm(`Remove ${c.name} from candidates?`)) return;
    await withAuth((token) => candidatesApi.remove(token, c.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Candidates</h1>
          <p className="mt-1 text-sm text-ink-soft">Every candidate across every open requisition.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={candidatesCsv}
            resourceLabel="candidates"
            requiredFields={CANDIDATE_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New candidate
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {stages.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors ${
              filter === s ? "bg-primary text-cream" : "bg-card text-ink-soft hover:bg-cream-dim"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Stage</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Applied</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-[11px] font-bold text-primary">
                      {c.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink">{c.name}</div>
                      <div className="truncate text-xs text-ink-soft">{c.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{c.client_name ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${stageTone[c.stage]}`}
                  >
                    {c.stage}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{c.source}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{c.applied_at}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No candidates in this stage.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit candidate" : "New candidate"} onClose={() => setShowForm(false)}>
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
              <label className={labelClass}>Role</label>
              <input
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Client</label>
                <select
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Requisition</label>
                <select
                  value={form.requisition}
                  onChange={(e) => setForm({ ...form, requisition: e.target.value })}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {requisitions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Stage</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value as CandidateStage })}
                  className={inputClass}
                >
                  {stageOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Source</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value as CandidateSource })}
                  className={inputClass}
                >
                  {sourceOptions.map((s) => (
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
              {saving ? "Saving…" : editing ? "Save changes" : "Add candidate"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
