import Link from "next/link";
import { Plus, Play } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PlacementsChart from "@/components/dashboard/PlacementsChart";
import { PipelineWidget } from "@/components/site/widgets";
import {
  activity,
  demoUser,
  overviewStats,
  pipelineStages,
  placementsTrend,
  sourceBreakdown,
} from "@/lib/dashboard-data";

const toneDot: Record<string, string> = {
  primary: "bg-primary",
  amber: "bg-amber",
  maroon: "bg-maroon",
  neutral: "bg-ink-soft",
};

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Welcome back, {demoUser.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Here&apos;s what&apos;s moving on your desk today.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/requisitions"
            className="flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2.5 font-mono text-[13px] font-semibold text-ink transition-colors hover:bg-cream-dim"
          >
            <Plus className="h-4 w-4" /> New requisition
          </Link>
          <Link
            href="/dashboard/payroll"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Play className="h-4 w-4" /> Run payroll
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} change={s.change} href={s.href} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Placements · last 6 months</h2>
            <Link
              href="/dashboard/analytics"
              className="font-mono text-xs font-semibold text-primary hover:text-primary-dark"
            >
              View analytics →
            </Link>
          </div>
          <PlacementsChart data={placementsTrend} />
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-5 font-display text-lg font-bold text-ink">Pipeline</h2>
          <PipelineWidget stages={pipelineStages} />
          <div className="mt-6">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Candidate sources
            </h3>
            <div className="flex flex-col gap-2.5">
              {sourceBreakdown.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink">{s.label}</span>
                    <span className="font-mono text-ink-soft">{s.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Recent activity</h2>
        <div className="flex flex-col">
          {activity.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 border-b border-line py-3 last:border-0"
            >
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${toneDot[a.tone]}`} />
              <p className="flex-1 text-sm text-ink">{a.message}</p>
              <span className="shrink-0 font-mono text-xs text-ink-soft">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
