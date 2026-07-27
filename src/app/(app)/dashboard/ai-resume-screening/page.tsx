"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import CandidateLink from "@/components/dashboard/CandidateLink";
import { candidatesApi, screenCandidate, type Candidate } from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

function scoreTone(score: number | null) {
  if (score === null) return "bg-cream-dim text-ink-soft";
  if (score >= 70) return "bg-primary/15 text-primary";
  if (score >= 40) return "bg-amber-soft text-amber";
  return "bg-maroon-soft text-maroon";
}

export default function AiResumeScreeningPage() {
  const { withAuth } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [screeningId, setScreeningId] = useState<number | null>(null);
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

  async function handleScreen(c: Candidate) {
    setScreeningId(c.id);
    setError(null);
    try {
      const updated = await withAuth((token) => screenCandidate(token, c.id));
      setCandidates((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Screening failed. Please try again.");
    } finally {
      setScreeningId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">AI Resume Screening</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Score every candidate&apos;s resume against their linked requisition&apos;s requirements — a
          keyword/skill-overlap match today, built as a drop-in replacement for a real LLM call later.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Requisition</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Notes</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const canScreen = !!c.requisition && !!c.resume_text;
              return (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3.5" data-label="Candidate">
                    <CandidateLink candidate={c} subtitle={c.role} />
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft" data-label="Requisition">
                    {c.requisition_title ? (
                      <Link href="/dashboard/requisitions" className="hover:text-primary hover:underline">
                        {c.requisition_title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3.5" data-label="Score">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${scoreTone(c.ai_score)}`}
                    >
                      {c.ai_score !== null ? `${c.ai_score}%` : "Not scored"}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-3.5 text-xs text-ink-soft" data-label="Notes">
                    <span className="line-clamp-2">{c.ai_score_notes || "—"}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {canScreen ? (
                      <button
                        onClick={() => handleScreen(c)}
                        disabled={screeningId === c.id}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
                      >
                        {screeningId === c.id ? "Screening…" : "Run screening"}
                      </button>
                    ) : (
                      <Link
                        href="/dashboard/resume-pool"
                        className="text-xs font-semibold whitespace-nowrap text-ink-soft hover:text-ink"
                        title={!c.requisition ? "Link a requisition first" : "Add resume text first"}
                      >
                        {!c.requisition ? "Needs requisition" : "Needs resume →"}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && candidates.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No candidates yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>
    </div>
  );
}
