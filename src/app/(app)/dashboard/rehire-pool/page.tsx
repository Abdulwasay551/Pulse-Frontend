"use client";

import { useEffect, useState } from "react";
import { Repeat } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CandidateLink from "@/components/dashboard/CandidateLink";
import { offboardingsApi, type Offboarding } from "@/lib/recruit-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";

export default function RehirePoolPage() {
  const { withAuth } = useAuth();
  const [offboardings, setOffboardings] = useState<Offboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Offboarding | null>(null);
  const [notes, setNotes] = useState("");
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

  function openNotes(o: Offboarding) {
    setActive(o);
    setNotes(o.rehire_notes);
  }

  async function handleSave() {
    if (!active) return;
    setSaving(true);
    try {
      const updated = await withAuth((token) =>
        offboardingsApi.update(token, active.id, { rehire_notes: notes })
      );
      setOffboardings((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setActive(null);
    } finally {
      setSaving(false);
    }
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
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Last working day</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Notes</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {alumni.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Candidate">
                  <CandidateLink candidate={o.candidate_detail} subtitle={o.candidate_detail.role} />
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Last working day">{o.last_working_day}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Reason">{o.reason || "—"}</td>
                <td className="max-w-xs px-5 py-3.5 text-xs text-ink-soft" data-label="Notes">
                  <span className="line-clamp-2">{o.rehire_notes || "—"}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openNotes(o)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark"
                    >
                      Edit notes
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
        {!loading && alumni.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-ink-soft">
            <Repeat className="h-6 w-6 text-ink-soft/60" />
            No rehire-eligible alumni yet — mark someone eligible from their offboarding record.
          </div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {active && (
        <Modal title={`Rehire notes · ${active.candidate_detail.name}`} onClose={() => setActive(null)}>
          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Conversations, interest level, best time to reach back out…"
            className={`${inputClass} mb-4`}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save notes"}
          </button>
        </Modal>
      )}
    </div>
  );
}
