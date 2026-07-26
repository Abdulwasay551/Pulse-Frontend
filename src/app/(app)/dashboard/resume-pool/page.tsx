"use client";

import { useEffect, useState } from "react";
import { FileText, Sparkles, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import { candidatesApi, screenCandidate, uploadResume, type Candidate } from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft";

function scoreTone(score: number | null) {
  if (score === null) return "bg-cream-dim text-ink-soft";
  if (score >= 70) return "bg-primary/15 text-primary";
  if (score >= 40) return "bg-amber-soft text-amber";
  return "bg-maroon-soft text-maroon";
}

export default function ResumePoolPage() {
  const { withAuth } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Candidate | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await withAuth((token) => candidatesApi.list(token));
      setCandidates(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCandidate(c: Candidate) {
    setActive(c);
    setResumeText(c.resume_text);
    setError(null);
  }

  async function handleSaveText() {
    if (!active) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await withAuth((token) => candidatesApi.update(token, active.id, { resume_text: resumeText }));
      setActive(updated);
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the resume text.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    if (!active) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await withAuth((token) => uploadResume(token, active.id, file));
      setActive(updated);
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleScreen() {
    if (!active) return;
    setScreening(true);
    setError(null);
    try {
      const updated = await withAuth((token) => screenCandidate(token, active.id));
      setActive(updated);
      setResumeText(updated.resume_text);
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Screening failed. Please try again.");
    } finally {
      setScreening(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Resume Pool</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every candidate&apos;s resume in one place — upload files, paste text, and run AI fit scoring against their
          linked requisition.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Requisition</th>
              <th className="px-5 py-3 font-medium">Resume</th>
              <th className="px-5 py-3 font-medium">AI score</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-cream/60">
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
                <td className="px-5 py-3.5 text-ink-soft">{c.requisition_title ?? "—"}</td>
                <td className="px-5 py-3.5">
                  {c.resume_file ? (
                    <a
                      href={c.resume_file}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:text-primary-dark"
                    >
                      <FileText className="h-3.5 w-3.5" /> View file
                    </a>
                  ) : c.resume_text ? (
                    <span className="font-mono text-xs text-ink-soft">Text only</span>
                  ) : (
                    <span className="font-mono text-xs text-ink-soft">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${scoreTone(c.ai_score)}`}
                  >
                    {c.ai_score !== null ? `${c.ai_score}%` : "Not scored"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => openCandidate(c)}
                    className="font-mono text-xs font-semibold text-primary hover:text-primary-dark"
                  >
                    Open →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && candidates.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No candidates yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {active && (
        <Modal title={active.name} onClose={() => setActive(null)} wide>
          {error && (
            <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
              {error}
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-ink-soft">{active.role}</p>
              <p className="text-xs text-ink-soft">
                Requisition: {active.requisition_title ?? "None linked — screening needs a requisition."}
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-cream px-3.5 py-2 font-mono text-xs font-semibold text-ink-soft hover:bg-cream-dim">
              <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload resume file"}
              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {active.resume_file && (
            <a
              href={active.resume_file}
              target="_blank"
              rel="noreferrer"
              className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:text-primary-dark"
            >
              <FileText className="h-3.5 w-3.5" /> Current file on record
            </a>
          )}

          <div className="mb-4">
            <label className={labelClass}>Resume text (used for AI screening)</label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the resume text here — the AI screener matches it against the requisition's requirements."
              className={inputClass}
            />
            <button
              onClick={handleSaveText}
              disabled={saving || resumeText === active.resume_text}
              className="mt-2 rounded-lg border border-line bg-card px-3.5 py-2 font-mono text-xs font-semibold text-ink-soft transition-colors hover:bg-cream-dim disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save text"}
            </button>
          </div>

          <div className="rounded-xl border border-line bg-cream p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
                <Sparkles className="h-4 w-4 text-primary" /> AI resume screening
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${scoreTone(active.ai_score)}`}
              >
                {active.ai_score !== null ? `${active.ai_score}% match` : "Not scored yet"}
              </span>
            </div>
            {active.ai_score_notes && <p className="mb-3 text-xs whitespace-pre-line text-ink-soft">{active.ai_score_notes}</p>}
            <button
              onClick={handleScreen}
              disabled={screening || !active.requisition}
              className="w-full rounded-lg bg-primary px-4 py-2.5 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {screening ? "Screening…" : "Run AI screening"}
            </button>
            {!active.requisition && (
              <p className="mt-2 text-center text-xs text-ink-soft">Link this candidate to a requisition first.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
