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
  return (
    <div className="flex flex-col">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-2 border-b border-line py-2 text-[12.5px] last:border-0"
        >
          <span className="truncate text-ink">{row.label}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-semibold whitespace-nowrap ${toneClasses[row.tone]}`}
          >
            {row.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PipelineWidget({ stages }: { stages: StageCountData[] }) {
  const shades = ["bg-cream-dim", "bg-amber-soft", "bg-primary-light/20", "bg-primary/15"];
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {stages.map((s, i) => (
        <div key={s.label} className={`rounded-lg ${shades[i % shades.length]} px-1.5 py-2 text-center`}>
          <div className="font-display text-base font-bold text-ink">{s.count}</div>
          <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wide text-ink-soft">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ITWidget({ skills }: { skills: SkillBarData[] }) {
  return (
    <div className="flex flex-col gap-2">
      {skills.map((s) => (
        <div key={s.label}>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-ink">{s.label}</span>
            <span className="font-mono text-ink-soft">{s.percent}% match</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
            <div className="h-full rounded-full bg-primary" style={{ width: `${s.percent}%` }} />
          </div>
        </div>
      ))}
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
