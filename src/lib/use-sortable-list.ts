"use client";

import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

/** Client-side column sorting for an already-loaded list. `key` identifies
 * a column (matched against what each page passes to <SortableTh>); getValue
 * extracts the comparable value for a given key — a string, number, or Date
 * all compare correctly via the same comparator, so a page's getValue for a
 * date column should return a Date/number, not a display string. Stable
 * (Array.prototype.sort is stable per spec) so ties keep their original
 * (e.g. API-provided) order rather than jittering. */
export function useSortableList<T>(
  items: T[],
  getValue: (item: T, key: string) => string | number | Date | null | undefined,
  initial?: { key: string; dir: SortDir }
) {
  const [sortKey, setSortKey] = useState<string | null>(initial?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(initial?.dir ?? "asc");

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    const withIndex = items.map((item, i) => ({ item, i }));
    withIndex.sort((a, b) => {
      const av = getValue(a.item, sortKey);
      const bv = getValue(b.item, sortKey);
      const aMissing = av == null || av === "";
      const bMissing = bv == null || bv === "";
      if (aMissing && bMissing) return a.i - b.i;
      if (aMissing) return 1; // empty values sort last regardless of direction
      if (bMissing) return -1;
      let cmp: number;
      if (av instanceof Date || bv instanceof Date) {
        cmp = new Date(av as string | number | Date).getTime() - new Date(bv as string | number | Date).getTime();
      } else if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      }
      if (cmp === 0) return a.i - b.i;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return withIndex.map((w) => w.item);
  }, [items, sortKey, sortDir, getValue]);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
    }
  }

  return { sorted, sortKey, sortDir, toggleSort };
}
