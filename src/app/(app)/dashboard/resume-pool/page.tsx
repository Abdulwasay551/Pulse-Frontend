"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, FileText, Sparkles, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import { candidatesApi, uploadResume, type Candidate } from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

function scoreTone(score: number | null) {
  if (score === null) return "bg-cream-dim text-ink-soft";
  if (score >= 70) return "bg-primary/15 text-primary";
  if (score >= 40) return "bg-amber-soft text-amber";
  return "bg-maroon-soft text-maroon";
}

function portalUrl(token: string) {
  if (typeof window === "undefined") return `/portal/${token}`;
  return `${window.location.origin}/portal/${token}`;
}

export default function ResumePoolPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <ResumePoolPage />
    </Suspense>
  );
}

function ResumePoolPage() {
  const { withAuth } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Candidate | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    setCurrentSalary(c.current_salary ?? "");
    setCopied(false);
    setError(null);
  }

  async function handleCopyPortalLink() {
    if (!active) return;
    await navigator.clipboard.writeText(portalUrl(active.portal_token));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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

  async function handleSaveSalary() {
    if (!active) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await withAuth((token) =>
        candidatesApi.update(token, active.id, { current_salary: currentSalary === "" ? null : currentSalary })
      );
      setActive(updated);
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the salary.");
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

  async function handleRemove() {
    if (!active) return;
    if (!confirm(`Remove ${active.name}'s resume (file and text)?`)) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await withAuth((token) =>
        candidatesApi.update(token, active.id, { resume_file: null, resume_text: "" })
      );
      setActive(updated);
      setResumeText("");
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove the resume.");
    } finally {
      setSaving(false);
    }
  }

  const searched = useTableSearch(candidates, (c) =>
    [c.name, c.role, c.source, c.resume_file ? "file" : "", c.resume_text ? "text" : ""].filter(Boolean).join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (c, key) => {
    switch (key) {
      case "name":
        return c.name;
      case "role":
        return c.role;
      case "salary":
        return c.current_salary !== null && c.current_salary !== undefined ? Number(c.current_salary) : null;
      case "applied_at":
        return c.applied_at;
      case "source":
        return c.source;
      case "ai_score":
        return c.ai_score;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Resume Pool</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every candidate&apos;s resume in one place — upload, replace, or remove a file, and paste/edit resume text.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Name" sortKeyName="name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Current Position" sortKeyName="role" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Salary" sortKeyName="salary" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh
                label="Application date"
                sortKeyName="applied_at"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortableTh label="Source" sortKeyName="source" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium">Resume</th>
              <SortableTh label="AI score" sortKeyName="ai_score" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Name">
                  <button onClick={() => openCandidate(c)} className="flex items-center gap-3 text-left">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                      {c.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink hover:text-primary hover:underline">{c.name}</div>
                    </div>
                  </button>
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Current Position">{c.role}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Salary">
                  {c.current_salary ? `$${Number(c.current_salary).toLocaleString()}` : "—"}
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Application date">
                  {c.applied_at ? new Date(c.applied_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Source">{c.source}</td>
                <td className="px-5 py-3.5" data-label="Resume">
                  {c.resume_file ? (
                    <a
                      href={c.resume_file}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark"
                    >
                      <FileText className="h-3.5 w-3.5" /> View file
                    </a>
                  ) : c.resume_text ? (
                    <span className="text-xs text-ink-soft">Text only</span>
                  ) : (
                    <span className="text-xs text-ink-soft">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5" data-label="AI score">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${scoreTone(c.ai_score)}`}
                  >
                    {c.ai_score !== null ? `${c.ai_score}%` : "Not scored"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => openCandidate(c)}
                    className="text-xs font-semibold text-primary hover:text-primary-dark"
                  >
                    Manage →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && visible.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No candidates yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {active && (
        <Modal title={active.name} onClose={() => setActive(null)} wide>
          {error && (
            <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
              {error}
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">{active.role}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPortalLink}
                title="Copy portal link"
                className="flex items-center gap-2 rounded-lg border border-line bg-cream px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-cream-dim"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy portal link"}
              </button>
              <a
                href={portalUrl(active.portal_token)}
                target="_blank"
                rel="noreferrer"
                title="Open portal"
                aria-label={`Open portal for ${active.name}`}
                className="rounded-lg border border-line bg-cream p-2.5 text-ink-soft hover:bg-cream-dim"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-cream px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-cream-dim">
                <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload file"}
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
              <button
                onClick={handleRemove}
                disabled={saving || (!active.resume_file && !active.resume_text)}
                aria-label="Remove resume"
                title="Remove resume (file and text)"
                className="rounded-lg border border-line bg-cream p-2.5 text-ink-soft transition-colors hover:border-maroon/30 hover:bg-maroon-soft hover:text-maroon disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mb-5 max-w-xs">
            <label className={labelClass}>Current salary (USD)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentSalary}
                onChange={(e) => setCurrentSalary(e.target.value)}
                placeholder="Not known"
                className={inputClass}
              />
              <button
                onClick={handleSaveSalary}
                disabled={saving || currentSalary === (active.current_salary ?? "")}
                className="shrink-0 rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-cream-dim disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          {active.resume_file && (
            <a
              href={active.resume_file}
              target="_blank"
              rel="noreferrer"
              className="mb-4 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark"
            >
              <FileText className="h-3.5 w-3.5" /> Current file on record
            </a>
          )}

          <div className="mb-5">
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
              className="mt-2 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-cream-dim disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save text"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-cream p-4">
            <div>
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
                <Sparkles className="h-4 w-4 text-primary" /> AI resume screening
              </h3>
              <p className="mt-1 text-xs text-ink-soft">
                {active.ai_score !== null ? active.ai_score_notes || "Scored." : "Not scored yet."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${scoreTone(active.ai_score)}`}
              >
                {active.ai_score !== null ? `${active.ai_score}% match` : "Not scored"}
              </span>
              <Link
                href="/dashboard/ai-resume-screening"
                className="text-xs font-semibold whitespace-nowrap text-primary hover:text-primary-dark"
              >
                Run screening →
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
