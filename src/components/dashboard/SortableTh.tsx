"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SortDir } from "@/lib/use-sortable-list";

/** A sortable `<th>` — pairs with useSortableList. Drop-in replacement for
 * a plain `<th className="px-5 py-3 font-medium">Label</th>`; every table
 * already shares that class, so this matches it exactly and just adds the
 * click target + direction indicator. */
export default function SortableTh({
  label,
  sortKeyName,
  activeKey,
  dir,
  onSort,
  className = "",
}: {
  label: string;
  sortKeyName: string;
  activeKey: string | null;
  dir: SortDir;
  onSort: (key: string) => void;
  className?: string;
}) {
  const active = activeKey === sortKeyName;
  return (
    <th className={`px-5 py-3 font-medium ${className}`}>
      <button
        onClick={() => onSort(sortKeyName)}
        className={`flex items-center gap-1 transition-colors hover:text-ink ${active ? "text-ink" : ""}`}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3 shrink-0" />
          ) : (
            <ArrowDown className="h-3 w-3 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 shrink-0 opacity-30" />
        )}
      </button>
    </th>
  );
}
