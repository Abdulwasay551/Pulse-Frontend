import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function ModuleHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All modules
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
