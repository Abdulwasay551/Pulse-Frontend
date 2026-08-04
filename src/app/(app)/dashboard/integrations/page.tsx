"use client";

import { Lock, Plug } from "lucide-react";
import { integrationModuleOrder, integrationsCatalog, type IntegrationComplexity } from "@/lib/integrations-catalog";

const complexityTone: Record<IntegrationComplexity, string> = {
  Low: "bg-primary/15 text-primary",
  Medium: "bg-amber-soft text-amber",
  "Medium-High": "bg-amber-soft text-amber",
  High: "bg-maroon-soft text-maroon",
  "Very High": "bg-maroon-soft text-maroon",
};

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Integrations</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A roadmap of the third-party apps each module could connect to — none of these are live yet. Complexity and
          time estimates reflect each vendor&apos;s own API/partner-approval process, not just build effort.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {integrationModuleOrder.map((moduleName) => {
          const entries = integrationsCatalog.filter((i) => i.module === moduleName);
          if (entries.length === 0) return null;
          return (
            <div key={moduleName}>
              <h2 className="mb-3 font-display text-base font-bold text-ink">{moduleName}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <div key={entry.name} className="flex flex-col rounded-2xl border border-line bg-card p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Plug className="h-5 w-5" />
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${complexityTone[entry.complexity]}`}
                      >
                        {entry.complexity}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-ink">{entry.name}</h3>
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-soft">{entry.note}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                      <span className="text-xs font-semibold text-ink-soft">Est. {entry.estimate}</span>
                      <span className="flex items-center gap-1.5 rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                        <Lock className="h-3 w-3" /> Not connected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
