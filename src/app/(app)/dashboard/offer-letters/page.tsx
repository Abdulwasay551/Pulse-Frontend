"use client";

import { useEffect, useState } from "react";
import { FileStack, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import CandidateLink from "@/components/dashboard/CandidateLink";
import {
  candidatesApi,
  clientsApi,
  offerLetterTemplatesApi,
  offerLettersApi,
  offerLettersCsv,
  type Candidate,
  type Client,
  type OfferLetter,
  type OfferLetterStatus,
  type OfferLetterTemplate,
} from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const OFFER_LETTER_REQUIRED_FIELDS = ["candidate", "job_title", "body"];

const statusTone: Record<OfferLetterStatus, string> = {
  Draft: "bg-cream-dim text-ink-soft",
  Sent: "bg-amber-soft text-amber",
  Signed: "bg-primary/15 text-primary",
  Declined: "bg-maroon-soft text-maroon",
};

const statusOptions: OfferLetterStatus[] = ["Draft", "Sent", "Signed", "Declined"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  candidate: string;
  template: string;
  job_title: string;
  salary: string;
  start_date: string;
  body: string;
  status: OfferLetterStatus;
}

const emptyForm: FormState = {
  candidate: "",
  template: "",
  job_title: "",
  salary: "",
  start_date: "",
  body: "",
  status: "Draft",
};

const DEFAULT_BODY =
  "Dear {name},\n\nWe are pleased to offer you the position of {role}. We look forward to you joining the team.\n\nBest regards,\nHiring Team";

function applyTemplateVars(body: string, name: string, role: string) {
  return body.replace(/\{name\}/g, name).replace(/\{role\}/g, role);
}

export default function OfferLettersPage() {
  const { withAuth } = useAuth();
  const [offers, setOffers] = useState<OfferLetter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [templates, setTemplates] = useState<OfferLetterTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<OfferLetter | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [o, c, t] = await withAuth((token) =>
        Promise.all([offerLettersApi.list(token), candidatesApi.list(token), offerLetterTemplatesApi.list(token)])
      );
      setOffers(o);
      setCandidates(c);
      setTemplates(t);
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

  function openEdit(o: OfferLetter) {
    setEditing(o);
    setForm({
      candidate: String(o.candidate),
      template: "",
      job_title: o.job_title,
      salary: o.salary ?? "",
      start_date: o.start_date ?? "",
      body: o.body,
      status: o.status,
    });
    setError(null);
    setShowForm(true);
  }

  function handleCandidateChange(candidateId: string) {
    const candidate = candidates.find((c) => String(c.id) === candidateId);
    setForm({
      ...form,
      candidate: candidateId,
      template: "",
      job_title: form.job_title || candidate?.role || "",
      body: form.body || (candidate ? applyTemplateVars(DEFAULT_BODY, candidate.name, candidate.role) : ""),
    });
  }

  function handleTemplateChange(templateId: string) {
    const template = templates.find((t) => String(t.id) === templateId);
    const candidate = candidates.find((c) => String(c.id) === form.candidate);
    if (!template) {
      setForm({ ...form, template: templateId });
      return;
    }
    setForm({
      ...form,
      template: templateId,
      job_title: template.role_title,
      body: candidate ? applyTemplateVars(template.body, candidate.name, candidate.role) : template.body,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.candidate) {
      setError("Choose a candidate first.");
      return;
    }
    setError(null);
    setSaving(true);
    const payload = {
      candidate: Number(form.candidate),
      job_title: form.job_title,
      salary: form.salary || null,
      start_date: form.start_date || null,
      body: form.body,
      status: form.status,
    };
    try {
      if (editing) {
        await withAuth((token) => offerLettersApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => offerLettersApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(o: OfferLetter) {
    if (!confirm(`Delete the offer letter for ${o.candidate_detail.name}?`)) return;
    await withAuth((token) => offerLettersApi.remove(token, o.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Digital Offer Letters</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Draft, send, and track offers through to signature. Signing is confirmed manually today — a real
            e-signature vendor can slot in here later.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink"
          >
            <FileStack className="h-4 w-4" /> Templates
          </button>
          <CsvToolbar
            csv={offerLettersCsv}
            resourceLabel="offer letters"
            requiredFields={OFFER_LETTER_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New offer
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Job title</th>
              <th className="px-5 py-3 font-medium">Salary</th>
              <th className="px-5 py-3 font-medium">Start date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Candidate">
                  <CandidateLink candidate={o.candidate_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Job title">{o.job_title}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Salary">{o.salary ?? "—"}</td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Start date">{o.start_date ?? "—"}</td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[o.status]}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(o)}
                      aria-label={`Edit offer for ${o.candidate_detail.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(o)}
                      aria-label={`Delete offer for ${o.candidate_detail.name}`}
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
        {!loading && offers.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No offer letters yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit offer letter" : "New offer letter"} onClose={() => setShowForm(false)} wide>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Candidate</label>
                <select
                  required
                  disabled={!!editing}
                  value={form.candidate}
                  onChange={(e) => handleCandidateChange(e.target.value)}
                  className={`${inputClass} disabled:opacity-60`}
                >
                  <option value="">Choose a candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Job title</label>
                <input
                  required
                  value={form.job_title}
                  onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            {(() => {
              const candidate = candidates.find((c) => String(c.id) === form.candidate);
              const relevantTemplates = candidate?.client
                ? templates.filter((t) => t.client === candidate.client)
                : templates;
              if (!form.candidate || relevantTemplates.length === 0) return null;
              return (
                <div className="mb-4">
                  <label className={labelClass}>Use a template</label>
                  <select value={form.template} onChange={(e) => handleTemplateChange(e.target.value)} className={inputClass}>
                    <option value="">Start from scratch</option>
                    {relevantTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.client_name} — {t.role_title}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Salary</label>
                <input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="e.g. 95000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Start date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Offer letter body</label>
              <textarea
                required
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as OfferLetterStatus })}
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
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create offer letter"}
            </button>
          </form>
        </Modal>
      )}

      {showTemplates && (
        <TemplatesModal templates={templates} onClose={() => setShowTemplates(false)} onChanged={load} />
      )}
    </div>
  );
}

function TemplatesModal({
  templates,
  onClose,
  onChanged,
}: {
  templates: OfferLetterTemplate[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const { withAuth } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: "", role_title: "", body: DEFAULT_BODY });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    withAuth((token) => clientsApi.list(token)).then(setClients);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ client: clients[0] ? String(clients[0].id) : "", role_title: "", body: DEFAULT_BODY });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client || !form.role_title) return;
    setSaving(true);
    try {
      await withAuth((token) =>
        offerLetterTemplatesApi.create(token, { client: Number(form.client), role_title: form.role_title, body: form.body })
      );
      setShowForm(false);
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: OfferLetterTemplate) {
    if (!confirm(`Delete the "${t.role_title}" template for ${t.client_name}?`)) return;
    await withAuth((token) => offerLetterTemplatesApi.remove(token, t.id));
    await onChanged();
  }

  return (
    <Modal title="Offer letter templates" onClose={onClose} wide>
      <p className="mb-4 text-xs text-ink-soft">
        One template per client, per role — selectable from a dropdown when drafting a new offer for that client.
      </p>
      <div className="mb-4 flex flex-col gap-2">
        {templates.length === 0 ? (
          <p className="text-sm text-ink-soft">No templates saved yet.</p>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cream px-3.5 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink">{t.role_title}</div>
                <div className="truncate text-xs text-ink-soft">{t.client_name}</div>
              </div>
              <button
                onClick={() => handleDelete(t)}
                aria-label={`Delete template ${t.role_title}`}
                className="shrink-0 rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="border-t border-line pt-4">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Client</label>
              <select
                required
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className={inputClass}
              >
                <option value="">Choose a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Role title</label>
              <input
                required
                value={form.role_title}
                onChange={(e) => setForm({ ...form, role_title: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Template body</label>
            <textarea
              required
              rows={6}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Use {name} and {role} as placeholders — filled in automatically when this template is used."
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </form>
      ) : (
        <button
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" /> New template
        </button>
      )}
    </Modal>
  );
}
