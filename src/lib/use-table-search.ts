"use client";

import { useSearchParams } from "next/navigation";

/** Filters an already-loaded list against the Topbar's search box — search
 * state lives in the URL (`?q=`), not local component state, so this stays
 * in sync with the Topbar without any prop drilling (see Topbar.tsx). Every
 * table page picks its own `getText` — whichever fields make sense to
 * search for that resource (name, email, status, etc.) — since there's no
 * one-size-fits-all set of searchable columns across the app. Purely a
 * client-side substring filter over records already in memory; pages that
 * move to real backend pagination pass `q` to the API instead (see
 * usePaginatedList) and skip this hook. */
export function useTableSearch<T>(items: T[], getText: (item: T) => string): T[] {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => getText(item).toLowerCase().includes(q));
}
