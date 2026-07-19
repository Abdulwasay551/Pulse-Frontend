import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StatCard({
  label,
  value,
  change,
  href,
  changeTone = "primary",
  valueTone = "ink",
}: {
  label: string;
  value: string;
  change?: string;
  href?: string;
  changeTone?: "primary" | "maroon";
  valueTone?: "ink" | "maroon";
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</div>
        {href && (
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-soft/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        )}
      </div>
      <div
        className={`mt-2 font-mono text-3xl font-bold tabular-nums ${valueTone === "maroon" ? "text-maroon" : "text-ink"}`}
      >
        {value}
      </div>
      {change && (
        <div className={`mt-1 text-xs ${changeTone === "maroon" ? "text-maroon" : "text-primary"}`}>
          {change}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-2xl border border-line bg-card p-5">{content}</div>;
}
