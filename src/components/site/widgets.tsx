"use client";

import AnimatedNumber from "./AnimatedNumber";
import { useInView } from "./useInView";

export type Tone = "primary" | "amber" | "neutral" | "maroon";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-soft text-amber",
  neutral: "bg-cream-dim text-ink-soft",
  maroon: "bg-maroon-soft text-maroon",
};

export interface DemoRowData {
  label: string;
  status: string;
  tone: Tone;
}

export interface StageCountData {
  label: string;
  count: number;
}

export interface SkillBarData {
  label: string;
  percent: number;
}

export function MiniRows({ rows }: { rows: DemoRowData[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="flex flex-col">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center justify-between gap-2 border-b border-line py-2 text-[12.5px] transition-all duration-500 ease-out last:border-0 ${
            inView ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
          }`}
          style={{ transitionDelay: `${i * 110}ms` }}
        >
          <span className="truncate text-ink">{row.label}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold whitespace-nowrap ${toneClasses[row.tone]}`}
          >
            {row.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PipelineWidget({ stages }: { stages: StageCountData[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const shades = ["bg-cream-dim", "bg-amber-soft", "bg-primary-light/20", "bg-primary/15"];

  return (
    <div ref={ref} className="grid grid-cols-4 gap-1.5">
      {stages.map((s, i) => (
        <div
          key={s.label}
          className={`rounded-lg ${shades[i % shades.length]} px-1.5 py-2 text-center transition-all duration-500 ease-out ${
            inView ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <div className="text-base font-bold tabular-nums text-ink">
            {inView ? <AnimatedNumber value={s.count} durationMs={800} /> : 0}
          </div>
          <div className="mt-0.5 text-[8.5px] uppercase tracking-wide text-ink-soft">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ITWidget({ skills }: { skills: SkillBarData[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="flex flex-col gap-2">
      {skills.map((s, i) => (
        <div key={s.label}>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-ink">{s.label}</span>
            <span className="text-ink-soft">
              {inView ? <AnimatedNumber value={s.percent} durationMs={900} suffix="% match" /> : "0% match"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-[900ms] ease-out"
              style={{ width: inView ? `${s.percent}%` : "0%", transitionDelay: `${i * 120}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface TrendGraphData {
  statLabel: string;
  statValue: number;
  statPrefix?: string;
  statSuffix?: string;
  deltaValue: number;
  bars: number[];
}

export function TrendGraph({ data, dark = false }: { data: TrendGraphData; dark?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const lastIndex = data.bars.length - 1;

  const chipBg = dark ? "bg-cream/10" : "bg-ink/[0.03]";
  const labelColor = dark ? "text-cream/60" : "text-ink-soft";
  const statColor = dark ? "text-cream" : "text-ink";
  const deltaClasses = dark ? "bg-cream/15 text-cream" : "bg-primary/10 text-primary";
  const barActive = dark ? "bg-cream" : "bg-primary";
  const barMuted = dark ? "bg-cream/25" : "bg-primary/20";

  return (
    <div ref={ref} className={`rounded-2xl p-5 ${chipBg}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className={`text-[10px] font-semibold uppercase tracking-wide ${labelColor}`}>
            {data.statLabel}
          </div>
          <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${statColor}`}>
            {inView ? (
              <AnimatedNumber
                value={data.statValue}
                prefix={data.statPrefix}
                suffix={data.statSuffix}
                durationMs={1100}
              />
            ) : (
              `${data.statPrefix ?? ""}0${data.statSuffix ?? ""}`
            )}
          </div>
        </div>
        <span className={`mb-1 shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${deltaClasses}`}>
          {inView ? <AnimatedNumber value={data.deltaValue} prefix="+" suffix="%" durationMs={900} /> : "+0%"}
        </span>
      </div>
      <div className="mt-5 flex h-24 items-end gap-2">
        {data.bars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-md transition-[height] ease-out ${i === lastIndex ? barActive : barMuted}`}
            style={{
              height: inView ? `${h}%` : "0%",
              transitionDuration: "700ms",
              transitionDelay: `${i * 90}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export type WidgetType =
  | "none"
  | "pipeline"
  | "payroll"
  | "it"
  | "benefits"
  | "hire"
  | "mobility"
  | "deals";

export function WidgetRenderer({
  widgetType,
  rows,
  stages,
  skills,
}: {
  widgetType: WidgetType;
  rows: DemoRowData[];
  stages: StageCountData[];
  skills: SkillBarData[];
}) {
  switch (widgetType) {
    case "pipeline":
      return <PipelineWidget stages={stages} />;
    case "it":
      return <ITWidget skills={skills} />;
    case "payroll":
    case "benefits":
    case "hire":
    case "mobility":
    case "deals":
      return <MiniRows rows={rows} />;
    default:
      return null;
  }
}
