import Link from "next/link";
import { comingSoonHref, type ModuleDef } from "@/lib/dashboard-modules";

/** The module hub's own tile grid — one card per sub-module, each linking
 * to that sub-module's own sub-dashboard (stats + its feature cards), not
 * straight to a feature. Mirrors the root hub's "one card per module"
 * pattern one level down, so the module → sub-module → feature hierarchy
 * is real navigation, not just sidebar grouping. */
export default function ModuleSectionCards({ moduleDef }: { moduleDef: ModuleDef }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {moduleDef.sections.map((section) => {
        const Icon = section.icon;
        const liveCount = section.features.filter((f) => f.href).length;
        const href = section.href ?? comingSoonHref(moduleDef.label, section.label, section.features[0]);
        return (
          <Link
            key={section.label}
            href={href}
            className="group relative h-full rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-sm font-bold text-ink">{section.label}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{section.description}</p>
            <p className="mt-3 text-[11px] font-semibold text-ink-soft">
              {liveCount} of {section.features.length} features
            </p>
          </Link>
        );
      })}
    </div>
  );
}
