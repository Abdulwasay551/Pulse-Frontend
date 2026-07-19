"use client";

import { useState } from "react";
import { candidates, type CandidateStage } from "@/lib/dashboard-data";

const stageTone: Record<CandidateStage, string> = {
  Sourced: "bg-cream-dim text-ink-soft",
  Interview: "bg-amber-soft text-amber",
  Offer: "bg-primary-light/20 text-primary",
  Placed: "bg-primary/15 text-primary",
  Rejected: "bg-maroon-soft text-maroon",
};

const stages: (CandidateStage | "All")[] = [
  "All",
  "Sourced",
  "Interview",
  "Offer",
  "Placed",
  "Rejected",
];

export default function CandidatesPage() {
  const [filter, setFilter] = useState<(typeof stages)[number]>("All");
  const filtered = filter === "All" ? candidates : candidates.filter((c) => c.stage === filter);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Candidates</h1>
        <p className="mt-1 text-sm text-ink-soft">Every candidate across every open requisition.</p>
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
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
                <td className="px-5 py-3.5 text-ink-soft">{c.client}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${stageTone[c.stage]}`}
                  >
                    {c.stage}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{c.source}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{c.applied}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No candidates in this stage.</div>
        )}
      </div>
    </div>
  );
}
