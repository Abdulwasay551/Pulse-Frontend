import PlacementsChart from "@/components/dashboard/PlacementsChart";
import DonutChart from "@/components/dashboard/DonutChart";
import { placementsTrend, sourceBreakdown } from "@/lib/dashboard-data";

const timeToFill = [
  { label: "Engineering", days: 24 },
  { label: "Sales", days: 14 },
  { label: "Design", days: 18 },
  { label: "Operations", days: 11 },
  { label: "Finance", days: 21 },
];

export default function AnalyticsPage() {
  const maxDays = Math.max(...timeToFill.map((t) => t.days));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">How your desk is performing, at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <h2 className="mb-5 font-display text-lg font-bold text-ink">Placements · last 6 months</h2>
          <PlacementsChart data={placementsTrend} />
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-5 font-display text-lg font-bold text-ink">Candidate sources</h2>
          <DonutChart data={sourceBreakdown} />
        </div>
      </div>

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
