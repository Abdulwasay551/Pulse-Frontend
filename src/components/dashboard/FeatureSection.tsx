"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FeatureSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-6 first:mt-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center gap-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:text-ink"
      >
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        {title}
      </button>
      {open && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>}
    </div>
  );
}
