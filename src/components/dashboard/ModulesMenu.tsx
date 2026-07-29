"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";

/** Topbar quick-access menu listing every module and its full sub-module /
 * feature hierarchy — unlike the per-module Sidebar (which only shows the
 * currently active module and disappears entirely on the hub/settings),
 * this is always available so a real feature is never more than two
 * clicks away regardless of where you currently are. */
export default function ModulesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Modules</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 max-h-[75vh] w-[92vw] max-w-3xl overflow-y-auto rounded-2xl border border-line bg-card p-4 shadow-xl md:max-w-4xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardModules.map((moduleDef) => {
              const ModuleIcon = moduleDef.icon;
              return (
                <div key={moduleDef.key} className="min-w-0">
                  <Link
                    href={moduleDef.overviewHref}
                    onClick={() => setOpen(false)}
                    className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 font-display text-sm font-bold text-ink transition-colors hover:bg-cream-dim"
                  >
                    <ModuleIcon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{moduleDef.label}</span>
                  </Link>
                  <div className="flex flex-col gap-3">
                    {moduleDef.sections.map((section) => (
                      <div key={section.label}>
                        {section.href ? (
                          <Link
                            href={section.href}
                            onClick={() => setOpen(false)}
                            className="block px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft/70 transition-colors hover:text-primary"
                          >
                            {section.label}
                          </Link>
                        ) : (
                          <div className="px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft/70">
                            {section.label}
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          {section.features.map((feature) => {
                            const href = featureHref(moduleDef, section, feature);
                            const Icon = feature.icon;
                            return (
                              <Link
                                key={href + feature.label}
                                href={href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink"
                              >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{feature.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
