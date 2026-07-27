import Link from "next/link";

/** Same reasoning as EmployeeLink — a candidate's name/avatar cell links
 * through to Candidates (`?candidate=<id>` auto-opens their edit modal). */
export default function CandidateLink({
  candidate,
  subtitle,
}: {
  candidate: { id: number; name: string; initials: string };
  subtitle?: string;
}) {
  return (
    <Link href={`/dashboard/candidates?candidate=${candidate.id}`} className="group/cand flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
        {candidate.initials}
      </span>
      <div className="min-w-0">
        <div className="truncate font-semibold text-ink group-hover/cand:text-primary group-hover/cand:underline">
          {candidate.name}
        </div>
        {subtitle && <div className="truncate text-xs text-ink-soft">{subtitle}</div>}
      </div>
    </Link>
  );
}
