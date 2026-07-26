import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export default function FeatureTile({
  icon: Icon,
  title,
  description,
  href,
  comingSoon,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  /** Still a real, clickable link (to the "coming soon" placeholder) — just
   * flagged with a badge so it reads as not-yet-built rather than broken. */
  comingSoon?: boolean;
}) {
  return (
    <Link href={href} className="block h-full">
      <div className="group relative h-full rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        {comingSoon && (
          <span className="absolute top-4 right-4 rounded-full bg-cream-dim px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-ink-soft">
            Coming soon
          </span>
        )}
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{description}</p>
      </div>
    </Link>
  );
}
