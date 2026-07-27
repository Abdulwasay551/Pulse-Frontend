"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import CandidateLink from "@/components/dashboard/CandidateLink";
import { candidatesApi, type Candidate, type CandidateStage } from "@/lib/recruit-api";

const stageTone: Record<CandidateStage, string> = {
  Sourced: "bg-cream-dim text-ink-soft",
  Interview: "bg-amber-soft text-amber",
  Offer: "bg-primary-light/20 text-primary",
  Placed: "bg-primary/15 text-primary",
  Rejected: "bg-maroon-soft text-maroon",
};

function portalUrl(token: string) {
  if (typeof window === "undefined") return `/portal/${token}`;
  return `${window.location.origin}/portal/${token}`;
}

export default function CandidatePortalPage() {
  const { withAuth } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    withAuth((token) => candidatesApi.list(token))
      .then(setCandidates)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCopy(c: Candidate) {
    await navigator.clipboard.writeText(portalUrl(c.portal_token));
    setCopiedId(c.id);
    setTimeout(() => setCopiedId((id) => (id === c.id ? null : id)), 1800);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Candidate Portal</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every candidate gets a stable, no-login status link — share it so they can check their own stage without
          calling you. It shows their name, role, client, and stage only — nothing internal.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Candidate</th>
              <th className="px-5 py-3 font-medium">Stage</th>
              <th className="px-5 py-3 font-medium">Portal link</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Candidate">
                  <CandidateLink candidate={c} subtitle={c.role} />
                </td>
                <td className="px-5 py-3.5" data-label="Stage">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${stageTone[c.stage]}`}
                  >
                    {c.stage}
                  </span>
                </td>
                <td className="max-w-xs px-5 py-3.5" data-label="Portal link">
                  <span className="block truncate text-xs text-ink-soft">{portalUrl(c.portal_token)}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleCopy(c)}
                      aria-label={`Copy portal link for ${c.name}`}
                      title="Copy link"
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      {copiedId === c.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={portalUrl(c.portal_token)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open portal for ${c.name}`}
                      title="Open portal"
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
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
    </div>
  );
}
