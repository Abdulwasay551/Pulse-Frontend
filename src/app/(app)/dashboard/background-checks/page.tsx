"use client";

import { Suspense, useEffect, useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import CandidateLink from "@/components/dashboard/CandidateLink";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import {
  backgroundChecksApi,
  backgroundChecksCsv,
  candidatesApi,
  sendBackgroundCheckToCheckr,
  type BackgroundCheck,
  type BackgroundCheckStatus,
  type BackgroundCheckType,
  type Candidate,
} from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

const BACKGROUND_CHECK_REQUIRED_FIELDS = ["candidate", "check_type"];

const statusTone: Record<BackgroundCheckStatus, string> = {
  Pending: "bg-cream-dim text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Cleared: "bg-primary/15 text-primary",
  Flagged: "bg-maroon-soft text-maroon",
};

const typeOptions: BackgroundCheckType[] = ["Education", "Employment", "Criminal", "EEC"];
const typeLabels: Record<BackgroundCheckType, string> = {
  Education: "Education",
  Employment: "Employment",
  Criminal: "Criminal",
  EEC: "Education + Employment + Criminal (EEC)",
};
const statusOptions: BackgroundCheckStatus[] = ["Pending", "In Progress", "Cleared", "Flagged"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  candidate: string;
  check_type: BackgroundCheckType;
  status: BackgroundCheckStatus;
  notes: string;
}

const emptyForm: FormState = { candidate: "", check_type: "Education", status: "Pending", notes: "" };

export default function BackgroundChecksPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <BackgroundChecksPage />
    </Suspense>
  );
}

function BackgroundChecksPage() {
  const { withAuth } = useAuth();
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<BackgroundCheck | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [b, c] = await withAuth((token) =>
        Promise.all([backgroundChecksApi.list(token), candidatesApi.list(token)])
      );
      setChecks(b);
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

  function openEdit(b: BackgroundCheck) {
    setEditing(b);
    setForm({ candidate: String(b.candidate), check_type: b.check_type, status: b.status, notes: b.notes });
    setError(null);
    setShowForm(true);
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
      check_type: form.check_type,
      status: form.status,
      notes: form.notes,
    };
    try {
      if (editing) {
        await withAuth((token) => backgroundChecksApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => backgroundChecksApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(b: BackgroundCheck) {
    if (!confirm(`Delete this background check for ${b.candidate_detail.name}?`)) return;
    await withAuth((token) => backgroundChecksApi.remove(token, b.id));
    await load();
  }

  const [sendingToCheckr, setSendingToCheckr] = useState<number | null>(null);

  async function handleSendToCheckr(b: BackgroundCheck) {
    setSendingToCheckr(b.id);
    try {
      await withAuth((token) => sendBackgroundCheckToCheckr(token, b.id));
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't send this to Checkr. Please try again.");
    } finally {
      setSendingToCheckr(null);
    }
  }

  const searched = useTableSearch(checks, (b) =>
    [b.candidate_detail.name, typeLabels[b.check_type], b.status, b.notes].filter(Boolean).join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (b, key) => {
    switch (key) {
      case "candidate":
        return b.candidate_detail.name;
      case "check_type":
        return typeLabels[b.check_type];
      case "status":
        return b.status;
      case "initiated_at":
        return b.initiated_at;
      case "completed_at":
        return b.completed_at;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Background Check Integration</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Track screening status per candidate. Tracked internally today — a vendor (Checkr, Sterling, etc.) can
            plug into this same workflow later.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={backgroundChecksCsv}
            resourceLabel="background checks"
            requiredFields={BACKGROUND_CHECK_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New check
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Candidate" sortKeyName="candidate" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh
                label="Screening Type"
                sortKeyName="check_type"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh
                label="Initiated"
                sortKeyName="initiated_at"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortableTh
                label="Completed"
                sortKeyName="completed_at"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((b) => (
              <tr key={b.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Candidate">
                  <CandidateLink candidate={b.candidate_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Screening Type">{typeLabels[b.check_type]}</td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[b.status]}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Initiated">
                  {b.initiated_at ? new Date(b.initiated_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Completed">
                  {b.completed_at ? new Date(b.completed_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {b.status === "Pending" && (
                      <button
                        onClick={() => handleSendToCheckr(b)}
                        disabled={sendingToCheckr === b.id}
                        aria-label={`Send ${b.candidate_detail.name}'s check to Checkr`}
                        title="Send to Checkr for a real background check"
                        className="rounded-lg p-1.5 text-ink-soft hover:bg-primary/10 hover:text-primary disabled:opacity-60"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(b)}
                      aria-label={`Edit check for ${b.candidate_detail.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      aria-label={`Delete check for ${b.candidate_detail.name}`}
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
          <div className="p-10 text-center text-sm text-ink-soft">No background checks yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {showForm && (
        <Modal title={editing ? "Edit background check" : "New background check"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Candidate</label>
              <select
                required
                disabled={!!editing}
                value={form.candidate}
                onChange={(e) => setForm({ ...form, candidate: e.target.value })}
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
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Screening Type</label>
                <select
                  value={form.check_type}
                  onChange={(e) => setForm({ ...form, check_type: e.target.value as BackgroundCheckType })}
                  className={inputClass}
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {typeLabels[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as BackgroundCheckStatus })}
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
            <div className="mb-6">
              <label className={labelClass}>Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create background check"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
