"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import CandidateLink from "@/components/dashboard/CandidateLink";
import {
  candidatesApi,
  offerLettersApi,
  offerLettersCsv,
  type Candidate,
  type OfferLetter,
  type OfferLetterStatus,
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
  job_title: string;
  salary: string;
  start_date: string;
  body: string;
  status: OfferLetterStatus;
}

const emptyForm: FormState = { candidate: "", job_title: "", salary: "", start_date: "", body: "", status: "Draft" };

const DEFAULT_BODY =
  "Dear {name},\n\nWe are pleased to offer you the position of {role}. We look forward to you joining the team.\n\nBest regards,\nHiring Team";

export default function OfferLettersPage() {
  const { withAuth } = useAuth();
  const [offers, setOffers] = useState<OfferLetter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<OfferLetter | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [o, c] = await withAuth((token) => Promise.all([offerLettersApi.list(token), candidatesApi.list(token)]));
      setOffers(o);
      setCandidates(c);
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
      job_title: form.job_title || candidate?.role || "",
      body: form.body || (candidate ? DEFAULT_BODY.replace("{name}", candidate.name).replace("{role}", candidate.role) : ""),
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
    </div>
  );
}
