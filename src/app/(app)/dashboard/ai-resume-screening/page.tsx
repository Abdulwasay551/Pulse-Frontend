"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Columns3 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAiStatus } from "@/lib/ai-status-context";
import AiFeatureGate from "@/components/dashboard/AiFeatureGate";
import CandidateLink from "@/components/dashboard/CandidateLink";
import { candidatesApi, screenCandidate, type Candidate } from "@/lib/recruit-api";
import { ApiError } from "@/lib/auth-api";

function scoreTone(score: number | null) {
  if (score === null) return "bg-cream-dim text-ink-soft";
  if (score >= 70) return "bg-primary/15 text-primary";
  if (score >= 40) return "bg-amber-soft text-amber";
  return "bg-maroon-soft text-maroon";
}

const DISCLAIMER =
  "This score is advisory only — a fit signal and its reasoning for a human recruiter to weigh, never a hiring decision. The recruiter makes every call.";

export default function AiResumeScreeningPage() {
  return (
    <AiFeatureGate
      featureKey="resume_screening"
      title="AI Resume Screening"
      blurb="Connect an AI provider in Settings to unlock real resume-to-requirement fit scoring, with a strengths/gaps breakdown and side-by-side candidate comparison."
    >
      <AiResumeScreeningContent />
    </AiFeatureGate>
  );
}

function AiResumeScreeningContent() {
  const { withAuth } = useAuth();
  const { refresh: refreshAiStatus } = useAiStatus();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [screeningId, setScreeningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [comparing, setComparing] = useState(false);

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
      if (err instanceof ApiError && err.status === 409) {
        refreshAiStatus();
        setError("The connected AI provider was disconnected. Reconnect it in Settings to keep screening.");
      } else {
        setError(err instanceof ApiError ? err.message : "Screening failed. Please try again.");
      }
    } finally {
      setScreeningId(null);
    }
  }

  function toggleSelected(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const detail = candidates.find((c) => c.id === detailId) ?? null;
  const compareList = candidates.filter((c) => selected.includes(c.id));

  if (comparing) {
    return (
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => setComparing(false)}
          className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to candidates
        </button>
        <h1 className="mb-1 font-display text-2xl font-bold text-ink">Compare candidates</h1>
        <p className="mb-2 text-sm text-ink-soft">{compareList.length} candidates side by side.</p>
        <p className="mb-6 text-xs text-ink-soft italic">{DISCLAIMER}</p>
        <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
          {compareList.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-3">
                <CandidateLink candidate={c} subtitle={c.role} />
              </div>
              <div className="mb-4 flex justify-center">
                <span className={`rounded-full px-4 py-2 text-lg font-bold ${scoreTone(c.ai_score)}`}>
                  {c.ai_score !== null ? `${c.ai_score}%` : "Not scored"}
                </span>
              </div>
              {c.ai_score_notes && <p className="mb-4 text-xs text-ink-soft">{c.ai_score_notes}</p>}
              <div className="mb-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">Strengths</div>
                {c.ai_score_strengths.length === 0 ? (
                  <p className="text-xs text-ink-soft">—</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {c.ai_score_strengths.map((s, i) => (
                      <li key={i} className="text-xs text-ink">
                        • {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-maroon">Gaps</div>
                {c.ai_score_gaps.length === 0 ? (
                  <p className="text-xs text-ink-soft">—</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {c.ai_score_gaps.map((g, i) => (
                      <li key={i} className="text-xs text-ink">
                        • {g}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">AI Resume Screening</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Score every candidate&apos;s resume against their linked requisition&apos;s requirements.
          </p>
          <p className="mt-1 text-xs text-ink-soft italic">{DISCLAIMER}</p>
        </div>
        <button
          onClick={() => setComparing(true)}
          disabled={selected.length < 2}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-40"
        >
          <Columns3 className="h-4 w-4" /> Compare selected ({selected.length})
        </button>
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
              <th className="px-5 py-3 font-medium" />
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Requisition</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Summary</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const canScreen = !!c.requisition && !!c.resume_text;
              return (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => toggleSelected(c.id)}
                      className="h-4 w-4 rounded border-line"
                    />
                  </td>
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
                    <button
                      onClick={() => setDetailId(c.id)}
                      disabled={c.ai_score === null}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${scoreTone(c.ai_score)} disabled:cursor-default`}
                    >
                      {c.ai_score !== null ? `${c.ai_score}%` : "Not scored"}
                    </button>
                  </td>
                  <td className="max-w-xs px-5 py-3.5 text-xs text-ink-soft" data-label="Summary">
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

      {detail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4" onClick={() => setDetailId(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <CandidateLink candidate={detail} subtitle={detail.role} />
            </div>
            <div className="mb-4 flex justify-center">
              <span className={`rounded-full px-5 py-2.5 text-2xl font-bold ${scoreTone(detail.ai_score)}`}>
                {detail.ai_score !== null ? `${detail.ai_score}%` : "Not scored"}
              </span>
            </div>
            {detail.ai_score_notes && <p className="mb-4 text-center text-sm text-ink-soft">{detail.ai_score_notes}</p>}
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">Strengths</div>
              {detail.ai_score_strengths.length === 0 ? (
                <p className="text-xs text-ink-soft">—</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {detail.ai_score_strengths.map((s, i) => (
                    <li key={i} className="text-sm text-ink">
                      • {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mb-5">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-maroon">Gaps</div>
              {detail.ai_score_gaps.length === 0 ? (
                <p className="text-xs text-ink-soft">—</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {detail.ai_score_gaps.map((g, i) => (
                    <li key={i} className="text-sm text-ink">
                      • {g}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mb-4 text-xs text-ink-soft italic">{DISCLAIMER}</p>
            <button
              onClick={() => setDetailId(null)}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
