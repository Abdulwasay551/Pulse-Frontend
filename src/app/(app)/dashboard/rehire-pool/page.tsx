"use client";

import { Suspense, useEffect, useState } from "react";
import { Repeat } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CandidateLink from "@/components/dashboard/CandidateLink";
import SortableTh from "@/components/dashboard/SortableTh";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { useSortableList } from "@/lib/use-sortable-list";
import { usePagination } from "@/lib/use-pagination";
import { offboardingsApi, type Offboarding, type RehireInterest } from "@/lib/recruit-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

const interestOptions: RehireInterest[] = ["Not Contacted", "Interested", "Not Interested", "Rehired"];

const interestTone: Record<RehireInterest, string> = {
  "Not Contacted": "bg-cream-dim text-ink-soft",
  Interested: "bg-primary/15 text-primary",
  "Not Interested": "bg-maroon-soft text-maroon",
  Rehired: "bg-amber-soft text-amber",
};

export default function RehirePoolPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <RehirePoolPage />
    </Suspense>
  );
}

function RehirePoolPage() {
  const { withAuth } = useAuth();
  const [offboardings, setOffboardings] = useState<Offboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Offboarding | null>(null);
  const [notes, setNotes] = useState("");
  const [lastContacted, setLastContacted] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await withAuth((token) => offboardingsApi.list(token));
      setOffboardings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alumni = offboardings.filter((o) => o.rehire_eligible);
  const searched = useTableSearch(alumni, (o) =>
    [o.candidate_detail.name, o.candidate_detail.role, o.reason, o.rehire_interest, o.rehire_notes].filter(Boolean).join(" ")
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableList(searched, (o, key) => {
    switch (key) {
      case "candidate":
        return o.candidate_detail.name;
      case "last_working_day":
        return o.last_working_day;
      case "reason":
        return o.reason;
      case "interest":
        return o.rehire_interest;
      case "last_contacted":
        return o.rehire_last_contacted;
      default:
        return null;
    }
  });
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(sorted);

  function openNotes(o: Offboarding) {
    setActive(o);
    setNotes(o.rehire_notes);
    setLastContacted(o.rehire_last_contacted ?? "");
  }

  async function handleSave() {
    if (!active) return;
    setSaving(true);
    try {
      const updated = await withAuth((token) =>
        offboardingsApi.update(token, active.id, { rehire_notes: notes, rehire_last_contacted: lastContacted || null })
      );
      setOffboardings((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setActive(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleInterestChange(o: Offboarding, rehire_interest: RehireInterest) {
    const updated = await withAuth((token) => offboardingsApi.update(token, o.id, { rehire_interest }));
    setOffboardings((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  async function handleRemoveFromPool(o: Offboarding) {
    if (!confirm(`Mark ${o.candidate_detail.name} as not eligible for rehire?`)) return;
    const updated = await withAuth((token) => offboardingsApi.update(token, o.id, { rehire_eligible: false }));
    setOffboardings((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Rehire & Alumni Pool</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every offboarded candidate flagged as rehire-eligible — a warm pool to reach back out to before sourcing
          cold.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <SortableTh label="Candidate" sortKeyName="candidate" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh
                label="Last working day"
                sortKeyName="last_working_day"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortableTh label="Reason" sortKeyName="reason" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Interest" sortKeyName="interest" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh
                label="Last contacted"
                sortKeyName="last_contacted"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <th className="px-5 py-3 font-medium">Notes</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Candidate">
                  <CandidateLink candidate={o.candidate_detail} subtitle={o.candidate_detail.role} />
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Last working day">{o.last_working_day}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Reason">{o.reason || "—"}</td>
                <td className="px-5 py-3.5" data-label="Interest">
                  <select
                    value={o.rehire_interest}
                    onChange={(e) => handleInterestChange(o, e.target.value as RehireInterest)}
                    className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${interestTone[o.rehire_interest]}`}
                  >
                    {interestOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Last contacted">
                  {o.rehire_last_contacted ?? "—"}
                </td>
                <td className="max-w-xs px-5 py-3.5 text-xs text-ink-soft" data-label="Notes">
                  <span className="line-clamp-2">{o.rehire_notes || "—"}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openNotes(o)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveFromPool(o)}
                      className="text-xs font-semibold text-ink-soft hover:text-maroon"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-ink-soft">
            <Repeat className="h-6 w-6 text-ink-soft/60" />
            No rehire-eligible alumni yet — mark someone eligible from their offboarding record.
          </div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
        <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {active && (
        <Modal title={`Rehire tracking · ${active.candidate_detail.name}`} onClose={() => setActive(null)}>
          <div className="mb-4">
            <label className={labelClass}>Last contacted</label>
            <input
              type="date"
              value={lastContacted}
              onChange={(e) => setLastContacted(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Notes</label>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conversations, interest level, best time to reach back out…"
              className={inputClass}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </Modal>
      )}
    </div>
  );
}
