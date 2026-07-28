import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function ModuleHeader({
  icon: Icon,
  title,
  description,
  backHref = "/dashboard",
  backLabel = "All modules",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Section hub pages link back to their module hub instead of the root
   * module-selector hub. */
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
        </div>
      </div>
    </div>
  );
}
