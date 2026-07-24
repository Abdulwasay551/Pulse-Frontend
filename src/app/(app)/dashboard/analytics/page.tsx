"use client";

import { useEffect, useState } from "react";
import PlacementsChart from "@/components/dashboard/PlacementsChart";
import DonutChart from "@/components/dashboard/DonutChart";
import { useAuth } from "@/lib/auth-context";
import { getDashboardSummary, type DashboardSummary } from "@/lib/crm-api";

// Time-to-fill isn't tracked yet (it needs requisition status-change history,
// which the CRUD API doesn't record) — kept as an illustrative placeholder
// alongside the now-real placements/sources charts above it.
const timeToFill = [
  { label: "Engineering", days: 24 },
  { label: "Sales", days: 14 },
  { label: "Design", days: 18 },
  { label: "Operations", days: 11 },
  { label: "Finance", days: 21 },
];

export default function AnalyticsPage() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const maxDays = Math.max(...timeToFill.map((t) => t.days));

  useEffect(() => {
    withAuth((token) => getDashboardSummary(token)).then(setSummary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">How your desk is performing, at a glance.</p>
      </div>

      {!summary ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">Placements · last 6 months</h2>
            <PlacementsChart data={summary.placements_trend} />
          </div>

          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">Candidate sources</h2>
            {summary.source_breakdown.length > 0 ? (
              <DonutChart data={summary.source_breakdown} />
            ) : (
              <p className="text-sm text-ink-soft">Add candidates to see a source breakdown here.</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-5 font-display text-lg font-bold text-ink">
          Average time-to-fill by desk
        </h2>
        <div className="flex flex-col gap-4">
          {timeToFill.map((t) => (
            <div key={t.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-ink">{t.label}</span>
                <span className="font-mono text-ink-soft">{t.days} days</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dim">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(t.days / maxDays) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
